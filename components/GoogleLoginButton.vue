<template>
  <button class="google-btn" @click="handleGoogleLogin" :disabled="isLoading">
    <img 
      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
      alt="Google"
    />
    <span v-if="isLoading">Memproses...</span>
    <span v-else>Masuk dengan Google</span>
  </button>
</template>

<script setup>
const isLoading = ref(false)

const handleGoogleLogin = () => {
  isLoading.value = true
  const { loginWithGoogle } = useAuth()
  loginWithGoogle()
}
</script>
