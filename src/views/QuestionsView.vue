<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/questions'
import { categoryLabels } from '@/data/questions'
import { difficultyLabels, difficultyBadgeColors } from '@/utils'
import type { QuestionCategory } from '@/types'
import EmptyState from '@/components/EmptyState.vue'
import { Notebook, FolderOpened, StarFilled, Search, Refresh, Close } from '@element-plus/icons-vue'

const router = useRouter()

const questionStore = useQuestionStore()

const categories: Array<{ key: QuestionCategory | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  ...Object.entries(categoryLabels).map(([key, label]) => ({
    key: key as QuestionCategory,
    label,
  })),
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900">
        <el-icon :size="24">
          <Notebook />
        </el-icon>
        面试题库
      </h1>
      <el-button type="primary" plain @click="router.push('/random-quiz')">
        <el-icon :size="14">
          <Refresh />
        </el-icon>
        随机刷题
      </el-button>
    </div>
    <!-- 筛选栏 -->
    <div class="space-y-4">
      <!-- 搜索 -->
      <div>
        <el-input
          v-model="questionStore.filter.searchText"
          placeholder="搜索题目..."
          clearable
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
</template>
        </el-input>
      </div>

      <!-- 分类和难度 -->
      <div class="flex flex-wrap gap-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.key"
            @click="questionStore.setFilter({ category: cat.key })"
            class="rounded-full px-3 py-1 text-sm transition"
            :class="questionStore.filter.category === cat.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            {{ cat.label }}
            <span v-if="cat.key !== 'all'" class="ml-1 text-xs opacity-70">
              ({{ (questionStore.categoryCount as Record<string, number>)[cat.key] || 0 }})
            </span>
          </button>
        </div>

        <div class="flex gap-2">
          <button
            v-for="(label, key) in difficultyLabels"
            :key="key"
            @click="questionStore.setFilter({ difficulty: (questionStore.filter.difficulty === key ? 'all' : key) as 'all' | 'easy' | 'medium' | 'hard' })"
            class="rounded-full px-3 py-1 text-sm transition"
            :class="questionStore.filter.difficulty === key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            {{ label }}
          </button>
        </div>

        <button
          @click="questionStore.setFilter({ onlyFavorites: !questionStore.filter.onlyFavorites })"
          class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm transition"
          :class="questionStore.filter.onlyFavorites
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          <el-icon :size="14">
            <StarFilled />
          </el-icon>
          仅收藏
        </button>
        <button
          @click="questionStore.setFilter({ onlyIncorrect: !questionStore.filter.onlyIncorrect })"
          class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm transition"
          :class="questionStore.filter.onlyIncorrect
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          <el-icon :size="14">
            <Close />
          </el-icon>
          错题本 ({{ questionStore.incorrectCount }})
        </button>
      </div>
    </div>

    <!-- 题目列表 -->
    <div class="space-y-3">
      <p class="text-sm text-gray-500">
        共 {{ questionStore.filteredQuestions.length }} 道题目
      </p>

      <EmptyState
        v-if="questionStore.filteredQuestions.length === 0"
        :icon="FolderOpened"
        title="暂无匹配的题目"
        has-filter
        @clear-filter="questionStore.setFilter({ category: 'all', difficulty: 'all', searchText: '', onlyFavorites: false, onlyIncorrect: false })"
      />

      <router-link
        v-for="question in questionStore.filteredQuestions"
        :key="question.id"
        :to="`/questions/${question.id}`"
        class="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ question.title }}</h3>
            <p class="mt-1 line-clamp-2 text-sm text-gray-500">{{ question.description }}</p>
          </div>
          <span
            class="ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
            :class="difficultyBadgeColors[question.difficulty]"
          >
            {{ difficultyLabels[question.difficulty] }}
          </span>
        </div>
        <div class="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>{{ categoryLabels[question.category] }}</span>
          <span
            v-if="questionStore.getProgress(question.id).isIncorrect"
            class="inline-flex items-center gap-1 text-red-500"
          >
            <el-icon :size="12">
              <Close />
            </el-icon>
            需复习
          </span>
          <button
            v-if="questionStore.getProgress(question.id).isStarred"
            @click.prevent="questionStore.toggleStar(question.id)"
            class="inline-flex items-center gap-1 text-yellow-500 hover:text-yellow-600"
          >
            <el-icon :size="12">
              <StarFilled />
            </el-icon>
            已收藏
          </button>
        </div>
      </router-link>
    </div>
  </div>
</template>

