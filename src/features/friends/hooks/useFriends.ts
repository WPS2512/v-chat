import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { friendService } from '@/services/friend.service'

export const FRIENDS_QUERY_KEY = (userId: string) => ['friends', userId]

export function useFriends() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: FRIENDS_QUERY_KEY(user?.id ?? ''),
    queryFn: () => friendService.getFriends(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  })
}
