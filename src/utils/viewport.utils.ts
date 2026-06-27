/**
 * 🔑 微信内置浏览器 100vh 灾难解决方案
 * 动态注入 --vh CSS 变量，替代 100vh
 */
export function initViewportHeight(): () => void {
  const setVh = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  setVh()
  window.addEventListener('resize', setVh, { passive: true })
  window.addEventListener('orientationchange', setVh, { passive: true })

  return () => {
    window.removeEventListener('resize', setVh)
    window.removeEventListener('orientationchange', setVh)
  }
}

/** 检测是否在微信内置浏览器中 */
export function isWeChatBrowser(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent)
}

/** 检测是否为移动端 */
export function isMobile(): boolean {
  return window.innerWidth < 768
}
