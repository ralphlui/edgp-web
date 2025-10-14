<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BankOutlined,
  LogoutOutlined,
  FileProtectOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from '@ant-design/icons-vue'
import { Layout, Menu, Modal, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import dashboardIcon from '@/assets/dashboardIcon.png'
import InviteNewUser from '@/components/auth/InviteNewUser.vue'
import FileDataDashboard from '@/components/dataDashboard/FileDataDashboard.vue'
import WorkflowManagement from '@/components/workflowManagement/WorkflowManagement.vue'
import OrganizationRegister from '@/components/organisations/OrganizationRegister.vue'
import OrganizationList from '@/components/organisations/OrganizationList.vue'
import PolicyList from '@/components/policyManagement/PolicyList.vue'
import MasterDataManagement from '@/components/masterData/MasterDataManagement.vue'
import ReportingAnalytics from '@/components/reporting/ReportingAnalytics.vue'
import { authService } from '@/services/auth.service'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/stores/auth'
import type { UserListResponse } from '@/services/user.service'
import { usePermissions } from '@/composables/usePermissions'

// Define props
const props = defineProps<{
  fileId?: string
  activeComponent?: string
}>()

// Use fileId directly from props
const fileId = computed(() => {
  console.log('🎯 DashboardView fileId computed:', props.fileId)
  return props.fileId
})

const collapsed = ref(false)
const selectedKeys = ref(['2']) // Default to User Onboarding
const organizationView = ref('list') // 'list' or 'register'
const inviteModalRef = ref()
const router = useRouter()

// Track whether user has manually selected a menu item
const userSelectedMenu = ref(false)

// Stats data from API
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  pendingInvites: 0,
})

// User data from API
const userData = ref<UserListResponse['data']['users']>([])
const loading = ref(false)

// Permissions
const { hasAccess } = usePermissions()

// Check access to different components
const canAccessOrganizations = hasAccess('org')
const canAccessPolicies = hasAccess('policy')
const canAccessMdm = hasAccess('mdm')

// Set menu selection based on active component
const updateSelectedMenu = () => {
  // Only update if user hasn't manually selected a menu item
  if (!userSelectedMenu.value && props.activeComponent === 'workflow-management') {
    selectedKeys.value = ['5'] // Select the Workflow Management menu item
  } else if (!props.activeComponent && !selectedKeys.value.length) {
    // Only set default if no active component and no current selection
    selectedKeys.value = ['2'] // Default to User Onboarding
  }
}

// Watch for menu selection changes to track manual selection
watch(
  selectedKeys,
  (newKeys, oldKeys) => {
    // If menu selection changed and it's not from prop initialization, mark as user selected
    if (oldKeys && newKeys[0] !== oldKeys[0]) {
      userSelectedMenu.value = true
    }
  },
  { deep: true },
)

const loadUserData = async () => {
  try {
    loading.value = true
    const response = await userService.getUsers()

    userData.value = response.data.users
    stats.value = {
      totalUsers: response.totalRecord,
      activeUsers: response.data.active,
      pendingInvites: response.data.pending,
    }
  } catch (error) {
    message.error('Failed to load user data')
    console.error('Error loading user data:', error)
  } finally {
    loading.value = false
  }
}

// Watch for prop changes to update menu selection
watch(
  () => props.activeComponent,
  () => {
    console.log('📋 DashboardView activeComponent changed to:', props.activeComponent)
    // Reset user selection flag when navigating via route
    if (props.activeComponent) {
      userSelectedMenu.value = false
    }
    updateSelectedMenu()
  },
  { immediate: true },
)

// Watch for fileId prop changes
watch(
  () => props.fileId,
  (newFileId, oldFileId) => {
    console.log('🔄 DashboardView fileId prop changed from', oldFileId, 'to', newFileId)
  },
  { immediate: true },
)

