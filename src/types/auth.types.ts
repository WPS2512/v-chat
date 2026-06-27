import type { User, Session } from '@supabase/supabase-js'

// ===== 认证类型 =====

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  username: string
  display_name: string
}
