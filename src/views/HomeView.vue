<script setup lang="ts">
import { useQuestionStore } from '@/stores/questions'
import StatCard from '@/components/StatCard.vue'
import QuickLinks from '@/components/QuickLinks.vue'
import { Sunny } from '@element-plus/icons-vue'

const questionStore = useQuestionStore()
</script>

<template>
  <div class="space-y-6">
    <!-- 欢迎区域 -->
    <div>
      <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900">
        <el-icon :size="28">
          <Sunny />
        </el-icon>
        欢迎回来！
      </h1>
      <p class="mt-1 text-gray-500">今天也要加油刷题哦</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="总题目数" :value="questionStore.todayStats.total" />
      <StatCard
        label="今日复习"
        :value="questionStore.todayStats.reviewed"
        color="text-blue-600"
      />
      <StatCard
        label="已掌握"
        :value="questionStore.todayStats.totalMastered"
        color="text-green-600"
      />
    </div>

    <!-- 快捷入口 -->
    <QuickLinks :links="[
      { to: '/questions', icon: '📚', label: '去刷题' },
      { to: '/random-quiz', icon: '🔀', label: '随机刷题' },
      { to: '/ai-interview', icon: '🤖', label: 'AI 模拟面试' },
      { to: '/notes', icon: '✍️', label: '学习笔记' },
      { to: '/discussion', icon: '💬', label: '讨论区' },
      { to: '/statistics', icon: '📊', label: '学习统计' },
    ]" />
  </div>
</template>

