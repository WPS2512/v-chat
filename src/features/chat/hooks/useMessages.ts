import { useInfiniteQuery } from '@tanstack/react-query'
import { chatService } from '@/services/chat.service'
import { MESSAGES_PAGE_SIZE } from '@/lib/constants'
import type { Message } from '@/types/chat.types'

export const MESSAGES_QUERY_KEY = (roomId: string) => ['messages', roomId]

/**
 * 分页加载历史消息（从最新向前）
 * getNextPageParam → 返回最早一条消息的 created_at 作为 cursor
 */
export function useMessages(roomId: string) {
  return useInfiniteQuery<Message[], Error>({
    queryKey: MESSAGES_QUERY_KEY(roomId),
    queryFn: ({ pageParam }) =>
      chatService.loadMessages(roomId, pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (firstPage) => {
      // 首页是最早一批（已被 loadMessages reverse），取第一条的时间戳
      if (firstPage.length < MESSAGES_PAGE_SIZE) return undefined
      return firstPage[0]?.created_at
    },
    // 结果按时间正序拍平
    select: (data) => ({
      ...data,
      pages: data.pages,
    }),
    staleTime: 1000 * 60,
    enabled: !!roomId,
  })
}
