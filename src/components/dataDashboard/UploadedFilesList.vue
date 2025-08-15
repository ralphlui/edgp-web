<template>
  <div class="uploaded-files-management">
    <!-- Header with filters -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <!-- Auto-refresh status indicator (left side) -->
        <div v-if="autoRefreshEnabled" class="flex items-center">
          <div
            class="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-green-700">
              Auto-refresh active - updates every 30 seconds
            </span>
          </div>
        </div>
        <!-- Empty div to maintain spacing when auto-refresh is off -->
        <div v-else></div>

        <!-- Control buttons (right side) -->
        <div class="flex items-center gap-3">
          <!-- Auto-refresh toggle -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Auto-refresh (30s):</span>
            <Button
              :type="autoRefreshEnabled ? 'primary' : 'default'"
              size="small"
              @click="toggleAutoRefresh"
              class="px-3 min-w-[50px]"
              :style="
                autoRefreshEnabled
                  ? 'background-color: #4f46e5; border-color: #4f46e5; color: white'
                  : ''
              "
            >
              {{ autoRefreshEnabled ? 'ON' : 'OFF' }}
            </Button>
          </div>
          <!-- Manual refresh button -->
          <Button
            type="primary"
            @click="refreshFiles"
            :loading="loading"
            class="px-4 py-2 flex items-center justify-center"
            style="background-color: #4f46e5; border-color: #4f46e5; color: white"
          >
            Refresh
          </Button>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
          <Select
            v-model:value="filters.domainName"
            placeholder="All Domains"
            class="w-full"
            allowClear
            @change="handleFilterChange"
          >
            <Select.Option value="Customer">Customer</Select.Option>
            <Select.Option value="Location">Location</Select.Option>
            <Select.Option value="Product">Product</Select.Option>
            <Select.Option value="Vendor">Vendor</Select.Option>
          </Select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Select
            v-model:value="filters.fileStatus"
            placeholder="All Statuses"
            class="w-full"
            allowClear
            @change="handleFilterChange"
          >
            <Select.Option value="UNPROCESSED">Unprocessed</Select.Option>
            <Select.Option value="PROCESSING">Processing</Select.Option>
            <Select.Option value="PROCESSED">Processed</Select.Option>
            <Select.Option value="FAILED">Failed</Select.Option>
          </Select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search Files</label>
          <Input
            v-model:value="searchText"
            placeholder="Search by filename or uploader"
            class="w-full"
            @input="handleSearch"
          />
        </div>

        <div class="flex items-end">
          <Button @click="clearFilters" class="w-full"> Clear Filters </Button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Files</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalFiles }}</p>
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
            <p class="text-sm font-medium text-gray-600">Unprocessed</p>
            <p class="text-2xl font-bold text-gray-900">{{ unprocessedCount }}</p>
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
            <p class="text-sm font-medium text-gray-600">Processed</p>
            <p class="text-2xl font-bold text-gray-900">{{ processedCount }}</p>
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
            <p class="text-2xl font-bold text-gray-900">{{ failedCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Files Table -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">
          Files List ({{ filteredFiles.length }} of {{ totalFiles }})
        </h3>
      </div>

      <div class="overflow-x-auto">
        <Table
          :columns="columns"
          :data-source="filteredFiles"
          :loading="loading"
          :pagination="{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }"
          row-key="id"
          class="files-table"
        >
          <template #bodyCell="{ column, record }">
            <!-- File Status Badge -->
            <template v-if="column.key === 'file_status'">
              <Tag :color="getStatusColor(record.file_status)" class="font-medium">
                {{ getStatusText(record.file_status) }}
              </Tag>
            </template>

            <!-- Domain Badge -->
            <template v-else-if="column.key === 'domain_name'">
              <Tag :color="getDomainColor(record.domain_name)" class="font-medium">
                {{ record.domain_name }}
              </Tag>
            </template>

            <!-- File Name with Icon -->
            <template v-else-if="column.key === 'file_name'">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-sm font-medium text-gray-900">{{ record.file_name }}</span>
              </div>
            </template>

            <!-- Organization -->
            <template v-else-if="column.key === 'organization'">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ record.organization.name }}</p>
                <p class="text-xs text-gray-500">{{ record.organization.id }}</p>
              </div>
            </template>

            <!-- Policy -->
            <template v-else-if="column.key === 'policy'">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ record.policy.name }}</p>
                <p class="text-xs text-gray-500">{{ record.policy.id }}</p>
              </div>
            </template>

            <!-- Row Count -->
            <template v-else-if="column.key === 'total_rows_count'">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {{ record.total_rows_count.toLocaleString() }} rows
              </span>
            </template>

            <!-- Upload Date -->
            <template v-else-if="column.key === 'uploaded_date'">
              <div>
                <p class="text-sm text-gray-900">{{ formatDate(record.uploaded_date) }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(record.uploaded_date) }}</p>
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
                    @click="handleViewDetails(record as UploadedFile)"
                  >
                    <EyeOutlined />
                  </Button>
                </Tooltip>

                <Tooltip
                  :title="
                    record.file_status === 'FAILED' ? 'Retry Processing' : 'Retry Not Available'
                  "
                >
                  <Button
                    type="text"
                    size="small"
                    :class="
                      record.file_status === 'FAILED'
                        ? 'text-green-600 hover:text-green-800'
                        : 'text-gray-400 cursor-not-allowed'
                    "
                    :disabled="record.file_status !== 'FAILED'"
                    @click="
                      record.file_status === 'FAILED'
                        ? handleRetryProcessing(record as UploadedFile)
                        : null
                    "
                    :loading="retryingFiles.includes((record as UploadedFile).id)"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </Button>
                </Tooltip>

                <Tooltip title="Delete File">
                  <Button
                    type="text"
                    size="small"
                    class="text-red-600 hover:text-red-800"
                    @click="handleDeleteFile(record as UploadedFile)"
                    :loading="deletingFiles.includes((record as UploadedFile).id)"
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

    <!-- File Detail Modal -->
    <Modal v-model:open="showDetailModal" title="File Details" :footer="null" width="800px">
      <div v-if="selectedFile" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600">File Name</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">{{ selectedFile.file_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Domain</label>
            <Tag :color="getDomainColor(selectedFile.domain_name)">{{
              selectedFile.domain_name
            }}</Tag>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Status</label>
            <Tag :color="getStatusColor(selectedFile.file_status)">{{
              getStatusText(selectedFile.file_status)
            }}</Tag>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Total Rows</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ selectedFile.total_rows_count.toLocaleString() }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Uploaded By</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ selectedFile.uploaded_by }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Upload Date</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ formatDateTime(selectedFile.uploaded_date) }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Organization</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ selectedFile.organization.name }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Policy</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ selectedFile.policy.name }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">Process Stage</label>
            <p class="text-sm text-gray-900 p-2 bg-gray-50 rounded">
              {{ selectedFile.process_stage }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600">File ID</label>
            <p class="text-xs text-gray-600 p-2 bg-gray-50 rounded font-mono">
              {{ selectedFile.id }}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Button, Modal, message, Select, Input, Table, Tag, Tooltip } from 'ant-design-vue'
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import {
  fileManagementService,
  type UploadedFile,
  type FileListRequest,
} from '@/services/file-management.service'

