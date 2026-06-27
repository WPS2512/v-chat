import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { friendService } from '@/services/friend.service'
import { FRIENDS_QUERY_KEY } from './useFriends'
import toast from 'react-hot-toast'

export const REQUESTS_QUERY_KEY = (userId: string) => ['friend-requests', userId]

export function useFriendRequests() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const requestsQuery = useQuery({
    queryKey: REQUESTS_QUERY_KEY(user?.id ?? ''),
    queryFn: () => friendService.getFriendRequests(user!.id),
    enabled: !!user,
    staleTime: 1000 * 30,
  })

  const acceptMutation = useMutation({
    mutationFn: (friendshipId: string) => friendService.acceptRequest(friendshipId),
    onSuccess: () => {
      toast.success('已接受好友申请 🎉')
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY(user!.id) })
      queryClient.invalidateQueries({ queryKey: FRIENDS_QUERY_KEY(user!.id) })
    },
    onError: () => toast.error('操作失败，请重试'),
  })

  const rejectMutation = useMutation({
    mutationFn: (friendshipId: string) => friendService.rejectRequest(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY(user!.id) })
    },
    onError: () => toast.error('操作失败，请重试'),
  })

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    accept: acceptMutation.mutate,
    reject: rejectMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
  }
}
