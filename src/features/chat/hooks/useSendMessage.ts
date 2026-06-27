import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '@/services/chat.service'
import { useAuthStore } from '@/stores/auth.store'
import { MESSAGES_QUERY_KEY } from './useMessages'
import { generateTempId } from '@/utils/message.utils'
import type { Message } from '@/types/chat.types'

interface SendMessageParams {
  roomId: string
  content: string
  type?: Message['type']
}

/**
 * 发送消息 mutation
 * 采用乐观更新：先在 UI 显示临时消息，发送成功后替换，失败后回滚
 */
export function useSendMessage() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthStore()

  return useMutation({
    mutationFn: ({ roomId, content, type = 'text' }: SendMessageParams) =>
      chatService.sendMessage(roomId, user!.id, content, type),

    onMutate: async ({ roomId, content, type = 'text' }) => {
      // 取消正在进行的重新请求，避免覆盖乐观更新
      await queryClient.cancelQueries({ queryKey: MESSAGES_QUERY_KEY(roomId) })

      // 创建临时乐观消息
      const tempMsg: Message = {
        id: generateTempId(),
        room_id: roomId,
        sender_id: user!.id,
        content,
        type,
        metadata: null,
        is_read: false,
        created_at: new Date().toISOString(),
        sender: profile ?? undefined,
      }

      // 追加到 cache 最后一页
      queryClient.setQueryData(
        MESSAGES_QUERY_KEY(roomId),
        (old: unknown) => {
          if (!old || typeof old !== 'object') {
            return { pages: [[tempMsg]], pageParams: [undefined] }
          }
          const data = old as { pages: Message[][]; pageParams: unknown[] }
          const pages = data.pages.length > 0 ? data.pages : [[]]
          return {
            ...data,
            pages: [
              ...pages.slice(0, -1),
              [...pages[pages.length - 1], tempMsg],
            ],
          }
        }
      )

      return { tempMsg, roomId }
    },

    onError: (_err, { roomId }, context) => {
      // 回滚：删除乐观消息
      if (!context) return
      queryClient.setQueryData(
        MESSAGES_QUERY_KEY(roomId),
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old
          const data = old as { pages: Message[][]; pageParams: unknown[] }
          return {
            ...data,
            pages: data.pages.map((page) =>
              page.filter((m) => m.id !== context.tempMsg.id)
            ),
          }
        }
      )
    },

    onSuccess: (serverMsg, { roomId }, context) => {
      // 用服务端真实消息替换临时消息
      queryClient.setQueryData(
        MESSAGES_QUERY_KEY(roomId),
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old
          const data = old as { pages: Message[][]; pageParams: unknown[] }
          return {
            ...data,
            pages: data.pages.map((page) =>
              page.map((m) =>
                m.id === context?.tempMsg.id ? serverMsg : m
              )
            ),
          }
        }
      )
    },
  })
}
