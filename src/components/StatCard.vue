<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  color?: string       // 文字颜色类名，如 'text-blue-600'
  icon?: string        // 可选的图标
  suffix?: string      // 附加信息文字
  progress?: number    // 可选的进度百分比 (0-100)
  progressColor?: string // 进度条颜色
  centered?: boolean   // 居中简约模式（用于统计概览页卡片）
}>()
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-5"
    :class="centered ? 'text-center' : ''"
  >
    <p class="text-xs text-gray-400">{{ label }}</p>
    <p class="mt-1 text-2xl font-bold" :class="[color || 'text-gray-900', centered ? '' : '']">
      {{ value }}
    </p>
    <div v-if="progress !== undefined" class="mt-2">
      <el-progress
        :percentage="progress"
        :stroke-width="4"
        :color="progressColor"
      />
    </div>
    <p v-if="suffix" class="mt-1 text-xs text-gray-400">{{ suffix }}</p>

    <!-- 额外内容插槽 -->
    <slot />
  </div>
</template>

