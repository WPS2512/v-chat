// Supabase 项目 URL 和公开匿名 Key（从 .env 读取）
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// 分页
export const MESSAGES_PAGE_SIZE = 40
export const CONVERSATIONS_PAGE_SIZE = 30

// 在线状态
export const PRESENCE_TIMEOUT_MS = 5 * 60 * 1000   // 5 分钟内视为在线
export const HEARTBEAT_INTERVAL_MS = 30 * 1000       // 30s 更新 last_seen_at

// 消息类型
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SYSTEM: 'system',
} as const

// 好友状态
export const FRIENDSHIP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  BLOCKED: 'blocked',
} as const

// 房间类型
export const ROOM_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
} as const
