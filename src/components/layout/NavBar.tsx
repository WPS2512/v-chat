import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface NavBarProps {
  title?: string
  showBack?: boolean
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  subtitle?: string
  centerContent?: React.ReactNode
}

export const NavBar = React.memo<NavBarProps>(({
  title,
  showBack = false,
  leftAction,
  rightAction,
  subtitle,
  centerContent,
}) => {
  const navigate = useNavigate()

  return (
    <header className="
      absolute top-0 inset-x-0 z-50
      glass-light dark:glass-dark
      h-14
      flex items-center justify-between
      px-4
    "
    style={{ paddingTop: 'var(--safe-area-top)' }}
    >
      {/* 左侧区域 */}
      <div className="w-14 flex items-center shrink-0">
        {leftAction ? (
          leftAction
        ) : (
          <AnimatePresence>
            {showBack && (
              <motion.button
                key="back"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                onClick={() => navigate(-1)}
                className="
                  w-9 h-9 rounded-full flex items-center justify-center
                  text-primary-500
                  hover:bg-primary-50 dark:hover:bg-primary-950/30
                  active:scale-90 transition-all duration-150
                "
                aria-label="返回"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* 中间区域 */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        {centerContent ?? (
          <>
            {title && (
              <h1 className="text-[15px] font-semibold text-dark-900 dark:text-white truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-dark-400 dark:text-dark-500">{subtitle}</p>
            )}
          </>
        )}
      </div>

      {/* 右侧区域 */}
      <div className="w-10 flex items-center justify-end">
        {rightAction}
      </div>
    </header>
  )
})

NavBar.displayName = 'NavBar'
