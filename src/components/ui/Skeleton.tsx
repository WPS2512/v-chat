import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'rect' | 'circle' | 'text'
}

export const Skeleton = React.memo<SkeletonProps>(({
  className = '',
  variant = 'rect',
}) => (
  <div className={`
    skeleton-shimmer
    ${variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded-lg h-4' : 'rounded-2xl'}
    ${className}
  `} />
))

Skeleton.displayName = 'Skeleton'

/** 会话列表骨架屏行 */
export const ConversationSkeleton = React.memo(() => (
  <div className="flex items-center gap-3 px-4 py-3">
    <Skeleton variant="circle" className="w-11 h-11 flex-shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-24 h-4" />
        <Skeleton variant="text" className="w-10 h-3" />
      </div>
      <Skeleton variant="text" className="w-40 h-3.5" />
    </div>
  </div>
))

ConversationSkeleton.displayName = 'ConversationSkeleton'

/** 消息骨架屏（聊天窗口） */
export const MessageSkeleton = React.memo(({ self = false }: { self?: boolean }) => (
  <div className={`flex gap-2 px-4 py-1 ${self ? 'flex-row-reverse' : ''}`}>
    {!self && <Skeleton variant="circle" className="w-8 h-8 flex-shrink-0 mt-auto" />}
    <Skeleton className={`h-10 rounded-bubble ${self ? 'w-48' : 'w-56'}`} />
  </div>
))

MessageSkeleton.displayName = 'MessageSkeleton'

/** 用户资料骨架屏 */
export const ProfileSkeleton = React.memo(() => (
  <div className="flex items-center gap-3 p-4">
    <Skeleton variant="circle" className="w-14 h-14" />
    <div className="flex flex-col gap-2">
      <Skeleton variant="text" className="w-32 h-5" />
      <Skeleton variant="text" className="w-48 h-4" />
    </div>
  </div>
))

ProfileSkeleton.displayName = 'ProfileSkeleton'
