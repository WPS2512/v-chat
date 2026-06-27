import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { profileService } from '@/services/profile.service'
import { storageService } from '@/services/storage.service'
import toast from 'react-hot-toast'

export function useUpdateProfile() {
  const { user, profile, setProfile } = useAuthStore()
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async ({
      displayName,
      bio,
      avatarFile,
    }: {
      displayName?: string
      bio?: string
      avatarFile?: File
    }) => {
      if (!user) throw new Error('Not authenticated')

      let avatarUrl = profile?.avatar_url
      if (avatarFile) {
        avatarUrl = await storageService.uploadAvatar(user.id, avatarFile)
      }

      const updates = {
        ...(displayName && { display_name: displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatar_url: avatarUrl }),
      }

      const updatedProfile = await profileService.updateProfile(user.id, updates)
      return updatedProfile
    },
    onSuccess: (updatedProfile) => {
      setProfile(updatedProfile)
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      toast.success('资料更新成功')
    },
    onError: () => {
      toast.error('更新失败，请重试')
    },
  })

  return {
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
