import React, { useMemo, useCallback, useEffect } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { MessageSkeleton } from '@/components/ui/Skeleton'
import { ChatMessageItem } from './ChatMessageItem'
import { TypingIndicator } from './TypingIndicator'
import { useMessages } from '../../hooks/useMessages'
import { useScrollToBottom } from '../../hooks/useScrollToBottom'
import type { Message } from '@/types/chat.types'

interface ChatMessageListProps {
  roomId: string
  currentUserId: string
  isGroup: boolean
  /** 新消息到达时（Realtime）通知此组件滚动 */
  newMessageSignal?: number
}

export const ChatMessageList = React.memo<ChatMessageListProps>(({
  roomId,
  currentUserId,
  isGroup,
  newMessageSignal,
}) => {
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useMessages(roomId)
  const {
    virtuosoRef,
    scrollToBottom,
    scrollToBottomInstant,
    handleAtBottomStateChange,
    isAtBottom,
  } = useScrollToBottom()

  // 拍平所有分页消息（正序）
  const messages: Message[] = useMemo(() => {
    if (!data) return []
    return data.pages.flat()
  }, [data])

  // 首次进入房间：瞬间跳到底部
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(scrollToBottomInstant, 50)
      return () => clearTimeout(timer)
    }
  // 仅在 roomId 变化或首次加载时触发
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, isLoading])

  // 新 Realtime 消息到达：仅在底部时才自动跟随
  useEffect(() => {
    if (newMessageSignal && isAtBottom) {
      const timer = setTimeout(scrollToBottom, 60)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessageSignal])

  if (isLoading) {
    return (
      <div className="flex flex-col justify-end flex-1 pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <MessageSkeleton key={i} self={i % 2 === 0} />
        ))}
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        followOutput="smooth"
        atBottomStateChange={handleAtBottomStateChange}
        atBottomThreshold={80}

        // 🔑 加载更早历史消息：Virtuoso 保持滚动位置，不会跳动
        startReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}

        // 顶部加载指示
        components={{
          Header: () =>
            isFetchingNextPage ? (
              <div className="flex justify-center py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-dark-300 dark:bg-dark-600 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : null,
          Footer: () => (
            <TypingIndicator roomId={roomId} />
          ),
        }}

        itemContent={(index, msg) => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            prevMessage={messages[index - 1] ?? null}
            currentUserId={currentUserId}
            showSenderName={isGroup}
          />
        )}

        style={{ height: '100%' }}
        className="scrollbar-thin"
        increaseViewportBy={{ top: 300, bottom: 300 }}
      />
    </div>
  )
})

ChatMessageList.displayName = 'ChatMessageList'
