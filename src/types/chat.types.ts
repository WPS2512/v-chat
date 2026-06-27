import type { Profile } from './profile.types'

// ===== 消息类型 =====

export type MessageType = 'text' | 'image' | 'system'

export interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string
  type: MessageType
  /** 图片尺寸、文件名等扩展数据 */
  metadata: Record<string, unknown> | null
  is_read: boolean
  created_at: string
  /** 关联查询，非数据库字段 */
  sender?: Profile
}

// ===== 房间类型（同时支持 1v1 和群聊）=====

export type RoomType = 'direct' | 'group'

export interface Room {
  id: string
  name: string | null           // null = 私聊（展示时用对方昵称替代）
  type: RoomType
  avatar_url: string | null
  created_by: string | null
  created_at: string
}

export interface RoomMember {
  room_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  profile?: Profile
}

/** 会话列表展示用（Room + 最新消息 + 未读数 + 对方信息） */
export interface ConversationItem {
  room: Room
  lastMessage: Message | null
  unreadCount: number
  /** 私聊时的对方信息（group 时为 null） */
  otherUser: Profile | null
  /** 群聊成员预览 */
  memberProfiles?: Profile[]
}

// ===== 输入状态广播 =====

export interface TypingPayload {
  userId: string
  isTyping: boolean
  roomId: string
}
