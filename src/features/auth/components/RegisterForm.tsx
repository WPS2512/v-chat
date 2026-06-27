import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRegister } from '../hooks/useRegister'
import type { RegisterCredentials } from '@/types/auth.types'

export const RegisterForm = React.memo(() => {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: submitRegister, isPending } = useRegister()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterCredentials>()

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit((data) => submitRegister(data))}
      className="flex flex-col gap-4"
    >
      <Input
        label="用户名"
        type="text"
        placeholder="vchat_user"
        autoComplete="username"
        leftIcon={<User size={16} />}
        error={errors.username?.message}
        {...register('username', {
          required: '请输入用户名',
          minLength: { value: 3, message: '用户名至少 3 个字符' },
          pattern: { value: /^[a-zA-Z0-9_]+$/, message: '只允许字母、数字、下划线' },
        })}
      />

      <Input
        label="昵称"
        type="text"
        placeholder="你的昵称"
        leftIcon={<User size={16} />}
        error={errors.display_name?.message}
        {...register('display_name', { required: '请输入昵称' })}
      />

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
        placeholder="至少 6 位"
        autoComplete="new-password"
        leftIcon={<Lock size={16} />}
        rightIcon={
          <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-dark-400 hover:text-dark-600 transition-colors">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        error={errors.password?.message}
        {...register('password', { required: '请输入密码', minLength: { value: 6, message: '密码至少 6 位' } })}
      />

      <Button type="submit" loading={isPending} fullWidth size="lg">
        创建账号
      </Button>
    </motion.form>
  )
})

RegisterForm.displayName = 'RegisterForm'
