<script setup lang="ts">
/**
 * 用户头像组件
 * - 有头像 URL 时显示图片
 * - 无头像时显示昵称首字母（带背景色）
 * - 支持自定义尺寸
 */
withDefaults(
  defineProps<{
    nickname?: string
    avatarUrl?: string
    size?: number
  }>(),
  {
    nickname: '?',
    size: 32,
  },
)
</script>

<template>
  <span
    v-if="avatarUrl"
    class="inline-block shrink-0 rounded-full bg-cover bg-center"
    :style="{
      width: size + 'px',
      height: size + 'px',
      backgroundImage: `url(${avatarUrl})`,
    }"
  />
  <span
    v-else
    class="inline-flex shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
    :style="{
      width: size + 'px',
      height: size + 'px',
      fontSize: Math.max(size * 0.45, 10) + 'px',
    }"
  >
    {{ nickname?.charAt(0) || '?' }}
  </span>
</template>
