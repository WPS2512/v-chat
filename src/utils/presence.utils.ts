import { PRESENCE_TIMEOUT_MS } from '@/lib/constants'

/**
 * 🔑 在线状态双保险判断
 * 主：WebSocket Presence Set（实时广播）
 * 兜底：last_seen_at 时间戳（5分钟内视为在线）
 */
export function isUserOnline(
  userId: string,
  onlineUserIds: Set<string>,
  lastSeenAt: string | null | undefined
): boolean {
  // 主判断：Realtime Presence
  if (onlineUserIds.has(userId)) return true

  // 兜底判断：时间戳
  if (!lastSeenAt) return false
  return Date.now() - new Date(lastSeenAt).getTime() < PRESENCE_TIMEOUT_MS
}

/** 格式化在线状态文字 */
export function getPresenceLabel(
  userId: string,
  onlineUserIds: Set<string>,
  lastSeenAt: string | null | undefined
): string {
  if (isUserOnline(userId, onlineUserIds, lastSeenAt)) return '在线'
  if (!lastSeenAt) return '离线'

  const diffMs = Date.now() - new Date(lastSeenAt).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)

  if (diffMin < 1) return '刚刚在线'
  if (diffMin < 60) return `${diffMin} 分钟前在线`
  if (diffHour < 24) return `${diffHour} 小时前在线`
  return '很久未在线'
}
