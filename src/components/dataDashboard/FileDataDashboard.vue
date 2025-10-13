<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button, Modal, message, Tooltip, Select, Table } from 'ant-design-vue'
import { PlusOutlined, InboxOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { policyService, type Policy } from '@/services/policy.service'
import { fileUploadService, type FileUploadResponse } from '@/services/file-upload.service'
import UploadedFilesList from './UploadedFilesList.vue'
import { usePermissions } from '@/composables/usePermissions'

// Types for file preview
interface CSVRow {
  [key: string]: string | number
}

interface TableColumn {
  title: string
  dataIndex: string
  key: string
  width?: number
  align?: 'left' | 'center' | 'right'
}

// Permissions
const { canManageResource, canViewResource } = usePermissions()
const canManageMdm = canManageResource('mdm')
const canViewMdm = canViewResource('mdm')

// Component state
const showUploadModal = ref(false)
const uploadedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement>()
const uploadingFile = ref(false)

// File preview modal state
const showFilePreviewModal = ref(false)
const filePreviewData = ref<CSVRow[]>([])
const filePreviewColumns = ref<TableColumn[]>([])
const loadingFilePreview = ref(false)

// Success notification modal state
const showSuccessModal = ref(false)
const uploadResult = ref<FileUploadResponse | null>(null)

// Error notification modal state
const showErrorModal = ref(false)
const uploadError = ref<{ title: string; message: string; details?: string } | null>(null)

// Form fields
const selectedDomain = ref<string>('')
const selectedPolicy = ref<string>('')
const policies = ref<Policy[]>([])
const loadingPolicies = ref(false)

// Domain options
const domainOptions = [
  { label: 'Customer', value: 'Customer' },
  { label: 'Location', value: 'Location' },
  { label: 'Product', value: 'Product' },
  { label: 'Vendor', value: 'Vendor' },
]

// File validation function
const validateFile = (file: File): boolean => {
  // Check file extension and MIME type for CSV
  const allowedMimeTypes = ['text/csv', 'text/plain', 'application/csv']
  const isCSVExtension = file.name.toLowerCase().endsWith('.csv')
  const isCSVMimeType = allowedMimeTypes.includes(file.type) || file.type === ''

  if (!isCSVExtension && !isCSVMimeType) {
    message.error('Please upload a valid CSV file. Only .csv files are supported.')
    return false
  }

  // Check file size (10MB limit)
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('File must be smaller than 10MB!')
    return false
  }

  // Check if file is not empty
  if (file.size === 0) {
    message.error('Cannot upload empty files!')
    return false
  }

  return true
}

// Handle file input click
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// Handle file selection from input
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file && validateFile(file)) {
    uploadedFile.value = file
    console.log('File selected:', file.name)
  }
}

// Handle drag and drop
const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  const file = files?.[0]

  if (file && validateFile(file)) {
    uploadedFile.value = file
    console.log('File dropped:', file.name)
  }
}

// Handle upload modal actions
const handleUploadFile = () => {
  console.log('Opening upload modal')
  showUploadModal.value = true
  // Don't load policies immediately - wait for domain selection
  // Clear previous selections
  selectedDomain.value = ''
  selectedPolicy.value = ''
  policies.value = []
}

