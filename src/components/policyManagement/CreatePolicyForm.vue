<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-lg">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Create New Policy</h2>
      </div>

      <!-- Form Content -->
      <div class="px-6 py-6">
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
            <Select v-model:value="formData.domainName" placeholder="Select domain" size="large">
              <SelectOption value="Customer">Customer</SelectOption>
              <SelectOption value="Location">Location</SelectOption>
              <SelectOption value="Product">Product</SelectOption>
              <SelectOption value="Vendor">Vendor</SelectOption>
            </Select>
          </FormItem>

          <!-- Rules Lists -->
          <FormItem label="Rules" name="rules" class="mb-6">
            <div class="space-y-4">
              <!-- Debug Information -->
              <div v-if="loadingRules" class="text-sm text-gray-500">Loading rules...</div>
              <div v-else-if="availableRules.length === 0" class="text-sm text-red-500">
                No rules available. Check console for errors.
              </div>
              <div v-else class="text-sm text-green-600">
                {{ availableRules.length }} rules loaded successfully
              </div>

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
                          Configure the field and parameters for this rule
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
                        <Input
                          v-model:value="rule.appliesToField"
                          placeholder="e.g., email, age, name"
                          size="small"
                        />
                      </div>

                      <!-- Dynamic Parameters based on rule -->
                      <div v-if="getRuleParameters(rule.ruleName)">
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
  message,
} from 'ant-design-vue'
import { DeleteOutlined } from '@ant-design/icons-vue'
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

// Form data
const formData = ref({
  policyName: '',
  domainName: '',
  rules: [] as CreatePolicyRequest['rules'],
  description: '',
  isPublished: false,
})

// Rules data
const availableRules = ref<Rule[]>([])

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

// Filter rules in dropdown
const filterRuleOption = (input: string, option: { value: string; label: string }) => {
  return (
    option.value.toLowerCase().includes(input.toLowerCase()) ||
    option.label.toLowerCase().includes(input.toLowerCase())
  )
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
          appliesToField: '',
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

    const payload: CreatePolicyRequest = {
      policyName: formData.value.policyName,
      domainName: formData.value.domainName,
      rules: formData.value.rules,
      description: formData.value.description,
      isPublished: formData.value.isPublished,
      createdBy: authStore.user?.userID || 'unknown',
      organizationId: 'c7ddfeaa-a005-4eb2-b7d1-ec5091d5a5bb', // Default organization ID for now
    }

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
</style>
