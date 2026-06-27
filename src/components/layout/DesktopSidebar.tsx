import React from 'react'
import { NavLink } from 'react-router-dom'
import { MessageCircle, Users, User } from 'lucide-react'
import { useChatStore } from '@/stores/chat.store'

const tabs = [
  { to: '/chats',   icon: <MessageCircle size={22} />, label: '消息', badgeKey: 'chats' },
  { to: '/friends', icon: <Users size={22} />,         label: '好友' },
  { to: '/profile', icon: <User size={22} />,          label: '我' },
]

export const DesktopSidebar = React.memo(() => {
  const unreadCounts = useChatStore((s) => s.unreadCounts)
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="
      w-[68px] h-full
      glass-sidebar
      flex flex-col items-center py-6 gap-6
      flex-shrink-0 z-10
    ">
      {/* Logo */}
      <div className="
        w-11 h-11 rounded-2xl mb-4 flex-shrink-0
        bg-gradient-to-br from-white/30 to-white/10
        border border-white/30
        flex items-center justify-center
        text-white text-xl
        shadow-lg shadow-purple-900/20
        backdrop-blur-sm
      ">
        💬
      </div>

      <div className="flex flex-col gap-3 w-full px-2">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className="w-full">
            {({ isActive }) => (
              <div
                className={`
                  w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 relative
                  transition-all duration-200 cursor-pointer glass-shine
                  ${isActive
                    ? 'bg-primary-500/15 dark:bg-white/25 text-primary-600 dark:text-white shadow-md shadow-primary-500/10 dark:shadow-purple-900/20 border border-primary-200/50 dark:border-white/30'
                    : 'text-dark-500 dark:text-white/60 hover:bg-dark-100/60 dark:hover:bg-white/15 hover:text-dark-900 dark:hover:text-white border border-transparent'
                  }
                `}
              >
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>

                {tab.badgeKey === 'chats' && totalUnread > 0 && (
                  <span className="
                    absolute top-1 right-1
                    w-4 h-4 text-[9px] font-bold text-white
                    bg-red-500 rounded-full
                    flex items-center justify-center
                    shadow-sm
                  ">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
})

DesktopSidebar.displayName = 'DesktopSidebar'
