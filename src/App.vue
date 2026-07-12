<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQuestionStore } from '@/stores/questions'
import { useNoteStore } from '@/stores/notes'
import { useSocialStore } from '@/stores/social'
import Sidebar from '@/components/Sidebar.vue'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const auth = useAuthStore()
const questionStore = useQuestionStore()
const noteStore = useNoteStore()
const socialStore = useSocialStore()

/** 登录页不需要侧边栏 */
const isLoginPage = () => route.name === 'login'

/** 初始数据是否已加载 */
const dataLoaded = ref(false)

/** 登录后加载初始数据 */
watch(() => auth.isLoggedIn, async (loggedIn) => {
  if (loggedIn) {
    dataLoaded.value = false
    await Promise.all([
      questionStore.fetchAll(),
      noteStore.fetchAll(),
      socialStore.fetchPublicNotes(),
    ])
    dataLoaded.value = true
  }
}, { immediate: true })
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 侧边栏：非登录页才显示 -->
    <Sidebar v-if="!isLoginPage()" />

    <!-- 主内容区 -->
    <main :class="['flex-1 overflow-y-auto', isLoginPage() ? '' : 'mx-auto max-w-4xl px-8 py-8']">
      <div v-if="auth.isLoggedIn && !dataLoaded" class="flex items-center justify-center py-20">
        <el-icon class="is-loading" :size="32" color="#409eff">
          <Loading />
        </el-icon>
        <span class="ml-3 text-gray-500">加载中...</span>
      </div>
      <router-view v-else />
    </main>
  </div>
</template>

<style scoped></style>

