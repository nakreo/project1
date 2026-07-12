import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录', noAuth: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: '个人中心' },
    },
    {
      path: '/questions',
      name: 'questions',
      component: () => import('@/views/QuestionsView.vue'),
      meta: { title: '面试题库' },
    },
    {
      path: '/questions/:id',
      name: 'question-detail',
      component: () => import('@/views/QuestionDetailView.vue'),
      meta: { title: '题目详情' },
    },
    {
      path: '/ai-interview',
      name: 'ai-interview',
      component: () => import('@/views/AiInterviewView.vue'),
      meta: { title: 'AI 模拟面试' },
    },
    {
      path: '/notes',
      name: 'notes',
      component: () => import('@/views/NotesView.vue'),
      meta: { title: '学习笔记' },
    },
    {
      path: '/discussion',
      name: 'discussion',
      component: () => import('@/views/DiscussionView.vue'),
      meta: { title: '讨论区' },
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('@/views/StatisticsView.vue'),
      meta: { title: '学习统计' },
    },
    {
      path: '/random-quiz',
      name: 'random-quiz',
      component: () => import('@/views/RandomQuizView.vue'),
      meta: { title: '随机刷题' },
    },
  ],
})

export default router

