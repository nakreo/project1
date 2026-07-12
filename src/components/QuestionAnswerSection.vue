<script setup lang="ts">
/**
 * 题目答案展示组件
 *
 * 统一展示题目的参考答案、代码示例、答题要点
 * 用于 QuestionDetailView 和 RandomQuizView，消除重复渲染逻辑
 */
import type { Question } from '@/types'
import { ChatDotSquare, Monitor, TrendCharts } from '@element-plus/icons-vue'

defineProps<{
  question: Question
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- 参考答案 -->
    <div class="rounded-xl border border-gray-200 bg-white p-6">
      <h3 class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <el-icon :size="18">
          <ChatDotSquare />
        </el-icon>
        参考答案
      </h3>
      <div
        class="prose prose-gray max-w-none whitespace-pre-wrap text-sm leading-relaxed text-gray-700"
      >
        {{ question.answer }}
      </div>
    </div>

    <!-- 代码示例 -->
    <div
      v-if="question.codeExample"
      class="rounded-xl border border-gray-200 bg-white p-6"
    >
      <h3 class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <el-icon :size="18">
          <Monitor />
        </el-icon>
        代码示例
      </h3>
      <pre
        class="overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm"
      ><code>{{ question.codeExample }}</code></pre>
    </div>

    <!-- 答题要点 -->
    <div
      v-if="question.tips"
      class="rounded-xl border border-blue-200 bg-blue-50 p-6"
    >
      <h3 class="mb-2 flex items-center gap-2 text-lg font-semibold text-blue-900">
        <el-icon :size="18">
          <TrendCharts />
        </el-icon>
        答题要点
      </h3>
      <p class="text-sm text-blue-800">{{ question.tips }}</p>
    </div>
  </div>
</template>
