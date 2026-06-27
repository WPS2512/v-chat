/** 格式化聊天时间（会话列表 & 消息时间戳） */
export function formatChatTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) {
    // 今天：显示时间
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return `周${days[date.getDay()]}`
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  }
}

/** 格式化消息详细时间（聊天气泡下方） */
export function formatMessageTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 是否需要显示时间分组分割线（距上条消息 > 5 分钟） */
export function shouldShowTimeDivider(
  currentTime: string,
  previousTime: string | null
): boolean {
  if (!previousTime) return true
  const diff = new Date(currentTime).getTime() - new Date(previousTime).getTime()
  return diff > 5 * 60 * 1000
}

/** 格式化相对时间（如：5分钟前、昨天） */
export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return '刚刚'
  if (diffMins < 60) return `${diffMins} 分钟前`
  if (diffHours < 24) return `${diffHours} 小时前`
  if (diffDays === 1) return '昨天'
  if (diffDays < 30) return `${diffDays} 天前`
  
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}
