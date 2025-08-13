<script setup lang="ts">
import { ref, watch } from 'vue'
import { Modal } from 'ant-design-vue'
import { policyService, type Policy } from '@/services/policy.service'

interface Props {
  open: boolean
  policyId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

// Component state
const viewingPolicy = ref<Policy | null>(null)
const loadingPolicyDetails = ref(false)

// Format date to DD MMM YYYY
const formatDate = (dateString?: string) => {
  if (!dateString) {
    const today = new Date()
    return today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Load policy details
const loadPolicyDetails = async (policyId: string) => {
  try {
    loadingPolicyDetails.value = true
    console.log('Loading policy details for ID:', policyId)

    const response = await policyService.viewPolicy(policyId)
    console.log('Policy details:', response.data)

    viewingPolicy.value = response.data
  } catch (error) {
    console.error('Error loading policy details:', error)
    viewingPolicy.value = null
    emit('close') // Close modal on error
  } finally {
    loadingPolicyDetails.value = false
  }
}

// Handle modal close
const handleClose = () => {
  viewingPolicy.value = null
  emit('close')
}

// Watch for policyId changes
watch(
  () => props.policyId,
  (newPolicyId) => {
    if (newPolicyId && props.open) {
      loadPolicyDetails(newPolicyId)
    }
  },
  { immediate: true },
)

// Watch for modal open changes
watch(
  () => props.open,
  (newOpen) => {
    if (newOpen && props.policyId) {
      loadPolicyDetails(props.policyId)
    } else if (!newOpen) {
      viewingPolicy.value = null
    }
  },
)
</script>

<template>
  <Modal
    :open="open"
    title="Policy Detailed View"
    :footer="null"
    width="900px"
    :mask-closable="true"
    :destroy-on-close="true"
    @cancel="handleClose"
  >
    <div v-if="loadingPolicyDetails" class="text-center py-8">
      <div class="text-gray-500">Loading policy details...</div>
    </div>

    <div v-else-if="viewingPolicy" class="space-y-6">
      <!-- Policy Basic Information -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Policy Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Policy Name</label>
            <p class="mt-1 text-sm text-gray-900">{{ viewingPolicy.policyName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Domain</label>
            <p class="mt-1 text-sm text-gray-900">{{ viewingPolicy.domainName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <span
              :class="{
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': true,
                'bg-green-100 text-green-800': viewingPolicy.published,
                'bg-gray-100 text-gray-800': !viewingPolicy.published,
              }"
            >
              {{ viewingPolicy.published ? 'Active' : 'Draft' }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Policy ID</label>
            <p class="mt-1 text-sm text-gray-600 font-mono">{{ viewingPolicy.policyId }}</p>
          </div>
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700">Description</label>
          <p class="mt-1 text-sm text-gray-900">
            {{ viewingPolicy.description || 'No description provided' }}
          </p>
        </div>
      </div>

      <!-- Rules Section -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          Rules ({{ viewingPolicy.rules?.length || 0 }})
        </h3>

        <div v-if="viewingPolicy.rules && viewingPolicy.rules.length > 0" class="space-y-4">
          <div
            v-for="(rule, index) in viewingPolicy.rules"
            :key="rule.ruleId"
            class="border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-medium text-gray-900">{{ rule.ruleName }}</h4>
              <span class="text-xs text-gray-500">Rule #{{ index + 1 }}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label class="block text-xs font-medium text-gray-600">Applied to Field</label>
                <span
                  class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium"
                >
                  {{ rule.appliesToField }}
                </span>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600">Rule ID</label>
                <p class="text-xs text-gray-500 font-mono">{{ rule.ruleId }}</p>
              </div>
            </div>

            <!-- Parameters -->
            <div v-if="rule.parameters && Object.keys(rule.parameters).length > 0" class="mt-3">
              <label class="block text-xs font-medium text-gray-600 mb-2">Parameters</label>
              <div class="bg-gray-100 rounded p-3">
                <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{
                  JSON.stringify(rule.parameters, null, 2)
                }}</pre>
              </div>
            </div>

            <!-- Description -->
            <div v-if="rule.description" class="mt-3">
              <label class="block text-xs font-medium text-gray-600">Description</label>
              <p class="text-sm text-gray-700">{{ rule.description }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-4 text-gray-500">No rules defined for this policy</div>
      </div>

      <!-- Metadata Section -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Metadata</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label class="block text-sm font-medium text-gray-700">Created By</label>
            <p class="mt-1 text-gray-600 font-mono">{{ viewingPolicy.createdBy }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Last Updated By</label>
            <p class="mt-1 text-gray-600 font-mono">{{ viewingPolicy.lastUpdatedBy }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Organization ID</label>
            <p class="mt-1 text-gray-600 font-mono">{{ viewingPolicy.organizationId }}</p>
          </div>
          <div v-if="viewingPolicy.createdAt">
            <label class="block text-sm font-medium text-gray-700">Created At</label>
            <p class="mt-1 text-gray-600">{{ formatDate(viewingPolicy.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loadingPolicyDetails" class="text-center py-8">
      <div class="text-red-500">Failed to load policy details</div>
    </div>
  </Modal>
</template>
