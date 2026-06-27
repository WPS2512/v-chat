import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { useChatStore } from '@/stores/chat.store'
import { useAuthStore } from '@/stores/auth.store'
import { useQuery } from '@tanstack/react-query'
import { profileService } from '@/services/profile.service'

interface TypingIndicatorProps {
  roomId: string
}

/**
 * 正在输入指示器
 * 当 typingUsers 中有非自己的用户时显示跳动圆点动画
 */
export const TypingIndicator = React.memo<TypingIndicatorProps>(({ roomId }) => {
  const { user } = useAuthStore()
  const typingUsers = useChatStore((s) => s.typingUsers[roomId])

  // 过滤掉自己
  const typingUserIds = typingUsers
    ? [...typingUsers].filter((id) => id !== user?.id)
    : []

  const isTyping = typingUserIds.length > 0
  const firstTypingUserId = typingUserIds[0]

  const { data: typingProfile } = useQuery({
    queryKey: ['profile', firstTypingUserId],
    queryFn: () => profileService.getProfile(firstTypingUserId),
    enabled: !!firstTypingUserId,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          key="typing"
          initial={{ opacity: 0, y: 8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: 8, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-3 py-2"
        >
          <Avatar
            src={typingProfile?.avatar_url}
            alt={typingProfile?.display_name ?? 'U'}
            size="xs"
          />

          <div className="
            flex items-center gap-1 px-4 py-2.5
            bg-dark-100 dark:bg-dark-800
            rounded-[20px] rounded-bl-[6px]
          ">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-dark-400 dark:bg-dark-500"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {typingUserIds.length > 1 && (
            <span className="text-[11px] text-dark-400 dark:text-dark-500">
              {typingUserIds.length} 人正在输入
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

TypingIndicator.displayName = 'TypingIndicator'
