import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavBar } from '@/components/layout/NavBar'
import { FriendSearch } from '@/features/friends/components/FriendSearch'
import { useUIStore } from '@/stores/ui.store'

export const GlobalSearchModal = React.memo(() => {
  const { searchModalOpen, setSearchModalOpen } = useUIStore()

  return (
    <AnimatePresence>
      {searchModalOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-white dark:bg-dark-950 flex flex-col"
        >
          <NavBar
            title="搜索 / 添加好友"
            leftAction={
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-dark-500 dark:text-dark-400 px-2 active:scale-95 transition-transform"
              >
                取消
              </button>
            }
          />
          <div className="flex-1 pt-14">
            <FriendSearch />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

GlobalSearchModal.displayName = 'GlobalSearchModal'
