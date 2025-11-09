<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { Table, Select, Card, Spin, message, Button, Tag } from 'ant-design-vue'
import { DatabaseOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import {
  masterDataService,
  type MasterDataItem,
  type DomainType,
} from '@/services/master-data.service'
import { usePermissions } from '@/composables/usePermissions'

// Permissions
const { canViewResource } = usePermissions()
const canViewMdm = canViewResource('mdm')

// Component state
const loading = ref(false)
const masterData = ref<MasterDataItem[]>([])
const selectedDomain = ref<DomainType>('customer')
const columns = ref<Array<{ title: string; dataIndex: string; key: string }>>([])

// Domain options
const domainOptions = ref(masterDataService.getDomainTypes())

// Statistics
const stats = computed(() => {
  const total = masterData.value.length
  const domains = [...new Set(masterData.value.map((item) => item.domain_name))]
  const recentItems = masterData.value.filter((item) => {
    const createdDate = new Date(item.created_date)
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceCreation <= 7
  }).length

  return {
    totalRecords: total,
    uniqueDomains: domains.length,
    recentItems,
  }
})

// Table pagination
const pagination = computed(() => ({
  current: 1,
  pageSize: 10,
  total: masterData.value.length,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} of ${total} items`,
}))

// Fetch domain data
const fetchDomainData = async () => {
  console.log('🚀 fetchDomainData called - no file selection needed!')

  if (!canViewMdm.value) {
    message.error('You do not have permission to view master data')
    return
  }

  console.log('=== COMPONENT DEBUG ===')
  console.log('Selected domain:', selectedDomain.value)
  console.log('Can view MDM:', canViewMdm.value)

  loading.value = true
  try {
    console.log('Calling masterDataService.getDomainData with:', selectedDomain.value)
    const response = await masterDataService.getDomainData(selectedDomain.value)

    if (response.success) {
      masterData.value = response.data
      columns.value = masterDataService.getDisplayColumns(response.data)
      message.success(`Successfully loaded ${response.totalRecord} ${selectedDomain.value} records`)
    } else {
      message.error(response.message || 'Failed to load master data')
      masterData.value = []
      columns.value = []
    }
  } catch (error) {
    console.error('Error loading master data:', error)
    message.error('Failed to load master data. Please try again later.')
    masterData.value = []
    columns.value = []
  } finally {
    loading.value = false
  }
}

// Refresh data
const handleRefresh = () => {
  fetchDomainData()
}

// Format date for display
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

// Format cell data
const formatCellData = (value: string | number | boolean, dataIndex: string) => {
  if (dataIndex.includes('date')) {
    return formatDate(String(value))
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  return String(value)
}

// Watch for permission changes
watch(
  canViewMdm,
  (hasPermission) => {
    if (!hasPermission) {
      masterData.value = []
      columns.value = []
    }
  },
  { immediate: true },
)

// Initialize component - don't auto-fetch to prevent logout issues
onMounted(() => {
  console.log('Master Data Management component mounted')
  // Don't automatically fetch data to prevent potential logout issues
  // User can manually click refresh to load data
})
</script>

<template>
  <div v-if="!canViewMdm" class="flex items-center justify-center h-64">
    <div class="text-center">
      <DatabaseOutlined class="text-4xl text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-600 mb-2">Access Denied</h3>
      <p class="text-gray-500">You do not have permission to view Master Data Management.</p>
    </div>
  </div>

  <div v-else class="space-y-6">
    <!-- Header Section -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <DatabaseOutlined class="text-blue-600" />
          Master Data Management
        </h1>
        <Select v-model:value="selectedDomain" class="w-40" @change="fetchDomainData">
          <Select.Option v-for="option in domainOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </Select.Option>
        </Select>
      </div>

      <Button type="primary" :loading="loading" @click="handleRefresh">
        <template #icon>
          <ReloadOutlined />
        </template>
        Refresh
      </Button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card class="text-center">
        <div class="text-2xl font-bold text-blue-600">{{ stats.totalRecords }}</div>
        <div class="text-gray-600">Total Records</div>
      </Card>
      <Card class="text-center">
        <div class="text-2xl font-bold text-green-600">{{ stats.uniqueDomains }}</div>
        <div class="text-gray-600">Domain Types</div>
      </Card>
      <Card class="text-center">
        <div class="text-2xl font-bold text-purple-600">{{ stats.recentItems }}</div>
        <div class="text-gray-600">Recent Items (7 days)</div>
      </Card>
    </div>

    <!-- Data Table -->
    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <span class="capitalize">{{ selectedDomain }} Data</span>
          <Tag v-if="masterData.length > 0" color="blue"> {{ masterData.length }} records </Tag>
        </div>
      </template>

      <Spin :spinning="loading" tip="Loading master data...">
        <div v-if="masterData.length === 0 && !loading" class="text-center py-12">
          <DatabaseOutlined class="text-4xl text-gray-300 mb-4" />
          <h3 class="text-lg font-medium text-gray-600 mb-2">Ready to Load Data</h3>
          <p class="text-gray-500 mb-4">
            Select a domain above and click "Load Data" to fetch {{ selectedDomain }} information.
          </p>
          <Button type="primary" @click="handleRefresh">
            <template #icon>
              <DatabaseOutlined />
            </template>
            Load Data
          </Button>
        </div>

        <Table
          v-else
          :columns="columns"
          :data-source="masterData"
          :pagination="pagination"
          :scroll="{ x: 1200 }"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <span v-if="column.dataIndex === 'domain_name'">
              <Tag :color="record.domain_name === 'Customer' ? 'blue' : 'green'">
                {{ record.domain_name }}
              </Tag>
            </span>
            <span v-else-if="column.dataIndex === 'is_archived'">
              <Tag :color="record.is_archived ? 'red' : 'green'">
                {{ record.is_archived ? 'Archived' : 'Active' }}
              </Tag>
            </span>
            <span v-else-if="column.dataIndex && typeof column.dataIndex === 'string'">
              {{ formatCellData(record[column.dataIndex], column.dataIndex) }}
            </span>
            <span v-else>
              {{ record[column.key || ''] }}
            </span>
          </template>
        </Table>
      </Spin>
    </Card>
  </div>
</template>

<style scoped>
.ant-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ant-table {
  border-radius: 8px;
}

.ant-select {
  border-radius: 6px;
}

.ant-btn {
  border-radius: 6px;
}
</style>