// Component state
const loading = ref(false)
const files = ref<UploadedFile[]>([])
const showDetailModal = ref(false)
const selectedFile = ref<UploadedFile | null>(null)
const retryingFiles = ref<string[]>([])
const deletingFiles = ref<string[]>([])
const searchText = ref('')

// Auto-refresh scheduler state
const autoRefreshEnabled = ref(true)
const refreshInterval = ref<number | null>(null)
const REFRESH_INTERVAL_MS = 30000 // 30 seconds
const lastRefreshTime = ref<Date | null>(null)

// Filters
const filters = ref<FileListRequest>({
  domainName: undefined,
  fileStatus: undefined,
})

// Table columns
const columns = [
  {
    title: 'File Name',
    dataIndex: 'file_name',
    key: 'file_name',
    sorter: (a: UploadedFile, b: UploadedFile) => a.file_name.localeCompare(b.file_name),
    width: 250,
  },
  {
    title: 'Domain',
    dataIndex: 'domain_name',
    key: 'domain_name',
    width: 120,
  },
  {
    title: 'Status',
    dataIndex: 'file_status',
    key: 'file_status',
    width: 120,
  },
  {
    title: 'Organization',
    dataIndex: 'organization',
    key: 'organization',
    width: 200,
  },
  {
    title: 'Policy',
    dataIndex: 'policy',
    key: 'policy',
    width: 180,
  },
  {
    title: 'Rows',
    dataIndex: 'total_rows_count',
    key: 'total_rows_count',
    sorter: (a: UploadedFile, b: UploadedFile) => a.total_rows_count - b.total_rows_count,
    width: 100,
  },
  {
    title: 'Uploaded',
    dataIndex: 'uploaded_date',
    key: 'uploaded_date',
    sorter: (a: UploadedFile, b: UploadedFile) =>
      new Date(a.uploaded_date).getTime() - new Date(b.uploaded_date).getTime(),
    width: 140,
  },
  {
    title: 'Uploaded By',
    dataIndex: 'uploaded_by',
    key: 'uploaded_by',
    width: 160,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150,
    fixed: 'right' as const,
  },
]

// Computed properties
const totalFiles = computed(() => files.value.length)
const unprocessedCount = computed(
  () => files.value.filter((f) => f.file_status === 'UNPROCESSED').length,
)
const processedCount = computed(
  () => files.value.filter((f) => f.file_status === 'PROCESSED').length,
)
const failedCount = computed(() => files.value.filter((f) => f.file_status === 'FAILED').length)

