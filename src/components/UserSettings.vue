<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { EditPen, Lock, PictureFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const auth = useAuthStore()

// ===== 当前选中的标签页 =====
const activeTab = ref<'nickname' | 'password' | 'avatar'>('nickname')

// ===== 昵称修改 =====
const nicknameFormRef = ref()
const nicknameForm = reactive({
  nickname: '',
})
const nicknameLoading = ref(false)

// ===== 密码修改 =====
const passwordFormRef = ref()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordLoading = ref(false)

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// ===== 头像上传 =====
const uploadLoading = ref(false)
const avatarPreview = ref<string | null>(null)

/** 头像上传前的校验 */
function beforeAvatarUpload(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('仅支持 JPG、PNG、GIF、WebP 格式的图片')
    return false
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

/** 读取文件为 base64 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleAvatarSelect(file: File) {
  if (!beforeAvatarUpload(file)) return

  uploadLoading.value = true
  try {
    const base64Url = await readFileAsDataURL(file)
    avatarPreview.value = base64Url

    const result = await auth.updateAvatar(base64Url)
    if (result.success) {
      ElMessage.success('头像已更新')
    } else {
      ElMessage.error(result.message)
      avatarPreview.value = null
    }
  } catch {
    ElMessage.error('图片读取失败')
  } finally {
    uploadLoading.value = false
  }
}

// ===== 方法 =====

/** 保存昵称 */
async function handleUpdateNickname() {
  nicknameFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    nicknameLoading.value = true
    const result = await auth.updateNickname(nicknameForm.nickname)
    nicknameLoading.value = false
    if (result.success) {
      ElMessage.success('昵称已更新')
      emit('update:modelValue', false)
    } else {
      ElMessage.error(result.message)
    }
  })
}

/** 保存密码 */
async function handleUpdatePassword() {
  passwordFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    passwordLoading.value = true
    const result = await auth.updatePassword(passwordForm.oldPassword, passwordForm.newPassword)
    passwordLoading.value = false
    if (result.success) {
      ElMessage.success('密码已更新')
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      emit('update:modelValue', false)
    } else {
      ElMessage.error(result.message)
    }
  })
}

/** 打开弹窗时初始化表单 */
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nicknameForm.nickname = auth.nickname || ''
      avatarPreview.value = auth.avatarUrl
    }
  },
)
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="账号设置"
    width="440px"
    :close-on-click-modal="false"
  >
    <!-- 选项卡导航 -->
    <div class="mb-6 flex gap-2">
      <button
        :class="activeTab === 'nickname'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition"
        @click="activeTab = 'nickname'"
      >
        <el-icon :size="16"><EditPen /></el-icon>
        修改昵称
      </button>
      <button
        :class="activeTab === 'password'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition"
        @click="activeTab = 'password'"
      >
        <el-icon :size="16"><Lock /></el-icon>
        修改密码
      </button>
      <button
        :class="activeTab === 'avatar'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition"
        @click="activeTab = 'avatar'"
      >
        <el-icon :size="16"><PictureFilled /></el-icon>
        更换头像
      </button>
    </div>

    <!-- ===== 修改昵称 ===== -->
    <div v-if="activeTab === 'nickname'" class="space-y-4">
      <p class="text-sm text-gray-500">当前昵称：<strong>{{ auth.nickname }}</strong></p>
      <el-form
        ref="nicknameFormRef"
        :model="nicknameForm"
        label-width="0"
        size="large"
        @keyup.enter="handleUpdateNickname"
      >
        <el-form-item
          prop="nickname"
          :rules="[{ required: true, message: '昵称不能为空', trigger: 'blur' }]"
        >
          <el-input v-model="nicknameForm.nickname" placeholder="请输入新昵称" />
        </el-form-item>
      </el-form>
      <div class="flex justify-end gap-3">
        <el-button @click="emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" :loading="nicknameLoading" @click="handleUpdateNickname">
          保存
        </el-button>
      </div>
    </div>

    <!-- ===== 修改密码 ===== -->
    <div v-if="activeTab === 'password'" class="space-y-4">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="0"
        size="large"
        @keyup.enter="handleUpdatePassword"
      >
        <el-form-item prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="当前密码"
            show-password
          >
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="新密码（至少 6 位）"
            show-password
          >
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="确认新密码"
            show-password
          >
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>
      </el-form>
      <div class="flex justify-end gap-3">
        <el-button @click="emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleUpdatePassword">
          保存
        </el-button>
      </div>
    </div>

    <!-- ===== 更换头像 ===== -->
    <div v-if="activeTab === 'avatar'" class="flex flex-col items-center space-y-5">
      <!-- 当前头像预览 -->
      <div
        v-if="avatarPreview"
        class="h-28 w-28 rounded-full bg-cover bg-center shadow-md"
        :style="{ backgroundImage: `url(${avatarPreview})` }"
      />
      <div
        v-else
        class="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-5xl font-bold text-white shadow-md"
      >
        {{ auth.currentUser?.charAt(0) || '?' }}
      </div>
      <p class="text-sm text-gray-400">当前头像</p>

      <!-- 上传组件 -->
      <el-upload
        action=""
        :auto-upload="false"
        :show-file-list="false"
        @change="(uploadFile: UploadFile) => { if (uploadFile.raw) handleAvatarSelect(uploadFile.raw) }"
      >
        <el-button type="primary" :loading="uploadLoading">
          {{ uploadLoading ? '上传中...' : '选择本地图片' }}
        </el-button>
      </el-upload>

      <p class="text-xs text-gray-400">
        支持 JPG、PNG、GIF、WebP 格式，大小不超过 2MB
      </p>

      <div class="flex justify-end gap-3 self-stretch pt-2">
        <el-button @click="emit('update:modelValue', false)">关闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>
