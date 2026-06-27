import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '@/services/auth.service'
import type { LoginCredentials } from '@/types/auth.types'

export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.signIn(credentials),
    onSuccess: () => {
      navigate('/chats', { replace: true })
    },
    onError: (err: Error) => {
      const msg = err.message.includes('Invalid login credentials')
        ? '邮箱或密码错误'
        : err.message
      toast.error(msg)
    },
  })
}
