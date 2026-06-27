import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { formatMessageTime, shouldShowTimeDivider } from '@/utils/date.utils'
import type { Message } from '@/types/chat.types'
import type { Profile } from '@/types/profile.types'

interface ChatMessageItemProps {
  message: Message
  prevMessage: Message | null
  currentUserId: string
  /** 群聊时显示发送者名称 */
  showSenderName?: boolean
}

/**
 * 单条消息气泡
 * - 自己的消息：靠右，主色背景
 * - 对方消息：靠左，浅灰/深灰卡片
 * - 大圆角（20px+），最大宽度 75%
 * - 系统消息：居中灰色小字
 */
export const ChatMessageItem = React.memo<ChatMessageItemProps>(({
  message,
  prevMessage,
  currentUserId,
  showSenderName = false,
}) => {
  const isSelf = message.sender_id === currentUserId
  const isSystem = message.type === 'system'

  // 时间分割线
  const showDivider = shouldShowTimeDivider(
    message.created_at,
    prevMessage?.created_at ?? null
  )

  if (isSystem) {
    return (
      <div className="flex flex-col items-center gap-1 py-2 px-4">
        {showDivider && <TimeDivider time={message.created_at} />}
        <span className="
          text-[11px] text-dark-400 dark:text-dark-500
          bg-dark-100/70 dark:bg-dark-800/70
          px-3 py-1 rounded-full
        ">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {showDivider && <TimeDivider time={message.created_at} />}

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={`
          flex items-end gap-2 px-3 py-0.5
          ${isSelf ? 'flex-row-reverse' : 'flex-row'}
        `}
      >
        {/* 对方头像（非自己的消息显示） */}
        {!isSelf && (
          <div className="flex-shrink-0 mb-1">
            <Avatar
              src={message.sender?.avatar_url}
              alt={message.sender?.display_name ?? 'U'}
              size="xs"
              userId={message.sender_id}
            />
          </div>
        )}

        <div className={`
          flex flex-col max-w-[75%]
          ${isSelf ? 'items-end' : 'items-start'}
        `}>
          {/* 群聊发送者名称 */}
          {showSenderName && !isSelf && message.sender && (
            <span className="text-[11px] text-dark-400 dark:text-dark-500 mb-1 ml-1">
              {message.sender.display_name}
            </span>
          )}

          {/* 消息气泡 */}
          <div className={`
            relative px-4 py-2.5
            text-[15px] leading-relaxed
            break-words whitespace-pre-wrap
            ${isSelf
              ? `
                bg-primary-500 text-white
                rounded-[20px] rounded-br-[6px]
                shadow-lg shadow-primary-500/30
              `
              : `
                bubble-other
                text-dark-900 dark:text-dark-100
                rounded-[20px] rounded-bl-[6px]
              `
            }
          `}>
            {message.content}
          </div>

          {/* 时间戳 */}
          <span className="text-[10px] text-dark-400/80 dark:text-dark-500/80 mt-0.5 mx-1">
            {formatMessageTime(message.created_at)}
            {isSelf && (
              <span className="ml-1 opacity-70">
                {message.is_read ? '已读' : ''}
              </span>
            )}
          </span>
        </div>

        {isSelf && <div className="w-7 flex-shrink-0" />}
      </motion.div>
    </div>
  )
})

ChatMessageItem.displayName = 'ChatMessageItem'

// ===== 时间分割线（毛玻璃风格） =====
const TimeDivider = React.memo<{ time: string }>(({ time }) => (
  <div className="flex items-center gap-3 px-6 py-3">
    <div className="flex-1 h-px bg-white/30 dark:bg-white/10" />
    <span className="
      text-[11px] text-dark-500 dark:text-dark-400 flex-shrink-0
      px-3 py-1 rounded-full
      bg-white/40 dark:bg-white/8
      backdrop-blur-sm
      border border-white/30 dark:border-white/8
    ">
      {formatMessageTime(time)}
    </span>
    <div className="flex-1 h-px bg-white/30 dark:bg-white/10" />
  </div>
))

TimeDivider.displayName = 'TimeDivider'
