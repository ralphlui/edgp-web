<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const email = ref('')
const password = ref('')

const handleLogin = () => {
  // TODO: Implement login logic
  console.log('Login attempt:', { email: email.value, password: password.value })
}

defineExpose({
  showModal: () => (visible.value = true),
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
            placeholder="Enter your email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <AButton
          type="primary"
          class="w-full h-9"
          style="background-color: #4f46e5"
          @click="handleLogin"
        >
          Sign In
        </AButton>
        <div class="text-center mt-4">
          <a href="#" class="text-[#4F46E5] hover:underline text-sm">Forgot Password?</a>
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
