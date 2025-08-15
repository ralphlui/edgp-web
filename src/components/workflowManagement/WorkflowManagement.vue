<template>
  <div class="workflow-management">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Workflow Management</h1>
      <p class="text-gray-600">Manage and monitor data processing workflows</p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <p class="text-sm font-medium text-gray-600">Active Workflows</p>
            <p class="text-2xl font-bold text-gray-900">{{ activeWorkflows }}</p>
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
            <p class="text-sm font-medium text-gray-600">Completed Today</p>
            <p class="text-2xl font-bold text-gray-900">{{ completedToday }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pending</p>
            <p class="text-2xl font-bold text-gray-900">{{ pendingWorkflows }}</p>
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
            <p class="text-sm font-medium text-gray-600">Failed</p>
            <p class="text-2xl font-bold text-gray-900">{{ failedWorkflows }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-4 mb-6">
      <Button
        type="primary"
        @click="createWorkflow"
        class="px-4 py-2"
        style="background-color: #4f46e5; border-color: #4f46e5; color: white"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        Create New Workflow
      </Button>
      <Button @click="refreshWorkflows" :loading="loading" class="px-4 py-2">
        <template #icon>
          <ReloadOutlined />
        </template>
        Refresh
      </Button>
    </div>

    <!-- Workflows Table -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">Workflow List</h3>
      </div>

      <div class="overflow-x-auto">
        <Table
          :columns="columns"
          :data-source="workflows"
          :loading="loading"
          :pagination="{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }"
          row-key="id"
          class="workflows-table"
        >
          <template #bodyCell="{ column, record }">
            <!-- Workflow Name -->
            <template v-if="column.key === 'name'">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-sm font-medium text-gray-900">{{ record.name }}</span>
              </div>
            </template>

            <!-- Status Badge -->
            <template v-else-if="column.key === 'status'">
              <Tag :color="getStatusColor(record.status)" class="font-medium">
                {{ getStatusText(record.status) }}
              </Tag>
            </template>

            <!-- Progress Bar -->
            <template v-else-if="column.key === 'progress'">
              <div class="w-full">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-600">{{ record.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full"
                    :class="getProgressColor(record.status)"
                    :style="{ width: record.progress + '%' }"
                  ></div>
                </div>
              </div>
            </template>

            <!-- Created Date -->
            <template v-else-if="column.key === 'created_date'">
              <div>
                <p class="text-sm text-gray-900">{{ formatDate(record.created_date) }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(record.created_date) }}</p>
              </div>
            </template>

            <!-- Actions -->
            <template v-else-if="column.key === 'actions'">
              <div class="flex items-center space-x-2">
                <Tooltip title="View Details">
                  <Button
                    type="text"
                    size="small"
                    class="text-blue-600 hover:text-blue-800"
                    @click="viewWorkflow(record as Workflow)"
                  >
                    <EyeOutlined />
                  </Button>
                </Tooltip>

                <Tooltip title="Edit Workflow">
                  <Button
                    type="text"
                    size="small"
                    class="text-green-600 hover:text-green-800"
                    @click="editWorkflow(record as Workflow)"
                  >
                    <EditOutlined />
                  </Button>
                </Tooltip>

                <Tooltip title="Delete Workflow">
                  <Button
                    type="text"
                    size="small"
                    class="text-red-600 hover:text-red-800"
                    @click="deleteWorkflow(record as Workflow)"
                  >
                    <DeleteOutlined />
                  </Button>
                </Tooltip>
              </div>
            </template>
          </template>
        </Table>
      </div>
    </div>

    <!-- Workflow Detail Modal -->
    <Modal v-model:open="showDetailModal" title="Workflow Details" :footer="null" width="800px">
      <div v-if="selectedWorkflow" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600">Workflow Name</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">{{ selectedWorkflow.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Status</label>
            <Tag :color="getStatusColor(selectedWorkflow.status)">
              {{ getStatusText(selectedWorkflow.status) }}
            </Tag>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Progress</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ selectedWorkflow.progress }}%
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Type</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">{{ selectedWorkflow.type }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Created Date</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ formatDateTime(selectedWorkflow.created_date) }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Updated Date</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ formatDateTime(selectedWorkflow.updated_date) }}
            </p>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Description</label>
          <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
            {{ selectedWorkflow.description }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Workflow ID</label>
          <p class="text-xs text-gray-600 p-2 bg-gray-50 rounded font-mono">
            {{ selectedWorkflow.id }}
          </p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button, Modal, message, Table, Tag, Tooltip } from 'ant-design-vue'
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'

// Define workflow interface
interface Workflow {
  id: string
  name: string
  type: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED'
  progress: number
  description: string
  created_date: string
  updated_date: string
}

// Component state
const loading = ref(false)
const workflows = ref<Workflow[]>([])
const showDetailModal = ref(false)
const selectedWorkflow = ref<Workflow | null>(null)

// Sample data
const sampleWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    name: 'Customer Data Validation',
    type: 'Data Processing',
    status: 'RUNNING',
    progress: 75,
    description: 'Validates customer data against predefined rules and policies',
    created_date: '2025-01-15 09:30:00',
    updated_date: '2025-01-15 14:20:00',
  },
  {
    id: 'wf-002',
    name: 'Product Catalog Sync',
    type: 'Data Synchronization',
    status: 'COMPLETED',
    progress: 100,
    description: 'Synchronizes product catalog data across multiple systems',
    created_date: '2025-01-15 08:00:00',
    updated_date: '2025-01-15 08:45:00',
  },
  {
    id: 'wf-003',
    name: 'Location Data Import',
    type: 'Data Import',
    status: 'PENDING',
    progress: 0,
    description: 'Imports location data from external sources',
    created_date: '2025-01-15 10:15:00',
    updated_date: '2025-01-15 10:15:00',
  },
  {
    id: 'wf-004',
    name: 'Vendor Quality Check',
    type: 'Data Quality',
    status: 'FAILED',
    progress: 45,
    description: 'Performs quality checks on vendor data',
    created_date: '2025-01-15 07:20:00',
    updated_date: '2025-01-15 12:30:00',
  },
  {
    id: 'wf-005',
    name: 'Master Data Cleansing',
    type: 'Data Cleansing',
    status: 'PAUSED',
    progress: 60,
    description: 'Cleanses and standardizes master data records',
    created_date: '2025-01-15 06:45:00',
    updated_date: '2025-01-15 13:10:00',
  },
]

