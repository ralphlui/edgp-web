<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BankOutlined,
} from '@ant-design/icons-vue'
import { Layout, Menu, Modal } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import dashboardIcon from '@/assets/dashboardIcon.png'
import InviteNewUser from '@/components/auth/InviteNewUser.vue'
import DataDashboard from '@/components/dataDashboard/DataDashboard.vue'
import OrganizationRegister from '@/components/organisations/OrganizationRegister.vue'

const collapsed = ref(false)
const selectedKeys = ref(['2']) // Default to User Onboarding
const inviteModalRef = ref()

// Compute which component to show based on selected menu item
const currentComponent = computed(() => {
  switch (selectedKeys.value[0]) {
    case '1':
      return 'DataDashboard'
    case '3':
      return 'OrganizationRegister'
    default:
      return 'UserOnboarding'
  }
})

// Mock data for statistics
const stats = ref({
  totalUsers: 256,
  activeUsers: 198,
  pendingInvites: 15,
})

// Mock data for user table
const userColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Last Login', dataIndex: 'lastLogin', key: 'lastLogin' },
  { title: 'Contributions', dataIndex: 'contributions', key: 'contributions' },
  { title: 'Actions', key: 'actions', slots: { customRender: 'actions' } },
]

const userData = ref([
  {
    key: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2025-06-14',
    contributions: 45,
  },
  {
    key: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'Editor',
    status: 'Active',
    lastLogin: '2025-06-13',
    contributions: 32,
  },
])

// Handler functions for table actions
const handleEdit = (record: (typeof userData.value)[0]) => {
  console.log('Edit user:', record)
  // TODO: Implement edit functionality
}

const handleDelete = (record: (typeof userData.value)[0]) => {
  console.log('Delete user:', record)
  // TODO: Implement delete functionality
}

const router = useRouter()

const handleInviteUser = () => {
  inviteModalRef.value?.show()
}

const handleLogout = () => {
  Modal.confirm({
    title: 'Logout Confirmation',
    content: 'Are you sure you want to logout?',
    okText: 'Yes',
    cancelText: 'No',
    onOk: () => {
      // TODO: Add any logout cleanup logic here (clear tokens, etc.)
      router.push('/')
    },
  })
}
</script>

<template>
  <Layout class="min-h-screen">
    <!-- Sidebar -->
    <Layout.Sider
      v-model:collapsed="collapsed"
      class="border-r border-gray-200"
      :trigger="null"
      collapsible
      style="background: #ffffff"
    >
      <!-- Logo and Brand with Collapse Button -->
      <div class="h-16 flex items-center px-4 border-b border-gray-200">
        <div class="w-8 flex justify-center">
          <component
            :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
            class="cursor-pointer hover:text-blue-600"
            @click="() => (collapsed = !collapsed)"
          />
        </div>
        <span v-if="!collapsed" class="ml-3 text-2xl font-semibold" style="color: #1d4ed8"
          >DataGov</span
        >
      </div>

      <!-- Navigation Menu -->
      <Menu v-model:selectedKeys="selectedKeys" mode="inline" class="border-r-0">
        <Menu.Item key="1">
          <template #icon>
            <img :src="dashboardIcon" alt="Dashboard" class="w-5 h-5" />
          </template>
          <span>Data Dashboard</span>
        </Menu.Item>
        <Menu.Item key="2">
          <template #icon>
            <UserOutlined />
          </template>
          <span>User Onboarding</span>
        </Menu.Item>
        <Menu.Item key="3">
          <template #icon>
            <BankOutlined />
          </template>
          <span>Organization Register</span>
        </Menu.Item>
        <Menu.Item key="logout" @click="handleLogout">
          <template #icon>
            <LogoutOutlined />
          </template>
          <span>Logout</span>
        </Menu.Item>
      </Menu>
    </Layout.Sider>

    <Layout>
      <!-- Main Content -->
      <Layout.Content class="p-6" style="background: #e5e7eb">
        <!-- Conditional rendering based on selected menu item -->
        <DataDashboard v-if="currentComponent === 'DataDashboard'" />
        <OrganizationRegister v-else-if="currentComponent === 'OrganizationRegister'" />

        <template v-else>
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">User Onboarding</h1>
            <button
              class="px-4 py-2 text-sm text-white rounded-lg"
              style="background-color: #4f46e5"
              @click="handleInviteUser"
            >
              Invite User
            </button>
          </div>

          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Total Users -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-500">Total Users</h3>
              <p class="mt-2 text-3xl font-semibold">{{ stats.totalUsers }}</p>
            </div>

            <!-- Active Users -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-500">Active Users</h3>
              <p class="mt-2 text-3xl font-semibold">{{ stats.activeUsers }}</p>
            </div>

            <!-- Pending Invites -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-sm font-medium text-gray-500">Pending Invites</h3>
              <p class="mt-2 text-3xl font-semibold">{{ stats.pendingInvites }}</p>
            </div>
          </div>

          <!-- User Management Table -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-xl font-semibold">User Management</h2>
            </div>
            <div class="p-6">
              <a-table
                :columns="userColumns"
                :data-source="userData"
                :pagination="{ pageSize: 10 }"
                class="user-management-table"
              >
                <template #actions="{ record }">
                  <a-space>
                    <a class="text-blue-600 hover:text-blue-800" @click="() => handleEdit(record)"
                      >Edit</a
                    >
                    <a class="text-red-600 hover:text-red-800" @click="() => handleDelete(record)"
                      >Delete</a
                    >
                  </a-space>
                </template>
              </a-table>
            </div>
          </div>
        </template>

        <InviteNewUser ref="inviteModalRef" />
      </Layout.Content>
    </Layout>
  </Layout>
</template>

<style scoped>
:deep(.user-management-table) {
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
