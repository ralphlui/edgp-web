<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import NavBar from './components/nav/NavBar.vue'

const route = useRoute()
const isDashboard = computed(() => route.path === '/dashboard')
</script>

<template>
  <div>
    <NavBar v-if="!isDashboard" />
    <RouterView />
  </div>
</template>

<style scoped></style>
