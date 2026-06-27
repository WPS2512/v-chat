import React, { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, ImagePlus, Paperclip } from 'lucide-react'
import { useTypingStatus } from '../../hooks/useTypingStatus'

interface ChatInputBarProps {
  roomId: string
  onSend: (content: string) => void
  isSending?: boolean
}

export const ChatInputBar = React.memo<ChatInputBarProps>(({
  roomId,
  onSend,
  isSending = false,
}) => {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { startTyping, stopTyping } = useTypingStatus(roomId)
  const hasContent = content.trim().length > 0

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    adjustHeight()
    startTyping()
  }, [adjustHeight, startTyping])

  const handleSend = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed || isSending) return
    onSend(trimmed)
    setContent('')
    stopTyping()
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [content, isSending, onSend, stopTyping])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div
      className="flex-shrink-0 glass-bar border-t"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* 工具栏（桌面端） */}
      <div className="hidden md:flex items-center gap-1 px-4 pt-2.5">
        {[
          { icon: <Smile size={18} />, label: 'Emoji' },
          { icon: <ImagePlus size={18} />, label: '图片' },
          { icon: <Paperclip size={18} />, label: '附件' },
        ].map(({ icon, label }) => (
          <button
            key={label}
            className="
              w-8 h-8 flex items-center justify-center rounded-lg
              text-dark-400 dark:text-dark-500
              hover:text-primary-500 hover:bg-white/40 dark:hover:bg-white/10
              transition-all duration-150 active:scale-90
            "
            aria-label={label}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* 输入行 */}
      <div className="flex items-end gap-2 px-3 md:px-4 py-2 md:py-2.5">

        {/* 移动端 Emoji */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          className="
            md:hidden w-9 h-9 flex items-center justify-center flex-shrink-0
            rounded-full text-dark-400 dark:text-dark-500
            hover:text-primary-500 hover:bg-white/40 dark:hover:bg-white/10
            transition-all duration-150 mb-0.5
          "
          aria-label="Emoji"
        >
          <Smile size={20} />
        </motion.button>

        {/* 输入框 */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={stopTyping}
            rows={1}
            placeholder="发消息..."
            className="
              w-full px-4 py-2.5
              glass-input rounded-2xl
              text-[14px] md:text-[15px] text-dark-900 dark:text-dark-100
              placeholder-dark-400 dark:placeholder-dark-600
              resize-none overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-primary-400/30
              transition-all duration-200
              max-h-[120px] leading-relaxed
            "
            style={{ minHeight: '40px' }}
          />
        </div>

        {/* 发送按钮 */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          animate={{
            scale: hasContent ? 1 : 0.9,
            opacity: hasContent ? 1 : 0.4,
          }}
          transition={{ duration: 0.15 }}
          onClick={handleSend}
          disabled={!hasContent || isSending}
          className="
            w-10 h-10 flex items-center justify-center flex-shrink-0
            rounded-full mb-0.5
            bg-primary-500 hover:bg-primary-600
            text-white shadow-lg shadow-primary-500/40
            disabled:cursor-not-allowed
            transition-all duration-150
          "
          aria-label="发送"
        >
          <AnimatePresence mode="wait">
            {isSending ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              />
            ) : (
              <motion.span
                key="send"
                initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Send size={16} strokeWidth={2.5} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  )
})

ChatInputBar.displayName = 'ChatInputBar'
