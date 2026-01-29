<template>
  <header class="app-header">
    <div class="container header-content">
      <NuxtLink to="/" class="header-logo">
        <span class="header-logo-icon">⚙️</span>
        <span>PLTD Tahuna</span>
      </NuxtLink>
      
      <nav class="header-nav">
        <NuxtLink to="/" class="header-nav-link" :class="{ active: route.path === '/' }">
          🏠 Home
        </NuxtLink>
        <NuxtLink to="/preventive" class="header-nav-link" :class="{ active: route.path.startsWith('/preventive') }">
          📅 Preventive
        </NuxtLink>
        <NuxtLink to="/material" class="header-nav-link" :class="{ active: route.path.startsWith('/material') }">
          📦 Material
        </NuxtLink>
      </nav>
      
      <!-- User section with logout -->
      <div class="header-user-section">
        <template v-if="user">
          <div class="user-dropdown" :class="{ open: isDropdownOpen }">
            <button class="header-user" @click="toggleDropdown">
              <img 
                v-if="user.picture" 
                :src="user.picture" 
                :alt="user.name" 
                class="header-user-avatar"
              />
              <span v-else class="header-user-avatar-placeholder">
                {{ user.name?.charAt(0) || '?' }}
              </span>
              <span class="header-user-name">{{ user.name }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <div class="user-dropdown-menu">
              <div class="user-dropdown-header">
                <img 
                  v-if="user.picture" 
                  :src="user.picture" 
                  :alt="user.name" 
                  class="dropdown-avatar"
                />
                <div class="dropdown-user-info">
                  <span class="dropdown-user-name">{{ user.name }}</span>
                  <span class="dropdown-user-email">{{ user.email }}</span>
                </div>
              </div>
              <div class="user-dropdown-divider"></div>
              <button class="user-dropdown-item danger" @click="handleLogout">
                🚪 Keluar
              </button>
            </div>
          </div>
        </template>
        
        <!-- Logout button always visible on mobile -->
        <button v-if="user" class="btn-logout-mobile" @click="handleLogout" title="Logout">
          🚪
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const route = useRoute()
const { user, logout } = useAuth()
const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleLogout = async () => {
  isDropdownOpen.value = false
  await logout()
}

// Close dropdown on click outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-dropdown')) {
      isDropdownOpen.value = false
    }
  })
})
</script>

<style scoped>
.header-user-section {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header-user {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.header-user:hover {
  background: rgba(255, 255, 255, 0.2);
}

.header-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.header-user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--primary-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.header-user-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
  opacity: 0.7;
}

/* Dropdown menu */
.user-dropdown {
  position: relative;
}

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 240px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-base);
  z-index: 200;
}

.user-dropdown.open .user-dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-dropdown-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
}

.dropdown-user-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--gray-800);
}

.dropdown-user-email {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.user-dropdown-divider {
  height: 1px;
  background: var(--gray-100);
}

.user-dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--gray-700);
  background: none;
  border: none;
  cursor: pointer;
  transition: background var(--transition-fast);
  text-align: left;
}

.user-dropdown-item:hover {
  background: var(--gray-50);
}

.user-dropdown-item.danger {
  color: var(--danger);
}

.user-dropdown-item.danger:hover {
  background: var(--danger-light);
}

/* Mobile logout button */
.btn-logout-mobile {
  display: none;
  width: 36px;
  height: 36px;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
  transition: background var(--transition-fast);
}

.btn-logout-mobile:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Hide name on small screens */
@media (max-width: 768px) {
  .header-user-name,
  .dropdown-arrow {
    display: none;
  }
  
  .user-dropdown {
    display: none;
  }
  
  .btn-logout-mobile {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (min-width: 769px) {
  .btn-logout-mobile {
    display: none;
  }
}
</style>
