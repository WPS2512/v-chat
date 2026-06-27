// ===== 用户资料类型 =====

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  /** 🔑 在线状态双保险字段：每 30s 心跳更新 */
  last_seen_at: string
  created_at: string
}

export type ProfileUpdate = Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'bio'>>
