import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '❌ 缺少 Supabase 环境变量。请复制 .env.example 为 .env 并填写真实密钥。'
  )
}

// 单例 Supabase 客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'vchat-auth-token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
