<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Form, Input, Select, message } from 'ant-design-vue'
import { organizationService } from '@/services/organization.service'

const form = ref({
  organizationName: '',
  taxId: '',
  streetAddress: '',
  city: '',
  postalCode: '',
  country: undefined,
  phone: '',
  website: '',
  size: '',
  industry: undefined,
  contactName: '',
  contactEmail: '',
  contactPhone: '',
})

const industries = ref<{ label: string; value: string }[]>([])
const loadingIndustries = ref(false)

const loadIndustries = async () => {
  try {
    loadingIndustries.value = true
    const sectorData = await organizationService.getSectors()
    industries.value = sectorData.map((sector) => ({
      label: sector.sectorName,
      value: sector.sectorID,
    }))
  } catch (error) {
    console.error('Error loading industries:', error)
    message.error('Failed to load industries')
  } finally {
    loadingIndustries.value = false
  }
}

onMounted(() => {
  loadIndustries()
})

// Import countries from constants
import { COUNTRIES } from '@/constants/countries'

const registering = ref(false)

const handleSubmit = async () => {
  if (!form.value.industry) {
    message.error('Please select an industry')
    return
  }

  try {
    registering.value = true
    // Here you would call your organization registration API
    // Using organization service to register the organization
    // TODO: Add organization registration API call
    console.log('Form ready for submission:', {
      ...form.value,
      organizationSize: Number(form.value.size),
    })
    message.success('Organization registered successfully!')
    // Reset form after successful registration
    form.value = {
      organizationName: '',
      taxId: '',
      streetAddress: '',
      city: '',
      postalCode: '',
      country: undefined,
      phone: '',
      website: '',
      size: '',
      industry: undefined,
      contactName: '',
      contactEmail: '',
      contactPhone: '',
    }
  } catch (error) {
    console.error('Error registering organization:', error)
    message.error('Failed to register organization')
  } finally {
    registering.value = false
  }
}
</script>

<template>
  <div class="p-6" style="background: #e5e7eb">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-8">Organization Registration</h1>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <Form layout="vertical">
          <h2 class="text-xl font-semibold mb-6">Organization Details</h2>

          <Form.Item label="Organization Name">
            <Input v-model:value="form.organizationName" placeholder="Enter organization name" />
          </Form.Item>

          <Form.Item label="Tax ID/Registration Number">
            <Input v-model:value="form.taxId" placeholder="Enter tax ID or registration number" />
          </Form.Item>

          <Form.Item label="Street Address">
            <Input v-model:value="form.streetAddress" placeholder="Enter street address" />
          </Form.Item>

          <div class="grid grid-cols-2 gap-4">
            <Form.Item label="City">
              <Input v-model:value="form.city" placeholder="Enter city" />
            </Form.Item>

            <Form.Item label="Postal Code">
              <Input v-model:value="form.postalCode" placeholder="Enter postal code" />
            </Form.Item>
          </div>

          <Form.Item label="Country">
            <Select
              v-model:value="form.country"
              placeholder="Select country"
              :options="COUNTRIES"
              show-search
              :filter-option="
                (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              "
              style="width: 100%"
            />
          </Form.Item>

          <Form.Item label="Organization Phone">
            <Input v-model:value="form.phone" placeholder="Enter organization phone" />
          </Form.Item>

          <Form.Item label="Website">
            <Input v-model:value="form.website" placeholder="Enter website URL" />
          </Form.Item>

          <Form.Item label="Organization Size (Number of Employees)">
            <Input
              v-model:value="form.size"
              placeholder="Enter number of employees (e.g., 50)"
              type="number"
              min="1"
              :max="999999"
              style="width: 100%"
            />
          </Form.Item>

          <Form.Item label="Industry">
            <Select
              v-model:value="form.industry"
              placeholder="Select industry"
              :options="industries"
              :loading="loadingIndustries"
              style="width: 100%"
              show-search
              :filter-option="
                (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              "
            />
          </Form.Item>

          <div class="mt-12 mb-6">
            <h2 class="text-xl font-semibold">Primary Contact Information</h2>
            <div class="border-t border-gray-200 my-4"></div>
          </div>

          <Form.Item label="Contact Name">
            <Input v-model:value="form.contactName" placeholder="Enter contact name" />
          </Form.Item>

          <Form.Item label="Contact Email">
            <Input v-model:value="form.contactEmail" placeholder="Enter contact email" />
          </Form.Item>

          <Form.Item label="Contact Phone">
            <Input v-model:value="form.contactPhone" placeholder="Enter contact phone" />
          </Form.Item>

          <div class="mt-8 w-full">
            <button
              class="w-full px-6 py-3 text-base text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style="background-color: #4f46e5"
              @click="handleSubmit"
              :disabled="registering"
            >
              {{ registering ? 'Registering...' : 'Register Organization' }}
            </button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
