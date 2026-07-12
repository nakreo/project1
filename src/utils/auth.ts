import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox, ElMessage } from 'element-plus'

/**
 * 确认并执行退出登录
 * @param router - 调用方传入的 router 实例
 */
export async function confirmLogout(router: ReturnType<typeof useRouter>) {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const auth = useAuthStore()
    auth.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 取消操作，不处理
  }
}
