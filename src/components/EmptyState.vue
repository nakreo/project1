<script setup lang="ts">
/**
 * 空状态占位组件
 * - 显示图标 + 标题 + 描述 + 可选操作按钮
 */
import { Document } from '@element-plus/icons-vue'
import type { Component } from 'vue'

withDefaults(
  defineProps<{
    icon?: Component | string
    title?: string
    description?: string
    actionText?: string
    actionIcon?: Component
    hasFilter?: boolean
  }>(),
  {
    icon: Document,
    title: '暂无数据',
    description: '',
    actionText: '',
    hasFilter: false,
  },
)

const emit = defineEmits<{
  action: []
  clearFilter: []
}>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-12 text-center">
    <el-icon :size="48" class="text-gray-300">
      <component :is="icon" />
    </el-icon>

    <h2 class="mt-4 text-lg font-semibold text-gray-900">{{ title }}</h2>

    <p v-if="description" class="mt-2 text-sm text-gray-500">{{ description }}</p>

    <div class="mt-4 flex justify-center gap-3">
      <ElButton v-if="actionText" type="primary" @click="emit('action')">
        <template v-if="actionIcon" #icon>
          <el-icon><component :is="actionIcon" /></el-icon>
        </template>
        {{ actionText }}
      </ElButton>

      <ElButton v-if="hasFilter" @click="emit('clearFilter')">
        清空筛选条件
      </ElButton>
    </div>
  </div>
</template>
