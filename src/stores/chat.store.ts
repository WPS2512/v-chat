import { create } from 'zustand'
import type { Message } from '@/types/chat.types'

interface ChatStore {
  activeRoomId: string | null
  /** roomId → 消息数组（Realtime 增量缓存） */
  realtimeMessages: Record<string, Message[]>
  /** roomId → 未读数 */
  unreadCounts: Record<string, number>
  /** 正在输入的用户 ID Set（roomId → Set） */
  typingUsers: Record<string, Set<string>>

  setActiveRoom: (roomId: string | null) => void
  appendMessage: (roomId: string, msg: Message) => void
  prependMessages: (roomId: string, msgs: Message[]) => void
  clearMessages: (roomId: string) => void
  markAsRead: (roomId: string) => void
  incrementUnread: (roomId: string) => void
  setTyping: (roomId: string, userId: string, isTyping: boolean) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  activeRoomId: null,
  realtimeMessages: {},
  unreadCounts: {},
  typingUsers: {},

  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

  appendMessage: (roomId, msg) =>
    set((state) => ({
      realtimeMessages: {
        ...state.realtimeMessages,
        [roomId]: [...(state.realtimeMessages[roomId] ?? []), msg],
      },
    })),

  prependMessages: (roomId, msgs) =>
    set((state) => ({
      realtimeMessages: {
        ...state.realtimeMessages,
        [roomId]: [...msgs, ...(state.realtimeMessages[roomId] ?? [])],
      },
    })),

  clearMessages: (roomId) =>
    set((state) => ({
      realtimeMessages: { ...state.realtimeMessages, [roomId]: [] },
    })),

  markAsRead: (roomId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [roomId]: 0 },
    })),

  incrementUnread: (roomId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [roomId]: (state.unreadCounts[roomId] ?? 0) + 1,
      },
    })),

  setTyping: (roomId, userId, isTyping) =>
    set((state) => {
      const roomTyping = new Set(state.typingUsers[roomId] ?? [])
      if (isTyping) roomTyping.add(userId)
      else roomTyping.delete(userId)
      return { typingUsers: { ...state.typingUsers, [roomId]: roomTyping } }
    }),
}))
