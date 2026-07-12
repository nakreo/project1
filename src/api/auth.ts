/**
 * 认证相关 API
 * 登录、注册、个人信息管理
 */

import { api } from './http'

export interface LoginResult {
  token: string
  user: {
    username: string
    nickname: string
    avatarUrl: string | null
    createdAt: number
  }
}

export interface RegisterParams {
  username: string
  password: string
  nickname: string
}

export interface UserProfile {
  username: string
  nickname: string
  avatarUrl: string | null
  createdAt: number
}

export const authApi = {
  /** 登录 */
  login: (username: string, password: string) =>
    api.post<LoginResult>('/auth/login', { username, password }),

  /** 注册 */
  register: (params: RegisterParams) =>
    api.post<LoginResult>('/auth/register', params),

  /** 获取用户信息 */
  getProfile: () =>
    api.get<UserProfile>('/auth/profile'),

  /** 更新昵称 */
  updateNickname: (nickname: string) =>
    api.put<null>('/auth/profile/nickname', { nickname }),

  /** 更新密码 */
  updatePassword: (oldPassword: string, newPassword: string) =>
    api.put<null>('/auth/profile/password', { oldPassword, newPassword }),

  /** 更新头像 */
  updateAvatar: (avatarUrl: string) =>
    api.put<null>('/auth/profile/avatar', { avatarUrl }),
}