const filteredFiles = computed(() => {
  let result = files.value

  // Apply search filter
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(
      (file) =>
        file.file_name.toLowerCase().includes(search) ||
        file.uploaded_by.toLowerCase().includes(search) ||
        file.organization.name.toLowerCase().includes(search),
    )
  }

  return result
})

// Methods
const loadFiles = async (silent = false) => {
  try {
    if (!silent) {
      loading.value = true
    }
    const response = await fileManagementService.getUploadedFiles(filters.value)
    files.value = response.data
    lastRefreshTime.value = new Date()
    console.log('Loaded files:', files.value.length)
  } catch (error) {
    console.error('Failed to load files:', error)

    // Check for network errors or API unavailability
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isNetworkError =
      errorMessage.includes('Network Error') ||
      errorMessage.includes('ERR_NETWORK') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('fetch')

    if (isNetworkError) {
      // Only show warning for manual refresh, not auto-refresh
      if (!silent) {
        message.warning(
          'File management API is not available. Please ensure the API server is running on http://localhost:8083',
        )
      }

      // Clear files when API is not available
      files.value = []
    } else {
      // Only show error for manual refresh, not auto-refresh
      if (!silent) {
        message.error('Failed to load uploaded files')
      }
      files.value = []
    }
  } finally {
    if (!silent) {
      loading.value = false
    }
  }
}

const refreshFiles = () => {
  loadFiles()
}

// Auto-refresh scheduler functions
const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }

  refreshInterval.value = setInterval(() => {
    if (autoRefreshEnabled.value) {
      console.log('Auto-refreshing files list...')
      loadFiles(true) // Silent refresh
    }
  }, REFRESH_INTERVAL_MS)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  if (autoRefreshEnabled.value) {
    message.info('Auto-refresh enabled (every 30 seconds)')
    startAutoRefresh()
  } else {
    message.info('Auto-refresh disabled')
    stopAutoRefresh()
  }
}

const handleFilterChange = () => {
  loadFiles()
}

const handleSearch = () => {
  // Search is handled by computed property
}

const clearFilters = () => {
  filters.value = {
    domainName: undefined,
    fileStatus: undefined,
  }
  searchText.value = ''
  loadFiles()
}

const handleViewDetails = (file: UploadedFile) => {
  selectedFile.value = file
  showDetailModal.value = true
}

const handleRetryProcessing = async (file: UploadedFile) => {
  try {
    retryingFiles.value.push(file.id)
    const response = await fileManagementService.retryFileProcessing(file.id)

    if (response.success) {
      message.success(`File "${file.file_name}" has been queued for reprocessing`)
      // Refresh the files list to get updated status
      await loadFiles()
    } else {
      message.error(response.message || 'Failed to retry file processing')
    }
  } catch (error) {
    console.error('Failed to retry processing:', error)
    message.error('Failed to retry file processing')
  } finally {
    retryingFiles.value = retryingFiles.value.filter((id) => id !== file.id)
  }
}

const handleDeleteFile = async (file: UploadedFile) => {
  Modal.confirm({
    title: 'Delete File',
    content: `Are you sure you want to delete "${file.file_name}"? This action cannot be undone.`,
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: async () => {
      try {
        deletingFiles.value.push(file.id)
        const response = await fileManagementService.deleteFile(file.id)

        if (response.success) {
          message.success(`File "${file.file_name}" has been deleted`)
          // Remove the file from the local list
          files.value = files.value.filter((f) => f.id !== file.id)
        } else {
          message.error(response.message || 'Failed to delete file')
        }
      } catch (error) {
        console.error('Failed to delete file:', error)
        message.error('Failed to delete file')
      } finally {
        deletingFiles.value = deletingFiles.value.filter((id) => id !== file.id)
      }
    },
  })
}

// Utility functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'UNPROCESSED':
      return 'orange'
    case 'PROCESSING':
      return 'blue'
    case 'PROCESSED':
      return 'green'
    case 'FAILED':
      return 'red'
    default:
      return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'UNPROCESSED':
      return 'Unprocessed'
    case 'PROCESSING':
      return 'Processing'
    case 'PROCESSED':
      return 'Processed'
    case 'FAILED':
      return 'Failed'
    default:
      return status
  }
}

const getDomainColor = (domain: string) => {
  switch (domain) {
    case 'Customer':
      return 'blue'
    case 'Location':
      return 'green'
    case 'Product':
      return 'purple'
    case 'Vendor':
      return 'orange'
    default:
      return 'default'
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
  loadFiles()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

// Watch for filter changes
watch(
  () => filters.value,
  () => {
    loadFiles()
  },
  { deep: true },
)
</script>

<style scoped>
:deep(.files-table) {
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
