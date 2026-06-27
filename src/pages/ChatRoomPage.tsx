import React, { lazy, Suspense } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/Spinner'

const ChatWindow = lazy(() =>
  import('@/features/chat/components/ChatWindow').then((m) => ({
    default: m.ChatWindow,
  }))
)

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()

  if (!roomId) return <Navigate to="/chats" replace />

  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center h-screen-dynamic">
          <Spinner size="lg" className="text-primary-500" />
        </div>
      }
    >
      <ChatWindow roomId={roomId} />
    </Suspense>
  )
}
