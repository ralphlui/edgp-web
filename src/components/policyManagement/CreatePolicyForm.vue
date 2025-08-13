<template>
  <div class="max-w-6xl mx-auto p-2">
    <div class="bg-white rounded-lg shadow-lg">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Create New Policy</h2>
      </div>

      <!-- Form Content -->
      <div class="px-4 py-4">
        <Form ref="formRef" :model="formData" layout="vertical" @finish="handleSubmit">
          <!-- Policy Name -->
          <FormItem label="Policy Name" name="policyName" class="mb-6">
            <Input
              v-model:value="formData.policyName"
              placeholder="Enter policy name"
              size="large"
            />
          </FormItem>

          <!-- Domain Name -->
          <FormItem label="Domain Name" name="domainName" class="mb-6">
            <div class="space-y-3">
              <Select
                v-model:value="formData.domainName"
                placeholder="Select domain"
                size="large"
                @change="handleDomainChange"
              >
                <SelectOption value="Customer">Customer</SelectOption>
                <SelectOption value="Location">Location</SelectOption>
                <SelectOption value="Product">Product</SelectOption>
                <SelectOption value="Vendor">Vendor</SelectOption>
              </Select>

              <!-- Download Template Button -->
              <div v-if="formData.domainName" class="flex items-center">
                <Button
                  type="default"
                  @click="downloadTemplate"
                  class="flex items-center space-x-2"
                >
                  <template #icon>
                    <DownloadOutlined />
                  </template>
                  Download {{ formData.domainName }} Template
                </Button>
                <Button
                  type="text"
                  @click="showFieldDefinitions"
                  class="flex items-center tooltip-button"
                  title="View field definitions"
                  style="margin-top: 4px"
                >
                  <template #icon>
                    <InfoCircleOutlined class="text-blue-500" />
                  </template>
                  <span class="text-xs text-gray-500">Apply this CSV format for data upload</span>
                </Button>
              </div>
            </div>
          </FormItem>

          <!-- Rules Lists -->
          <FormItem name="rules" class="mb-6">
            <template #label>
              <div class="flex items-center space-x-2">
                <span>Rules</span>
                <div v-if="loadingRules" class="text-sm text-gray-500">Loading rules...</div>
                <div v-else-if="availableRules.length === 0" class="text-sm text-red-500">
                  No rules available. Check console for errors.
                </div>
                <div v-else class="text-sm text-green-600">
                  {{ availableRules.length }} rules loaded successfully
                </div>
              </div>
            </template>
            <div class="space-y-4">
              <!-- Rules Dropdown with Checkboxes -->
              <Select
                v-model:value="selectedRuleNames"
                mode="multiple"
                placeholder="Select rules to apply"
                size="large"
                :loading="loadingRules"
                show-search
                :filter-option="filterRuleOption"
                @change="handleRuleSelection"
              >
                <SelectOption
                  v-for="rule in availableRules"
                  :key="rule.ruleId"
                  :value="rule.ruleName"
                  :label="rule.ruleName"
                >
                  <div class="font-medium">{{ rule.ruleName }}</div>
                </SelectOption>
              </Select>

              <!-- Selected Rules Configuration -->
              <div v-if="formData.rules.length > 0" class="space-y-3">
                <div class="text-sm font-medium text-gray-700 mb-2">Configure Selected Rules:</div>
                <div
                  v-for="(rule, index) in formData.rules"
                  :key="index"
                  class="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div class="space-y-3">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="font-medium text-gray-900">{{ rule.ruleName }}</div>
                        <div class="text-sm text-gray-600 mt-1">
                          Configure the fields and parameters for this rule
                        </div>
                      </div>
                      <Button type="text" danger @click="removeRule(index)" class="ml-4">
                        <template #icon>
                          <DeleteOutlined />
                        </template>
                      </Button>
                    </div>

                    <!-- Field Configuration -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Field Name <span class="text-red-500">*</span>
                        </label>
                        <Select
                          v-model:value="rule.appliesToField"
                          mode="multiple"
                          placeholder="Select fields from template"
                          size="small"
                          :loading="loadingTemplateFields"
                          show-search
                          :filter-option="filterFieldOption"
                          :disabled="!formData.domainName || availableTemplateFields.length === 0"
                        >
                          <SelectOption
                            v-for="field in availableTemplateFields"
                            :key="field"
                            :value="field"
                            :label="field"
                          >
                            {{ field }}
                          </SelectOption>
                        </Select>

                        <!-- Display selected fields -->
                        <div
                          v-if="
                            Array.isArray(rule.appliesToField) && rule.appliesToField.length > 0
                          "
                          class="mt-2"
                        >
                          <div class="text-xs text-gray-500 mb-1">Applied to fields:</div>
                          <div class="flex flex-wrap gap-1">
                            <span
                              v-for="field in rule.appliesToField"
                              :key="field"
                              class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                            >
                              {{ field }}
                            </span>
                          </div>
                        </div>

                        <div v-if="!formData.domainName" class="text-xs text-gray-500 mt-1">
                          Please select a domain first to load available fields
                        </div>
                        <div
                          v-else-if="availableTemplateFields.length === 0"
                          class="text-xs text-orange-500 mt-1"
                        >
                          No template fields available for {{ formData.domainName }}
                        </div>
                      </div>

                      <!-- Available Parameters Display -->
                      <div v-if="getRuleParameterValues(rule.ruleName)">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Available Parameters
                        </label>
                        <div class="bg-blue-50 p-2 rounded text-xs border">
                          <pre class="text-blue-800 whitespace-pre-wrap">{{
                            JSON.stringify(getRuleParameterValues(rule.ruleName), null, 2)
                          }}</pre>
                        </div>
                      </div>

                      <!-- Dynamic Parameters based on rule -->
                      <div v-else-if="getRuleParameters(rule.ruleName)" class="md:col-start-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                          Parameters
                        </label>
                        <div class="space-y-2">
                          <div
                            v-for="(paramValue, paramKey) in rule.parameters"
                            :key="paramKey"
                            class="flex items-center space-x-2"
                          >
                            <label class="text-xs text-gray-600 w-16 capitalize"
                              >{{ paramKey }}:</label
                            >
                            <Input
                              v-if="typeof paramValue === 'string'"
                              v-model:value="rule.parameters[paramKey] as string"
                              :placeholder="`Enter ${paramKey}`"
                              size="small"
                              class="flex-1"
                            />
                            <InputNumber
                              v-else-if="typeof paramValue === 'number'"
                              v-model:value="rule.parameters[paramKey] as number"
                              :placeholder="`Enter ${paramKey}`"
                              size="small"
                              class="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FormItem>

          <!-- Description -->
          <FormItem label="Description" name="description" class="mb-6">
            <Textarea
              v-model:value="formData.description"
              placeholder="Enter policy description"
              :rows="4"
              showCount
              :maxlength="500"
            />
          </FormItem>

          <!-- Publish Checkbox -->
          <FormItem name="isPublished" class="mb-6">
            <Checkbox v-model:checked="formData.isPublished">
              <span class="text-sm font-medium">Publish Policy</span>
              <div class="text-xs text-gray-500 mt-1">
                {{
                  formData.isPublished
                    ? 'Policy will be active immediately'
                    : 'Policy will be saved as draft'
                }}
              </div>
            </Checkbox>
          </FormItem>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button @click="emit('close')" size="large"> Cancel </Button>
            <Button
              type="primary"
              html-type="submit"
              size="large"
              :loading="submitting"
              style="background-color: #4f46e5"
            >
              {{ formData.isPublished ? 'Create & Publish' : 'Save as Draft' }}
            </Button>
          </div>
        </Form>
      </div>
    </div>

    <!-- Field Definitions Modal -->
    <Modal
      v-model:open="showDefinitionsModal"
      :title="`${formData.domainName} Template Field Definitions`"
      width="1000px"
      :footer="null"
      :destroy-on-close="true"
      :style="{ top: '250px' }"
    >
      <div v-if="loadingDefinitions" class="text-center py-8">
        <div class="text-gray-500">Loading field definitions...</div>
      </div>
      <div v-else-if="fieldDefinitions.length > 0">
        <Table
          :columns="definitionColumns"
          :data-source="fieldDefinitions"
          :pagination="false"
          size="small"
          :scroll="{ y: 400 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fieldName'">
              <span class="font-medium text-gray-900">{{ record.fieldName }}</span>
            </template>
            <template v-else-if="column.key === 'description'">
              <span class="text-gray-700">{{ record.description }}</span>
            </template>
            <template v-else-if="column.key === 'dataType'">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {{ record.dataType }}
              </span>
            </template>
            <template v-else-if="column.key === 'length'">
              <span class="text-gray-600">{{ record.length }}</span>
            </template>
          </template>
        </Table>
      </div>
      <div v-else class="text-center py-8">
        <div class="text-gray-500">No field definitions available</div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Form,
  FormItem,
  Input,
  Select,
  SelectOption,
  Textarea,
  Checkbox,
  Button,
  InputNumber,
  Modal,
  Table,
  message,
} from 'ant-design-vue'
import { DeleteOutlined, DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { policyService, type CreatePolicyRequest } from '@/services/policy.service'
import { rulesService, type Rule } from '@/services/rules.service'
import { useAuthStore } from '@/stores/auth'

// Emits
const emit = defineEmits(['close', 'success'])

// Form reference
const formRef = ref()

// Auth store
const authStore = useAuthStore()

// Form state
const submitting = ref(false)
const loadingRules = ref(false)
const selectedRuleNames = ref<string[]>([])
const loadingTemplateFields = ref(false)
const availableTemplateFields = ref<string[]>([])

// Local interface for form rules (supports multi-select fields)
interface FormRule {
  appliesToField: string[] // Multi-select field array in form
  ruleName: string
  parameters: Record<string, unknown>
}

// Form data
const formData = ref({
  policyName: '',
  domainName: '',
  rules: [] as FormRule[],
  description: '',
  isPublished: false,
})

// Rules data
const availableRules = ref<Rule[]>([])

// Field definitions modal
const showDefinitionsModal = ref(false)
const loadingDefinitions = ref(false)
const fieldDefinitions = ref<FieldDefinition[]>([])

interface FieldDefinition {
  fieldName: string
  description: string
  dataType: string
  length: string
}

// Table columns for field definitions
const definitionColumns = [
  {
    title: 'Field Name',
    dataIndex: 'fieldName',
    key: 'fieldName',
    width: '25%',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    width: '40%',
  },
  {
    title: 'Data Type',
    dataIndex: 'dataType',
    key: 'dataType',
    width: '20%',
  },
  {
    title: 'Length',
    dataIndex: 'length',
    key: 'length',
    width: '15%',
  },
]

// Load available rules
const loadRules = async () => {
  try {
    console.log('Starting to load rules...')
    loadingRules.value = true

    console.log('Environment variables:')
    console.log('VITE_RULES_API_URL:', import.meta.env.VITE_RULES_API_URL)

    const rules = await rulesService.getRules()
    console.log('Rules loaded successfully:', rules)
    console.log('Number of rules loaded:', rules.length)

    if (rules && rules.length > 0) {
      availableRules.value = rules
      console.log('availableRules.value set to:', availableRules.value)
      console.log('First rule example:', availableRules.value[0])
    } else {
      console.warn('No rules returned from API')
      availableRules.value = []
    }
  } catch (error) {
    console.error('Error loading rules:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    message.error('Failed to load available rules. Please check the console for details.')
    availableRules.value = []
  } finally {
    loadingRules.value = false
    console.log('Loading rules finished. Final availableRules length:', availableRules.value.length)
  }
}

// Handle domain change
const handleDomainChange = (value: unknown) => {
  console.log('Domain changed to:', value)
  if (typeof value === 'string') {
    loadTemplateFields(value)
  }
}

// Load template fields from CSV template
const loadTemplateFields = async (domainName: string) => {
  try {
    loadingTemplateFields.value = true

    const templateFiles: Record<string, string> = {
      Customer: '/csv_template/Customer_TemplateFile.csv',
      Location: '/csv_template/Location_TemplateFile.csv',
      Product: '/csv_template/Product_TemplateFile.csv',
      Vendor: '/csv_template/Vendor_TemplateFile.csv',
    }

    const templatePath = templateFiles[domainName]

    if (templatePath) {
      const response = await fetch(templatePath)
      const csvText = await response.text()

      // Parse CSV to get field names (first line contains headers)
      const lines = csvText.split('\n').filter((line) => line.trim())
      if (lines.length > 0) {
        const fieldNames = lines[0].split(',').map((field) => field.trim())
        availableTemplateFields.value = fieldNames
        console.log(`Loaded ${fieldNames.length} template fields for ${domainName}:`, fieldNames)
      }
    } else {
      console.warn(`Template file not found for domain: ${domainName}`)
      availableTemplateFields.value = []
    }
  } catch (error) {
    console.error('Error loading template fields:', error)
    message.error('Failed to load template fields')
    availableTemplateFields.value = []
  } finally {
    loadingTemplateFields.value = false
  }
}

// Download template file
const downloadTemplate = () => {
  if (!formData.value.domainName) {
    message.warning('Please select a domain first')
    return
  }

  const templateFiles: Record<string, string> = {
    Customer: '/csv_template/Customer_TemplateFile.csv',
    Location: '/csv_template/Location_TemplateFile.csv',
    Product: '/csv_template/Product_TemplateFile.csv',
    Vendor: '/csv_template/Vendor_TemplateFile.csv',
  }

  const templatePath = templateFiles[formData.value.domainName]

  if (templatePath) {
    // Create a temporary link element and trigger download
    const link = document.createElement('a')
    link.href = templatePath
    link.download = `${formData.value.domainName}_TemplateFile.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    message.success(`${formData.value.domainName} template downloaded successfully`)
  } else {
    message.error('Template file not found')
  }
}

// Show field definitions modal
const showFieldDefinitions = async () => {
  if (!formData.value.domainName) {
    message.warning('Please select a domain first')
    return
  }

  showDefinitionsModal.value = true
  await loadFieldDefinitions()
}

// Load field definitions from CSV file
const loadFieldDefinitions = async () => {
  if (!formData.value.domainName) return

  try {
    loadingDefinitions.value = true

    const definitionFiles: Record<string, string> = {
      Customer: '/standard_templateDetailsDef/Customer_Template_DefDetails.csv',
      Location: '/standard_templateDetailsDef/Location_Template_DefDetails.csv',
      Product: '/standard_templateDetailsDef/Product_Template_DefDetails.csv',
      Vendor: '/standard_templateDetailsDef/Vendor_Template_DefDetails.csv',
    }

    const definitionPath = definitionFiles[formData.value.domainName]

    if (definitionPath) {
      const response = await fetch(definitionPath)
      const csvText = await response.text()

      // Parse CSV content
      const lines = csvText.split('\n').filter((line) => line.trim())

      const definitions: FieldDefinition[] = lines
        .slice(1)
        .map((line) => {
          const values = line.split(',')
          return {
            fieldName: values[0]?.trim() || '',
            description: values[1]?.trim() || '',
            dataType: values[2]?.trim() || '',
            length: values[3]?.trim() || '',
          }
        })
        .filter((def) => def.fieldName) // Filter out empty rows

      fieldDefinitions.value = definitions
    } else {
      message.error('Field definitions file not found')
    }
  } catch (error) {
    console.error('Error loading field definitions:', error)
    message.error('Failed to load field definitions')
  } finally {
    loadingDefinitions.value = false
  }
}

// Filter rules in dropdown
const filterRuleOption = (input: string, option: { value: string; label: string }) => {
  return (
    option.value.toLowerCase().includes(input.toLowerCase()) ||
    option.label.toLowerCase().includes(input.toLowerCase())
  )
}

// Filter template fields in dropdown
const filterFieldOption = (input: string, option: { value: string; label: string }) => {
  return option.value.toLowerCase().includes(input.toLowerCase())
}

// Handle rule selection from dropdown
const handleRuleSelection = (value: unknown) => {
  const selectedNames = Array.isArray(value) ? value.map(String) : value ? [String(value)] : []

  // Add new rules
  selectedNames.forEach((ruleName) => {
    const existingRule = formData.value.rules.find((r) => r.ruleName === ruleName)
    if (!existingRule) {
      const ruleTemplate = availableRules.value.find((r) => r.ruleName === ruleName)
      if (ruleTemplate) {
        const newRule = {
          appliesToField: [], // Initialize as empty array for multi-select
          ruleName: ruleName,
          parameters: getDefaultParameters(ruleName, ruleTemplate.value),
        }
        formData.value.rules.push(newRule)
      }
    }
  })

  // Remove deselected rules
  formData.value.rules = formData.value.rules.filter((rule) =>
    selectedNames.includes(rule.ruleName),
  )
}

// Get default parameters for a rule based on its value structure
const getDefaultParameters = (ruleName: string, value: unknown): Record<string, unknown> => {
  if (!value || value === null) {
    return {}
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const params: Record<string, unknown> = {}
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      params[key] = typeof val === 'string' ? '' : typeof val === 'number' ? 0 : val
    })
    return params
  }

  if (Array.isArray(value)) {
    return { values: [] }
  }

  return {}
}

// Get rule parameters for configuration
const getRuleParameters = (ruleName: string): boolean => {
  const rule = availableRules.value.find((r) => r.ruleName === ruleName)
  return !!(rule && rule.value !== null && rule.value !== undefined)
}

// Get rule parameter values to display
const getRuleParameterValues = (ruleName: string): unknown => {
  const rule = availableRules.value.find((r) => r.ruleName === ruleName)
  return rule?.value || null
}

// Remove rule
const removeRule = (index: number) => {
  const removedRule = formData.value.rules[index]
  formData.value.rules.splice(index, 1)

  // Also remove from selected rule names
  selectedRuleNames.value = selectedRuleNames.value.filter((name) => name !== removedRule.ruleName)
}

// Handle form submission
const handleSubmit = async () => {
  try {
    submitting.value = true

    // Transform form rules to API format - convert arrays to comma-separated strings
    const transformedRules: CreatePolicyRequest['rules'] = formData.value.rules
      .filter((rule) => Array.isArray(rule.appliesToField) && rule.appliesToField.length > 0) // Only include rules with fields
      .map((rule) => ({
        appliesToField: rule.appliesToField.join(', '), // Convert array to comma-separated string
        ruleName: rule.ruleName,
        parameters: rule.parameters,
      }))

    const payload: CreatePolicyRequest = {
      policyName: formData.value.policyName,
      domainName: formData.value.domainName,
      rules: transformedRules,
      description: formData.value.description,
      isPublished: formData.value.isPublished,
      createdBy: authStore.user?.userID || 'unknown',
      organizationId: 'c7ddfeaa-a005-4eb2-b7d1-ec5091d5a5bb', // Default organization ID for now
    }

    console.log('Transformed payload for API:', JSON.stringify(payload, null, 2))

    await policyService.createPolicy(payload)

    message.success(
      `Policy ${formData.value.isPublished ? 'created and published' : 'saved as draft'} successfully`,
    )

    // Emit success event to parent
    emit('success')
  } catch (error) {
    console.error('Error creating policy:', error)
    message.error('Failed to create policy')
  } finally {
    submitting.value = false
  }
}

// Load rules on component mount
onMounted(() => {
  loadRules()
})
</script>

<style scoped>
:deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #374151;
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
}

:deep(.ant-select-selector) {
  border-radius: 8px;
}

:deep(.ant-btn) {
  border-radius: 8px;
}

/* Remove hover background for tooltip button */
:deep(.tooltip-button.ant-btn-text:hover) {
  background-color: transparent !important;
}
</style>
