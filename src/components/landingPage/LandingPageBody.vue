<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppAuth from '../auth/AppAuth.vue'
import AButton from 'ant-design-vue/es/button'

const route = useRoute()
const authRef = ref()

const isResetPasswordPage = computed(() => route.path === '/reset-password')

const handleStartFreeTrial = () => {
  if (!isResetPasswordPage.value) {
    authRef.value?.showModal()
  }
}
</script>

<template>
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

    <!-- Auth Modal -->
    <AppAuth ref="authRef" />
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
