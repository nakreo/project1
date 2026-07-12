<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQuestionStore } from '@/stores/questions'
import { useNoteStore } from '@/stores/notes'
import { useSocialStore } from '@/stores/social'
import { categoryLabels, categoryColors } from '@/data/questions'
import { formatRelativeTime, formatDate, extractStudyDates, calcTotalStudyDays } from '@/utils'
import { confirmLogout } from '@/utils/auth'
import StatCard from '@/components/StatCard.vue'
import QuickLinks from '@/components/QuickLinks.vue'
import CategoryProgress from '@/components/CategoryProgress.vue'
import DifficultyProgress from '@/components/DifficultyProgress.vue'
import UserSettings from '@/components/UserSettings.vue'
import {
  Calendar,
  Reading,
  Document,
  EditPen,
  Notebook,
  ChatDotSquare,
} from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuthStore()
const questionStore = useQuestionStore()
const noteStore = useNoteStore()
const socialStore = useSocialStore()

const settingsVisible = ref(false)

const myPublishedNotes = computed(() => socialStore.getMyPublishedNotes())

const recentReviewedQuestions = computed(() => {
  return Object.entries(questionStore.progress)
    .filter(([, p]) => p.lastReviewedAt)
    .sort(([, a], [, b]) => (b.lastReviewedAt ?? 0) - (a.lastReviewedAt ?? 0))
    .slice(0, 5)
    .map(([qid]) => {
      const q = questionStore.getQuestionById(qid)
      const p = questionStore.getProgress(qid)
      return { question: q, progress: p }
    })
    .filter((item) => item.question)
})

const recentNotes = computed(() => {
  return noteStore.sortedNotes.slice(0, 5)
})

const totalStudyDays = computed(() => {
  return calcTotalStudyDays(extractStudyDates(questionStore.progress))
})

async function handleLogout() {
  await confirmLogout(router)
}
</script>

