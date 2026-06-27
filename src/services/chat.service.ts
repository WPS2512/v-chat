import { supabase } from '@/lib/supabase'
import type { Message, MessageType, TypingPayload } from '@/types/chat.types'
import { MESSAGES_PAGE_SIZE } from '@/lib/constants'
import { generateTempId } from '@/utils/message.utils'

// 活跃订阅的 channel 缓存
const activeChannels = new Map<string, ReturnType<typeof supabase.channel>>()

export const chatService = {
  /**
   * 加载历史消息（分页，从最新向前）
   * cursor = 最早一条消息的 created_at，用于加载更早的消息
   */
  async loadMessages(
    roomId: string,
    cursor?: string,
    limit = MESSAGES_PAGE_SIZE
  ): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url, username, last_seen_at, bio, created_at)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []).reverse() // 倒序翻转为正序
  },

  /**
   * 发送消息（含乐观更新 ID）
   */
  async sendMessage(
    roomId: string,
    senderId: string,
    content: string,
    type: MessageType = 'text',
    metadata?: Record<string, unknown>
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: senderId,
        content,
        type,
        metadata: metadata ?? null,
      })
      .select('*, sender:profiles!messages_sender_id_fkey(*)')
      .single()
    if (error) throw error
    return data
  },

  /**
   * 🔑 订阅房间实时消息
   * 返回取消订阅函数
   */
  subscribeRoom(
    roomId: string,
    onMessage: (msg: Message) => void,
    onTyping?: (payload: TypingPayload) => void
  ): () => void {
    // 如果已有订阅，先清理
    if (activeChannels.has(roomId)) {
      chatService.unsubscribeRoom(roomId)
    }

    const channel = supabase
      .channel(`room:${roomId}`)
      // 新消息
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // 获取发送者信息
          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single()
          onMessage({ ...payload.new as Message, sender: sender ?? undefined })
        }
      )
      // 输入状态广播
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        onTyping?.(payload as TypingPayload)
      })
      .subscribe()

    activeChannels.set(roomId, channel)

    return () => chatService.unsubscribeRoom(roomId)
  },

  /** 取消订阅 */
  unsubscribeRoom(roomId: string): void {
    const channel = activeChannels.get(roomId)
    if (channel) {
      supabase.removeChannel(channel)
      activeChannels.delete(roomId)
    }
  },

  /** 广播输入状态 */
  broadcastTyping(roomId: string, userId: string, isTyping: boolean): void {
    const channel = activeChannels.get(roomId)
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping, roomId } satisfies TypingPayload,
      })
    }
  },

  /** 标记消息为已读 */
  async markMessagesRead(roomId: string, userId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('room_id', roomId)
      .neq('sender_id', userId)
      .eq('is_read', false)
  },
}
