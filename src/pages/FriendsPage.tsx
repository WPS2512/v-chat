import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { UserPlus, MessageCircle } from 'lucide-react'
import { NavBar } from '@/components/layout/NavBar'
import { FriendItem } from '@/features/friends/components/FriendItem'
import { FriendRequests } from '@/features/friends/components/FriendRequests'
import { useFriends } from '@/features/friends/hooks/useFriends'
import { useRealtimeFriendships } from '@/features/friends/hooks/useRealtimeFriendships'
import { roomService } from '@/services/room.service'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { Spinner } from '@/components/ui/Spinner'

export default function FriendsPage() {
  useRealtimeFriendships()
  
  const { setSearchModalOpen } = useUIStore()
  const { data: friends, isLoading } = useFriends()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleStartChat = async (targetId: string) => {
    if (!user) return
    try {
      const room = await roomService.findOrCreateDirectRoom(user.id, targetId)
      // 使缓存失效，以同步更新左侧会话列表
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
      navigate(`/chats/${room.id}`)
    } catch (err: any) {
      console.error('Failed to start chat:', JSON.stringify(err), err)
      alert('创建房间失败: ' + (err?.message || err?.error_description || JSON.stringify(err)))
    }
  }

  return (
    <div className="flex flex-col h-full glass-panel">

      {/* 桌面端标题头 */}
      <div className="hidden md:flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
        <h2 className="text-[18px] font-bold text-dark-900 dark:text-white tracking-tight">好友</h2>
        <button
          onClick={() => setSearchModalOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 dark:hover:bg-white/10 transition-all text-dark-500 dark:text-dark-400 active:scale-90"
        >
          <UserPlus size={16} />
        </button>
      </div>

      {/* 移动端 NavBar */}
      <div className="md:hidden">
        <NavBar
          title="好友"
          rightAction={
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition-all text-dark-500 dark:text-dark-400 active:scale-90"
            >
              <UserPlus size={18} />
            </button>
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-16 md:pb-0">
        <FriendRequests />

        <div className="px-4">
          <h2 className="text-[12px] font-semibold text-dark-500 dark:text-dark-400 mb-2 px-1 uppercase tracking-widest">
            我的好友 ({friends?.length ?? 0})
          </h2>

          <div className="glass-card rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col divide-y divide-white/20 dark:divide-white/5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-white/30 dark:bg-white/10 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/40 dark:bg-white/10 rounded w-1/3" />
                      <div className="h-3 bg-white/30 dark:bg-white/8 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : friends?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-dark-400 dark:text-dark-500">
                <p className="text-[14px]">暂无好友</p>
                <p className="text-[12px] mt-1 opacity-70">点击右上角添加好友</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/20 dark:divide-white/5">
                {friends?.map((friend) => (
                  <FriendItem
                    key={friend.id}
                    friend={friend}
                    onClick={() => handleStartChat(friend.id)}
                    action={
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartChat(friend.id)
                        }}
                        className="
                          w-9 h-9 flex items-center justify-center rounded-full
                          text-primary-500
                          bg-primary-500/10 hover:bg-primary-500/20
                          transition-all active:scale-90
                        "
                      >
                        <MessageCircle size={18} />
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  )
}
