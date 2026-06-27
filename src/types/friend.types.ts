import type { Profile } from './profile.types'

// ===== 好友关系类型 =====

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  /** 关联的对方用户资料 */
  profile?: Profile
}

export interface FriendRequest {
  friendship: Friendship
  profile: Profile
  direction: 'incoming' | 'outgoing'
}
