import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useFriendRequests } from '../hooks/useFriendRequests'
import { formatTimeAgo } from '@/utils/date.utils'

export const FriendRequests = React.memo(() => {
  const { requests, accept, reject, isAccepting, isRejecting, isLoading } = useFriendRequests()

  if (isLoading) {
    return (
      <div className="mb-6 px-4">
        <h2 className="text-[13px] font-semibold text-dark-400 dark:text-dark-500 mb-3 px-2 uppercase tracking-wider">
          新的朋友
        </h2>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-dark-900 rounded-2xl border border-dark-100 dark:border-dark-800 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-dark-100 dark:bg-dark-800 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-dark-100 dark:bg-dark-800 rounded w-1/3" />
                <div className="h-3 bg-dark-100 dark:bg-dark-800 rounded w-1/2" />
              </div>
              <div className="w-16 h-8 bg-dark-100 dark:bg-dark-800 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (requests.length === 0) return null

  return (
    <div className="mb-6 px-4">
      <h2 className="text-[13px] font-semibold text-dark-400 dark:text-dark-500 mb-3 px-2 uppercase tracking-wider">
        新的朋友
      </h2>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {requests.map((req) => (
            <motion.div
              key={req.friendship.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
              className="
                flex items-center gap-3 p-3
                bg-white dark:bg-dark-900
                rounded-2xl
                shadow-sm border border-dark-100 dark:border-dark-800
              "
            >
              <Avatar
                src={req.profile.avatar_url}
                alt={req.profile.display_name}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-dark-900 dark:text-white truncate">
                  {req.profile.display_name}
                </h3>
                <p className="text-[12px] text-dark-400 dark:text-dark-500 truncate">
                  请求添加你为好友 · {formatTimeAgo(req.friendship.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => accept(req.friendship.id)}
                  disabled={isAccepting || isRejecting}
                  className="
                    w-8 h-8 flex items-center justify-center
                    rounded-full bg-primary-50 text-primary-500
                    hover:bg-primary-100 dark:bg-primary-500/20 dark:hover:bg-primary-500/30
                    transition-colors disabled:opacity-50
                  "
                >
                  <Check size={16} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => reject(req.friendship.id)}
                  disabled={isAccepting || isRejecting}
                  className="
                    w-8 h-8 flex items-center justify-center
                    rounded-full bg-dark-50 text-dark-400
                    hover:bg-dark-100 dark:bg-dark-800 dark:hover:bg-dark-700
                    transition-colors disabled:opacity-50
                  "
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
})

FriendRequests.displayName = 'FriendRequests'
