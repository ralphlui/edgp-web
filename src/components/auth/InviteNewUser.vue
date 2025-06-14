<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { Modal, Form, Input, Select, message } from 'ant-design-vue'

const emit = defineEmits(['close'])
const visible = ref(false)
const inviteForm = ref({
  email: '',
  role: undefined,
})

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Data Analyst', value: 'dataAnalyst' },
  { label: 'Policy Manager', value: 'policyManager' },
]

const show = () => {
  visible.value = true
}

const handleSendInvite = () => {
  // TODO: Implement invite functionality
  message.success(`Invitation sent to ${inviteForm.value.email}`)
  handleCancel()
}

const handleCancel = () => {
  visible.value = false
  inviteForm.value = { email: '', role: undefined }
  emit('close')
}

// Expose the show method to parent components
defineExpose({ show })
</script>

<template>
  <Modal v-model:visible="visible" :footer="null" @cancel="handleCancel">
    <div class="p-4">
      <h2 class="text-xl font-semibold mb-6">Invite New User</h2>
      <Form layout="vertical">
        <Form.Item label="Email">
          <Input
            v-model:value="inviteForm.email"
            placeholder="Enter email address"
            :style="{ width: '100%' }"
          />
        </Form.Item>
        <Form.Item label="Role">
          <Select
            v-model:value="inviteForm.role"
            :options="roleOptions"
            placeholder="Select role"
            :style="{ width: '100%' }"
          />
        </Form.Item>
        <div class="flex justify-end gap-4 mt-6">
          <button
            class="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            @click="handleCancel"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-sm text-white rounded-lg"
            style="background-color: #4f46e5"
            @click="handleSendInvite"
          >
            Send Invite
          </button>
        </div>
      </Form>
    </div>
  </Modal>
</template>

<style scoped></style>
