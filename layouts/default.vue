<template>
  <div class="app-layout">
    <!-- Sidebar (Left) -->
    <AppSidebar :is-open="isSidebarOpen" @close="closeSidebar" />

    <!-- Main Content Area -->
    <div class="main-wrapper">
      <!-- Header (Top) -->
      <AppHeader @toggle-sidebar="toggleSidebar" />
      
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
const { checkAuth, user } = useAuth()
const isSidebarOpen = ref(false)

// Check auth on every page load
onMounted(async () => {
  await checkAuth()
})

// Also check auth when navigating
const route = useRoute()
watch(() => route.path, async () => {
  if (!user.value) {
    await checkAuth()
  }
  // Close sidebar on navigation (mobile)
  closeSidebar()
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
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
  transition: padding-left var(--transition-base);
}

.app-content {
  flex: 1;
  padding-top: calc(var(--header-height) + var(--space-6));
  padding-bottom: var(--space-8);
}

@media (min-width: 1024px) {
  .main-wrapper {
    padding-left: var(--sidebar-width, 280px);
  }

  /* Adjust AppHeader position when sidebar is present */
  :deep(.app-header) {
    left: var(--sidebar-width, 280px);
    width: calc(100% - var(--sidebar-width, 280px));
  }
  
  :deep(.header-logo.mobile-only) {
    display: none;
  }
}
</style>
