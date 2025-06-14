<script setup lang="ts">
import { ref } from 'vue'
import { Form, Input, Select } from 'ant-design-vue'

const form = ref({
  organizationName: '',
  taxId: '',
  streetAddress: '',
  city: '',
  postalCode: '',
  country: undefined,
  phone: '',
  website: '',
  size: undefined,
  industry: undefined,
  contactName: '',
  contactEmail: '',
  contactPhone: '',
})

const organizationSizes = [
  { label: '1-20 employees', value: '1-20' },
  { label: '21-50 employees', value: '21-50' },
  { label: '51-100 employees', value: '51-100' },
  { label: '101-500 employees', value: '101-500' },
  { label: '501-1000 employees', value: '501-1000' },
  { label: '1000+ employees', value: '1000+' },
]

const industries = [
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Finance', value: 'finance' },
  { label: 'Education', value: 'education' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Retail', value: 'retail' },
  { label: 'Government', value: 'government' },
  { label: 'Non-profit', value: 'non-profit' },
  { label: 'Energy', value: 'energy' },
  { label: 'Transportation', value: 'transportation' },
  { label: 'Construction', value: 'construction' },
  { label: 'Agriculture', value: 'agriculture' },
  { label: 'Other', value: 'other' },
]

// Import country list from a reliable source or define your own
const countries = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'Canada', value: 'CA' },
  // ... add more countries
]

const handleSubmit = () => {
  console.log('Form submitted:', form.value)
  // TODO: Implement form submission
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
              :options="countries"
              style="width: 100%"
            />
          </Form.Item>

          <Form.Item label="Organization Phone">
            <Input v-model:value="form.phone" placeholder="Enter organization phone" />
          </Form.Item>

          <Form.Item label="Website">
            <Input v-model:value="form.website" placeholder="Enter website URL" />
          </Form.Item>

          <Form.Item label="Organization Size">
            <Select
              v-model:value="form.size"
              placeholder="Select organization size"
              :options="organizationSizes"
              style="width: 100%"
            />
          </Form.Item>

          <Form.Item label="Industry">
            <Select
              v-model:value="form.industry"
              placeholder="Select industry"
              :options="industries"
              style="width: 100%"
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
              class="w-full px-6 py-3 text-base text-white rounded-lg"
              style="background-color: #4f46e5"
              @click="handleSubmit"
            >
              Register Organization
            </button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
