<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button, message } from 'ant-design-vue'
import { organizationService } from '@/services/organization.service'
import type { Organization } from '@/services/organization.service'
import OrganizationDetailModal from './OrganizationDetailModal.vue'

const emit = defineEmits(['register-click'])

const organizations = ref<Organization[]>([])
const loading = ref(false)
const showDetailModal = ref(false)
const selectedOrganizationId = ref<string | null>(null)

// Columns for the organization table
const columns = [
  {
    title: 'Organization Name',
    dataIndex: 'organizationName',
    key: 'organizationName',
    sorter: (a: Organization, b: Organization) =>
      a.organizationName.localeCompare(b.organizationName),
  },
  {
    title: 'Industry',
    dataIndex: ['sector', 'sectorName'],
    key: 'sector',
  },
  {
    title: 'Contact Number',
    dataIndex: 'contactNumber',
    key: 'contactNumber',
  },
  {
    title: 'Country',
    dataIndex: 'country',
    key: 'country',
  },
  {
    title: 'Size',
    dataIndex: 'organizationSize',
    key: 'organizationSize',
    sorter: (a: Organization, b: Organization) =>
      (a.organizationSize || 0) - (b.organizationSize || 0),
  },
  {
    title: 'Contact Name',
    dataIndex: 'primaryContactName',
    key: 'primaryContactName',
  },
  {
    title: 'UEN',
    dataIndex: 'uniqueEntityNumber',
    key: 'uniqueEntityNumber',
  },
  {
    title: 'Actions',
    key: 'actions',
    slots: { customRender: 'actions' },
  },
]

// Load organization data
const loadOrganizations = async () => {
  try {
    loading.value = true
    const data = await organizationService.getOrganizations()
    organizations.value = data
    console.log('Organizations loaded:', organizations.value.length)
  } catch (error) {
    console.error('Failed to load organizations:', error)
    message.error('Failed to load organizations')
  } finally {
    loading.value = false
  }
}

// Navigate to organization registration page
const handleRegisterOrganization = () => {
  emit('register-click')
}

// View organization details
const handleViewDetails = (record: Organization) => {
  console.log('View details for:', record.organizationId)
  selectedOrganizationId.value = record.organizationId
  showDetailModal.value = true
}

// Edit organization
const handleEditOrganization = (record: Organization) => {
  console.log('Edit organization:', record.organizationId)
  message.info(`Editing ${record.organizationName}`)
}

onMounted(() => {
  loadOrganizations()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Organization Management</h1>
      <Button
        type="primary"
        class="px-4 py-2 text-sm text-white rounded-lg flex items-center justify-center"
        style="background-color: #4f46e5"
        @click="handleRegisterOrganization"
      >
        Register Organization
      </Button>
    </div>

    <!-- Organization table -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold">Organizations</h2>
      </div>
      <div class="p-6">
        <a-table
          :columns="columns"
          :data-source="organizations"
          :pagination="{ pageSize: 10 }"
          :loading="loading"
          rowKey="organizationId"
          class="organization-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'sector'">
              {{ (record as Organization).sector?.sectorName || 'N/A' }}
            </template>
            <template v-else-if="column.key === 'contactNumber'">
              {{ (record as Organization).contactNumber || 'N/A' }}
            </template>
            <template v-else-if="column.key === 'country'">
              {{ (record as Organization).country || 'N/A' }}
            </template>
            <template v-else-if="column.key === 'organizationSize'">
              {{ (record as Organization).organizationSize || 'N/A' }}
            </template>
            <template v-else-if="column.key === 'primaryContactName'">
              {{ (record as Organization).primaryContactName || 'N/A' }}
            </template>
            <template v-else-if="column.key === 'uniqueEntityNumber'">
              {{ (record as Organization).uniqueEntityNumber || 'N/A' }}
            </template>
          </template>
          <template #actions="{ record }">
            <a-space>
              <a
                class="text-blue-600 hover:text-blue-800"
                @click="handleViewDetails(record as Organization)"
                >View</a
              >
              <a
                class="text-green-600 hover:text-green-800"
                @click="handleEditOrganization(record as Organization)"
                >Edit</a
              >
            </a-space>
          </template>
        </a-table>
      </div>
    </div>

    <!-- Organization Detail Modal -->
    <OrganizationDetailModal
      :organization-id="selectedOrganizationId"
      v-model:visible="showDetailModal"
    />
  </div>
</template>

<style scoped>
:deep(.organization-table) {
  /* Remove borders from table */
  .ant-table-thead > tr > th {
    background: transparent;
    border: none;
  }
  .ant-table-tbody > tr > td {
    border: none;
  }
  /* Add subtle hover effect */
  .ant-table-tbody > tr:hover > td {
    background: #f8fafc;
  }
}
</style>
