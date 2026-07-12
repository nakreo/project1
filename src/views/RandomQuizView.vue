<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/questions'
import { categoryLabels } from '@/data/questions'
import { difficultyLabels, difficultyBadgeColors } from '@/utils'
import type { Question } from '@/types'
import EmptyState from '@/components/EmptyState.vue'
import QuestionAnswerSection from '@/components/QuestionAnswerSection.vue'
import {
  ArrowLeft,
  Refresh,
  StarFilled,
  Star,
  CircleCheckFilled,
  Close,
  Document,
  ChatDotSquare,
  EditPen,
  FolderOpened,
} from '@element-plus/icons-vue'

type QuizMode = 'all' | 'exclude-mastered' | 'incorrect-only'
type PageState = 'select' | 'quiz' | 'empty'

const router = useRouter()
const questionStore = useQuestionStore()

// ===== 状态 =====
const pageState = ref<PageState>('select')
const quizMode = ref<QuizMode>('all')
const currentQuestion = ref<Question | null>(null)
const showAnswer = ref(false)
const userAnswer = ref('')
const sessionCount = ref(0)
const answeredIds = ref<Set<string>>(new Set())

// ===== 计算属性 =====
const progress = computed(() => {
  if (!currentQuestion.value) return null
  return questionStore.getProgress(currentQuestion.value.id)
})
const isMastered = computed(() => progress.value?.isMastered ?? false)
const isIncorrect = computed(() => progress.value?.isIncorrect ?? false)
const isStarred = computed(() => progress.value?.isStarred ?? false)

const modeOptions: Array<{ value: QuizMode; label: string; desc: string; icon: string }> = [
  { value: 'all', label: '全部题目', desc: `${questionStore.questions.length} 道题随机抽`, icon: '📚' },
  { value: 'exclude-mastered', label: '排除已掌握', desc: `跳过已掌握的题目`, icon: '✅' },
  { value: 'incorrect-only', label: '只刷错题', desc: `${questionStore.incorrectCount} 道错题需要复习`, icon: '❌' },
]

// ===== 方法 =====
function startQuiz() {
  const q = pickQuestion()
  if (!q) {
    pageState.value = 'empty'
    return
  }
  currentQuestion.value = q
  showAnswer.value = false
  userAnswer.value = ''
  sessionCount.value = 0
  answeredIds.value = new Set([q.id])
  pageState.value = 'quiz'
}

function pickQuestion(): Question | undefined {
  if (quizMode.value === 'incorrect-only') {
    let q = questionStore.getRandomIncorrect()
    let retries = 0
    while (q && answeredIds.value.has(q.id) && retries < 20) {
      q = questionStore.getRandomIncorrect()
      retries++
    }
    return q
  }
  const excludeMastered = quizMode.value === 'exclude-mastered'
  let q = questionStore.getRandomQuestion(excludeMastered)
  let retries = 0
  while (answeredIds.value.has(q.id) && retries < 20) {
    q = questionStore.getRandomQuestion(excludeMastered)
    retries++
  }
  return q
}

function nextQuestion() {
  const q = pickQuestion()
  if (!q) {
    if (quizMode.value === 'incorrect-only') {
      pageState.value = 'empty'
    } else {
      pageState.value = 'select'
    }
    return
  }
  currentQuestion.value = q
  answeredIds.value.add(q.id)
  showAnswer.value = false
  userAnswer.value = ''
  sessionCount.value++
}

function handleMastered() {
  if (!currentQuestion.value) return
  questionStore.toggleMastered(currentQuestion.value.id)
  if (isIncorrect.value) {
    questionStore.markCorrected(currentQuestion.value.id)
  }
  questionStore.recordReview(currentQuestion.value.id)
}

function handleIncorrect() {
  if (!currentQuestion.value) return
  questionStore.markIncorrect(currentQuestion.value.id)
  questionStore.recordReview(currentQuestion.value.id)
}

function handleToggleStar() {
  if (!currentQuestion.value) return
  questionStore.toggleStar(currentQuestion.value.id)
}

