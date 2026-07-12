<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/questions'
import { categoryLabels } from '@/data/questions'
import { difficultyLabels, difficultyBadgeColors } from '@/utils'
import { computed } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import QuestionAnswerSection from '@/components/QuestionAnswerSection.vue'
import {
  ArrowLeft,
  StarFilled,
  Star,
  Select,
  CircleCheckFilled,
  Document,
  Search,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const questionStore = useQuestionStore()

const question = computed(() => {
  return questionStore.getQuestionById(route.params.id as string)
})

const progress = computed(() => {
  if (!question.value) return null
  return questionStore.getProgress(question.value.id)
})
</script>

<template>
  <div v-if="question" class="space-y-6">
    <!-- 返回按钮 -->
    <button
      @click="router.back()"
      class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
    >
      <el-icon :size="14">
        <ArrowLeft />
      </el-icon>
      返回
    </button>

    <!-- 题目头部 -->
    <div>
      <div class="flex items-start justify-between">
        <h1 class="text-2xl font-bold text-gray-900">{{ question.title }}</h1>
        <span
          class="shrink-0 rounded-full px-3 py-1 text-sm font-medium"
          :class="difficultyBadgeColors[question.difficulty]"
        >
          {{ difficultyLabels[question.difficulty] }}
        </span>
      </div>
      <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
        <span>{{ categoryLabels[question.category] }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="progress" class="flex gap-3">
      <button
        @click="questionStore.toggleStar(question.id)"
        class="rounded-lg px-4 py-2 text-sm font-medium transition"
        :class="progress.isStarred
          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        <el-icon v-if="progress.isStarred"><StarFilled /></el-icon>
        <el-icon v-else><Star /></el-icon>
        {{ progress.isStarred ? ' 已收藏' : ' 收藏' }}
      </button>
      <button
        @click="questionStore.toggleMastered(question.id)"
        class="rounded-lg px-4 py-2 text-sm font-medium transition"
        :class="progress.isMastered
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        <el-icon v-if="progress.isMastered"><CircleCheckFilled /></el-icon>
        <el-icon v-else><Select /></el-icon>
        {{ progress.isMastered ? ' 已掌握' : ' 标记掌握' }}
      </button>
    </div>

    <!-- 题目描述 -->
    <div class="rounded-xl border border-gray-200 bg-white p-6">
      <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <el-icon :size="18">
          <Document />
        </el-icon>
        题目描述
      </h2>
      <p class="text-gray-700 leading-relaxed">{{ question.description }}</p>
    </div>

    <QuestionAnswerSection :question="question" />

    <!-- 复习按钮 -->
    <div class="flex justify-center py-4">
      <button
        @click="questionStore.recordReview(question.id)"
        class="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        标记已复习（{{ progress ? progress.reviewCount : 0 }} 次）
      </button>
    </div>
  </div>

  <!-- 题目不存在 -->
  <EmptyState
    v-else
    :icon="Search"
    title="题目不存在"
    description="请返回题库查看其他题目"
    action-text="返回题库"
    @action="router.push('/questions')"
  />
</template>

