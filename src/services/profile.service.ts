import { supabase } from '@/lib/supabase'
import type { Profile, ProfileUpdate } from '@/types/profile.types'

export const profileService = {
  /** 获取单个用户资料 */
  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  /** 搜索用户（用户名模糊匹配） */
  async searchProfiles(query: string, limit = 20): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(limit)
    if (error) throw error
    return data ?? []
  },

  /** 更新当前用户资料 */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  /** 🔑 心跳：更新 last_seen_at（每 30s 调用一次） */
  async updateLastSeen(userId: string): Promise<void> {
    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', userId)
  },

  /** 批量获取多个用户的 last_seen_at（用于 Presence 兜底） */
  async getLastSeenBatch(userIds: string[]): Promise<Record<string, string>> {
    const { data } = await supabase
      .from('profiles')
      .select('id, last_seen_at')
      .in('id', userIds)
    const map: Record<string, string> = {}
    data?.forEach((p) => { map[p.id] = p.last_seen_at })
    return map
  },
}
