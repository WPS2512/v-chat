import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { useChatStore } from '@/stores/chat.store'
import { MESSAGES_QUERY_KEY } from '@/features/chat/hooks/useMessages'
import { roomService } from '@/services/room.service'
import type { Message, ConversationItem } from '@/types/chat.types'

/**
 * 全局 Realtime 订阅（挂载在 App 层）
 * - 监听所有发给当前用户的消息（无论在哪个房间）
 * - 刷新对应的 conversation 缓存（置顶、更新最新消息）
 * - 增加未读数
 */
export function useGlobalRealtime() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const { activeRoomId, incrementUnread } = useChatStore()

  useEffect(() => {
    if (!user) return

    // 获取当前用户所在的全部房间 ID，用于过滤消息
    // 注意：这里可能不是 100% 实时，但在大多数情况够用。
    // 更严谨的做法是在 messages 表 RLS 允许的情况下，订阅所有房间
    // 由于 RLS 限制了只能收到自己房间的消息，我们可以直接全量订阅
    const channelName = `global-messages-${user.id}-${Math.random().toString(36).substring(7)}`
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const msg = payload.new as Message

          // 如果发送者是自己，已经在本地乐观更新过了，无需处理
          if (msg.sender_id === user.id) return

          // 1. 如果当前没有在这个房间里，则增加未读数
          if (activeRoomId !== msg.room_id) {
            incrementUnread(msg.room_id)
          }

          // 2. 更新 ConversationList 缓存
          queryClient.setQueryData<ConversationItem[]>(
            ['conversations', user.id],
            (old) => {
              if (!old) return old
              const existingIndex = old.findIndex((c) => c.room.id === msg.room_id)
              
              // 如果是新房间的第一条消息，可能需要重新 fetch 全局 conversations
              if (existingIndex === -1) {
                // 后台静默刷新会话列表
                queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
                return old
              }

              // 否则把该房间抽出来放到最前面，并更新 lastMessage 和 unreadCount
              const item = old[existingIndex]
              const newItem: ConversationItem = {
                ...item,
                lastMessage: msg,
                unreadCount: activeRoomId === msg.room_id ? item.unreadCount : item.unreadCount + 1,
              }
              const newConversations = [...old]
              newConversations.splice(existingIndex, 1)
              newConversations.unshift(newItem)
              return newConversations
            }
          )

          // 3. 追加消息到对应的 query 缓存（如果在后台的话）
          // 这里如果是活跃房间，会被 useRealtimeMessages 覆盖，无所谓
          queryClient.setQueryData(
            MESSAGES_QUERY_KEY(msg.room_id),
            (old: unknown) => {
              if (!old || typeof old !== 'object') return old
              const data = old as { pages: Message[][]; pageParams: unknown[] }
              if (!data.pages || data.pages.length === 0) return data
              const lastPage = data.pages[data.pages.length - 1]
              if (lastPage.some((m) => m.id === msg.id)) return data
              return {
                ...data,
                pages: [
                  ...data.pages.slice(0, -1),
                  [...lastPage, msg],
                ],
              }
            }
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, queryClient, activeRoomId, incrementUnread])
}
