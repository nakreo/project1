<script setup lang="ts">
import { calcPercent } from '@/utils'
import { categoryLabels, categoryColors } from '@/data/questions'
import { DataAnalysis } from '@element-plus/icons-vue'

defineProps<{
  /** 分类统计数据，key 为分类 key，value 为 { total, mastered } */
  stats: Record<string, { total: number; mastered: number }>
  /** 标题 */
  title?: string
  /** 是否显示总览统计卡片 */
  showOverview?: boolean
}>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6">
    <h2 v-if="title" class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
      <el-icon :size="18"><DataAnalysis /></el-icon>
      {{ title }}
    </h2>
    <div class="space-y-4">
      <div
        v-for="(label, key) in categoryLabels"
        :key="key"
      >
        <div class="mb-1 flex items-center justify-between text-sm">
          <span class="font-medium text-gray-700">{{ label }}</span>
          <span class="text-gray-500">
            {{ stats[key]?.mastered ?? 0 }} / {{ stats[key]?.total ?? 0 }}
            （{{ calcPercent(stats[key]?.mastered ?? 0, stats[key]?.total ?? 0) }}%）
          </span>
        </div>
        <div class="h-3 rounded-full bg-gray-100">
          <div
            class="h-3 rounded-full transition-all duration-500"
            :style="{
              width: calcPercent(
                stats[key]?.mastered ?? 0,
                stats[key]?.total ?? 0
              ) + '%',
              backgroundColor: categoryColors[key] || '#3b82f6'
            }"
          />
        </div>
      </div>
    </div>

    <!-- 额外内容插槽 -->
    <slot />
  </div>
</template>
