import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { FRIENDS_QUERY_KEY } from './useFriends'
import { REQUESTS_QUERY_KEY } from './useFriendRequests'

export function useRealtimeFriendships() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) return

    // 监听 friendships 表变化
    // 注意：为避免 React StrictMode 导致的重复订阅问题，生成唯一的 channel name
    const channelName = `realtime-friendships-${user.id}-${Math.random().toString(36).substring(7)}`
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friendships' },
        (payload) => {
          // 只要有任何变化，为了保证一致性，直接 invalidate 相关缓存
          // TanStack Query 会在后台静默刷新
          queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEY(user.id) })
          queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY(user.id) })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient])
}
