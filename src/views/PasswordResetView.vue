<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const resetEmail = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const router = useRouter()
const loading = ref(false)
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const emailInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  // Auto-focus email input when component mounts
  emailInput.value?.focus()
})

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!resetEmail.value) {
    emailError.value = 'Email is required'
    return false
  }
  if (!emailRegex.test(resetEmail.value)) {
    emailError.value = 'Please enter a valid email'
    return false
  }
  emailError.value = ''
  return true
}

const validatePassword = () => {
  if (!newPassword.value) {
    passwordError.value = 'New password is required'
    return false
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }
  passwordError.value = ''
  return true
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
    return false
  }
  if (confirmPassword.value !== newPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return false
  }
  confirmPasswordError.value = ''
  return true
}

const handleSubmit = async (e: Event) => {
  e.preventDefault() // Prevent form submission if used within a form
  await handleResetPassword()
}

const handleResetPassword = async () => {
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  const isConfirmPasswordValid = validateConfirmPassword()

  if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
    return
  }

  loading.value = true
  try {
    // TODO: Implement actual password reset logic here
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call
    message.success({
      content: 'Password reset instructions sent! Please check your email.',
      duration: 4,
    })
    // Allow user to see the success message before redirecting
    await new Promise((resolve) => setTimeout(resolve, 2000))
    router.push('/')
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to send reset instructions. Please try again.'

    message.error({
      content: errorMessage,
      duration: 5,
    })
    // Focus the email input for retry
    emailInput.value?.focus()
  } finally {
    loading.value = false
  }
}

const goBackToLogin = () => {
  router.push('/')
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="bg-white py-8 px-4 shadow-xl border border-gray-200 sm:rounded-lg sm:px-10 transform transition-all hover:shadow-2xl"
      >
        <div class="flex items-center mb-6">
          <button
            @click="goBackToLogin"
            class="text-gray-600 hover:text-[#4F46E5] mr-2 transition-colors duration-200"
          >
            <span class="text-lg">←</span>
          </button>
          <h2 class="text-2xl font-bold text-center flex-grow mr-6">Reset Password</h2>
        </div>

        <div class="bg-gray-50 p-4 rounded-md mb-6">
          <p class="text-gray-600 text-sm">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form @submit="handleSubmit" id="reset-form" class="mb-6">
          <div class="space-y-4">
            <div>
              <label for="reset-email" class="block text-sm font-medium text-gray-700">Email</label>
              <input
                ref="emailInput"
                type="email"
                id="reset-email"
                v-model="resetEmail"
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
              <p v-if="emailError" class="mt-1 text-sm text-red-600" role="alert">
                {{ emailError }}
              </p>
            </div>

            <div>
              <label for="new-password" class="block text-sm font-medium text-gray-700"
                >New Password</label
              >
              <input
                type="password"
                id="new-password"
                v-model="newPassword"
                @blur="validatePassword"
                placeholder="Enter new password"
                required
                :class="[
                  'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors duration-200',
                  passwordError
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-[#4F46E5] focus:border-[#4F46E5]',
                ]"
              />
              <p v-if="passwordError" class="mt-1 text-sm text-red-600" role="alert">
                {{ passwordError }}
              </p>
            </div>

            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700"
                >Confirm Password</label
              >
              <input
                type="password"
                id="confirm-password"
                v-model="confirmPassword"
                @blur="validateConfirmPassword"
                placeholder="Confirm new password"
                required
                :class="[
                  'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm transition-colors duration-200',
                  confirmPasswordError
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-[#4F46E5] focus:border-[#4F46E5]',
                ]"
              />
              <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600" role="alert">
                {{ confirmPasswordError }}
              </p>
            </div>
          </div>
        </form>

        <button
          type="submit"
          form="reset-form"
          :disabled="loading"
          class="w-full h-[45px] flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="mr-2">
            <svg
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
          {{ loading ? 'Resetting...' : 'Submit' }}
        </button>
      </div>
    </div>
  </div>
</template>
