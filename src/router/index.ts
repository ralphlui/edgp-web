import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import PasswordResetView from '../views/PasswordResetView.vue'
import DashboardView from '../views/DashboardView.vue'
import InvitationVerifyView from '../views/InvitationVerifyView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: PasswordResetView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/invitation/:token',
      name: 'invitation-verify',
      component: InvitationVerifyView,
      props: true,
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // Initialize auth state from localStorage
  if (!authStore.accessToken) {
    authStore.initAuth()
  }

  if (requiresAuth && !authStore.accessToken) {
    // Redirect to home page if trying to access protected route without auth
    next({ name: 'home' })
  } else if (to.path === '/' && authStore.accessToken) {
    // Redirect to dashboard if already authenticated
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
