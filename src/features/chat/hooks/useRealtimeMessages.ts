import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { chatService } from '@/services/chat.service'
import { useChatStore } from '@/stores/chat.store'
import { useAuthStore } from '@/stores/auth.store'
import { MESSAGES_QUERY_KEY } from './useMessages'
import type { Message, TypingPayload } from '@/types/chat.types'

interface UseRealtimeMessagesOptions {
  roomId: string
  onNewMessage?: (msg: Message) => void
}

/**
 * 订阅房间 Realtime 推送：
 * - 新消息 → 写入 chat.store & 追加到 TanStack Query cache
 * - typing 状态 → 写入 chat.store.typingUsers
 */
export function useRealtimeMessages({ roomId, onNewMessage }: UseRealtimeMessagesOptions) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { appendMessage, incrementUnread, activeRoomId, setTyping } = useChatStore()
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!roomId) return

    const handleNewMessage = (msg: Message) => {
      // 1. 写入 Zustand store（实时缓存）
      appendMessage(roomId, msg)

      // 2. 追加到 TanStack Query cache（不重新请求）
      queryClient.setQueryData<ReturnType<typeof queryClient.getQueryData>>(
        MESSAGES_QUERY_KEY(roomId),
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old
          const data = old as { pages: Message[][]; pageParams: unknown[] }
          if (!data.pages || data.pages.length === 0) return data
          const lastPage = data.pages[data.pages.length - 1]
          // 防止重复追加（Realtime 有时会重发）
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

      // 3. 非当前活跃房间 → 未读 +1
      if (activeRoomId !== roomId && msg.sender_id !== user?.id) {
        incrementUnread(roomId)
      }

      // 4. 外部回调（触发滚动到底部）
      onNewMessage?.(msg)
    }

    const handleTyping = (payload: TypingPayload) => {
      if (payload.userId !== user?.id) {
        setTyping(roomId, payload.userId, payload.isTyping)
      }
    }

    // 订阅
    unsubscribeRef.current = chatService.subscribeRoom(
      roomId,
      handleNewMessage,
      handleTyping
    )

    return () => {
      unsubscribeRef.current?.()
      unsubscribeRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  return null
}
