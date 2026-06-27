import { supabase } from '@/lib/supabase'
import type { Friendship, FriendRequest } from '@/types/friend.types'
import type { Profile } from '@/types/profile.types'

export const friendService = {
  /** 获取已接受的好友列表（含对方资料） */
  async getFriends(userId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id, requester_id, addressee_id, status,
        requester:profiles!friendships_requester_id_fkey(
          id, username, display_name, avatar_url, bio, last_seen_at, created_at
        ),
        addressee:profiles!friendships_addressee_id_fkey(
          id, username, display_name, avatar_url, bio, last_seen_at, created_at
        )
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

    if (error) throw error

    // 去重：互相添加好友会产生两条记录，按好友的 profile ID 去重
    const seen = new Set<string>()
    const friends: Profile[] = []
    for (const row of data ?? []) {
      const isRequester = row.requester_id === userId
      const friend = isRequester
        ? (row.addressee as unknown as Profile)
        : (row.requester as unknown as Profile)
      if (friend?.id && !seen.has(friend.id)) {
        seen.add(friend.id)
        friends.push(friend)
      }
    }
    return friends
  },

  /** 获取待处理的好友申请（含对方资料） */
  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id, requester_id, addressee_id, status, created_at,
        requester:profiles!friendships_requester_id_fkey(
          id, username, display_name, avatar_url, bio, last_seen_at, created_at
        )
      `)
      .eq('addressee_id', userId)
      .eq('status', 'pending')

    if (error) throw error

    return (data ?? []).map((row) => ({
      friendship: row as unknown as Friendship,
      profile: row.requester as unknown as Profile,
      direction: 'incoming' as const,
    }))
  },

  /** 获取我发出的好友申请（待对方处理） */
  async getSentRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id, requester_id, addressee_id, status, created_at,
        addressee:profiles!friendships_addressee_id_fkey(
          id, username, display_name, avatar_url, bio, last_seen_at, created_at
        )
      `)
      .eq('requester_id', userId)
      .eq('status', 'pending')

    if (error) throw error

    return (data ?? []).map((row) => ({
      friendship: row as unknown as Friendship,
      profile: row.addressee as unknown as Profile,
      direction: 'outgoing' as const,
    }))
  },

  /** 发送好友申请 */
  async sendRequest(requesterId: string, addresseeId: string): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: requesterId, addressee_id: addresseeId })
    if (error) throw error
  },

  /** 接受好友申请 */
  async acceptRequest(friendshipId: string): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
    if (error) throw error
  },

  /** 拒绝好友申请 */
  async rejectRequest(friendshipId: string): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
    if (error) throw error
  },

  /** 检查两人之间的好友状态（null=无关系） */
  async checkFriendship(
    userId: string,
    targetId: string
  ): Promise<Friendship | null> {
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(
        `and(requester_id.eq.${userId},addressee_id.eq.${targetId}),` +
        `and(requester_id.eq.${targetId},addressee_id.eq.${userId})`
      )
      .single()
    return (data as Friendship) ?? null
  },
}
