import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { authService } from '@/services/auth.service'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

type AuthTab = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const [tab, setTab] = useState<AuthTab>('login')

  const handleForgotPassword = async (email: string) => {
    try {
      await authService.resetPassword(email)
      toast.success('重置邮件已发送，请查收邮箱')
      setTab('login')
    } catch {
      toast.error('发送失败，请稍后重试')
    }
  }

  return (
    <div className="
      min-h-screen-dynamic
      flex items-center justify-center
      bg-gradient-to-br from-primary-50 via-white to-indigo-50
      dark:from-dark-950 dark:via-dark-900 dark:to-primary-950/20
      p-4
    ">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-200/30 dark:bg-primary-800/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-200/30 dark:bg-indigo-800/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="
          relative w-full max-w-sm
          bg-white/80 dark:bg-dark-900/80
          backdrop-blur-xl
          rounded-3xl
          border border-white/50 dark:border-dark-700/50
          shadow-2xl shadow-primary-500/10
          p-8
        "
      >
        {/* Logo & 标题 */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-primary-500/30">
            💬
          </div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">VChat</h1>
          <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">极简 · 高级 · 实时聊天</p>
        </div>

        {/* Tab 切换（登录/注册） */}
        {tab !== 'forgot' && (
          <div className="flex rounded-2xl bg-dark-100 dark:bg-dark-800 p-1 mb-6">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`
                  flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${tab === t
                    ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-sm'
                    : 'text-dark-500 dark:text-dark-400'
                  }
                `}
              >
                {t === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>
        )}

        {/* 表单区域 */}
        <AnimatePresence mode="wait">
          {tab === 'login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <LoginForm onForgotPassword={() => setTab('forgot')} />
            </motion.div>
          )}
          {tab === 'register' && (
            <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <RegisterForm />
            </motion.div>
          )}
          {tab === 'forgot' && (
            <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <ForgotPasswordForm
                onSubmit={handleForgotPassword}
                onBack={() => setTab('login')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ===== 忘记密码内联组件 =====
interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>
  onBack: () => void
}

const ForgotPasswordForm = React.memo<ForgotPasswordFormProps>(({ onSubmit, onBack }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(email)
    setLoading(false)
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div className="text-center mb-2">
        <p className="text-sm text-dark-500 dark:text-dark-400">
          输入注册邮箱，我们将发送重置链接
        </p>
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="
          w-full h-11 px-4 rounded-2xl
          bg-dark-100 dark:bg-dark-800
          border border-transparent
          text-dark-900 dark:text-dark-100
          placeholder-dark-400
          focus:outline-none focus:border-primary-400
          focus:ring-2 focus:ring-primary-400/20
          transition-all duration-150
        "
      />
      <Button type="submit" loading={loading} fullWidth size="lg">发送重置邮件</Button>
      <Button type="button" variant="ghost" fullWidth onClick={onBack}>← 返回登录</Button>
    </motion.form>
  )
})

ForgotPasswordForm.displayName = 'ForgotPasswordForm'
