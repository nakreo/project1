<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/questions'
import { calcPercent } from '@/utils'
import CategoryProgress from '@/components/CategoryProgress.vue'
import DifficultyProgress from '@/components/DifficultyProgress.vue'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { DataAnalysis, RefreshRight, Document } from '@element-plus/icons-vue'

const router = useRouter()
const questionStore = useQuestionStore()
</script>

<template>
  <div class="space-y-6">
    <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900">
      <el-icon :size="24"><DataAnalysis /></el-icon>
      学习统计
    </h1>

    <!-- 概览统计 -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="总题目" :value="questionStore.todayStats.total" centered />
      <StatCard label="已掌握" :value="questionStore.todayStats.totalMastered" color="text-blue-600" centered />
      <StatCard label="今日复习" :value="questionStore.todayStats.reviewed" color="text-green-600" centered />
      <StatCard
        label="掌握率"
        :value="`${calcPercent(questionStore.todayStats.totalMastered, questionStore.todayStats.total)}%`"
        color="text-orange-600"
        centered
      />
    </div>

    <!-- 学习习惯 -->
    <div class="grid grid-cols-2 gap-4">
      <StatCard label="连续学习天数" :value="questionStore.streakDays" color="text-purple-600" centered />
      <StatCard
        label="收藏题目"
        :value="Object.values(questionStore.progress).filter(p => p.isStarred).length"
        color="text-indigo-600"
        centered
      />
    </div>

    <!-- 各分类掌握情况 -->
    <CategoryProgress
      title="各分类掌握情况"
      :stats="questionStore.categoryStats"
    />

    <!-- 各难度掌握情况 -->
    <DifficultyProgress
      title="各难度掌握情况"
      :stats="questionStore.difficultyStats"
      mode="card"
    />

    <!-- 复习最多的题目 -->
    <div class="rounded-xl border border-gray-200 bg-white p-6">
      <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <el-icon :size="18"><RefreshRight /></el-icon>
        复习最多的题目
      </h2>
      <div v-if="questionStore.topReviewed.length > 0" class="space-y-3">
        <div
          v-for="(q, index) in questionStore.topReviewed"
          :key="q.id"
          class="flex items-center gap-3"
        >
          <span class="w-6 text-center text-sm font-bold text-gray-400">#{{ index + 1 }}</span>
          <router-link
            :to="`/questions/${q.id}`"
            class="flex-1 truncate text-sm text-gray-700 hover:text-blue-600 hover:underline"
          >
            {{ q.title }}
          </router-link>
          <span class="shrink-0 text-sm text-gray-400">{{ q.progress.reviewCount }} 次</span>
        </div>
      </div>
      <EmptyState
        v-else
        :icon="Document"
        title="还没有复习记录"
        description="去刷题吧！"
        action-text="去刷题"
        @action="router.push('/questions')"
      />
    </div>
  </div>
</template>

