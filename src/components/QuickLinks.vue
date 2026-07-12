<script setup lang="ts">
import {
  Promotion,
  Notebook,
  Monitor,
  Refresh,
  EditPen,
  DataAnalysis,
  ChatDotSquare,
} from '@element-plus/icons-vue'

const iconMap: Record<string, object> = {
  '📚': Notebook,
  '🤖': Monitor,
  '🔀': Refresh,
  '✍️': EditPen,
  '📊': DataAnalysis,
  '💬': ChatDotSquare,
}

defineProps<{
  /** 链接配置 */
  links: Array<{
    to: string
    icon: string
    label: string
  }>
}>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-5">
    <h3 class="mb-4 flex items-center gap-2 font-semibold text-gray-900">
      <el-icon :size="18">
        <Promotion />
      </el-icon>
      快捷入口
    </h3>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
      >
        <el-icon :size="28">
          <component :is="iconMap[link.icon] || Notebook" />
        </el-icon>
        <span class="text-sm font-medium text-gray-700">{{ link.label }}</span>
      </router-link>
    </div>
  </div>
</template>

