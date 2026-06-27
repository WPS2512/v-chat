import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/profile.types'

interface AuthStore {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  reset: () => void
}

const initialState = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      reset: () => set(initialState),
    }),
    {
      name: 'vchat-auth',
      // 只持久化非敏感的 profile 数据
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
