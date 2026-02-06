<template>
  <div class="app-layout" :class="{ 'dark-mode': isDark }">
    <!-- Main Content Area -->
    <div class="main-wrapper">
      <!-- Header (Top) -->
      <AppHeader />
      
      <!-- Page Content -->
      <main class="app-content">
        <div class="container">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
const { initAuth, user } = useAuth()
const { isDark, initTheme } = useTheme()

// Initialize theme and auth on mount
onMounted(async () => {
  initTheme()
  
  try {
    await initAuth()
  } catch (error) {
    console.error('Failed to initialize auth:', error)
  }
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--gray-50);
}

.main-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  padding-top: calc(var(--header-height) + var(--space-6));
  padding-bottom: var(--space-8);
}
</style>