function backToSelect() {
  pageState.value = 'select'
  currentQuestion.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- 顶部导航 -->
    <div class="flex items-center justify-between">
      <button
        v-if="pageState === 'select'"
        @click="router.push('/questions')"
        class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <el-icon :size="14">
          <ArrowLeft />
        </el-icon>
        返回题库
      </button>
      <button
        v-else
        @click="backToSelect"
        class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <el-icon :size="14">
          <ArrowLeft />
        </el-icon>
        重新选择模式
      </button>

      <div v-if="pageState === 'quiz'" class="flex items-center gap-3">
        <span class="text-sm text-gray-400">
          已刷 {{ sessionCount }} 题
        </span>
      </div>
    </div>

    <!-- ===== 模式选择页 ===== -->
    <div v-if="pageState === 'select'" class="space-y-6">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <el-icon :size="24">
            <Refresh />
          </el-icon>
          随机刷题
        </h1>
        <p class="mt-1 text-sm text-gray-500">请选择刷题范围</p>
      </div>

      <div class="grid gap-4">
        <button
          v-for="opt in modeOptions"
          :key="opt.value"
          @click="quizMode = opt.value"
          class="flex items-start gap-4 rounded-xl border-2 p-5 text-left transition"
          :class="quizMode === opt.value
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-gray-300'"
        >
          <span class="mt-0.5 text-2xl">{{ opt.icon }}</span>
          <div class="flex-1">
            <p class="font-semibold text-gray-900">{{ opt.label }}</p>
            <p class="mt-0.5 text-sm text-gray-500">{{ opt.desc }}</p>
          </div>
        </button>
      </div>

      <div class="pt-2">
        <el-button
          type="primary"
          size="large"
          class="w-full"
          @click="startQuiz"
        >
          🚀 开始刷题
        </el-button>
      </div>
    </div>

    <!-- ===== 空状态 ===== -->
    <div v-else-if="pageState === 'empty'" class="py-16 text-center">
      <el-icon :size="64" class="text-gray-300">
        <FolderOpened />
      </el-icon>
      <h2 class="mt-4 text-xl font-semibold text-gray-700">
        {{ quizMode === 'incorrect-only' ? '暂无错题 🎉' : '没有更多题目了' }}
      </h2>
      <p class="mt-2 text-sm text-gray-500">
        {{ quizMode === 'incorrect-only' ? '所有题目都已掌握，继续保持！' : '试试换个模式继续刷题' }}
      </p>
      <div class="mt-6 flex justify-center gap-3">
        <el-button @click="backToSelect">换个模式</el-button>
        <el-button type="primary" @click="router.push('/questions')">去题库看看</el-button>
      </div>
    </div>

    <!-- ===== 答题页 ===== -->
    <template v-else-if="currentQuestion">
      <div class="rounded-xl border border-gray-200 bg-white p-6">
        <div
          v-if="isIncorrect"
          class="mb-4 inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600"
        >
          <el-icon :size="12">
            <Close />
          </el-icon>
          需复习
        </div>
        <!-- 题目元信息 -->
        <div class="mb-4 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold text-gray-900">
                {{ currentQuestion.title }}
              </span>
            </div>
            <div class="mt-2 flex items-center gap-3 text-sm text-gray-500">
              <span>{{ categoryLabels[currentQuestion.category] }}</span>
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="difficultyBadgeColors[currentQuestion.difficulty]"
              >
                {{ difficultyLabels[currentQuestion.difficulty] }}
              </span>
            </div>
          </div>
          <button
            @click="handleToggleStar"
            class="rounded-lg p-2 transition"
            :class="isStarred
              ? 'text-yellow-500 hover:bg-yellow-50'
              : 'text-gray-400 hover:bg-gray-100'"
          >
            <el-icon :size="20">
              <StarFilled v-if="isStarred" />
              <Star v-else />
            </el-icon>
          </button>
        </div>

        <!-- 题目描述 -->
        <div class="mb-6">
          <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <el-icon :size="16">
              <Document />
            </el-icon>
            题目描述
          </h3>
          <p class="text-gray-700 leading-relaxed">{{ currentQuestion.description }}</p>
        </div>

        <!-- 你的回答 -->
        <div class="mb-6">
          <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <el-icon :size="16">
              <EditPen />
            </el-icon>
            你的回答
          </h3>
          <el-input
            v-model="userAnswer"
            type="textarea"
            :rows="5"
            placeholder="在此输入你的答案，然后点击「查看答案」对比..."
            :disabled="showAnswer"
          />
        </div>

        <div v-if="!showAnswer" class="flex items-center gap-3">
          <el-button type="primary" @click="showAnswer = true">
            <el-icon :size="14">
              <ChatDotSquare />
            </el-icon>
            查看答案
          </el-button>
        </div>

        <div v-else class="flex flex-wrap items-center gap-3">
          <el-button type="success" plain @click="handleMastered">
            <el-icon :size="14">
              <CircleCheckFilled />
            </el-icon>
            掌握了
          </el-button>
          <el-button type="danger" plain @click="handleIncorrect">
            <el-icon :size="14">
              <Close />
            </el-icon>
            还需复习
          </el-button>
          <el-button type="primary" @click="nextQuestion">
            <el-icon :size="14">
              <Refresh />
            </el-icon>
            下一题
          </el-button>
        </div>
      </div>

    <!-- 参考答案（展开后显示，复用 QuestionAnswerSection 组件） -->
    <Transition name="fade">
      <div v-if="showAnswer" class="space-y-6">
        <QuestionAnswerSection :question="currentQuestion" />

        <!-- 底部操作 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            复习次数：<span class="font-medium text-gray-700">{{ progress?.reviewCount ?? 0 }}</span>
          </div>
          <div class="flex items-center gap-2">
            <el-button type="success" plain size="small" @click="handleMastered">
              <el-icon :size="14">
                <CircleCheckFilled />
              </el-icon>
              掌握了
            </el-button>
            <el-button type="danger" plain size="small" @click="handleIncorrect">
              <el-icon :size="14">
                <Close />
              </el-icon>
              还需复习
            </el-button>
            <el-button type="primary" @click="nextQuestion">
              <el-icon :size="14">
                <Refresh />
              </el-icon>
              下一题
            </el-button>
          </div>
        </div>
      </div>
    </Transition>
    </template>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
