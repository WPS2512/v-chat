import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { roomService } from '@/services/room.service'
import { ConversationItem as ConversationItemComponent } from './ConversationItem'
import { ConversationSkeleton } from '@/components/ui/Skeleton'
import type { ConversationItem } from '@/types/chat.types'

export const ConversationList = React.memo(() => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: conversations, isLoading } = useQuery<ConversationItem[]>({
    queryKey: ['conversations', user?.id],
    queryFn: () => roomService.getConversations(user!.id),
    enabled: !!user,
    refetchInterval: 30000, // 兜底轮询
  })

  if (isLoading) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)}
      </div>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-dark-300 dark:text-dark-600">
        <div className="text-5xl">💬</div>
        <p className="text-sm font-medium">还没有任何对话</p>
        <p className="text-xs">去好友列表发起第一次聊天吧</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-dark-50 dark:divide-dark-900">
      {conversations.map((item) => (
        <ConversationItemComponent
          key={item.room.id}
          item={item}
          onClick={() => navigate(`/chats/${item.room.id}`)}
        />
      ))}
    </div>
  )
})

ConversationList.displayName = 'ConversationList'
