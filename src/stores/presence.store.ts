import { create } from 'zustand'
import { isUserOnline } from '@/utils/presence.utils'

interface PresenceStore {
  /** Realtime Presence 在线用户 ID Set（主判断） */
  onlineUserIds: Set<string>
  /** last_seen_at 时间戳 Map（兜底判断） */
  lastSeenMap: Record<string, string>

  setOnline: (userId: string) => void
  setOffline: (userId: string) => void
  updateLastSeen: (userId: string, timestamp: string) => void
  syncLastSeenBatch: (map: Record<string, string>) => void

  /** 🔑 双保险：先查 Presence Set，再判断 last_seen_at */
  isOnline: (userId: string) => boolean
}

export const usePresenceStore = create<PresenceStore>((set, get) => ({
  onlineUserIds: new Set(),
  lastSeenMap: {},

  setOnline: (userId) =>
    set((state) => ({
      onlineUserIds: new Set([...state.onlineUserIds, userId]),
    })),

  setOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUserIds)
      next.delete(userId)
      return { onlineUserIds: next }
    }),

  updateLastSeen: (userId, timestamp) =>
    set((state) => ({
      lastSeenMap: { ...state.lastSeenMap, [userId]: timestamp },
    })),

  syncLastSeenBatch: (map) =>
    set((state) => ({
      lastSeenMap: { ...state.lastSeenMap, ...map },
    })),

  isOnline: (userId) => {
    const { onlineUserIds, lastSeenMap } = get()
    return isUserOnline(userId, onlineUserIds, lastSeenMap[userId])
  },
}))
