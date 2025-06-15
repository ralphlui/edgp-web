<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const visible = ref(false)
const authStore = useAuthStore()

// Only allow showing modal if not on reset password page
const showModal = () => {
  if (route.path !== '/reset-password') {
    visible.value = true
  }
}

// Close modal if user navigates to reset password page
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/reset-password') {
      visible.value = false
    }
  },
)
const email = ref('')
const password = ref('')
const loading = ref(false)
const emailError = ref('')
const passwordError = ref('')

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email'
    return false
  }
  emailError.value = ''
  return true
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Password is required'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }
  passwordError.value = ''
  return true
}

const handleLogin = async () => {
  if (!validateEmail() || !validatePassword()) {
    return
  }

  loading.value = true
  try {
    const response = await authService.login(email.value, password.value)
    authStore.setAuth(response)
    message.success('Login successful!')
    visible.value = false
    router.push('/dashboard')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.'
    message.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  visible.value = false
  router.push('/reset-password')
}

defineExpose({
  showModal,
})
</script>

<template>
  <AModal
    v-model:visible="visible"
    :footer="null"
    title=""
    :width="400"
    :maskClosable="true"
    centered
  >
    <div class="flex flex-col items-center">
      <h2 class="text-2xl font-bold mb-2 text-center">Login</h2>
      <ADivider class="my-2" />
      <div class="w-full max-w-md">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            @blur="validateEmail"
            placeholder="Enter your email"
            required
            :class="[
              'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors duration-200',
              emailError
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-[#4F46E5] focus:border-[#4F46E5]',
            ]"
          />
          <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            @blur="validatePassword"
            placeholder="Enter your password"
            required
            :class="[
              'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors duration-200',
              passwordError
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-[#4F46E5] focus:border-[#4F46E5]',
            ]"
          />
          <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
        </div>
        <AButton
          type="primary"
          class="w-full h-9"
          style="background-color: #4f46e5"
          :loading="loading"
          @click="handleLogin"
        >
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </AButton>
        <div class="text-center mt-4">
          <button @click="handleForgotPassword" class="text-[#4F46E5] hover:underline text-sm">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  </AModal>
</template>

<style scoped>
:deep(.ant-modal-header) {
  border-bottom: none;
  padding-bottom: 0;
}
:deep(.ant-modal-body) {
  padding-top: 0;
}
</style>
