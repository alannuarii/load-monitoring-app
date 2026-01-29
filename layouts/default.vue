<template>
  <div class="app-wrapper">
    <AppHeader />
    <main class="app-content">
      <div class="container">
        <slot />
      </div>
    </main>
    <AppMenu />
  </div>
</template>

<script setup>
const { checkAuth, user } = useAuth()

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
})
</script>