// Handle manual menu selection
const handleMenuSelect = (info: { key: string | number }) => {
  const key = String(info.key)

  // Skip logout handling here since it's handled separately
  if (key === 'logout') {
    return
  }

  selectedKeys.value = [key]
  userSelectedMenu.value = true

  // If we're currently on a workflow route, navigate back to dashboard
  // This ensures the URL changes from /workflow/fileId back to /dashboard
  const currentRoute = router.currentRoute.value
  if (currentRoute.name === 'workflow-management') {
    console.log('🔄 Navigating from workflow route back to dashboard:', {
      currentRoute: currentRoute.name,
      currentPath: currentRoute.path,
      selectedMenuItem: key,
    })
    router.push({ name: 'dashboard' })
  }
}

// Update menu selection when component mounts
onMounted(() => {
  updateSelectedMenu()
  loadUserData()
})

// Compute which component to show based on selected menu item or props
const currentComponent = computed(() => {
  // If user has manually selected a menu item, always use that
  if (userSelectedMenu.value) {
    switch (selectedKeys.value[0]) {
      case '1':
        return 'FileDataDashboard'
      case '5':
        return 'WorkflowManagement'
      case '3':
        return 'Organization'
      case '4':
        return 'PolicyList'
      case '6':
        return 'MasterDataManagement'
      case '7':
        return 'ReportingAnalytics'
      default:
        return 'UserOnboarding'
    }
  }

  // If activeComponent is passed as prop and user hasn't manually selected, use it
  if (props.activeComponent === 'workflow-management') {
    return 'WorkflowManagement'
  }

  // Otherwise use the menu selection
  switch (selectedKeys.value[0]) {
    case '1':
      return 'FileDataDashboard'
    case '5':
      return 'WorkflowManagement'
    case '3':
      return 'Organization'
    case '4':
      return 'PolicyList'
    case '6':
      return 'MasterDataManagement'
    case '7':
      return 'ReportingAnalytics'
    default:
      return 'UserOnboarding'
  }
})

// Add methods to switch between organization views
const switchToOrganizationRegister = () => {
  organizationView.value = 'register'
}

const switchToOrganizationList = () => {
  organizationView.value = 'list'
}

// Columns for user table
const userColumns = [
  { title: 'Name', dataIndex: 'username', key: 'username' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' },
  },
  { title: 'Last Login', dataIndex: 'lastLogin', key: 'lastLogin' },
  { title: 'Contributions', dataIndex: 'contributions', key: 'contributions' },
  { title: 'Actions', key: 'actions', slots: { customRender: 'actions' } },
]

// Handler functions for table actions
const handleEdit = (record: (typeof userData.value)[0]) => {
  console.log('Edit user:', record)
  // TODO: Implement edit functionality
}

const handleDelete = (record: (typeof userData.value)[0]) => {
  Modal.confirm({
    title: 'Delete User',
    content: `Are you sure you want to delete ${record.username}?`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk: () => {
      // Here you would typically make an API call to delete the user
      userData.value = userData.value.filter((user) => user.id !== record.id)
      Modal.success({
        title: 'User Deleted',
        content: `${record.username} has been successfully deleted.`,
      })
    },
  })
}

const handleInviteUser = () => {
  inviteModalRef.value?.show()
}

