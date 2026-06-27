import React from 'react'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { usePresenceStore } from '@/stores/presence.store'
import { getPresenceLabel } from '@/utils/presence.utils'
import type { Profile } from '@/types/profile.types'

interface FriendItemProps {
  friend: Profile
  onClick?: () => void
  action?: React.ReactNode
}

export const FriendItem = React.memo<FriendItemProps>(({ friend, onClick, action }) => {
  const { isOnline, lastSeenMap, onlineUserIds } = usePresenceStore()
  
  const online = isOnline(friend.id)
  const presenceLabel = getPresenceLabel(friend.id, onlineUserIds, lastSeenMap[friend.id])

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3
        ${onClick ? 'cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-900 active:bg-dark-100 dark:active:bg-dark-800' : ''}
        transition-colors duration-150
      `}
    >
      <Avatar
        src={friend.avatar_url}
        alt={friend.display_name}
        size="md"
        userId={friend.id}
        showPresence
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-dark-900 dark:text-white truncate">
          {friend.display_name}
        </h3>
        <p className={`
          text-[12px] truncate transition-colors duration-300 mt-0.5
          ${online ? 'text-online' : 'text-dark-400 dark:text-dark-500'}
        `}>
          {presenceLabel}
        </p>
      </div>

      {action && (
        <div className="flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
          {action}
        </div>
      )}
    </motion.div>
  )
})

FriendItem.displayName = 'FriendItem'
