<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Form, FormItem, Input, Checkbox, Button, message } from 'ant-design-vue'
import { policyService, type Policy, type UpdatePolicyRequest } from '@/services/policy.service'

interface Props {
  policy: Policy
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  success: []
}>()

// Form data - only editable fields
const formData = ref({
  description: '',
  isPublished: false,
})

// Form state
const submitting = ref(false)

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

// Initialize form with policy data
onMounted(() => {
  formData.value.description = props.policy.description || ''
  formData.value.isPublished = props.policy.published
})

// Handle form submission
const handleSubmit = async () => {
  try {
    submitting.value = true

    const updateData: UpdatePolicyRequest = {
      description: formData.value.description,
      isPublished: formData.value.isPublished,
    }

    console.log('Updating policy:', props.policy.policyId, 'with data:', updateData)

    await policyService.updatePolicy(props.policy.policyId, updateData)

    message.success(
      `Policy ${formData.value.isPublished ? 'published' : 'saved as draft'} successfully`,
    )

    // Emit success event to parent
    emit('success')
  } catch (error) {
    console.error('Error updating policy:', error)
    message.error('Failed to update policy')
  } finally {
    submitting.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  emit('close')
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Edit Policy</h2>
      <p class="text-sm text-gray-600 mt-1">
        Update the description and publication status for this policy. All other fields are
        read-only.
      </p>
    </div>

    <div class="space-y-6">
      <!-- Policy Basic Information (Read-only) -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Policy Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Policy Name</label>
            <p class="mt-1 text-sm text-gray-900">{{ policy.policyName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Domain</label>
            <p class="mt-1 text-sm text-gray-900">{{ policy.domainName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Current Status</label>
            <span
              :class="{
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': true,
                'bg-green-100 text-green-800': policy.published,
                'bg-gray-100 text-gray-800': !policy.published,
              }"
            >
              {{ policy.published ? 'Active' : 'Draft' }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Policy ID</label>
            <p class="mt-1 text-sm text-gray-600 font-mono">{{ policy.policyId }}</p>
          </div>
        </div>
      </div>

      <!-- Rules Section (Read-only) -->
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          Rules ({{ policy.rules?.length || 0 }})
        </h3>

        <div v-if="policy.rules && policy.rules.length > 0" class="space-y-4">
          <div
            v-for="(rule, index) in policy.rules"
            :key="rule.ruleId"
            class="border border-gray-100 rounded-lg p-4 bg-gray-50"
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
              <div class="bg-gray-200 rounded p-3">
                <pre class="text-xs text-gray-700 whitespace-pre-wrap">{{
                  JSON.stringify(rule.parameters, null, 2)
                }}</pre>
              </div>
            </div>

            <!-- Rule Description -->
            <div v-if="rule.description" class="mt-3">
              <label class="block text-xs font-medium text-gray-600">Rule Description</label>
              <p class="text-sm text-gray-700">{{ rule.description }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-4 text-gray-500">No rules defined for this policy</div>
      </div>

      <!-- Metadata Section (Read-only) -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Metadata</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label class="block text-sm font-medium text-gray-700">Created By</label>
            <p class="mt-1 text-gray-600 font-mono">{{ policy.createdBy }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Last Updated By</label>
            <p class="mt-1 text-gray-600 font-mono">{{ policy.lastUpdatedBy }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Organization ID</label>
            <p class="mt-1 text-gray-600 font-mono">{{ policy.organizationId }}</p>
          </div>
          <div v-if="policy.createdAt">
            <label class="block text-sm font-medium text-gray-700">Created At</label>
            <p class="mt-1 text-gray-600">{{ formatDate(policy.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Editable Fields Section -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-blue-900 mb-3">
          <span class="inline-flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
              ></path>
            </svg>
            Editable Fields
          </span>
        </h3>

        <Form layout="vertical" @submit.prevent="handleSubmit">
          <!-- Description Field -->
          <FormItem label="Description" class="mb-4">
            <Input.TextArea
              v-model:value="formData.description"
              placeholder="Enter policy description"
              :rows="4"
              :max-length="500"
              show-count
            />
          </FormItem>

          <!-- Publication Status -->
          <FormItem class="mb-6">
            <Checkbox v-model:checked="formData.isPublished" class="text-sm">
              <span class="font-medium">Publish Policy</span>
              <div class="text-xs text-gray-500 mt-1">
                {{
                  formData.isPublished
                    ? 'Policy is active and visible to users'
                    : 'Policy is saved as draft and not visible to users'
                }}
              </div>
            </Checkbox>
          </FormItem>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3">
            <Button @click="handleCancel" :disabled="submitting"> Cancel </Button>
            <Button
              type="primary"
              html-type="submit"
              :loading="submitting"
              style="background-color: #4f46e5"
            >
              {{ submitting ? 'Updating...' : 'Update Policy' }}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
