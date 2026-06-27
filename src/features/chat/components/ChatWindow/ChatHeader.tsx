import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, MoreHorizontal, Phone, Video } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { usePresenceStore } from '@/stores/presence.store'
import { getPresenceLabel } from '@/utils/presence.utils'
import type { Profile } from '@/types/profile.types'
import type { Room } from '@/types/chat.types'

interface ChatHeaderProps {
  room: Room
  otherUser: Profile | null
  memberCount?: number
  showBack?: boolean
}

export const ChatHeader = React.memo<ChatHeaderProps>(({
  room,
  otherUser,
  memberCount,
  showBack = true,
}) => {
  const navigate = useNavigate()
  const { isOnline, lastSeenMap, onlineUserIds } = usePresenceStore()
  const isGroup = room.type === 'group'

  const displayName = isGroup
    ? (room.name ?? '群聊')
    : (otherUser?.display_name ?? '未知用户')

  const avatarSrc = isGroup ? room.avatar_url : otherUser?.avatar_url
  const userId = isGroup ? undefined : otherUser?.id

  const presenceLabel = isGroup
    ? `${memberCount ?? 0} 人`
    : userId
      ? getPresenceLabel(userId, onlineUserIds, lastSeenMap[userId])
      : '离线'

  const online = userId ? isOnline(userId) : false

  return (
    <header className="
      flex-shrink-0
      h-14 flex items-center gap-3 px-4
      glass-bar border-b
      z-10
    ">
      {/* 移动端返回按钮 */}
      {showBack && (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate(-1)}
          className="
            md:hidden
            w-9 h-9 flex items-center justify-center
            rounded-full text-primary-500
            hover:bg-white/30 dark:hover:bg-white/10
            transition-colors duration-150 flex-shrink-0
          "
          aria-label="返回"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </motion.button>
      )}

      <Avatar
        src={avatarSrc}
        alt={displayName}
        size="sm"
        userId={userId}
        showPresence={!isGroup}
      />

      <div className="flex-1 flex flex-col justify-center min-w-0">
        <h1 className="text-[15px] font-semibold text-dark-900 dark:text-white truncate leading-tight">
          {displayName}
        </h1>
        <p className={`
          text-[12px] leading-tight truncate transition-colors duration-300
          ${online ? 'text-green-500' : 'text-dark-400 dark:text-dark-500'}
        `}>
          {presenceLabel}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="
          hidden md:flex
          w-9 h-9 items-center justify-center rounded-full
          text-dark-500 dark:text-dark-400
          hover:bg-white/30 dark:hover:bg-white/10
          transition-all duration-150 active:scale-90
        " aria-label="语音通话">
          <Phone size={17} />
        </button>
        <button className="
          hidden md:flex
          w-9 h-9 items-center justify-center rounded-full
          text-dark-500 dark:text-dark-400
          hover:bg-white/30 dark:hover:bg-white/10
          transition-all duration-150 active:scale-90
        " aria-label="视频通话">
          <Video size={17} />
        </button>
        <button className="
          w-9 h-9 flex items-center justify-center rounded-full
          text-dark-500 dark:text-dark-400
          hover:bg-white/30 dark:hover:bg-white/10
          transition-all duration-150 active:scale-90
        " aria-label="更多">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </header>
  )
})

ChatHeader.displayName = 'ChatHeader'
