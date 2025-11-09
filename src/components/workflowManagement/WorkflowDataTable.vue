<template>
  <div>
    <!-- Loading Indicator -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
      ></div>
      <span class="ml-3 text-gray-600">Loading workflow data...</span>
    </div>

    <!-- Error Message -->
    <div v-else-if="error" class="text-center py-6">
      <div class="inline-block p-3 bg-red-100 rounded-full mb-3">
        <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <p class="text-gray-700">{{ error }}</p>
      <Button class="mt-4" @click="$emit('refresh')">Retry</Button>
    </div>

    <!-- Workflow Data Table -->
    <div v-else-if="data.length > 0">
      <!-- Add horizontal scroll container -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <Table
          :dataSource="data"
          :pagination="{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }"
          rowKey="id"
          :scroll="{ x: 'max-content' }"
        >
          <!-- Serial Number Column -->
          <Column title="S.No" key="serialNo" :width="80" fixed="left">
            <template #default="{ index }">
              <div class="text-center font-medium">
                {{ getSerialNumber(index) }}
              </div>
            </template>
          </Column>

          <template v-for="field in dynamicFields" :key="field">
            <Column
              :title="formatColumnTitle(field)"
              :dataIndex="field"
              :ellipsis="true"
              :sorter="true"
              :width="150"
            >
              <template #default="{ text, record }">
                <template v-if="field === 'final_status'">
                  <Tag :color="getStatusTagColor(text)">{{ text }}</Tag>
                </template>
                <template v-else-if="field === 'rule_status'">
                  <Tooltip placement="topLeft" :overlayStyle="{ maxWidth: '500px' }">
                    <template #title>
                      <div
                        v-if="record.failed_validations && record.failed_validations.length > 0"
                        class="validation-tooltip"
                      >
                        <div class="font-semibold mb-2 text-red-600">Failed Validations:</div>
                        <div
                          v-for="(validation, idx) in record.failed_validations"
                          :key="idx"
                          class="mb-3 p-2 bg-gray-100 rounded border-l-2 border-red-400"
                        >
                          <div class="text-sm text-red-700">
                            <div>
                              <strong class="text-red-800">Rule:</strong>
                              <span class="text-red-600">{{
                                validation.rule_name || 'Unknown'
                              }}</span>
                            </div>
                            <div>
                              <strong class="text-red-800">Column:</strong>
                              <span class="text-red-600">{{
                                validation.column_name || 'N/A'
                              }}</span>
                            </div>
                            <div>
                              <strong class="text-red-800">Status:</strong>
                              <span class="text-red-600 font-medium">
                                {{ validation.status || 'Unknown' }}
                              </span>
                            </div>
                            <div>
                              <strong class="text-red-800">Error:</strong>
                              <span class="text-red-600">{{
                                validation.error_message || 'No error message'
                              }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-gray-600">No validation failures</div>
                    </template>
                    <Tag :color="getStatusTagColor(text)" class="cursor-help">
                      {{ text }}
                    </Tag>
                  </Tooltip>
                </template>
                <template v-else-if="field === 'created_date'">
                  {{ formatDateTime(text) }}
                </template>
                <template v-else>
                  <div class="truncate" :title="text">{{ text || '-' }}</div>
                </template>
              </template>
            </Column>
          </template>

          <Column title="Actions" key="actions" fixed="right" :width="80">
            <template #default="{ record }">
              <div class="flex justify-center">
                <Tooltip title="View Details">
                  <Button
                    type="text"
                    size="small"
                    @click="$emit('view-details', record)"
                    class="text-blue-600"
                  >
                    <template #icon>
                      <EyeOutlined />
                    </template>
                  </Button>
                </Tooltip>
              </div>
            </template>
          </Column>
        </Table>
      </div>
    </div>

    <!-- No Data -->
    <div v-else class="text-center py-6">
      <p class="text-gray-500">No workflow data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button, Table, Tag, Tooltip } from 'ant-design-vue'
import { EyeOutlined } from '@ant-design/icons-vue'
import type { WorkflowDataRecord } from '@/services/workflow.service'

// Column component from ant-design-vue
const Column = Table.Column

// Props
defineProps<{
  data: WorkflowDataRecord[]
  dynamicFields: string[]
  loading: boolean
  error: string | null
}>()

// Emits
defineEmits<{
  (e: 'refresh'): void
  (e: 'view-details', record: WorkflowDataRecord): void
}>()

// Helper functions
const formatColumnTitle = (field: string) => {
  // Convert snake_case or camelCase to Title Case with spaces
  return field
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

const getStatusTagColor = (status: string) => {
  if (!status) return 'default'

  status = status.toLowerCase()

  if (status.includes('success') || status.includes('pass')) {
    return 'green'
  } else if (status.includes('fail') || status.includes('error')) {
    return 'red'
  } else if (status.includes('warn') || status.includes('partial')) {
    return 'orange'
  } else if (status.includes('process') || status.includes('running')) {
    return 'blue'
  } else {
    return 'default'
  }
}

// Get serial number based on current pagination
const getSerialNumber = (index: number) => {
  // This will show 1, 2, 3... for each page
  return index + 1
}
</script>

<style scoped>
:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  white-space: nowrap;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #f8fafc;
}

:deep(.ant-tag) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.ant-table) {
  min-width: 100%;
}

:deep(.ant-table-container) {
  overflow-x: auto;
}

:deep(.ant-table-content) {
  overflow-x: auto;
}

.truncate {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cursor-help {
  cursor: help;
}

:deep(.ant-tooltip-inner) {
  max-width: 500px;
  white-space: pre-wrap;
  background-color: #f3f4f6 !important; /* Grey background */
  color: #374151 !important; /* Default dark grey for contrast */
}

.validation-tooltip {
  color: #374151; /* Ensure tooltip content is readable */
}
</style>
