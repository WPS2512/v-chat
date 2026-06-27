import React, { lazy, Suspense } from 'react'
import { NavBar } from '@/components/layout/NavBar'
import { ConversationSkeleton } from '@/components/ui/Skeleton'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/ui.store'

const ConversationList = lazy(() =>
  import('@/features/chat/components/ConversationList').then((m) => ({ default: m.ConversationList }))
)

export default function ChatsPage() {
  const navigate = useNavigate()
  const { setSearchModalOpen } = useUIStore()

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-950">
      <NavBar
        title="消息"
        rightAction={
          <div className="flex gap-1">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-dark-500 dark:text-dark-400 active:scale-90"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => navigate('/friends')}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-dark-500 dark:text-dark-400 active:scale-90"
            >
              <Plus size={18} />
            </button>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto pt-14 pb-16">
        <Suspense fallback={
          <div className="flex flex-col">
            {Array.from({ length: 6 }).map((_, i) => <ConversationSkeleton key={i} />)}
          </div>
        }>
          <ConversationList />
        </Suspense>
      </div>
    </div>
  )
}