const handleUploadClose = () => {
  showUploadModal.value = false
  uploadedFile.value = null
  selectedDomain.value = ''
  selectedPolicy.value = ''
  // Clear the file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Check authentication status
const checkAuthStatus = () => {
  const token = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')
  console.log('Auth check:', {
    hasAccessToken: !!token,
    hasRefreshToken: !!refreshToken,
    tokenLength: token?.length || 0,
  })
  return !!token
}

const handleUploadSubmit = async () => {
  console.log('Submit clicked')

  // Check authentication first
  if (!checkAuthStatus()) {
    message.error('You must be logged in to upload files. Please log in and try again.')
    return
  }

  console.log('uploadedFile:', uploadedFile.value)
  console.log('selectedDomain:', selectedDomain.value)
  console.log('selectedPolicy:', selectedPolicy.value)

  if (!uploadedFile.value) {
    message.error('Please select a file to upload')
    return
  }

  if (!selectedDomain.value) {
    message.error('Please select a domain')
    return
  }

  if (!selectedPolicy.value) {
    message.error('Please select a policy')
    return
  }

  try {
    uploadingFile.value = true

    // Prepare upload request
    const uploadRequest = {
      policyId: selectedPolicy.value,
      domainName: selectedDomain.value,
    }

    console.log('Uploading file:', {
      fileName: uploadedFile.value.name,
      uploadRequest,
    })

    // Call the upload API
    const response = await fileUploadService.uploadFile(uploadedFile.value, uploadRequest)

    console.log('Upload response:', response.data)

    // Store the result for the success modal
    uploadResult.value = response.data

    // Show success modal
    showSuccessModal.value = true

    // Close upload modal
    handleUploadClose()
  } catch (error) {
    console.error('Upload error:', error)

    // Parse error details
    const errorWithStatus = error as Error & {
      status?: number
      statusText?: string
      responseData?: unknown
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const statusCode = errorWithStatus.status

    let errorTitle = 'Upload Failed'
    let errorDetails = ''

    // Handle specific HTTP status codes and API responses
    if (statusCode === 409) {
      errorTitle = 'File Already Exists'
      errorDetails = errorMessage // Use the API's clear message about file already existing
    } else if (statusCode === 415) {
      errorTitle = 'Unsupported File Format'
      errorDetails =
        'The server could not process the uploaded file. Please check the file format and try again.'
    } else if (statusCode === 401 || errorMessage.includes('authentication')) {
      errorTitle = 'Authentication Error'
      errorDetails = 'Your session has expired. Please log in again and try uploading the file.'
    } else if (statusCode === 413) {
      errorTitle = 'File Too Large'
      errorDetails = 'The uploaded file is too large. Please ensure the file is less than 10MB.'
    } else if (statusCode === 400) {
      errorTitle = 'Invalid Request'
      errorDetails = errorMessage // Use the API's specific error message
    } else if (statusCode === 500) {
      errorTitle = 'Server Error'
      errorDetails =
        'The server encountered an error while processing your request. Please try again later.'
    } else if (errorMessage.includes('Network error')) {
      errorTitle = 'Network Error'
      errorDetails =
        'Unable to connect to the server. Please check your internet connection and try again.'
    } else if (errorMessage.includes('timeout')) {
      errorTitle = 'Upload Timeout'
      errorDetails =
        'The upload took too long to complete. Please try again with a smaller file or check your connection.'
    } else {
      // For any other errors, use the API message if it's user-friendly, otherwise provide a generic message
      errorDetails =
        errorMessage.length > 200 ? 'An unexpected error occurred. Please try again.' : errorMessage
    }

    // Store error details for the modal
    uploadError.value = {
      title: errorTitle,
      message: errorDetails,
      details: statusCode ? `HTTP ${statusCode}: ${errorMessage}` : errorMessage,
    }

    // Show error modal
    showErrorModal.value = true
  } finally {
    uploadingFile.value = false
  }
}

// Load policies from API
const loadPolicies = async (domainName?: string) => {
  try {
    loadingPolicies.value = true

    let response
    if (domainName) {
      console.log('Loading policies for domain:', domainName)
      response = await policyService.getPoliciesByDomain(domainName)
    } else {
      console.log('Loading all policies')
      response = await policyService.getPolicies()
    }

    console.log('Policies loaded:', response.data)

    // Filter only published policies
    policies.value = response.data.filter((policy: Policy) => policy.published)
    console.log('Filtered published policies:', policies.value.length)
  } catch (error) {
    console.error('Error loading policies:', error)
    message.error(`Failed to load policies${domainName ? ` for ${domainName}` : ''}`)
    policies.value = [] // Clear policies on error
  } finally {
    loadingPolicies.value = false
  }
}

// Watch for domain changes and load corresponding policies
watch(
  selectedDomain,
  async (newDomain, oldDomain) => {
    console.log('Domain changed from', oldDomain, 'to', newDomain)

    // Clear policy selection when domain changes
    selectedPolicy.value = ''
    policies.value = []

    // Load policies for the new domain if one is selected
    if (newDomain) {
      await loadPolicies(newDomain)
    }
  },
  { immediate: false },
) // Don't trigger on initial load

// CSV parsing function
const parseCSVFile = (file: File): Promise<{ data: CSVRow[]; columns: TableColumn[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const lines = csvText.split('\n').filter((line) => line.trim() !== '')

        if (lines.length === 0) {
          reject(new Error('Empty file'))
          return
        }

        // Parse headers
        const headers = lines[0].split(',').map((header) => header.trim().replace(/"/g, ''))

        // Create columns configuration with Serial Number as first column
        const columns: TableColumn[] = [
          {
            title: 'Sr No',
            dataIndex: 'srNo',
            key: 'srNo',
            width: 80,
            align: 'center',
          },
          ...headers.map((header, index) => ({
            title: header,
            dataIndex: header,
            key: `col_${index}`,
          })),
        ]

        // Parse data rows
        const data: CSVRow[] = lines.slice(1).map((line, rowIndex) => {
          const values = line.split(',').map((value) => value.trim().replace(/"/g, ''))
          const row: CSVRow = {
            key: `row_${rowIndex}`,
            srNo: rowIndex + 1, // Add serial number starting from 1
          }

          headers.forEach((header, colIndex) => {
            row[header] = values[colIndex] || ''
          })

          return row
        })

        resolve({ data, columns })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// View file data tooltip action
const handleViewFileData = async () => {
  if (!uploadedFile.value) return

  try {
    loadingFilePreview.value = true
    console.log('Parsing CSV file:', uploadedFile.value.name)

    const { data, columns } = await parseCSVFile(uploadedFile.value)

    filePreviewData.value = data
    filePreviewColumns.value = columns
    showFilePreviewModal.value = true

    console.log('CSV parsed successfully:', { rows: data.length, columns: columns.length })
  } catch (error) {
    console.error('Error parsing CSV file:', error)
    message.error('Failed to parse CSV file. Please check the file format.')
  } finally {
    loadingFilePreview.value = false
  }
}

// Delete attached file
const handleDeleteFile = () => {
  console.log('Deleting attached file:', uploadedFile.value?.name)
  uploadedFile.value = null

  // Clear the file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  // Show success message
  message.success('File removed successfully')
}

// Close file preview modal
const handleFilePreviewClose = () => {
  showFilePreviewModal.value = false
  filePreviewData.value = []
  filePreviewColumns.value = []
}

// Close success notification modal
const handleSuccessModalClose = () => {
  showSuccessModal.value = false
  uploadResult.value = null
}

// Close error notification modal
const handleErrorModalClose = () => {
  showErrorModal.value = false
  uploadError.value = null
}
</script>

<template>
  <div>
    <!-- Header with Upload Button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">File and Data Dashboard</h1>
      <Button
        v-if="canManageMdm"
        type="primary"
        size="large"
        class="h-12 px-8 text-lg flex items-center gap-1"
        style="background-color: #4f46e5; color: white"
        @click="handleUploadFile"
      >
        <PlusOutlined />
        Upload File
      </Button>
      <span v-else-if="canViewMdm" class="text-gray-500 text-lg"> View Only Access </span>
    </div>

    <!-- Uploaded Files List and Management Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Uploaded Files List and Management</h2>
        </div>
      </div>

      <div class="p-6">
        <!-- Uploaded Files List and Management Component -->
        <UploadedFilesList />
      </div>
    </div>

    <!-- Upload File Modal -->
    <Modal
      v-model:open="showUploadModal"
      title="Submit File"
      :footer="null"
      width="600px"
      :mask-closable="false"
      :destroy-on-close="true"
    >
      <div class="space-y-6">
        <!-- Domain Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Domain <span class="text-red-500">*</span>
          </label>
          <Select
            v-model:value="selectedDomain"
            placeholder="Select a domain"
            :options="domainOptions"
            class="w-full"
            size="large"
          />
        </div>

        <!-- Policy Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Policy <span class="text-red-500">*</span>
          </label>
          <Select
            v-model:value="selectedPolicy"
            placeholder="Select a policy"
            :loading="loadingPolicies"
            :disabled="loadingPolicies"
            class="w-full"
            size="large"
            show-search
            :filter-option="
              (input, option) => option?.label?.toLowerCase().includes(input.toLowerCase())
            "
          >
            <Select.Option
              v-for="policy in policies"
              :key="policy.policyId"
              :value="policy.policyId"
              :label="policy.policyName"
            >
              {{ policy.policyName }}
            </Select.Option>
          </Select>
        </div>

        <!-- File Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File <span class="text-red-500">*</span>
          </label>

          <!-- Custom File Input -->
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".csv"
              @change="handleFileSelect"
              class="hidden"
            />
            <InboxOutlined class="text-4xl text-indigo-500 mb-4" />
            <p class="text-lg font-medium text-gray-700 mb-2">Click or drag CSV file here</p>
            <p class="text-sm text-gray-500">
              Support for a single CSV file upload. File size must be less than 10MB.
            </p>
          </div>
        </div>

        <!-- Show uploaded file name with tooltip -->
        <div v-if="uploadedFile" class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <!-- CSV File Icon -->
                  <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ uploadedFile.name }}</p>
                <p class="text-xs text-gray-500">{{ (uploadedFile.size / 1024).toFixed(2) }} KB</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Tooltip title="View file data">
                <Button
                  type="text"
                  shape="circle"
                  @click="handleViewFileData"
                  class="text-blue-500 hover:text-blue-700"
                >
                  <template #icon>
                    <EyeOutlined />
                  </template>
                </Button>
              </Tooltip>
              <Tooltip title="Remove file">
                <Button
                  type="text"
                  shape="circle"
                  @click="handleDeleteFile"
                  class="text-red-500 hover:text-red-700"
                >
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <Button @click="handleUploadClose" :disabled="uploadingFile"> Cancel </Button>
          <Button
            type="primary"
            @click="handleUploadSubmit"
            :disabled="!uploadedFile || !selectedDomain || !selectedPolicy || uploadingFile"
            :loading="uploadingFile"
            style="background-color: #4f46e5; color: white"
          >
            {{ uploadingFile ? 'Uploading...' : 'Submit File' }}
          </Button>
        </div>
      </div>
    </Modal>

    <!-- File Preview Modal -->
    <Modal
      v-model:open="showFilePreviewModal"
      title="File Preview"
      :footer="null"
      width="80%"
      :mask-closable="true"
      :destroy-on-close="true"
      @cancel="handleFilePreviewClose"
    >
      <div v-if="loadingFilePreview" class="text-center py-8">
        <div class="text-gray-500">Loading file preview...</div>
      </div>

      <div v-else-if="filePreviewData.length > 0" class="space-y-4">
        <!-- File Information -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">File Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label class="block font-medium text-gray-700">File Name</label>
              <p class="text-gray-900">{{ uploadedFile?.name }}</p>
            </div>
            <div>
              <label class="block font-medium text-gray-700">File Size</label>
              <p class="text-gray-900">
                {{ uploadedFile ? (uploadedFile.size / 1024).toFixed(2) : 0 }} KB
              </p>
            </div>
            <div>
              <label class="block font-medium text-gray-700">Total Rows</label>
              <p class="text-gray-900">{{ filePreviewData.length }} rows</p>
            </div>
          </div>
        </div>

        <!-- CSV Data Table -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <Table
            :columns="filePreviewColumns"
            :data-source="filePreviewData"
            :pagination="{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} rows`,
            }"
            :scroll="{ x: 'max-content' }"
            size="small"
            class="file-preview-table"
          />
        </div>
      </div>

      <div v-else class="text-center py-8">
        <div class="text-gray-500">No data to display</div>
      </div>
    </Modal>

    <!-- Upload Success Notification Modal -->
    <Modal
      v-model:open="showSuccessModal"
      title="Upload Successful"
      :footer="null"
      width="500px"
      :mask-closable="true"
      :destroy-on-close="true"
      @cancel="handleSuccessModalClose"
    >
      <div v-if="uploadResult" class="text-center py-6">
        <!-- Success Icon -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ uploadResult.message }}</h3>

        <!-- Upload Statistics -->
        <div class="bg-gray-50 rounded-lg p-4 mt-4">
          <div class="text-sm text-gray-600">
            <div class="flex justify-between items-center">
              <span>Total Records Uploaded:</span>
              <span class="font-semibold text-gray-900">{{ uploadResult.totalRecord }}</span>
            </div>
            <div class="flex justify-between items-center mt-2">
              <span>Status:</span>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="
                  uploadResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                "
              >
                {{ uploadResult.success ? 'Success' : 'Failed' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Close Button -->
        <div class="mt-6">
          <Button
            type="primary"
            @click="handleSuccessModalClose"
            style="background-color: #4f46e5; color: white"
          >
            OK
          </Button>
        </div>
      </div>
    </Modal>

    <!-- Upload Error Notification Modal -->
    <Modal
      v-model:open="showErrorModal"
      title="Upload Failed"
      :footer="null"
      width="500px"
      :mask-closable="true"
      :destroy-on-close="true"
      @cancel="handleErrorModalClose"
    >
      <div v-if="uploadError" class="text-center py-6">
        <!-- Error Icon -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Error Title -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ uploadError.title }}</h3>

        <!-- Error Message -->
        <p class="text-gray-600 mb-4">{{ uploadError.message }}</p>

        <!-- Suggestions for specific error types -->
        <div
          v-if="uploadError.title === 'File Already Exists'"
          class="bg-blue-50 rounded-lg p-4 mb-4"
        >
          <div class="text-sm text-blue-700">
            <div class="font-medium mb-2 text-center">💡 Suggestions:</div>
            <ul class="list-disc list-inside space-y-1 text-left">
              <li>Rename your file before uploading</li>
              <li>Check if the file was already uploaded successfully</li>
            </ul>
          </div>
        </div>

        <div
          v-else-if="uploadError.title === 'Authentication Error'"
          class="bg-yellow-50 rounded-lg p-4 mb-4"
        >
          <div class="text-sm text-yellow-700">
            <div class="font-medium mb-2 text-center">🔐 Next Steps:</div>
            <ul class="list-disc list-inside space-y-1 text-left">
              <li>Please log out and log back in</li>
              <li>Then try uploading your file again</li>
            </ul>
          </div>
        </div>

        <!-- Error Details (if available and different from message) -->
        <div
          v-if="uploadError.details && uploadError.details !== uploadError.message"
          class="bg-gray-50 rounded-lg p-4 mt-4"
        >
          <details class="text-sm">
            <summary class="font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              Technical Details
            </summary>
            <div class="mt-2 font-mono text-xs text-gray-600 break-all">
              {{ uploadError.details }}
            </div>
          </details>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex space-x-3 justify-center">
          <Button type="default" @click="handleErrorModalClose"> Cancel </Button>
          <Button type="primary" danger @click="handleErrorModalClose">
            {{
              uploadError.title === 'File Already Exists' ? 'Choose Different File' : 'Try Again'
            }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
:deep(.upload-area .ant-upload-drag) {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.3s ease;
}

:deep(.upload-area .ant-upload-drag:hover) {
  border-color: #4f46e5;
  background: #f8fafc;
}

:deep(.upload-area .ant-upload-drag.ant-upload-drag-hover) {
  border-color: #4f46e5;
  background: #eff6ff;
}

:deep(.ant-upload-text) {
  color: #374151;
  font-weight: 500;
}

:deep(.ant-upload-hint) {
  color: #6b7280;
  font-size: 13px;
}

/* File Preview Table Styles */
:deep(.file-preview-table .ant-table-thead > tr > th) {
  background: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

:deep(.file-preview-table .ant-table-thead > tr > th:first-child) {
  background: #f1f5f9;
  font-weight: 700;
  color: #1e293b;
}

:deep(.file-preview-table .ant-table-tbody > tr > td) {
  border-bottom: 1px solid #f3f4f6;
  font-size: 12px;
  padding: 8px 12px;
}

:deep(.file-preview-table .ant-table-tbody > tr > td:first-child) {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  text-align: center;
}

:deep(.file-preview-table .ant-table-tbody > tr:hover > td) {
  background: #f8fafc;
}

:deep(.file-preview-table .ant-table-tbody > tr:hover > td:first-child) {
  background: #f1f5f9;
}

:deep(.file-preview-table .ant-pagination) {
  margin-top: 16px;
}

:deep(.file-preview-table .ant-table-container) {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
</style>
