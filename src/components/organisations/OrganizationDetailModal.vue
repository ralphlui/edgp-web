<template>
  <Modal
    v-model:open="visible"
    title="Organization Details"
    :footer="null"
    width="800px"
    @cancel="handleClose"
  >
    <div v-if="loading" class="flex justify-center py-8">
      <Spin size="large" />
    </div>

    <div v-else-if="organization" class="space-y-6">
      <!-- Basic Information -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-800">Basic Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Organization Name</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.organizationName }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Industry</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.sector?.sectorName || 'N/A' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">UEN</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.uniqueEntityNumber || 'N/A' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Organization Size</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.organizationSize || 'N/A' }} employees
            </p>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-800">Contact Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.contactNumber || 'N/A' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Website</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.websiteURL || 'N/A' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-800">Address Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Street Address</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.streetAddress || 'N/A' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">City</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.city || 'N/A' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Postal Code</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.postalCode || 'N/A' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Country</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.country || 'N/A' }}
            </p>
          </div>
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-600 mb-1">Full Address</label>
          <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
            {{ organization.address || 'N/A' }}
          </p>
        </div>
      </div>

      <!-- Primary Contact Information -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-800">Primary Contact</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Contact Name</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.primaryContactName || 'N/A' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Position</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.primaryContactPosition || 'N/A' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.primaryContactEmail || 'N/A' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ organization.primaryContactNumber || 'N/A' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div>
        <h3 class="text-lg font-semibold mb-4 text-gray-800">Status</h3>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Active Status</label>
          <span
            :class="{
              'bg-green-100 text-green-800': organization.active,
              'bg-red-100 text-red-800': !organization.active,
            }"
            class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
          >
            {{ organization.active ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <p>No organization details available</p>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Modal, Spin, message } from 'ant-design-vue'
import { organizationService, type Organization } from '@/services/organization.service'

interface Props {
  organizationId: string | null
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const visible = ref(props.open)
const loading = ref(false)
const organization = ref<Organization | null>(null)

// Watch for prop changes
watch(
  () => props.open,
  (newValue) => {
    visible.value = newValue
    if (newValue && props.organizationId) {
      loadOrganizationDetails()
    }
  },
)

watch(
  () => props.organizationId,
  (newValue) => {
    if (newValue && visible.value) {
      loadOrganizationDetails()
    }
  },
)

watch(visible, (newValue) => {
  emit('update:open', newValue)
  if (!newValue) {
    organization.value = null
  }
})

const loadOrganizationDetails = async () => {
  if (!props.organizationId) return

  try {
    loading.value = true
    organization.value = await organizationService.getOrganizationDetails(props.organizationId)
  } catch (error: unknown) {
    console.error('Failed to load organization details:', error)

    // Type guard for axios error
    const isAxiosError = (err: unknown): err is { response?: { status: number } } => {
      return err !== null && typeof err === 'object' && 'response' in err
    }

    // Type guard for error with message
    const hasMessage = (err: unknown): err is { message: string } => {
      return err !== null && typeof err === 'object' && 'message' in err
    }

    // Check if it's a network error
    if (hasMessage(error) && error.message === 'Network Error') {
      message.error({
        content:
          'Unable to connect to the server. Please ensure the backend API is running on http://localhost:8082',
        duration: 6,
      })
    } else if (isAxiosError(error) && error.response?.status === 401) {
      message.error({
        content: 'Authentication required. Please log in again to view organization details.',
        duration: 5,
      })
    } else if (isAxiosError(error) && error.response?.status === 403) {
      message.error({
        content: "You do not have permission to view this organization's details.",
        duration: 5,
      })
    } else if (isAxiosError(error) && error.response?.status === 404) {
      message.error({
        content: 'Organization not found. It may have been deleted or you may not have access.',
        duration: 5,
      })
    } else {
      message.error({
        content: 'Failed to load organization details. Please try again.',
        duration: 4,
      })
    }
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
:deep(.ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 0;
}

:deep(.ant-modal-body) {
  padding: 24px;
}
</style>
