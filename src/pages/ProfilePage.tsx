import React, { useRef, useState } from 'react'
import { NavBar } from '@/components/layout/NavBar'
import { useAuthStore } from '@/stores/auth.store'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { Moon, Sun, LogOut, Camera, Edit2 } from 'lucide-react'
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, reset } = useAuthStore()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { updateProfile, isUpdating } = useUpdateProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')

  const handleSignOut = async () => {
    await authService.signOut()
    reset()
    navigate('/auth', { replace: true })
    toast.success('已退出登录')
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片不能超过 2MB')
      return
    }

    try {
      await updateProfile({ avatarFile: file })
    } catch (err) {
      console.error(err)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ displayName, bio })
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col h-full glass-panel">

      {/* 桌面端标题头 */}
      <div className="hidden md:flex items-center justify-between px-4 pt-5 pb-3 flex-shrink-0">
        <h2 className="text-[18px] font-bold text-dark-900 dark:text-white tracking-tight">我的</h2>
        <button
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          disabled={isUpdating}
          className="text-[14px] font-medium px-2 py-1 text-primary-500 hover:text-primary-600 active:scale-95 transition-all disabled:opacity-50"
        >
          {isUpdating ? '保存中...' : isEditing ? '保存' : '编辑'}
        </button>
      </div>

      {/* 移动端 NavBar */}
      <div className="md:hidden">
        <NavBar
          title="我的"
          rightAction={
            <button
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              disabled={isUpdating}
              className="text-[15px] font-medium px-2 py-1 text-primary-500 hover:text-primary-600 active:scale-95 transition-all disabled:opacity-50"
            >
              {isUpdating ? '保存中...' : isEditing ? '保存' : '编辑'}
            </button>
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-20 md:pb-0">
        {/* 隐藏的图片上传框 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
        />

        {/* 个人信息卡片 */}
        <div className="flex flex-col items-center py-8 gap-4 bg-white dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar
              src={profile?.avatar_url}
              alt={profile?.display_name ?? 'U'}
              size="xl"
            />
            <div className="
              absolute inset-0 bg-black/40 rounded-full
              flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity
            ">
              <Camera size={24} className="text-white" />
            </div>
            {isUpdating && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-full flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="w-full px-8 flex flex-col gap-2 items-center">
            {isEditing ? (
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="昵称"
                className="w-full text-center text-xl font-semibold bg-dark-50 dark:bg-dark-800 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
                maxLength={30}
              />
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-dark-900 dark:text-white">
                  {profile?.display_name ?? '未设置昵称'}
                </h2>
              </div>
            )}

            <p className="text-sm text-dark-400 dark:text-dark-500">
              @{profile?.username ?? 'username'}
            </p>

            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="填写个性签名..."
                className="w-full text-center text-sm bg-dark-50 dark:bg-dark-800 rounded-lg px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                rows={2}
                maxLength={100}
              />
            ) : (
              <p className="text-sm text-dark-500 dark:text-dark-400 text-center mt-1">
                {profile?.bio || '这家伙很懒，什么都没留下'}
              </p>
            )}
          </div>
        </div>

        {/* 设置列表 */}
        <div className="px-4 flex flex-col gap-3 mt-6">
          <button
            onClick={toggle}
            className="
              flex items-center justify-between
              w-full px-4 py-3.5
              glass-card rounded-2xl
              hover:bg-white/80 dark:hover:bg-white/5
              active:scale-[0.98] transition-all duration-150
            "
          >
            <div className="flex items-center gap-3 text-dark-700 dark:text-dark-300">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="text-[15px] font-medium">
                {theme === 'dark' ? '浅色模式' : '深色模式'}
              </span>
            </div>
          </button>

          <Button
            variant="danger"
            fullWidth
            icon={<LogOut size={18} />}
            onClick={handleSignOut}
            size="lg"
            className="mt-4"
          >
            退出登录
          </Button>
        </div>
      </div>
    </div>
  )
}
