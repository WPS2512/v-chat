import { supabase } from '@/lib/supabase'

export const storageService = {
  /**
   * 上传用户头像
   * 路径规则：avatars/{userId}/{timestamp}.{ext}
   * 返回公开可访问的 URL
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const filePath = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  /**
   * 上传聊天图片
   * 路径规则：chat-images/{roomId}/{userId}/{timestamp}.{ext}
   */
  async uploadChatImage(
    roomId: string,
    userId: string,
    file: File
  ): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const filePath = `${roomId}/${userId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('chat-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (error) throw error

    const { data } = supabase.storage
      .from('chat-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  },
}
