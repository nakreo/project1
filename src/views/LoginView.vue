<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Briefcase, UserFilled, Lock, Guide, EditPen } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// ===== 登录/注册模式切换 =====
const isRegisterMode = ref(false)

// ===== 登录表单 =====
const loginFormRef = ref()
const loginLoading = ref(false)
const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// ===== 注册表单 =====
const registerFormRef = ref()
const registerLoading = ref(false)
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
})

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, message: '用户名至少 2 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
}

// ===== 切换模式 =====
function switchToRegister() {
  isRegisterMode.value = true
  loginForm.username = ''
  loginForm.password = ''
}

function switchToLogin() {
  isRegisterMode.value = false
  registerForm.username = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
  registerForm.nickname = ''
}

// ===== 登录 =====
async function handleLogin() {
  loginFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return

    loginLoading.value = true
    const success = await auth.login(loginForm.username, loginForm.password)
    loginLoading.value = false

    if (success) {
      ElMessage.success(`欢迎回来，${auth.currentUser}！`)
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      ElMessage.error('用户名或密码错误')
    }
  })
}

// ===== 注册 =====
async function handleRegister() {
  registerFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return

    registerLoading.value = true
    const result = await auth.register(
      registerForm.username,
      registerForm.password,
      registerForm.nickname,
    )
    registerLoading.value = false

    if (result.success) {
      ElMessage.success(`欢迎你，${auth.currentUser}！`)
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      ElMessage.error(result.message)
    }
  })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- 卡片 -->
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg shadow-blue-100/50">
      <!-- Logo & 标题 -->
      <div class="mb-8 text-center">
        <el-icon :size="48" :color="'#3b82f6'" class="mb-3">
          <Briefcase />
        </el-icon>
        <h1 class="text-2xl font-bold text-gray-800">面试刷题助手</h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ isRegisterMode ? '注册新账号，开始你的学习之旅' : '登录以继续你的学习之旅' }}
        </p>
      </div>

      <!-- ===== 登录模式 ===== -->
      <template v-if="!isRegisterMode">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="0"
          size="large"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名">
              <template #prefix>
                <el-icon><UserFilled /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="w-full"
              :loading="loginLoading"
              @click="handleLogin"
            >
              {{ loginLoading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 切换到注册 -->
        <div class="mt-4 text-center">
          <span class="text-sm text-gray-500">还没有账号？</span>
          <el-button text type="primary" size="small" @click="switchToRegister">
            立即注册
          </el-button>
        </div>

        <!-- 测试账号 -->
        <div class="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
          <p class="mb-2 text-xs font-medium text-blue-600">
            <el-icon :size="14" class="mr-0.5 align-text-bottom"><Guide /></el-icon>
            测试账号
          </p>
          <div class="flex flex-wrap gap-2 text-xs text-gray-500">
            admin / admin123 &nbsp;|&nbsp; user / user123 &nbsp;|&nbsp; test / test123
          </div>
        </div>
      </template>

      <!-- ===== 注册模式 ===== -->
      <template v-else>
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="0"
          size="large"
          @keyup.enter="handleRegister"
        >
          <el-form-item prop="username">
            <el-input v-model="registerForm.username" placeholder="用户名">
              <template #prefix>
                <el-icon><UserFilled /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="nickname">
            <el-input v-model="registerForm.nickname" placeholder="昵称">
              <template #prefix>
                <el-icon><EditPen /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="密码（至少 6 位）"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="w-full"
              :loading="registerLoading"
              @click="handleRegister"
            >
              {{ registerLoading ? '注册中...' : '注 册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 切换回登录 -->
        <div class="mt-4 text-center">
          <span class="text-sm text-gray-500">已有账号？</span>
          <el-button text type="primary" size="small" @click="switchToLogin">
            返回登录
          </el-button>
        </div>
      </template>

      <!-- 底部 -->
      <p class="mt-6 text-center text-xs text-gray-400">
        学习 · 进步 · 拿到 Offer
      </p>
    </div>
  </div>
</template>

