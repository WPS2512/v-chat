import React from 'react'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatChatTime } from '@/utils/date.utils'
import { getMessagePreview } from '@/utils/message.utils'
import type { ConversationItem as ConversationItemType } from '@/types/chat.types'

interface ConversationItemProps {
  item: ConversationItemType
  onClick: () => void
}

export const ConversationItem = React.memo<ConversationItemProps>(({ item, onClick }) => {
  const { room, lastMessage, unreadCount, otherUser } = item
  const isGroup = room.type === 'group'

  const displayName = isGroup
    ? (room.name ?? '群聊')
    : (otherUser?.display_name ?? '未知用户')

  const avatarSrc = isGroup ? room.avatar_url : otherUser?.avatar_url
  const avatarAlt = displayName
  const userId = isGroup ? undefined : otherUser?.id

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      className="
        flex items-center gap-3 px-4 py-3
        w-full text-left
        hover:bg-dark-50 dark:hover:bg-dark-900
        active:bg-dark-100 dark:active:bg-dark-800
        transition-colors duration-150
      "
    >
      <Avatar
        src={avatarSrc}
        alt={avatarAlt}
        size="md"
        userId={userId}
        showPresence={!isGroup}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[15px] font-semibold text-dark-900 dark:text-white truncate pr-2">
            {displayName}
          </span>
          {lastMessage && (
            <span className="text-[11px] text-dark-400 dark:text-dark-500 flex-shrink-0">
              {formatChatTime(lastMessage.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-dark-400 dark:text-dark-500 truncate pr-2">
            {getMessagePreview(lastMessage)}
          </p>
          <Badge count={unreadCount} />
        </div>
      </div>
    </motion.button>
  )
})

ConversationItem.displayName = 'ConversationItem'
