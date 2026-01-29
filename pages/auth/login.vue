<template>
  <div>
    <AuthCard>
      <template #header>
        <div class="auth-logo">⚙️</div>
        <h2>PLTD Tahuna</h2>
        <p class="text-muted text-sm mt-2">Maintenance App</p>
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
</script>
