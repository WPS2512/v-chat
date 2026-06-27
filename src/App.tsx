import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { usePresenceStore } from '@/stores/presence.store'
import { profileService } from '@/services/profile.service'
import { useGlobalRealtime } from '@/hooks/useGlobalRealtime'
import { AppLayout } from '@/components/layout/AppLayout'
import { Spinner } from '@/components/ui/Spinner'

const LoginPage = lazy(() => import('@/pages/LoginPage'))

// ===== 全局认证初始化 =====
function AuthInitializer() {
  const { setUser, setSession, setProfile, setLoading, setInitialized } = useAuthStore()

  useEffect(() => {
    // 1. 获取当前 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        profileService.getProfile(session.user.id)
          .then(setProfile)
          .catch(() => {})
      }
      setLoading(false)
      setInitialized(true)
    })

    // 2. 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          const profile = await profileService.getProfile(session.user.id).catch(() => null)
          setProfile(profile)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setProfile, setLoading, setInitialized])

  return null
}

// ===== 全局 Presence 订阅 =====
function PresenceInitializer() {
  const { user } = useAuthStore()
  const { setOnline, setOffline, syncLastSeenBatch } = usePresenceStore()

  useEffect(() => {
    if (!user) return

    const channel = supabase.channel('global-presence')
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((p) => {
          const uid = (p as Record<string, unknown>).user_id as string
          if (uid) setOnline(uid)
        })
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((p) => {
          const uid = (p as Record<string, unknown>).user_id as string
          if (uid) setOffline(uid)
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id })
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [user, setOnline, setOffline])

  return null
}

// ===== 全局 Realtime 消息订阅 =====
function GlobalRealtimeInitializer() {
  useGlobalRealtime()
  return null
}

// ===== 路由守卫 =====
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, isLoading } = useAuthStore()

  if (!isInitialized || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-dark-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
            💬
          </div>
          <Spinner size="md" className="text-primary-500" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

// ===== 根组件 =====
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer />
        <PresenceInitializer />
        <GlobalRealtimeInitializer />

        <Suspense fallback={
          <div className="h-screen flex items-center justify-center">
            <Spinner size="lg" className="text-primary-500" />
          </div>
        }>
          <Routes>
            {/* 公开路由 */}
            <Route path="/auth" element={<LoginPage />} />

            {/* 受保护路由 */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>

        {/* Toast 通知系统 */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg, #1e293b)',
              color: '#f1f5f9',
              borderRadius: '16px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />

        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </BrowserRouter>
    </QueryClientProvider>
  )
}
