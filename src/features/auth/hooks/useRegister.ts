import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authService } from '@/services/auth.service'
import type { RegisterCredentials } from '@/types/auth.types'

export function useRegister() {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.signUp(credentials),
    onSuccess: () => {
      toast.success('注册成功！请查收验证邮件')
    },
    onError: (err: Error) => {
      const msg = err.message.includes('already registered')
        ? '该邮箱已被注册'
        : err.message
      toast.error(msg)
    },
  })
}
