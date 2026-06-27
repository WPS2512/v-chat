import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { TabBar } from './TabBar'
import { DesktopSidebar } from './DesktopSidebar'
import { GlobalSearchModal } from './GlobalSearchModal'
import { useAuthStore } from '@/stores/auth.store'
import { useViewportHeight } from '@/hooks/useViewportHeight'
import { useTheme } from '@/hooks/useTheme'
import { Spinner } from '@/components/ui/Spinner'

// 路由级懒加载
const ChatsPage    = lazy(() => import('@/pages/ChatsPage'))
const ChatRoomPage = lazy(() => import('@/pages/ChatRoomPage'))
const FriendsPage  = lazy(() => import('@/pages/FriendsPage'))
const ProfilePage  = lazy(() => import('@/pages/ProfilePage'))

// 桌面端左侧聊天面板（含搜索栏）
const DesktopChatListPanel = lazy(() =>
  import('@/features/chat/components/DesktopChatListPanel').then((m) => ({
    default: m.DesktopChatListPanel,
  }))
)

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -20 },
}

const pageTransition = {
  duration: 0.2,
}

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <Spinner size="lg" className="text-primary-500" />
  </div>
)

export const AppLayout = React.memo(() => {
  const location = useLocation()
  const isChatRoom = location.pathname.match(/^\/chats\/.+/)

  // 初始化视口高度（微信兜底）
  useViewportHeight()
  // 初始化主题
  useTheme()

  return (
    <div className="
      h-screen-dynamic
      flex flex-col
      bg-white dark:bg-dark-950
      text-dark-900 dark:text-dark-100
      overflow-hidden
    ">
      {/* 桌面端：三栏布局 (Sidebar, List, Detail) */}
      <div className="hidden md:flex h-full">
        {/* 最左侧图标导航栏 */}
        <DesktopSidebar />

        {/* 中间列表栏（固定 280px） */}
        <div className="w-[280px] border-r border-dark-100 dark:border-dark-800 flex flex-col overflow-hidden flex-shrink-0">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* 消息页：始终显示会话列表（含搜索栏），不再嵌套 NavBar */}
              <Route path="/chats/*" element={<DesktopChatListPanel />} />
              <Route path="/friends"  element={<FriendsPage />} />
              <Route path="/profile"  element={<ProfilePage />} />
              <Route path="*"         element={<Navigate to="/chats" replace />} />
            </Routes>
          </Suspense>
        </div>

        {/* 右侧详情栏（撑满剩余） */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/chats/:roomId" element={<ChatRoomPage />} />
              <Route path="*"              element={<DesktopEmptyState />} />
            </Routes>
          </Suspense>
        </div>
      </div>

      {/* 移动端：单栏 + TabBar */}
      <div className="md:hidden flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="absolute inset-0"
            >
              <Suspense fallback={<PageLoader />}>
                <Routes location={location} key={location.pathname}>
                  <Route index element={<Navigate to="/chats" replace />} />
                  <Route path="/chats"          element={<ChatsPage />} />
                  <Route path="/chats/:roomId"  element={<ChatRoomPage />} />
                  <Route path="/friends"         element={<FriendsPage />} />
                  <Route path="/profile"         element={<ProfilePage />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* TabBar 仅在非聊天房间页显示 */}
        {!isChatRoom && <TabBar />}
      </div>

      <GlobalSearchModal />
    </div>
  )
})

AppLayout.displayName = 'AppLayout'

const DesktopEmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-dark-300 dark:text-dark-600 bg-dark-50/50 dark:bg-dark-900/50">
    <div className="w-24 h-24 rounded-3xl bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center text-5xl shadow-inner">
      💬
    </div>
    <div className="text-center">
      <p className="text-base font-semibold text-dark-400 dark:text-dark-500">选择联系人开始聊天</p>
      <p className="text-sm text-dark-300 dark:text-dark-600 mt-1">从左侧列表中选择一个对话</p>
    </div>
  </div>
)
