import { supabase } from '@/lib/supabase'
import type { Room, ConversationItem, RoomMember } from '@/types/chat.types'

export const roomService = {
  /**
   * 获取当前用户的所有会话（含最新消息和未读数）
   * 同时支持私聊（direct）和群聊（group）
   */
  async getConversations(userId: string): Promise<ConversationItem[]> {
    // 1. 获取用户加入的所有房间
    const { data: memberships, error: memberErr } = await supabase
      .from('room_members')
      .select(`
        room_id,
        rooms (
          id, name, type, avatar_url, created_by, created_at
        )
      `)
      .eq('user_id', userId)

    if (memberErr) throw memberErr
    if (!memberships || memberships.length === 0) return []

    const rooms = memberships
      .map((m) => m.rooms)
      .filter(Boolean) as unknown as Room[]

    // 2. 并行获取每个房间的最新消息和成员信息
    const conversationPromises = rooms.map(async (room): Promise<ConversationItem> => {
      // 最新消息
      const { data: lastMsgData } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url, username, last_seen_at, bio, created_at)')
        .eq('room_id', room.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // 未读数
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('is_read', false)
        .neq('sender_id', userId)

      // 私聊时获取对方信息
      let otherUser = null
      if (room.type === 'direct') {
        const { data: otherMember } = await supabase
          .from('room_members')
          .select('profiles (*)')
          .eq('room_id', room.id)
          .neq('user_id', userId)
          .single()
        otherUser = otherMember?.profiles ?? null
      }

      return {
        room,
        lastMessage: lastMsgData ?? null,
        unreadCount: unreadCount ?? 0,
        otherUser: otherUser as ConversationItem['otherUser'],
      }
    })

    const conversations = await Promise.all(conversationPromises)

    // 按最新消息时间排序
    return conversations.sort((a, b) => {
      const aTime = a.lastMessage?.created_at ?? a.room.created_at
      const bTime = b.lastMessage?.created_at ?? b.room.created_at
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
  },

  /** 查找或创建 1v1 私聊房间 */
  async findOrCreateDirectRoom(userId: string, targetUserId: string): Promise<Room> {
    // 1. 找到当前用户所在的所有房间 ID
    const { data: myMemberships, error: myErr } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', userId)

    if (myErr) {
      console.error('[findOrCreateDirectRoom] myMemberships error:', JSON.stringify(myErr))
      throw myErr
    }

    const myRoomIds = (myMemberships ?? []).map((m) => m.room_id)

    if (myRoomIds.length > 0) {
      // 2. 找到目标用户也在的房间 ID
      const { data: targetMemberships, error: targetErr } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', targetUserId)
        .in('room_id', myRoomIds)

      if (targetErr) {
        console.error('[findOrCreateDirectRoom] targetMemberships error:', JSON.stringify(targetErr))
        throw targetErr
      }

      const sharedRoomIds = (targetMemberships ?? []).map((m) => m.room_id)

      if (sharedRoomIds.length > 0) {
        // 3. 在共同房间中找出 type=direct 的那个
        const { data: directRooms, error: roomsErr } = await supabase
          .from('rooms')
          .select('id, name, type, avatar_url, created_by, created_at')
          .in('id', sharedRoomIds)
          .eq('type', 'direct')
          .limit(1)

        if (roomsErr) {
          console.error('[findOrCreateDirectRoom] directRooms error:', JSON.stringify(roomsErr))
          throw roomsErr
        }

        if (directRooms && directRooms.length > 0) {
          return directRooms[0] as Room
        }
      }
    }

    // 未找到，创建新房间（rooms_select 策略允许 created_by=auth.uid() 直接可见）
    const { data: newRoom, error: roomErr } = await supabase
      .from('rooms')
      .insert({ type: 'direct', created_by: userId })
      .select('id, name, type, avatar_url, created_by, created_at')
      .single()
    if (roomErr || !newRoom) {
      console.error('[findOrCreateDirectRoom] insert room error:', JSON.stringify(roomErr))
      throw roomErr ?? new Error('创建房间失败')
    }

    // 添加双方为成员
    const now = new Date().toISOString()
    const { error: memberErr } = await supabase
      .from('room_members')
      .insert([
        { room_id: newRoom.id, user_id: userId, role: 'owner', joined_at: now },
        { room_id: newRoom.id, user_id: targetUserId, role: 'member', joined_at: now },
      ])
    if (memberErr) {
      console.error('[findOrCreateDirectRoom] insert members error:', JSON.stringify(memberErr))
      throw memberErr
    }

    return newRoom as Room
  },

  /** 创建群聊房间 */
  async createGroupRoom(
    creatorId: string,
    name: string,
    memberIds: string[]
  ): Promise<Room> {
    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .insert({ type: 'group', name, created_by: creatorId })
      .select()
      .single()
    if (roomErr) throw roomErr

    const members: Omit<RoomMember, 'profile'>[] = [
      { room_id: room.id, user_id: creatorId, role: 'owner', joined_at: new Date().toISOString() },
      ...memberIds.map((id) => ({
        room_id: room.id,
        user_id: id,
        role: 'member' as const,
        joined_at: new Date().toISOString(),
      })),
    ]

    const { error: memberErr } = await supabase.from('room_members').insert(members)
    if (memberErr) throw memberErr

    return room
  },

  /** 获取房间成员列表 */
  async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    const { data, error } = await supabase
      .from('room_members')
      .select('*, profile:profiles(*)')
      .eq('room_id', roomId)
    if (error) throw error
    return data ?? []
  },
}
