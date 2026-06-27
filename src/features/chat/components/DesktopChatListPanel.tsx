import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, Edit } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { roomService } from '@/services/room.service'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatChatTime } from '@/utils/date.utils'
import { getMessagePreview } from '@/utils/message.utils'
import { ConversationSkeleton } from '@/components/ui/Skeleton'
import type { ConversationItem } from '@/types/chat.types'

/**
 * 桌面端左侧聊天列表面板 - iOS 毛玻璃风格
 */
export const DesktopChatListPanel = React.memo(() => {
  const navigate = useNavigate()
  const { roomId: activeRoomId } = useParams<{ roomId?: string }>()
  const { user } = useAuthStore()
  const { setSearchModalOpen } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: conversations, isLoading } = useQuery<ConversationItem[]>({
    queryKey: ['conversations', user?.id],
    queryFn: () => roomService.getConversations(user!.id),
    enabled: !!user,
    refetchInterval: 30000,
  })

  const filtered = searchQuery.trim()
    ? (conversations ?? []).filter((item) => {
        const name = item.room.type === 'direct'
          ? (item.otherUser?.display_name ?? '')
          : (item.room.name ?? '')
        return name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : (conversations ?? [])

  return (
    <div className="flex flex-col h-full glass-panel">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
        <h2 className="text-[18px] font-bold text-dark-900 dark:text-white tracking-tight">消息</h2>
        <button
          onClick={() => setSearchModalOpen(true)}
          className="
            w-8 h-8 flex items-center justify-center rounded-full
            text-dark-500 dark:text-dark-400
            hover:bg-white/50 dark:hover:bg-white/10
            transition-all duration-150 active:scale-90
          "
          aria-label="新建"
        >
          <Edit size={16} />
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索"
            className="
              w-full pl-8 pr-4 py-2
              glass-input rounded-xl
              text-[13px] text-dark-900 dark:text-dark-100
              placeholder-dark-400 dark:placeholder-dark-500
              focus:outline-none focus:ring-2 focus:ring-primary-400/30
              transition-all duration-200
            "
          />
        </div>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-dark-400 dark:text-dark-500">
            <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-3xl">💬</div>
            <p className="text-sm">{searchQuery ? '没有找到相关对话' : '还没有任何对话'}</p>
          </div>
        ) : (
          filtered.map((item) => (
            <DesktopConversationItem
              key={item.room.id}
              item={item}
              isActive={item.room.id === activeRoomId}
              onClick={() => navigate(`/chats/${item.room.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
})

DesktopChatListPanel.displayName = 'DesktopChatListPanel'

// ===== 桌面端会话列表项 =====
interface DesktopConversationItemProps {
  item: ConversationItem
  isActive: boolean
  onClick: () => void
}

const DesktopConversationItem = React.memo<DesktopConversationItemProps>(({
  item, isActive, onClick,
}) => {
  const { room, lastMessage, unreadCount, otherUser } = item
  const isGroup = room.type === 'group'

  const displayName = isGroup
    ? (room.name ?? '群聊')
    : (otherUser?.display_name ?? '未知用户')

  const avatarSrc = isGroup ? room.avatar_url : otherUser?.avatar_url
  const userId = isGroup ? undefined : otherUser?.id

  return (
    <div className="px-3 py-1.5">
      <motion.button
        whileHover={{ y: -1, scale: 1.005 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`
          flex items-center gap-3 w-full text-left px-3 py-2.5
          rounded-2xl
          transition-all duration-200 relative
          ${isActive
            ? [
                'bg-primary-500/12 dark:bg-primary-500/20',
                'border border-primary-300/50 dark:border-primary-500/30',
                'shadow-md shadow-primary-500/10 dark:shadow-primary-500/15',
              ].join(' ')
            : [
                'bg-white/80 dark:bg-white/5',
                'border border-white/90 dark:border-white/10',
                'shadow-sm shadow-dark-200/20 dark:shadow-black/20',
                'hover:bg-white/95 dark:hover:bg-white/10',
                'hover:shadow-md hover:shadow-dark-200/25 dark:hover:shadow-black/30',
                'hover:border-white dark:hover:border-white/15',
              ].join(' ')
          }
        `}
      >
        <div className="relative flex-shrink-0">
          <Avatar
            src={avatarSrc}
            alt={displayName}
            size="md"
            userId={userId}
            showPresence={!isGroup}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className={`
              text-[14px] font-semibold truncate pr-2
              ${isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-dark-900 dark:text-white'
              }
            `}>
              {displayName}
            </span>
            {lastMessage && (
              <span className="text-[11px] text-dark-400 dark:text-dark-500 flex-shrink-0">
                {formatChatTime(lastMessage.created_at)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-dark-400 dark:text-dark-500 truncate pr-2">
              {getMessagePreview(lastMessage)}
            </p>
            {unreadCount > 0 && <Badge count={unreadCount} />}
          </div>
        </div>
      </motion.button>
    </div>
  )
})

DesktopConversationItem.displayName = 'DesktopConversationItem'
