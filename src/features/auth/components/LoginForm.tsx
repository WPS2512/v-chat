import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLogin } from '../hooks/useLogin'
import type { LoginCredentials } from '@/types/auth.types'

interface LoginFormProps {
  onForgotPassword: () => void
}

export const LoginForm = React.memo<LoginFormProps>(({ onForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>()

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit((data) => login(data))}
      className="flex flex-col gap-4"
    >
      <Input
        label="邮箱"
        type="email"
        placeholder="your@email.com"
        autoComplete="email"
        leftIcon={<Mail size={16} />}
        error={errors.email?.message}
        {...register('email', {
          required: '请输入邮箱',
          pattern: { value: /\S+@\S+\.\S+/, message: '请输入有效邮箱' },
        })}
      />

      <Input
        label="密码"
        type={showPassword ? 'text' : 'password'}
        placeholder="输入密码"
        autoComplete="current-password"
        leftIcon={<Lock size={16} />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="text-dark-400 hover:text-dark-600 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        error={errors.password?.message}
        {...register('password', { required: '请输入密码', minLength: { value: 6, message: '密码至少 6 位' } })}
      />

      <button
        type="button"
        onClick={onForgotPassword}
        className="text-sm text-primary-500 text-right hover:text-primary-600 transition-colors"
      >
        忘记密码？
      </button>

      <Button type="submit" loading={isPending} fullWidth size="lg">
        登录
      </Button>
    </motion.form>
  )
})

LoginForm.displayName = 'LoginForm'
