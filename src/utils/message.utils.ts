import type { Message } from '@/types/chat.types'

/** 截取消息预览文本（会话列表最后一条消息） */
export function getMessagePreview(message: Message | null): string {
  if (!message) return '暂无消息'
  switch (message.type) {
    case 'text':  return message.content.slice(0, 60)
    case 'image': return '📷 图片'
    case 'system': return message.content
    default: return message.content.slice(0, 60)
  }
}

/** 生成临时 ID（用于乐观更新） */
export function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
