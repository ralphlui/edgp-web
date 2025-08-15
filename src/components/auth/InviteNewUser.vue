<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Form, Input, Select, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { roleService } from '@/services/role.service'
import { organizationService } from '@/services/organization.service'
import { userService } from '@/services/user.service'

const emit = defineEmits(['close', 'invite-success'])
const visible = ref(false)
const rolesLoading = ref(false)
const orgsLoading = ref(false)
const inviteForm = ref({
  email: '',
  organization: undefined,
  role: undefined,
})

const roleOptions = ref<{ label: string; value: string }[]>([])
const organizationOptions = ref<{ label: string; value: string }[]>([])

const router = useRouter()

const fetchOrganizations = async () => {
  try {
    orgsLoading.value = true
    const organizations = await organizationService.getOrganizations()
    organizationOptions.value = organizations.map((org) => ({
      label: org.organizationName,
      value: org.organizationId,
    }))
  } catch (error) {
    console.error('Error fetching organizations:', error)
    message.error('Please log in again to continue')
    visible.value = false
    router.push('/')
  } finally {
    orgsLoading.value = false
  }
}

const fetchRoles = async () => {
  try {
    rolesLoading.value = true
    const roles = await roleService.getRoles()
    roleOptions.value = roles.map((role) => ({
      label: role.roleDescription,
      value: role.roleName,
    }))
  } catch (error) {
    console.error('Error fetching roles:', error)
    message.error('Please log in again to continue')
    visible.value = false
    router.push('/')
  } finally {
    rolesLoading.value = false
  }
}

const show = () => {
  visible.value = true
  // Fetch data when the modal is opened
  fetchOrganizations()
  fetchRoles()
}

const handleSendInvite = async () => {
  if (!inviteForm.value.email || !inviteForm.value.organization || !inviteForm.value.role) {
    message.error('Please fill in all required fields')
    return
  }

  try {
    const response = await userService.inviteUser({
      email: inviteForm.value.email,
      organizationId: inviteForm.value.organization,
      role: inviteForm.value.role,
    })

    if (response.success) {
      message.success(response.message || 'Invitation sent successfully')
      emit('invite-success') // So parent component can refresh the user list
      handleCancel()
    } else {
      message.error(response.message || 'Failed to send invitation')
    }
  } catch (error) {
    console.error('Failed to send invitation:', error)
    message.error('Failed to send invitation. Please try again.')
  }
}

const handleCancel = () => {
  visible.value = false
  inviteForm.value = { email: '', organization: undefined, role: undefined }
  emit('close')
}

// Expose the show method to parent components
defineExpose({ show })
</script>

<template>
  <Modal v-model:open="visible" :footer="null" @cancel="handleCancel">
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
        <Form.Item label="Organization">
          <Select
            v-model:value="inviteForm.organization"
            :options="organizationOptions"
            :loading="orgsLoading"
            placeholder="Select organization"
            :style="{ width: '100%' }"
          />
        </Form.Item>
        <Form.Item label="Role">
          <Select
            v-model:value="inviteForm.role"
            :options="roleOptions"
            :loading="rolesLoading"
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
