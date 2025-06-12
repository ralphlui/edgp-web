<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import MyContainer from './MyContainer.vue'
import AppAuth from '../auth/AppAuth.vue'

const authRef = ref()

const handleGetStarted = () => {
  authRef.value?.showModal()
}

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <ALayout>
    <ALayoutHeader class="header-style">
      <MyContainer>
        <div class="nav-container">
          <div class="right-content">
            <RouterLink to="/" class="nav-title"> Enterprise Master Data Governance </RouterLink>
          </div>
          <div class="left-content">
            <AButton type="link" class="nav-links" @click="scrollToSection('features')"
              >Features</AButton
            >
            <AButton type="link" class="nav-links" @click="scrollToSection('pricing')"
              >Pricing</AButton
            >
            <AButton type="primary" class="nav-button" @click="handleGetStarted"
              >Get Started</AButton
            >
          </div>
        </div>
      </MyContainer>
    </ALayoutHeader>
    <AppAuth ref="authRef" />
  </ALayout>
</template>

<style scoped>
.header-style {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}
.nav-container {
  /* background-color: aqua; */
  display: flex;
  justify-content: space-between;
}
.nav-title {
  color: black;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 24px;
}
.right-content {
  display: flex;
  align-items: center;
  color: black;
}
.nav-links {
  color: #6b7280;
}
.nav-button {
  background-color: #4f46e5;
  height: 60%;
  color: white;
}
</style>