const handleLogout = () => {
  Modal.confirm({
    title: 'Logout Confirmation',
    content: 'Are you sure you want to logout?',
    okText: 'Yes',
    cancelText: 'No',
    onOk: async () => {
      try {
        await authService.logout()
        // Clear all auth state first
        const authStore = useAuthStore()
        authStore.clearAuth() // Clear Pinia store state

        // Clear browser storage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
        })

        // Navigate and show success message
        await router.push({ name: 'home' }) // Wait for navigation to complete
        Modal.success({
          title: 'Logout Successful',
          content: 'You have been successfully logged out.',
        })
      } catch (error) {
        console.error('Logout failed:', error)
        // Even on error, clear auth state and redirect
        const authStore = useAuthStore()
        authStore.clearAuth()
        await router.push({ name: 'home' })
        Modal.error({
          title: 'Logout Failed',
          content: error instanceof Error ? error.message : 'Failed to logout. Please try again.',
        })
      }
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

      <div class="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        <!-- Navigation Menu -->
        <Menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          class="border-r-0 flex-1"
          @select="handleMenuSelect"
        >
          <Menu.Item v-if="canAccessMdm" key="1">
            <template #icon>
              <img :src="dashboardIcon" alt="Dashboard" class="w-5 h-5" />
            </template>
            <span>File and Data Dashboard</span>
          </Menu.Item>
          <Menu.Item key="2">
            <template #icon>
              <UserOutlined />
            </template>
            <span>User Onboarding</span>
          </Menu.Item>
          <Menu.Item v-if="canAccessOrganizations" key="3">
            <template #icon>
              <BankOutlined />
            </template>
            <span>Organization Management</span>
          </Menu.Item>
          <Menu.Item v-if="canAccessPolicies" key="4">
            <template #icon>
              <FileProtectOutlined />
            </template>
            <span>Policy Management</span>
          </Menu.Item>
          <Menu.Item v-if="canAccessMdm" key="5">
            <template #icon>
              <ProjectOutlined />
            </template>
            <span>Workflow Management</span>
          </Menu.Item>
          <Menu.Item v-if="canAccessMdm" key="6">
            <template #icon>
              <DatabaseOutlined />
            </template>
            <span>Master Data Management</span>
          </Menu.Item>
          <Menu.Item v-if="canAccessMdm" key="7">
            <template #icon>
              <BarChartOutlined />
            </template>
            <span>Reporting & Analytics</span>
          </Menu.Item>
          <Menu.Divider class="my-2" />
          <Menu.Item key="logout" @click="handleLogout">
            <template #icon>
              <LogoutOutlined />
            </template>
            <span>Logout</span>
          </Menu.Item>
        </Menu>
      </div>
    </Layout.Sider>

    <Layout>
      <!-- Main Content -->
      <Layout.Content class="p-6" style="background: #e5e7eb">
        <!-- Conditional rendering based on selected menu item -->
        <FileDataDashboard v-if="currentComponent === 'FileDataDashboard'" />

        <!-- Workflow Management section -->
        <WorkflowManagement
          v-else-if="currentComponent === 'WorkflowManagement'"
          :key="`workflow-${fileId || 'default'}`"
          :fileId="fileId"
        />

        <!-- Policy List section -->
        <PolicyList v-else-if="currentComponent === 'PolicyList'" />

        <!-- Master Data Management section -->
        <MasterDataManagement v-else-if="currentComponent === 'MasterDataManagement'" />

        <!-- Reporting & Analytics section -->
        <ReportingAnalytics v-else-if="currentComponent === 'ReportingAnalytics'" />

        <!-- Organization section with nested views -->
        <template v-else-if="currentComponent === 'Organization'">
          <OrganizationList
            v-if="organizationView === 'list'"
            @register-click="switchToOrganizationRegister"
          />
          <OrganizationRegister
            v-else
            @back-click="switchToOrganizationList"
            @register-success="switchToOrganizationList"
          />
        </template>

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
                :pagination="{ pageSize: 5 }"
                :loading="loading"
                class="user-management-table"
              >
                <template #status="{ record }">
                  <span
                    :class="{
                      'text-green-600': record.status === 'Active',
                      'text-red-600': record.status === 'Pending',
                      'text-gray-500': record.status === 'Inactive',
                    }"
                  >
                    {{ record.status }}
                  </span>
                </template>
                <template #lastLogin="{ text }">
                  {{ text || 'Never' }}
                </template>
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

        <InviteNewUser ref="inviteModalRef" @invite-success="loadUserData" />
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