// Table columns
const columns = [
  {
    title: 'Workflow Name',
    dataIndex: 'name',
    key: 'name',
    width: 250,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    width: 150,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
  },
  {
    title: 'Progress',
    dataIndex: 'progress',
    key: 'progress',
    width: 150,
  },
  {
    title: 'Created',
    dataIndex: 'created_date',
    key: 'created_date',
    width: 140,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150,
    fixed: 'right' as const,
  },
]

// Computed statistics
const activeWorkflows = computed(
  () => workflows.value.filter((w) => w.status === 'RUNNING' || w.status === 'PENDING').length,
)
const completedToday = computed(
  () => workflows.value.filter((w) => w.status === 'COMPLETED').length,
)
const pendingWorkflows = computed(
  () => workflows.value.filter((w) => w.status === 'PENDING').length,
)
const failedWorkflows = computed(() => workflows.value.filter((w) => w.status === 'FAILED').length)

// Methods
const loadWorkflows = async () => {
  try {
    loading.value = true
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    workflows.value = [...sampleWorkflows]
    console.log('Loaded workflows:', workflows.value.length)
  } catch (error) {
    console.error('Failed to load workflows:', error)
    message.error('Failed to load workflows')
  } finally {
    loading.value = false
  }
}

const refreshWorkflows = () => {
  loadWorkflows()
  message.success('Workflows refreshed')
}

const createWorkflow = () => {
  message.info('Create workflow functionality will be implemented')
}

const viewWorkflow = (workflow: Workflow) => {
  selectedWorkflow.value = workflow
  showDetailModal.value = true
}

const editWorkflow = (workflow: Workflow) => {
  message.info(`Edit workflow: ${workflow.name}`)
}

const deleteWorkflow = (workflow: Workflow) => {
  Modal.confirm({
    title: 'Delete Workflow',
    content: `Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`,
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: () => {
      workflows.value = workflows.value.filter((w) => w.id !== workflow.id)
      message.success(`Workflow "${workflow.name}" has been deleted`)
    },
  })
}

// Utility functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'orange'
    case 'RUNNING':
      return 'blue'
    case 'COMPLETED':
      return 'green'
    case 'FAILED':
      return 'red'
    case 'PAUSED':
      return 'purple'
    default:
      return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'RUNNING':
      return 'Running'
    case 'COMPLETED':
      return 'Completed'
    case 'FAILED':
      return 'Failed'
    case 'PAUSED':
      return 'Paused'
    default:
      return status
  }
}

const getProgressColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500'
    case 'RUNNING':
      return 'bg-blue-500'
    case 'FAILED':
      return 'bg-red-500'
    case 'PAUSED':
      return 'bg-purple-500'
    default:
      return 'bg-gray-400'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString()
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// Lifecycle
onMounted(() => {
  loadWorkflows()
})
</script>

<style scoped>
:deep(.workflows-table) {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f8fafc;
  }
}

:deep(.ant-tag) {
  border-radius: 6px;
  font-weight: 500;
}
</style>
