import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api'
import { removeFromStorage } from '@/utils'

export const useAuthStore = defineStore('auth', () => {
  // ===== 状态 =====
  const token = ref<string | null>(localStorage.getItem('auth-token'))
  const username = ref<string | null>(localStorage.getItem('auth-username'))
  const nickname = ref<string | null>(localStorage.getItem('auth-nickname'))
  const avatarUrl = ref<string | null>(localStorage.getItem('auth-avatar'))
  const createdAt = ref<number | null>(
    localStorage.getItem('auth-createdAt')
      ? Number(localStorage.getItem('auth-createdAt'))
      : null,
  )

  // ===== 计算属性 =====
  const isLoggedIn = computed(() => !!token.value)
  const currentUser = computed(() => (isLoggedIn.value ? nickname.value : null))

  // ===== 私有方法：同步 token 到 localStorage =====
  function saveTokenToStorage(t: string, u: string, n: string, a: string | null, c: number) {
    token.value = t
    username.value = u
    nickname.value = n
    avatarUrl.value = a
    createdAt.value = c
    localStorage.setItem('auth-token', t)
    localStorage.setItem('auth-username', u)
    localStorage.setItem('auth-nickname', n)
    localStorage.setItem('auth-avatar', a || '')
    localStorage.setItem('auth-createdAt', String(c))
  }

  // ===== 方法 =====

  /**
   * 登录
   */
  async function login(loginUsername: string, password: string): Promise<boolean> {
    const [data, error] = await authApi.login(loginUsername, password)
    if (error || !data) return false

    saveTokenToStorage(
      data.token,
      data.user.username,
      data.user.nickname,
      data.user.avatarUrl,
      data.user.createdAt,
    )
    return true
  }

  /**
   * 注册
   */
  async function register(
    registerUsername: string,
    password: string,
    registerNickname: string,
  ): Promise<{ success: boolean; message: string }> {
    if (registerUsername.length < 2) {
      return { success: false, message: '用户名至少 2 个字符' }
    }
    if (password.length < 6) {
      return { success: false, message: '密码至少 6 个字符' }
    }
    if (!registerNickname || registerNickname.trim().length === 0) {
      return { success: false, message: '请输入昵称' }
    }

    const [data, error] = await authApi.register({
      username: registerUsername,
      password,
      nickname: registerNickname.trim(),
    })

    if (error || !data) {
      return { success: false, message: error || '注册失败' }
    }

    saveTokenToStorage(
      data.token,
      data.user.username,
      data.user.nickname,
      data.user.avatarUrl,
      data.user.createdAt,
    )
    return { success: true, message: '注册成功' }
  }

  /**
   * 更新昵称
   */
  async function updateNickname(newNickname: string): Promise<{ success: boolean; message: string }> {
    if (!newNickname || newNickname.trim().length === 0) {
      return { success: false, message: '昵称不能为空' }
    }

    const [, error] = await authApi.updateNickname(newNickname.trim())
    if (error) return { success: false, message: error }

    nickname.value = newNickname.trim()
    localStorage.setItem('auth-nickname', newNickname.trim())
    return { success: true, message: '昵称已更新' }
  }

  /**
   * 更新密码
   */
  async function updatePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (newPassword.length < 6) {
      return { success: false, message: '新密码至少 6 个字符' }
    }

    const [, error] = await authApi.updatePassword(oldPassword, newPassword)
    if (error) return { success: false, message: error }

    return { success: true, message: '密码已更新' }
  }

  /**
   * 更新头像
   */
  async function updateAvatar(newAvatarUrl: string): Promise<{ success: boolean; message: string }> {
    if (newAvatarUrl.startsWith('data:image') && newAvatarUrl.length > 250000) {
      return { success: false, message: '图片过大，请压缩后再试' }
    }

    const [, error] = await authApi.updateAvatar(newAvatarUrl)
    if (error) return { success: false, message: error }

    avatarUrl.value = newAvatarUrl
    localStorage.setItem('auth-avatar', newAvatarUrl)
    return { success: true, message: '头像已更新' }
  }

  /** 退出登录 */
  function logout() {
    token.value = null
    username.value = null
    nickname.value = null
    avatarUrl.value = null
    createdAt.value = null
    removeFromStorage('auth-token')
    removeFromStorage('auth-username')
    removeFromStorage('auth-nickname')
    removeFromStorage('auth-avatar')
    removeFromStorage('auth-createdAt')
  }

  return {
    token,
    username,
    nickname,
    avatarUrl,
    createdAt,
    isLoggedIn,
    currentUser,
    login,
    register,
    updateNickname,
    updatePassword,
    updateAvatar,
    logout,
  }
})

