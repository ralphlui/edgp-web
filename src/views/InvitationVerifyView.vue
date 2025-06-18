<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Form, Input, message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { userService } from '@/services/user.service'

const route = useRoute()
const router = useRouter()
const registering = ref(false)

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const formRules: Record<string, Rule[]> = {
  email: [{ required: true, message: 'Please input your email' }],
  password: [
    { required: true, message: 'Please input your password' },
    { min: 8, message: 'Password must be at least 8 characters' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password' },
    {
      validator: async (_rule: Rule, value: string) => {
        if (value && value !== form.value.password) {
          throw new Error('The two passwords do not match')
        }
      },
    },
  ],
}

const handleSubmit = async () => {
  try {
    registering.value = true
    const token = route.params.token as string

    await userService.completeRegistration({
      email: form.value.email,
      username: form.value.email, // Using email as username
      password: form.value.password,
      userInvitationtoken: token,
    })

    message.success('Registration completed successfully. Please log in to continue.')
    router.push('/')
  } catch (error) {
    console.error('Error completing registration:', error)
    message.error('Failed to complete registration. Please try again.')
  } finally {
    registering.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 text-center">
          Complete Your Registration
        </h2>
        <p class="mt-2 text-sm text-gray-600 text-center">Set up your account to continue</p>
      </div>

      <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <Form layout="vertical" :rules="formRules" @finish="handleSubmit">
          <Form.Item name="email" label="Email" :rules="formRules.email">
            <Input v-model:value="form.email" placeholder="Enter your email" />
          </Form.Item>

          <Form.Item name="password" label="Password" :rules="formRules.password">
            <Input.Password v-model:value="form.password" placeholder="Enter your password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            :rules="formRules.confirmPassword"
          >
            <Input.Password
              v-model:value="form.confirmPassword"
              placeholder="Confirm your password"
            />
          </Form.Item>

          <div class="mt-6">
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="registering"
            >
              {{ registering ? 'Setting up your account...' : 'Complete Registration' }}
            </button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
