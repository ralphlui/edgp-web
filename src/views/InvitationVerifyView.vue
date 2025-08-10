<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal, Form, Input, Button, message } from 'ant-design-vue'
import AButton from 'ant-design-vue/es/button'
import type { Rule } from 'ant-design-vue/es/form'
import { userService } from '@/services/user.service'
import AppAuth from '@/components/auth/AppAuth.vue'

const route = useRoute()
const router = useRouter()
const registering = ref(false)
const modalVisible = ref(false)
const authRef = ref()

const form = reactive({
  email: '',
  username: '',
  password: '',
})

const formRules: Record<string, Rule[]> = {
  email: [
    { required: true, message: 'Please input your email' },
    { type: 'email', message: 'Please enter a valid email address' },
  ],
  username: [
    { required: true, message: 'Please input your username' },
    { min: 3, message: 'Username must be at least 3 characters' },
  ],
  password: [
    { required: true, message: 'Please input your password' },
    { min: 8, message: 'Password must be at least 8 characters' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  ],
}

const handleSubmit = async () => {
  try {
    registering.value = true
    const token = route.params.token as string

    await userService.completeRegistration({
      email: form.email,
      username: form.username,
      password: form.password,
      userInvitationtoken: token,
    })

    message.success('Registration completed successfully. Please log in to continue.')
    modalVisible.value = false

    // Show login modal after successful registration
    setTimeout(() => {
      authRef.value?.showModal()
    }, 300)
  } catch (error) {
    console.error('Error completing registration:', error)
    message.error('Failed to complete registration. Please try again.')
  } finally {
    registering.value = false
  }
}

const handleCancel = () => {
  modalVisible.value = false
  router.push('/')
}

const handleStartFreeTrial = () => {
  // Do nothing since this is an invitation page
}

// Show modal when component mounts
onMounted(() => {
  modalVisible.value = true
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
    <!-- Complete User Registration Modal -->
    <Modal
      v-model:open="modalVisible"
      title="Complete User Registration"
      :footer="null"
      :closable="false"
      :mask-closable="false"
      width="500px"
      :destroy-on-close="true"
      :mask-style="{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }"
      :z-index="1000"
    >
      <Form layout="vertical" :model="form" :rules="formRules" @finish="handleSubmit" class="mt-6">
        <Form.Item name="email" label="Email">
          <Input v-model:value="form.email" placeholder="Enter your email" size="large" />
        </Form.Item>

        <Form.Item name="username" label="Username">
          <Input v-model:value="form.username" placeholder="Choose your username" size="large" />
        </Form.Item>

        <Form.Item name="password" label="Password">
          <Input.Password
            v-model:value="form.password"
            placeholder="Enter your password"
            size="large"
          />
        </Form.Item>

        <div class="flex justify-end space-x-3 mt-8">
          <Button @click="handleCancel" :disabled="registering" size="large"> Cancel </Button>
          <Button
            type="primary"
            html-type="submit"
            :loading="registering"
            size="large"
            class="bg-blue-600 hover:bg-blue-700"
          >
            {{ registering ? 'Verifying...' : 'Verify' }}
          </Button>
        </div>
      </Form>
    </Modal>

    <!-- Same content as main landing page -->
    <div class="min-h-screen pt-[64px]">
      <!-- Hero Section -->
      <section class="py-14 bg-white">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-4 text-gray-900">Unify Your Master</h1>
          <h1 class="text-4xl md:text-6xl font-bold mb-2 text-gray-900">Data Management</h1>
          <p class="text-[#6B7280] mb-8 text-lg font-['Inter'] text-center">
            Transform fragmented data into a single source of truth with
            <br />AI-powered governance
          </p>
          <AButton
            type="primary"
            size="large"
            class="h-12 px-8 text-lg"
            style="background-color: #4f46e5"
            @click="handleStartFreeTrial"
          >
            Start Free Trial
          </AButton>
        </div>
      </section>

      <!-- Vision Section -->
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold mb-4 text-left">Our Vision</h2>
            <p class="text-[#6B7280] mb-8 text-base">
              Become the unified system of record for master data governance, enabling organizations
              to achieve data integrity, compliance, and operational efficiency.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="bg-[#F8FAFC] p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4">Centralized Governance</h3>
                <p class="text-[#6B7280] text-sm">
                  Unified policies and domain models for cross-departmental consistency
                </p>
              </div>
              <div class="bg-[#F8FAFC] p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4">Automated Compliance</h3>
                <p class="text-[#6B7280] text-sm">
                  AI-powered duplication detection, rule enforcement, and remediation
                </p>
              </div>
              <div class="bg-[#F8FAFC] p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4">Trusted Decision-Making</h3>
                <p class="text-[#6B7280] text-sm">
                  Real-time analytics on data quality and policy adherence
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold mb-12 text-center">Enterprise-Grade Features</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-semibold mb-4">Predefined Domain Models</h3>
              <ul class="text-[#6B7280] text-sm list-disc pl-5 space-y-2">
                <li>Product management</li>
                <li>Business partner data</li>
                <li>Location tracking</li>
                <li>API integration support</li>
              </ul>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-semibold mb-4">AI-Powered Quality Management</h3>
              <ul class="text-[#6B7280] text-sm list-disc pl-5 space-y-2">
                <li>Intelligent validation rules</li>
                <li>AI duplication detection</li>
                <li>Automated data cleansing</li>
                <li>Real-time quality metrics</li>
              </ul>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-semibold mb-4">Enterprise Security</h3>
              <ul class="text-[#6B7280] text-sm list-disc pl-5 space-y-2">
                <li>Role-based access control</li>
                <li>Advanced authentication</li>
                <li>Audit logging</li>
                <li>Data encryption</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold mb-12 text-center">Flexible Pricing Plans</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              class="bg-white p-8 rounded-lg shadow-md border transition-transform duration-300 hover:scale-105"
            >
              <h3 class="text-2xl font-bold mb-2">Free</h3>
              <p class="text-[#6B7280] text-sm mb-4">Perfect for getting started</p>
              <p class="text-[#111827] text-4xl font-bold mb-6">
                $0<span class="text-sm text-[#6B7280] font-normal">/month</span>
              </p>
              <ul class="text-[#6B7280] text-sm list-disc pl-5 space-y-2 mb-6">
                <li>1 Data Analyst</li>
                <li>1,000 Records/batch</li>
                <li>Manual Upload Only</li>
                <li>Basic Support</li>
              </ul>
              <AButton
                type="primary"
                ghost
                class="w-full h-[45px] border-2 !border-[#4F46E5] !bg-transparent hover:!bg-[#4F46E5] !text-[#4F46E5] hover:!text-white transition-all duration-300"
                @click="handleStartFreeTrial"
              >
                Get Started
              </AButton>
            </div>
            <div
              class="bg-white p-8 rounded-lg shadow-md border transition-transform duration-300 hover:scale-105"
            >
              <h3 class="text-2xl font-bold mb-2">Business</h3>
              <p class="text-[#6B7280] text-sm mb-4">For growing organizations</p>
              <p class="text-[#111827] text-4xl font-bold mb-6">
                $499<span class="text-sm text-[#6B7280] font-normal">/month</span>
              </p>
              <ul class="text-[#6B7280] text-sm list-disc pl-5 space-y-2 mb-6">
                <li>5 Data Analysts</li>
                <li>5,000 Records/batch</li>
                <li>Manual Upload Only</li>
                <li>Priority Support</li>
              </ul>
              <AButton
                type="primary"
                ghost
                class="w-full h-[45px] border-2 !border-[#4F46E5] !bg-transparent hover:!bg-[#4F46E5] !text-[#4F46E5] hover:!text-white transition-all duration-300"
                @click="handleStartFreeTrial"
              >
                Start Trial
              </AButton>
            </div>
            <div
              class="bg-white p-8 rounded-lg shadow-md border transition-transform duration-300 hover:scale-105"
            >
              <h3 class="text-2xl font-bold mb-2">Enterprise</h3>
              <p class="text-[#6B7280] text-sm mb-4">For large organizations</p>
              <p class="text-[#111827] text-4xl font-bold mb-6">Custom</p>
              <ul class="text-[#6B7280] text-sm list-disc pl-5 space-y-2 mb-6">
                <li>Unlimited Users</li>
                <li>Unlimited Records</li>
                <li>Full ERP Integration</li>
                <li>24/7 Support</li>
              </ul>
              <AButton
                type="primary"
                ghost
                class="w-full h-[45px] border-2 !border-[#4F46E5] !bg-transparent hover:!bg-[#4F46E5] !text-[#4F46E5] hover:!text-white transition-all duration-300"
                @click="handleStartFreeTrial"
              >
                Contact Sales
              </AButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-white border-t py-8">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="text-gray-600 mb-4 md:mb-0">© 2025 DataGov. All rights reserved.</div>
            <div class="flex space-x-6">
              <a href="#" class="text-gray-600 hover:text-[#4F46E5]">Privacy</a>
              <a href="#" class="text-gray-600 hover:text-[#4F46E5]">Terms</a>
              <a href="#" class="text-gray-600 hover:text-[#4F46E5]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- Auth Modal for Login after Registration -->
    <AppAuth ref="authRef" />
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
