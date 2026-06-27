import { supabase } from '@/lib/supabase'
import type { LoginCredentials, RegisterCredentials } from '@/types/auth.types'

export const authService = {
  /** 邮箱登录 */
  async signIn({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  /** 邮箱注册（自动创建 profile） */
  async signUp({ email, password, username, display_name }: RegisterCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name },
      },
    })
    if (error) throw error
    return data
  },

  /** 忘记密码（发送重置邮件） */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  },

  /** 退出登录 */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /** 获取当前 Session */
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  /** 监听认证状态变化 */
  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
