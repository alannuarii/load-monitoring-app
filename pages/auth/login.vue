<template>
  <div class="login-wrapper">
    <AuthCard>
      <template #header>
        <div class="auth-logo-container">
          <img src="/images/npblue.png" alt="PLTD Tahuna" class="auth-logo-img" />
        </div>
        <div class="auth-title-group">
          <h2 class="auth-app-title">Load Monitoring</h2>
          <p class="auth-app-subtitle">PLTD Tahuna</p>
        </div>
      </template>
      
      <div class="auth-action-group">
        <div v-if="error" class="badge badge-danger p-3" style="display: block;">
          {{ getErrorMessage(error) }}
        </div>
        
        <GoogleLoginButton />
        
        <div class="text-center mt-4">
          <small class="text-muted">
            By signing in, you agree to the
            <a href="#">Terms of Service</a>
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
    no_code: 'Authorization code not found',
    oauth_failed: 'Google sign-in failed'
  }
  return messages[err] || 'An error occurred'
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
  margin-bottom: 2rem;
}

.auth-logo-img {
  height: 76px;
  width: auto;
}

.auth-title-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
}

.auth-app-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0c4a6e;
  letter-spacing: 0.02em;
  margin: 0;
  line-height: 1.2;
}

.auth-app-subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: #000000;
  letter-spacing: 0.04em;
  margin: 0;
}

.auth-title-group::after {
  content: '';
  display: block;
  width: 42px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-500), #38bdf8);
  border-radius: 2px;
  margin-top: 0.4rem;
}

.auth-action-group {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Override default auth card container if needed */
:deep(.auth-container) {
  background: transparent !important; /* Let wrapper handle bg */
  padding: 0;
}
</style>
