<template>
  <div class="auth-card">
    <div class="text-center mb-4">
      <slot name="header">
        <h2>Selamat Datang</h2>
        <p class="text-muted">Silakan masuk untuk melanjutkan</p>
      </slot>
    </div>
    
    <slot />
    
    <div v-if="$slots.footer" class="mt-4 text-center">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
// Reusable auth card component
</script>
