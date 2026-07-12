<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { confirmLogout } from '@/utils/auth'
import {
  HomeFilled,
  UserFilled,
  Notebook,
  Monitor,
  EditPen,
  DataAnalysis,
  Briefcase,
  ChatDotSquare,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

interface NavItem {
  path: string
  label: string
  icon: object
}

const navItems: NavItem[] = [
  { path: '/', label: '首页', icon: HomeFilled },
  { path: '/profile', label: '个人中心', icon: UserFilled },
  { path: '/questions', label: '面试题库', icon: Notebook },
  { path: '/ai-interview', label: 'AI 模拟面试', icon: Monitor },
  { path: '/notes', label: '学习笔记', icon: EditPen },
  { path: '/discussion', label: '讨论区', icon: ChatDotSquare },
  { path: '/statistics', label: '学习统计', icon: DataAnalysis },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

async function handleLogout() {
  await confirmLogout(router)
}
</script>

<template>
  <aside class="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
    <!-- Logo -->
    <div class="flex items-center gap-2 border-b border-gray-200 px-6 py-5">
      <el-icon :size="24" :color="'#3b82f6'">
        <Briefcase />
      </el-icon>
      <span class="text-lg font-bold text-gray-800">面试刷题助手</span>
    </div>

    <!-- 导航 -->
    <nav class="flex-1 space-y-1 px-3 py-4">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="isActive(item.path)
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
      >
        <el-icon :size="18">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- 用户信息 & 快捷跳转 -->
    <div class="border-t border-gray-200 px-4 py-4">
      <router-link
        to="/profile"
        class="mb-3 flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-gray-50"
      >
        <span
          v-if="auth.avatarUrl"
          class="h-8 w-8 shrink-0 rounded-full bg-cover bg-center"
          :style="{ backgroundImage: `url(${auth.avatarUrl})` }"
        />
        <span
          v-else
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600"
        >
          {{ auth.currentUser?.charAt(0) || '?' }}
        </span>
        <div class="flex-1 overflow-hidden">
          <p class="truncate text-sm font-medium text-gray-700">{{ auth.currentUser }}</p>
          <p class="text-xs text-gray-400">查看个人中心 →</p>
        </div>
      </router-link>
      <el-button
        class="w-full"
        size="small"
        plain
        @click="handleLogout"
      >
        退出登录
      </el-button>
    </div>
  </aside>
</template>

