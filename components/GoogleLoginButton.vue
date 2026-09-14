<template>
  <button class="google-btn" @click="handleGoogleLogin" :disabled="isLoading">
    <img 
      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
      alt="Google"
    />
    <span v-if="isLoading">Signing in...</span>
    <span v-else>Sign in with Google</span>
  </button>
</template>

<script setup>
const isLoading = ref(false)

const handleGoogleLogin = async () => {
  isLoading.value = true
  try {
    const { loginWithGoogle } = useAuth()
    await loginWithGoogle()
  } finally {
    // If redirect didn't happen immediately, we reset after a short delay
    setTimeout(() => {
      isLoading.value = false
    }, 2000)
  }
}
</script>
