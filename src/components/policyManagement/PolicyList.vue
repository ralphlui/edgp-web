<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Table, Button, message, Space } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { policyService, type Policy } from '@/services/policy.service'

// Component state
const loading = ref(false)
const policies = ref<Policy[]>([])

// Current date for Last Updated column
const currentDate = ref('')

// Computed statistics based on actual policy data
const stats = computed(() => {
  const totalPolicies = policies.value.length
  const activePolicies = policies.value.filter((p) => p.published).length
  const draftPolicies = policies.value.filter((p) => !p.published).length

  return {
    totalPolicies,
    activePolicies,
    draftPolicies,
  }
})

// Table columns configuration
const columns = [
  {
    title: 'Policy Name',
    key: 'policyName',
    width: '25%',
    sorter: (a: Policy, b: Policy) => a.policyName.localeCompare(b.policyName),
    sortDirections: ['ascend' as const, 'descend' as const],
  },
  {
    title: 'Domain',
    dataIndex: 'domainName',
    key: 'domainName',
    width: '15%',
  },
  {
    title: 'Status',
    key: 'status',
    width: '12%',
  },
  {
    title: 'Compliance',
    key: 'compliance',
    width: '15%',
  },
  {
    title: 'Last Updated',
    key: 'lastUpdated',
    width: '15%',
    sorter: (a: Policy, b: Policy) => {
      const dateA = new Date(a.lastUpdated || a.updatedAt || a.createdAt || new Date())
      const dateB = new Date(b.lastUpdated || b.updatedAt || b.createdAt || new Date())
      return dateA.getTime() - dateB.getTime()
    },
    sortDirections: ['ascend' as const, 'descend' as const],
  },
  {
    title: 'Actions',
    key: 'actions',
    width: '18%',
  },
]

// Load policies data
const loadPolicies = async () => {
  try {
    loading.value = true
    const response = await policyService.getPolicies()
    console.log('Policy API Response:', response)
    console.log('Policies Data:', response.data)

    // The response is a PolicyListResponse with { success, message, totalRecord, data }
    // The policies array is in response.data
    policies.value = response.data || []
  } catch (error) {
    message.error('Failed to load policies')
    console.error('Error loading policies:', error)
  } finally {
    loading.value = false
  }
}

// Format date to DD MMM YYYY
const formatDate = (dateString?: string) => {
  if (!dateString) {
    // If no date provided, use current date
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

// Action handlers
const handleCreatePolicy = () => {
  message.info('Create Policy functionality will be implemented')
}

const handleEdit = (policy: Policy) => {
  console.log('Edit policy:', policy.policyName)
  message.info(`Edit ${policy.policyName} functionality will be implemented`)
}

const handleView = (policy: Policy) => {
  console.log('View policy:', policy.policyName)
  message.info(`View ${policy.policyName} functionality will be implemented`)
}

// Load data on component mount
onMounted(() => {
  loadPolicies()
  // Set current date once when component mounts
  currentDate.value = formatDate()
})
</script>

<template>
  <div>
    <!-- Header with Create Button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Policy Management</h1>
      <Button
        type="primary"
        size="large"
        class="h-12 px-8 text-lg"
        style="background-color: #4f46e5"
        @click="handleCreatePolicy"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        Create New Policy
      </Button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Total Policies -->
      <div class="bg-white rounded-lg shadow p-6 flex items-center">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-blue-500 rounded"></div>
          </div>
        </div>
        <div class="ml-4">
          <h3 class="text-sm font-medium text-gray-500">Total Policies</h3>
          <p class="mt-1 text-3xl font-semibold">{{ stats.totalPolicies }}</p>
        </div>
      </div>

      <!-- Active Policies -->
      <div class="bg-white rounded-lg shadow p-6 flex items-center">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div class="ml-4">
          <h3 class="text-sm font-medium text-gray-500">Active Policies</h3>
          <p class="mt-1 text-3xl font-semibold">{{ stats.activePolicies }}</p>
        </div>
      </div>

      <!-- Draft Policies -->
      <div class="bg-white rounded-lg shadow p-6 flex items-center">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-yellow-500 rounded-sm"></div>
          </div>
        </div>
        <div class="ml-4">
          <h3 class="text-sm font-medium text-gray-500">Draft Policies</h3>
          <p class="mt-1 text-3xl font-semibold">{{ stats.draftPolicies }}</p>
        </div>
      </div>
    </div>

    <!-- Policies Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Policies</h2>
        </div>
      </div>

      <div class="p-6">
        <Table
          :columns="columns"
          :data-source="policies"
          :loading="loading"
          :pagination="{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} policies`,
          }"
          row-key="policyId"
        >
          <template #bodyCell="{ column, record }">
            <!-- Policy Name Column -->
            <div v-if="column.key === 'policyName'">
              <div class="font-medium text-gray-900">{{ record.policyName }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ record.description }}</div>
            </div>

            <!-- Status Column -->
            <span
              v-else-if="column.key === 'status'"
              :class="{
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': true,
                'bg-green-100 text-green-800': record.published,
                'bg-gray-100 text-gray-800': !record.published,
              }"
            >
              {{ record.published ? 'Active' : 'Draft' }}
            </span>

            <!-- Compliance Column -->
            <div v-else-if="column.key === 'compliance'" class="flex items-center">
              <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div class="h-2 rounded-full bg-gray-400" style="width: 0%"></div>
              </div>
              <span class="text-sm text-gray-700">N/A</span>
            </div>

            <!-- Last Updated Column -->
            <span v-else-if="column.key === 'lastUpdated'" class="text-sm text-gray-700">
              {{ formatDate(record.lastUpdated || record.updatedAt || record.createdAt) }}
            </span>

            <!-- Actions Column -->
            <Space v-else-if="column.key === 'actions'">
              <a
                class="text-blue-600 hover:text-blue-800 cursor-pointer"
                @click="() => handleEdit(record as Policy)"
              >
                Edit
              </a>
              <a
                class="text-gray-600 hover:text-gray-800 cursor-pointer"
                @click="() => handleView(record as Policy)"
              >
                View
              </a>
            </Space>
          </template>
        </Table>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.ant-table-thead > tr > th) {
  background: transparent;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #f3f4f6;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #f8fafc;
}

:deep(.ant-pagination) {
  margin-top: 16px;
}
</style>
