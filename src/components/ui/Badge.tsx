import React from 'react'

interface BadgeProps {
  count: number
  max?: number
  className?: string
}

export const Badge = React.memo<BadgeProps>(({ count, max = 99, className = '' }) => {
  if (count <= 0) return null
  const display = count > max ? `${max}+` : String(count)

  return (
    <span className={`
      inline-flex items-center justify-center
      min-w-[18px] h-[18px] px-1
      text-[10px] font-bold text-white
      bg-primary-500 rounded-full
      leading-none
      ${className}
    `}>
      {display}
    </span>
  )
})

Badge.displayName = 'Badge'
