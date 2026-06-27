import { useRef, useCallback } from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'

/**
 * 消息列表滚动控制
 *
 * - scrollToBottom()：平滑滚动到底部（新消息到达时调用）
 * - scrollToBottomInstant()：瞬间跳到底部（首次进入房间时调用）
 * - isAtBottom：当前是否处于底部（用于判断是否自动跟随）
 */
export function useScrollToBottom() {
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const isAtBottomRef = useRef(true)
  const isAtBottom = isAtBottomRef.current

  const scrollToBottom = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: 'LAST',
      behavior: 'smooth',
      align: 'end',
    })
  }, [])

  const scrollToBottomInstant = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: 'LAST',
      behavior: 'auto',
      align: 'end',
    })
  }, [])

  const handleAtBottomStateChange = useCallback((atBottom: boolean) => {
    isAtBottomRef.current = atBottom
  }, [])

  return {
    virtuosoRef,
    isAtBottom,
    scrollToBottom,
    scrollToBottomInstant,
    handleAtBottomStateChange,
  }
}
