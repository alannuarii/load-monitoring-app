<template>
  <aside class="app-sidebar" :class="{ 'is-open': isOpen }">
    <div class="sidebar-header">
      <div class="logo-container" @click="navigateToHome">
        <img src="/images/npblue.png" alt="PLTD Tahuna" class="logo-image" />
      </div>
      <button class="btn-close-sidebar" @click="$emit('close')">
        ✕
      </button>
    </div>

    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <!-- Loop through menu items -->
        <template v-for="item in menuItems" :key="item.path">
          
          <!-- Single Menu Item -->
          <NuxtLink 
            v-if="!item.children" 
            :to="item.path" 
            class="nav-item" 
            :class="{ active: isActive(item.path) }"
            @click="handleItemClick"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </NuxtLink>

          <!-- Parent Menu Item with Children -->
          <div v-else class="nav-group" :class="{ 'is-expanded': isExpanded(item.path) }">
            <div class="nav-item nav-parent" @click="toggleGroup(item.path)" :class="{ active: isGroupActive(item) }">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
              <span class="nav-arrow">▼</span>
            </div>
            
            <div class="nav-children" :style="{ maxHeight: isExpanded(item.path) ? '500px' : '0' }">
              <NuxtLink 
                v-for="child in item.children" 
                :key="child.path"
                :to="child.path"
                class="nav-item nav-child"
                :class="{ active: isActive(child.path) }"
                @click="handleItemClick"
              >
                <span class="nav-icon">{{ child.icon }}</span>
                <span class="nav-label">{{ child.label }}</span>
              </NuxtLink>
            </div>
          </div>

        </template>
      </nav>
    </div>
    
    <div class="sidebar-footer">
      <p class="text-xs text-muted">© 2026 PLTD Tahuna</p>
    </div>
  </aside>
  
  <!-- Overlay for mobile -->
  <div class="sidebar-overlay" :class="{ 'is-visible': isOpen }" @click="$emit('close')"></div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const route = useRoute()
const router = useRouter()

// Expanded groups state
const expandedGroups = ref([])

// Menu Configuration
const menuItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/profile', icon: '🏭', label: 'Profile' },
  { 
    path: '/preventive', 
    icon: '📅', 
    label: 'Preventive',
    children: [
      { path: '/preventive', icon: '📅', label: 'Jadwal' },
      { path: '/preventive/realisasi', icon: '✅', label: 'Realisasi' }
    ]
  },
  { 
    path: '/material', 
    icon: '📦', 
    label: 'Material',
    children: [
      { path: '/material', icon: '📋', label: 'Daftar' },
      { path: '/material/plan', icon: '📊', label: 'Perencanaan' }
    ]
  },
  { path: '/periodic', icon: '🔄', label: 'Periodik' },
]

// Initialize expanded state based on current route
onMounted(() => {
  menuItems.forEach(item => {
    if (item.children && isGroupActive(item)) {
      expandedGroups.value.push(item.path)
    }
  })
})

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path === path
}

const isGroupActive = (item) => {
  if (!item.children) return false
  return item.children.some(child => route.path === child.path || route.path.startsWith(child.path + '/'))
}

const isExpanded = (path) => {
  return expandedGroups.value.includes(path)
}

const toggleGroup = (path) => {
  const index = expandedGroups.value.indexOf(path)
  if (index === -1) {
    expandedGroups.value.push(path)
  } else {
    expandedGroups.value.splice(index, 1)
  }
}

const handleItemClick = () => {
  // On mobile, close sidebar when item clicked
  if (window.innerWidth < 1024) {
    emit('close')
  }
}

const navigateToHome = () => {
  router.push('/')
  emit('close')
}
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width, 280px);
  background: white;
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform var(--transition-base);
  box-shadow: var(--shadow-lg);
}

.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--gray-100);
  background: white; /* Changed from primary gradient to white */
  color: var(--gray-800);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  user-select: none;
}

/* Replaced placeholder with actual image style */
.logo-image {
  height: 36px;
  width: auto;
}

.logo-text {
  font-weight: 700;
  font-size: var(--font-size-lg);
  letter-spacing: -0.02em;
  color: var(--primary-600); /* Brand color text */
}

.btn-close-sidebar {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: var(--space-2);
  display: none; /* Hidden on desktop */
  color: var(--gray-500); /* Changed to gray for white background */
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: 0 var(--space-3);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--gray-600);
  font-weight: 500;
  transition: all var(--transition-fast);
  cursor: pointer;
  text-decoration: none;
}

.nav-item:hover {
  background: var(--gray-50);
  color: var(--primary-600);
}

.nav-item.active {
  background: var(--primary-50);
  color: var(--primary-600);
}

.nav-icon {
  width: 24px;
  display: flex;
  justify-content: center;
  font-size: 1.1rem;
}

.nav-arrow {
  margin-left: auto; /* Push arrow to the right */
  font-size: 0.7rem;
  transition: transform var(--transition-base);
  opacity: 0.6;
}

.nav-group.is-expanded .nav-arrow {
  transform: rotate(180deg);
}

/* Nav Children / Submenu */
.nav-children {
  overflow: hidden;
  transition: max-height var(--transition-slow);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  margin-top: 2px;
}

.nav-child {
  padding-left: calc(var(--space-4) + 24px + var(--space-3)); /* Indent child items */
  font-size: 0.9rem;
}

.nav-child.active {
  background: rgba(59, 130, 246, 0.1); /* Lighter active state for child */
  font-weight: 600;
}

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--gray-100);
  text-align: center;
}

/* Mobile & Responsive */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 990;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-base);
}

@media (max-width: 1024px) {
  .app-sidebar {
    transform: translateX(-100%);
  }

  .app-sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar-overlay.is-visible {
    opacity: 1;
    visibility: visible;
  }

  .btn-close-sidebar {
    display: block;
  }
}

@media (min-width: 1024px) {
  .app-sidebar {
    transform: translateX(0); /* Always visible on desktop */
    box-shadow: none; /* Remove shadow on desktop/sidebar layout */
    border-right: 1px solid var(--gray-200);
  }
  
  .sidebar-overlay {
    display: none; /* No overlay on desktop */
  }
}
</style>
