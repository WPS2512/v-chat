import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { profileService } from '@/services/profile.service'
import { friendService } from '@/services/friend.service'
import { REQUESTS_QUERY_KEY } from './useFriendRequests'
import { useDebounce } from '@/hooks/useDebounce'
import toast from 'react-hot-toast'

export function useFriendSearch() {
  const [query, setQuery] = useState('')
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const debouncedQuery = useDebounce(query, 400)

  const searchQuery = useQuery({
    queryKey: ['user-search', debouncedQuery],
    queryFn: () => profileService.searchProfiles(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 30,
  })

  const sendRequestMutation = useMutation({
    mutationFn: (targetId: string) =>
      friendService.sendRequest(user!.id, targetId),
    onSuccess: () => {
      toast.success('好友申请已发送 ✉️')
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY(user!.id) })
    },
    onError: (err: Error) => {
      const msg = err.message.includes('duplicate')
        ? '已发送过申请或已是好友'
        : '发送失败，请重试'
      toast.error(msg)
    },
  })

  return {
    query,
    setQuery,
    results: (searchQuery.data ?? []).filter((p) => p.id !== user?.id),
    isSearching: searchQuery.isFetching,
    sendRequest: sendRequestMutation.mutate,
    isSending: sendRequestMutation.isPending,
  }
}