<template>
  <div class="space-y-6">
    <!-- ===== 顶部用户信息 ===== -->
    <div class="rounded-xl border border-gray-200 bg-white p-6">
      <div class="flex items-center gap-5">
        <!-- 头像 -->
        <div
          v-if="auth.avatarUrl"
          class="h-20 w-20 shrink-0 rounded-full bg-cover bg-center shadow-md"
          :style="{ backgroundImage: `url(${auth.avatarUrl})` }"
        />
        <div
          v-else
          class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-3xl font-bold text-white shadow-md"
        >
          {{ auth.currentUser?.charAt(0) || '?' }}
        </div>

        <!-- 信息 -->
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">{{ auth.currentUser }}</h1>
          <p class="mt-1 text-sm text-gray-500">@{{ auth.username }}</p>
          <div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span class="flex items-center gap-1">
              <el-icon :size="14"><Calendar /></el-icon> 加入时间：{{ auth.createdAt ? formatDate(auth.createdAt) : '2025 年 1 月' }}
            </span>
            <span class="flex items-center gap-1">
              <el-icon :size="14" color="#f59e0b"><Reading /></el-icon> 连续学习 {{ questionStore.streakDays }} 天
            </span>
            <span class="flex items-center gap-1">
              <el-icon :size="14"><Notebook /></el-icon> 总学习 {{ totalStudyDays }} 天
            </span>
          </div>
        </div>

        <!-- 操作 -->
        <div class="flex flex-col gap-2">
          <el-button plain size="small" @click="settingsVisible = true">
            账号设置
          </el-button>
          <el-button type="danger" plain size="small" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </div>
    </div>

    <!-- ===== 学习概览卡片 ===== -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="总题目数"
        :value="questionStore.todayStats.total"
        :progress="Math.round((questionStore.todayStats.totalMastered / questionStore.todayStats.total) * 100)"
        :suffix="`已掌握 ${questionStore.todayStats.totalMastered} 题`"
      />
      <StatCard
        label="今日复习"
        :value="questionStore.todayStats.reviewed"
        color="text-blue-600"
        :suffix="`连续学习 ${questionStore.streakDays} 天`"
      />
      <StatCard
        label="收藏题目"
        :value="Object.values(questionStore.progress).filter((p) => p.isStarred).length"
        color="text-yellow-500"
        :suffix="`待复习 ${Object.values(questionStore.progress).filter((p) => p.isStarred && !p.isMastered).length} 题`"
      />
      <StatCard
        label="学习笔记"
        :value="noteStore.totalCount"
        color="text-green-600"
        :suffix="`共 ${noteStore.allTags ? Object.keys(noteStore.allTags).length : 0} 个标签`"
      />
      <StatCard
        label="讨论区发布"
        :value="myPublishedNotes.length"
        color="text-purple-500"
        suffix="分享知识，共同进步"
      />
    </div>

    <!-- ===== 双栏布局 ===== -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <CategoryProgress
        title="分类掌握进度"
        :stats="questionStore.categoryStats"
      />
      <DifficultyProgress title="难度掌握进度" :stats="questionStore.difficultyStats" mode="list" />
    </div>

    <!-- ===== 最近活动 ===== -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 font-semibold text-gray-900">
            <el-icon :size="16"><Document /></el-icon> 最近复习
          </h3>
          <router-link to="/questions" class="text-sm text-blue-600 hover:text-blue-700">查看全部 →</router-link>
        </div>
        <div v-if="recentReviewedQuestions.length === 0" class="py-8 text-center text-sm text-gray-400">还没有复习记录，去刷题吧！</div>
        <div v-else class="space-y-2">
          <div v-for="item in recentReviewedQuestions" :key="item.question?.id" class="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-gray-50">
            <div class="min-w-0 flex-1">
              <router-link :to="`/questions/${item.question?.id}`" class="block truncate text-sm font-medium text-gray-700 hover:text-blue-600">
                {{ item.question?.title }}
              </router-link>
              <p class="mt-0.5 text-xs text-gray-400">复习 {{ item.progress.reviewCount }} 次 · {{ item.progress.lastReviewedAt ? formatRelativeTime(item.progress.lastReviewedAt) : '' }}</p>
            </div>
            <el-tag
              v-if="item.question"
              :style="{ backgroundColor: categoryColors[item.question.category] + '20', color: categoryColors[item.question.category], borderColor: categoryColors[item.question.category] + '40' }"
              size="small"
            >
              {{ categoryLabels[item.question.category] || item.question.category }}
            </el-tag>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="flex items-center gap-2 font-semibold text-gray-900">
            <el-icon :size="16"><EditPen /></el-icon> 最近笔记
          </h3>
          <router-link to="/notes" class="text-sm text-blue-600 hover:text-blue-700">查看全部 →</router-link>
        </div>
        <div v-if="recentNotes.length === 0" class="py-8 text-center text-sm text-gray-400">还没有学习笔记，去记录吧！</div>
        <div v-else class="space-y-2">
          <div v-for="note in recentNotes" :key="note.id" class="rounded-lg px-3 py-2 transition hover:bg-gray-50">
            <p class="truncate text-sm font-medium text-gray-700">{{ note.title }}</p>
            <p class="mt-0.5 text-xs text-gray-400">
              {{ formatRelativeTime(note.updatedAt) }}
              <span v-if="note.tags.length > 0"> · </span>
              <span v-for="(tag, idx) in note.tags.slice(0, 3)" :key="tag"><template v-if="idx > 0"> </template>#{{ tag }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 快捷入口 ===== -->
    <QuickLinks :links="[
      { to: '/questions', icon: '📚', label: '面试题库' },
      { to: '/ai-interview', icon: '🤖', label: 'AI 面试' },
      { to: '/notes', icon: '✍️', label: '学习笔记' },
      { to: '/discussion', icon: '💬', label: '讨论区' },
      { to: '/statistics', icon: '📊', label: '学习统计' },
    ]" />

    <!-- ===== 用户设置弹窗 ===== -->
    <UserSettings v-model="settingsVisible" />
  </div>
</template>
