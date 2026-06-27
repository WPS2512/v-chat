import React from 'react'
import { usePresenceStore } from '@/stores/presence.store'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: AvatarSize
  userId?: string
  showPresence?: boolean
  className?: string
}

const sizeMap: Record<AvatarSize, { outer: string; dot: string; fallback: string }> = {
  xs: { outer: 'w-7 h-7',  dot: 'w-2 h-2 border',   fallback: 'text-xs' },
  sm: { outer: 'w-9 h-9',  dot: 'w-2.5 h-2.5 border', fallback: 'text-sm' },
  md: { outer: 'w-11 h-11', dot: 'w-3 h-3 border-2',  fallback: 'text-base' },
  lg: { outer: 'w-14 h-14', dot: 'w-3.5 h-3.5 border-2', fallback: 'text-xl' },
  xl: { outer: 'w-20 h-20', dot: 'w-4 h-4 border-2',  fallback: 'text-2xl' },
}

export const Avatar = React.memo<AvatarProps>(({
  src,
  alt = '用户',
  size = 'md',
  userId,
  showPresence = false,
  className = '',
}) => {
  const isOnline = usePresenceStore((s) => userId ? s.isOnline(userId) : false)
  const { outer, dot, fallback } = sizeMap[size]
  const initials = alt.charAt(0).toUpperCase()

  return (
    <div className={`relative flex-shrink-0 ${outer} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className={`
          w-full h-full rounded-full flex items-center justify-center font-semibold
          bg-gradient-to-br from-primary-400 to-primary-600 text-white
          ${fallback}
        `}>
          {initials}
        </div>
      )}

      {/* 在线状态指示器 */}
      {showPresence && userId && (
        <span className={`
          absolute bottom-0 right-0 ${dot} rounded-full
          border-white dark:border-dark-900
          transition-colors duration-300
          ${isOnline ? 'bg-online' : 'bg-offline'}
        `} />
      )}
    </div>
  )
})

Avatar.displayName = 'Avatar'
