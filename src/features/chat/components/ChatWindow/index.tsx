import React, { useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChatHeader } from './ChatHeader'
import { ChatMessageList } from './ChatMessageList'
import { ChatInputBar } from './ChatInputBar'
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages'
import { useSendMessage } from '../../hooks/useSendMessage'
import { useHeartbeat } from '../../hooks/useHeartbeat'
import { useChatStore } from '@/stores/chat.store'
import { useAuthStore } from '@/stores/auth.store'
import { roomService } from '@/services/room.service'
import { chatService } from '@/services/chat.service'
import { Spinner } from '@/components/ui/Spinner'
import type { Room, ConversationItem } from '@/types/chat.types'
import type { Profile } from '@/types/profile.types'

interface ChatWindowProps {
  roomId: string
}

export const ChatWindow = React.memo<ChatWindowProps>(({ roomId }) => {
  const { user } = useAuthStore()
  const { setActiveRoom, markAsRead } = useChatStore()
  const { mutate: sendMessage, isPending: isSending } = useSendMessage()
  const newMessageSignalRef = useRef(0)
  const [newMessageSignal, setNewMessageSignal] = useState(0)

  useHeartbeat()

  const { data: roomData, isLoading } = useQuery({
    queryKey: ['room-detail', roomId],
    queryFn: async () => {
      const members = await roomService.getRoomMembers(roomId)
      return { members }
    },
    enabled: !!roomId,
    staleTime: 1000 * 60 * 5,
  })

  const { data: conversationData } = useQuery({
    queryKey: ['conversation-item', roomId, user?.id],
    queryFn: async () => {
      const convs = await roomService.getConversations(user!.id)
      return convs.find((c) => c.room.id === roomId) ?? null
    },
    enabled: !!user && !!roomId,
    staleTime: 1000 * 60 * 2,
  })

  const room = conversationData?.room
  const otherUser = conversationData?.otherUser ?? null
  const isGroup = room?.type === 'group'
  const memberCount = roomData?.members.length

  React.useEffect(() => {
    setActiveRoom(roomId)
    markAsRead(roomId)
    if (user) {
      chatService.markMessagesRead(roomId, user.id).catch(() => {})
    }
    return () => setActiveRoom(null)
  }, [roomId, setActiveRoom, markAsRead, user])

  useRealtimeMessages({
    roomId,
    onNewMessage: () => {
      newMessageSignalRef.current += 1
      setNewMessageSignal(newMessageSignalRef.current)
    },
  })

  const handleSend = useCallback((content: string) => {
    sendMessage({ roomId, content })
  }, [roomId, sendMessage])

  if (isLoading || !room) {
    return (
      <div className="flex-1 flex items-center justify-center glass-panel">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden glass-panel">
      <ChatHeader
        room={room}
        otherUser={otherUser}
        memberCount={memberCount}
        showBack={true}
      />

      {/* 消息列表：亮色浅紫渐变 / 暗色透明 */}
      <div className="flex-1 overflow-hidden flex flex-col msg-area-bg">
        <ChatMessageList
          roomId={roomId}
          currentUserId={user!.id}
          isGroup={isGroup}
          newMessageSignal={newMessageSignal}
        />
      </div>

      <ChatInputBar
        roomId={roomId}
        onSend={handleSend}
        isSending={isSending}
      />
    </div>
  )
})

ChatWindow.displayName = 'ChatWindow'
