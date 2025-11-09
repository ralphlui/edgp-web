<script setup lang="ts">
import { ref } from 'vue'
import { Modal } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'
import { LogoutOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const isLoggingOut = ref(false)

const clearBrowserState = () => {
  // Clear tokens from localStorage
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')

  // Clear all cookies
  document.cookie.split(';').forEach(function (c) {
    document.cookie = c
      .replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
  })
}

const handleLogout = () => {
  Modal.confirm({
    title: 'Logout Confirmation',
    content: 'Are you sure you want to logout?',
    okText: 'Yes',
    cancelText: 'No',
    onOk: async () => {
      isLoggingOut.value = true
      try {
        await authService.logout()
        // Clear browser state first
        clearBrowserState()
        // Then clear auth store state
        authStore.clearAuth()

        Modal.success({
          title: 'Logout Successful',
          content: 'You have been successfully logged out.',
          onOk: () => {
            router.push({ name: 'home' })
          },
        })
      } catch (error) {
        console.error('Logout failed:', error)
        Modal.error({
          title: 'Logout Failed',
          content: error instanceof Error ? error.message : 'Failed to logout. Please try again.',
          onOk: () => {
            // Even if API call fails, clear local state for security
            clearBrowserState()
            authStore.clearAuth()
            router.push({ name: 'home' })
          },
        })
      } finally {
        isLoggingOut.value = false
      }
    },
  })
}
</script>

<template>
  <div
    class="flex items-center"
    :class="{ 'opacity-50': isLoggingOut }"
    @click="!isLoggingOut && handleLogout"
  >
    <LogoutOutlined />
    <span class="ml-3">{{ isLoggingOut ? 'Logging out...' : 'Logout' }}</span>
  </div>
</template>

<style scoped>
:deep(.ant-menu-item) {
  display: flex;
  align-items: center;
}
</style>
