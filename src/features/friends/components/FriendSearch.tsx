import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserPlus } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useFriendSearch } from '../hooks/useFriendSearch'

export const FriendSearch = React.memo(() => {
  const { query, setQuery, results, isSearching, sendRequest, isSending } = useFriendSearch()

  return (
    <div className="flex flex-col h-full bg-dark-50 dark:bg-dark-950">
      <div className="px-4 py-3 bg-white dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索用户名添加好友..."
            className="
              w-full h-10 pl-10 pr-4 rounded-xl
              bg-dark-50 dark:bg-dark-800
              border border-transparent
              text-[15px] text-dark-900 dark:text-dark-100
              placeholder-dark-400
              focus:outline-none focus:border-primary-400/60
              focus:ring-2 focus:ring-primary-400/15
              transition-all duration-150
            "
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {isSearching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-10"
            >
              <span className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2"
            >
              <h3 className="text-[13px] font-semibold text-dark-400 mb-2 px-2 uppercase">搜索结果</h3>
              {results.map((profile) => (
                <div
                  key={profile.id}
                  className="
                    flex items-center gap-3 p-3
                    bg-white dark:bg-dark-900
                    rounded-2xl shadow-sm
                  "
                >
                  <Avatar src={profile.avatar_url} alt={profile.display_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-semibold text-dark-900 dark:text-white truncate">
                      {profile.display_name}
                    </h4>
                    <p className="text-[13px] text-dark-400 truncate">@{profile.username}</p>
                  </div>
                  <button
                    onClick={() => sendRequest(profile.id)}
                    disabled={isSending}
                    className="
                      flex items-center justify-center gap-1.5
                      px-3 py-1.5 rounded-full
                      bg-primary-50 text-primary-600
                      dark:bg-primary-500/10 dark:text-primary-400
                      text-[13px] font-medium
                      hover:bg-primary-100 dark:hover:bg-primary-500/20
                      transition-colors disabled:opacity-50
                    "
                  >
                    <UserPlus size={16} />
                    添加
                  </button>
                </div>
              ))}
            </motion.div>
          ) : query.length >= 2 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-dark-400"
            >
              <div className="w-16 h-16 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center mb-3">
                <Search size={24} />
              </div>
              <p className="text-[14px]">未找到相关用户</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
})

FriendSearch.displayName = 'FriendSearch'
