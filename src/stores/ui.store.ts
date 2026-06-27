import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface UIStore {
  theme: Theme
  sidebarOpen: boolean
  /** 移动端是否显示聊天窗口（隐藏会话列表） */
  mobileChatOpen: boolean
  /** 是否显示全局搜索/添加好友弹窗 */
  searchModalOpen: boolean

  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setMobileChatOpen: (open: boolean) => void
  setSearchModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: true,
      mobileChatOpen: false,
      searchModalOpen: false,

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setMobileChatOpen: (mobileChatOpen) => set({ mobileChatOpen }),
      setSearchModalOpen: (searchModalOpen) => set({ searchModalOpen }),
    }),
    {
      name: 'vchat-ui',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)
