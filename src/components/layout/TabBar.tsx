import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, Users, User } from 'lucide-react'
import { useChatStore } from '@/stores/chat.store'

interface TabItem {
  to: string
  icon: React.ReactNode
  label: string
  badgeKey?: string
}

const tabs: TabItem[] = [
  { to: '/chats',   icon: <MessageCircle size={22} />, label: '消息', badgeKey: 'chats' },
  { to: '/friends', icon: <Users size={22} />,         label: '好友' },
  { to: '/profile', icon: <User size={22} />,          label: '我' },
]

export const TabBar = React.memo(() => {
  const unreadCounts = useChatStore((s) => s.unreadCounts)
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      glass-light dark:glass-dark
      border-t border-dark-100/50 dark:border-dark-800/50
      flex items-center
      pb-safe
    ">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className="flex-1"
        >
          {({ isActive }) => (
            <motion.div
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.1 }}
              className="flex flex-col items-center justify-center gap-0.5 py-2 relative"
            >
              <span className={`
                transition-colors duration-150
                ${isActive
                  ? 'text-primary-500'
                  : 'text-dark-400 dark:text-dark-500'
                }
              `}>
                {tab.icon}
              </span>
              <span className={`
                text-[10px] font-medium transition-colors duration-150
                ${isActive
                  ? 'text-primary-500'
                  : 'text-dark-400 dark:text-dark-500'
                }
              `}>
                {tab.label}
              </span>

              {/* 消息未读数徽章 */}
              {tab.badgeKey === 'chats' && totalUnread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="
                    absolute top-1.5 left-1/2 translate-x-2
                    w-4 h-4 text-[9px] font-bold text-white
                    bg-red-500 rounded-full
                    flex items-center justify-center
                  "
                >
                  {totalUnread > 99 ? '99+' : totalUnread}
                </motion.span>
              )}

              {/* 激活指示点 */}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 w-1 h-1 rounded-full bg-primary-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  )
})

TabBar.displayName = 'TabBar'
