import { useCallback, useRef } from 'react'
import { chatService } from '@/services/chat.service'
import { useAuthStore } from '@/stores/auth.store'

const TYPING_DEBOUNCE_MS = 2000 // 2s 无输入后发送 isTyping=false

/**
 * 输入状态广播 Hook
 * - 调用 startTyping()：发送 isTyping=true，并设置 2s 超时自动发 false
 * - 调用 stopTyping()：立即发送 isTyping=false
 */
export function useTypingStatus(roomId: string) {
  const { user } = useAuthStore()
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const stopTyping = useCallback(() => {
    if (!isTypingRef.current) return
    isTypingRef.current = false
    chatService.broadcastTyping(roomId, user!.id, false)
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = null
    }
  }, [roomId, user])

  const startTyping = useCallback(() => {
    if (!user) return

    // 尚未开始输入 → 广播 true
    if (!isTypingRef.current) {
      isTypingRef.current = true
      chatService.broadcastTyping(roomId, user.id, true)
    }

    // 重置超时计时器
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(stopTyping, TYPING_DEBOUNCE_MS)
  }, [roomId, user, stopTyping])

  return { startTyping, stopTyping }
}
