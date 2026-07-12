<script setup lang="ts">
import { difficultyLabels, difficultyTextColors, difficultyBgColors, calcPercent } from '@/utils'
import { Aim } from '@element-plus/icons-vue'

const props = defineProps<{
  /** 难度统计，key 为 difficulty，value 为 { total, mastered } */
  stats: Record<string, { total: number; mastered: number }>
  /** 显示模式：'card'=卡片模式, 'list'=列表模式 */
  mode?: 'card' | 'list'
  /** 标题 */
  title?: string
}>()

const difficultyKeys = ['easy', 'medium', 'hard'] as const
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6">
    <h2 v-if="title" class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
      <el-icon :size="18"><Aim /></el-icon>
      {{ title }}
    </h2>

    <!-- 卡片模式 -->
    <div v-if="mode === 'card'" class="grid grid-cols-3 gap-4">
      <div
        v-for="key in difficultyKeys"
        :key="key"
        class="rounded-lg border border-gray-100 p-4 text-center"
      >
        <p class="text-sm text-gray-500">{{ difficultyLabels[key] }}</p>
        <p class="mt-1 text-2xl font-bold" :class="difficultyTextColors[key]">
          {{ calcPercent(stats[key]?.mastered ?? 0, stats[key]?.total ?? 0) }}%
        </p>
        <p class="text-xs text-gray-400">
          {{ stats[key]?.mastered ?? 0 }} / {{ stats[key]?.total ?? 0 }}
        </p>
        <div class="mt-2 h-2 rounded-full bg-gray-100">
          <div
            class="h-2 rounded-full transition-all duration-500"
            :class="difficultyBgColors[key]"
            :style="{
              width: calcPercent(stats[key]?.mastered ?? 0, stats[key]?.total ?? 0) + '%'
            }"
          />
        </div>
      </div>
    </div>

    <!-- 列表模式（Element Plus 进度条） -->
    <div v-else class="space-y-3">
      <div v-for="key in difficultyKeys" :key="key">
        <div class="mb-1 flex items-center justify-between text-sm">
          <span class="font-medium text-gray-700">{{ difficultyLabels[key] }}</span>
          <span class="text-gray-400">{{ stats[key]?.mastered ?? 0 }}/{{ stats[key]?.total ?? 0 }}</span>
        </div>
        <el-progress
          :percentage="calcPercent(stats[key]?.mastered ?? 0, stats[key]?.total ?? 0)"
          :stroke-width="8"
          :color="key === 'easy' ? '#67c23a' : key === 'medium' ? '#e6a23c' : '#f56c6c'"
        />
      </div>
    </div>

    <slot />
  </div>
</template>
