<template>
  <div class="workflow-management">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Workflow Management</h1>
      <p class="text-gray-600">Manage and monitor data processing workflows</p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Workflow Records</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalRecords }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Success Workflow Records</p>
            <p class="text-2xl font-bold text-gray-900">{{ successRecords }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Failed Workflow Records</p>
            <p class="text-2xl font-bold text-gray-900">{{ failedRecords }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Workflow Data Display Section (shown when fileId is provided) -->
    <div v-if="fileId" class="bg-white rounded-lg border border-gray-200 mt-6">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">Workflow Data</h3>
        <div class="flex items-center gap-2 mt-2">
          <Tag color="blue">Total: {{ totalRecords }}</Tag>
          <Tag color="green">Success: {{ successRecords }}</Tag>
          <Tag color="red">Failed: {{ failedRecords }}</Tag>
        </div>
      </div>

      <!-- File Information Section -->
      <div v-if="fileMetadata" class="p-6 border-b border-gray-200 bg-gray-50">
        <h4 class="text-md font-medium text-gray-800 mb-4">File Information</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600">File ID</label>
            <p class="text-sm text-gray-900 mt-1">{{ fileMetadata.file_id || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">File Name</label>
            <p class="text-sm text-gray-900 mt-1">{{ fileMetadata.fileName || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Domain Name</label>
            <p class="text-sm text-gray-900 mt-1">{{ fileMetadata.domain_name || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Uploaded By</label>
            <p class="text-sm text-gray-900 mt-1">{{ fileMetadata.uploaded_by || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Organization ID</label>
            <p class="text-sm text-gray-900 mt-1">{{ fileMetadata.organization_id || '-' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Policy ID</label>
            <p class="text-sm text-gray-900 mt-1">{{ fileMetadata.policy_id || '-' }}</p>
          </div>
        </div>
      </div>

      <div class="p-4">
        <WorkflowDataTable
          :data="workflowData"
          :dynamic-fields="dynamicFields"
          :loading="workflowDataLoading"
          :error="workflowError"
          @refresh="loadWorkflowData"
          @view-details="viewRecordDetails"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message, Tag } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { workflowService, type WorkflowDataRecord } from '@/services/workflow.service'
import WorkflowDataTable from './WorkflowDataTable.vue'

// Define props
const props = defineProps<{
  fileId?: string
}>()

// Component state
const route = useRoute()

// Workflow data state
const workflowDataLoading = ref(false)
const workflowData = ref<WorkflowDataRecord[]>([])
const workflowError = ref<string | null>(null)
const dynamicFields = ref<string[]>([])
const selectedRecord = ref<WorkflowDataRecord | null>(null)
const totalRecords = ref(0)
const successRecords = ref(0)
const failedRecords = ref(0)
const fileMetadata = ref<WorkflowDataRecord | null>(null)

// Get fileId from props or route params (to handle both scenarios)
const fileId = computed(() => {
  const id = props.fileId || (route.params.fileId as string)
  console.log(
    '🆔 Computed fileId:',
    id,
    'from props:',
    props.fileId,
    'from route:',
    route.params.fileId,
    'route path:',
    route.path,
  )
  return id
})

// Method to load workflow data for a specific file
const loadWorkflowData = async () => {
  console.log('📊 loadWorkflowData called with fileId:', fileId.value)
  if (!fileId.value) return

  try {
    workflowDataLoading.value = true
    workflowError.value = null

    // Clear previous data when loading new file
    workflowData.value = []
    fileMetadata.value = null
    dynamicFields.value = []
    totalRecords.value = 0
    successRecords.value = 0
    failedRecords.value = 0

    console.log('🔄 Making API call for fileId:', fileId.value)
    const response = await workflowService.getWorkflowData(fileId.value)

    if (response.success && response.data) {
      workflowData.value = response.data.dataRecords
      totalRecords.value = response.totalRecord || 0
      successRecords.value = response.data.successRecords || 0
      failedRecords.value = response.data.failedRecords || 0

      // Extract common fields and dynamic fields
      if (workflowData.value.length > 0) {
        // Set file metadata from the first record
        fileMetadata.value = workflowData.value[0]

        // Metadata fields that should be displayed above the table
        const metadataFields = [
          'file_id',
          'fileName',
          'domain_name',
          'uploaded_by',
          'organization_id',
          'policy_id',
        ]

        // Extract dynamic fields (fields that are not metadata or system fields)
        const allFields = new Set<string>()
        workflowData.value.forEach((record) => {
          Object.keys(record).forEach((key) => {
            if (
              !metadataFields.includes(key) &&
              key !== 'id' &&
              key !== 'created_date' &&
              key !== 'failed_validations'
            ) {
              allFields.add(key)
            }
          })
        })

        dynamicFields.value = Array.from(allFields)
        console.log('Metadata fields:', metadataFields)
        console.log('Dynamic fields:', dynamicFields.value)
      }

      message.success(`Loaded ${workflowData.value.length} workflow records`)
    } else {
      workflowError.value = response.message || 'Failed to load workflow data'
      message.error(workflowError.value)
    }
  } catch (error) {
    console.error('Error loading workflow data:', error)
    workflowError.value = 'Failed to load workflow data. Please try again later.'
    message.error(workflowError.value)
  } finally {
    workflowDataLoading.value = false
  }
}

// View record details
const viewRecordDetails = (record: WorkflowDataRecord) => {
  selectedRecord.value = record
  console.log('Selected record:', record)
}

// Lifecycle
onMounted(() => {
  // Load workflow data for the specific file if fileId is provided
  if (fileId.value) {
    loadWorkflowData()
  }
})

// Watch for fileId changes to reload data when navigating between different files
watch(
  () => fileId.value,
  (newFileId, oldFileId) => {
    console.log('🔍 FileId watcher triggered:', { newFileId, oldFileId, hasValue: !!newFileId })
    // Only reload if fileId actually changed and is not empty
    if (newFileId && newFileId !== oldFileId) {
      console.log('📂 File ID changed from', oldFileId, 'to', newFileId, '- Loading data...')
      loadWorkflowData()
    }
  },
  { immediate: true },
)

// Also watch for route changes to catch navigation events
watch(
  () => route.params.fileId,
  (newFileId, oldFileId) => {
    console.log('🛣️ Route fileId changed:', { newFileId, oldFileId, routePath: route.path })
    // This will trigger the fileId computed which will trigger the first watcher
  },
  { immediate: true },
)
</script>

<style scoped>
:deep(.ant-tag) {
  border-radius: 6px;
  font-weight: 500;
}
</style>
