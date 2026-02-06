<template>
  <div class="login-wrapper">
    <AuthCard>
      <template #header>
        <div class="auth-logo-container">
          <img src="/images/npblue.png" alt="PLTD Tahuna" class="auth-logo-img" />
        </div>
        <!-- <h2>PLTD Tahuna</h2> -->
        <p class="text-muted text-sm mt-2 font-medium">Maintenance App</p>
      </template>
      
      <div class="flex flex-col gap-4">
        <div v-if="error" class="badge badge-danger p-3" style="display: block;">
          {{ getErrorMessage(error) }}
        </div>
        
        <GoogleLoginButton />
        
        <div class="text-center mt-4">
          <small class="text-muted">
            Dengan masuk, Anda menyetujui
            <a href="#">Ketentuan Layanan</a>
          </small>
        </div>
      </div>
    </AuthCard>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth'
})

// Check for error from OAuth callback
const route = useRoute()
const error = computed(() => route.query.error)

const getErrorMessage = (err) => {
  const messages = {
    no_code: 'Kode otorisasi tidak ditemukan',
    oauth_failed: 'Login dengan Google gagal'
  }
  return messages[err] || 'Terjadi kesalahan'
}

// Redirect if already authenticated
const { user, initAuth } = useAuth()

onMounted(async () => {
  await initAuth()
  if (user.value) {
    await navigateTo('/')
  }
})
</script>

<style scoped>
.login-wrapper {
  background-image: url('/images/bg.png');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.auth-logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-4);
}

.auth-logo-img {
  height: 80px;
  width: auto;
}

/* Override default auth card container if needed */
:deep(.auth-container) {
  background: transparent !important; /* Let wrapper handle bg */
  padding: 0;
}
</style>
