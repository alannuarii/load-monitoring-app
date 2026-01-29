<template>
  <nav class="app-menu">
    <div class="menu-content">
      <NuxtLink 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path" 
        class="menu-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="menu-item-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup>
const route = useRoute()

const menuItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/preventive', icon: '📅', label: 'PM' },
  { path: '/material', icon: '📦', label: 'Material' },
  { path: '/periodic', icon: '🔄', label: 'Periodik' },
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
