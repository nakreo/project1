<script setup lang="ts">
/**
 * 页面标题区域组件
 * - 显示图标 + 标题 + 副标题 + 右侧操作区
 */
defineProps<{
  icon: object
  title: string
  subtitle?: string
  showAction?: boolean
  actionText?: string
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900">
        <el-icon :size="24">
          <component :is="icon" />
        </el-icon>
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
    </div>
    <ElButton v-if="showAction" type="primary" @click="$emit('action')">
      {{ actionText }}
    </ElButton>
  </div>
</template>
