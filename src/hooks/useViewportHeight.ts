import { useEffect } from 'react'
import { initViewportHeight } from '@/utils/viewport.utils'

/**
 * 🔑 动态视口高度 Hook
 * 在应用根组件挂载时初始化 --vh CSS 变量
 * 解决微信内置浏览器动态底栏导致的 100vh 遮挡问题
 */
export function useViewportHeight(): void {
  useEffect(() => {
    const cleanup = initViewportHeight()
    return cleanup
  }, [])
}
