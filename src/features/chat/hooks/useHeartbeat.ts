import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { profileService } from '@/services/profile.service'
import { HEARTBEAT_INTERVAL_MS } from '@/lib/constants'

/**
 * 在线状态心跳 Hook
 * 挂载后每 30s 更新 profiles.last_seen_at
 * 作为 Supabase Presence 断连时的兜底
 */
export function useHeartbeat() {
  const { user } = useAuthStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!user) return

    const tick = () => profileService.updateLastSeen(user.id)
    tick() // 立即执行一次

    timerRef.current = setInterval(tick, HEARTBEAT_INTERVAL_MS)

    // Page Visibility API：切回前台时立即更新
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [user])
}
