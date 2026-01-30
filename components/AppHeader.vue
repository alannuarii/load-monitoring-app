<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="header-left">
        <!-- Hamburger Menu (Mobile/Tablet) -->
        <button class="btn-menu" @click="$emit('toggleSidebar')">
          ☰
        </button>

        <!-- Logo (Visible on Mobile/Tablet when sidebar hidden, or always if design preference) -->
        <NuxtLink to="/" class="header-logo mobile-only">
          <img src="/images/npblue.png" alt="PLTD Tahuna" class="header-logo-img" />
        </NuxtLink>
      </div>

      <!-- Center Title & Caption -->
      <div class="header-center desktop-only">
        <h1 class="app-brand-title">SENTRA-DIGITAL</h1>
        <p class="app-brand-caption">Sistem Terpadu Digital Untuk Preventive Maintenance Di Pltd Isolated System</p>
      </div>
      
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
                referrerpolicy="no-referrer"
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
                  referrerpolicy="no-referrer"
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

defineEmits(['toggleSidebar'])

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
.app-header {
  position: fixed;
  top: 0;
  left: 0; /* Will be adjusted by layout when sidebar is present */
  right: 0;
  height: var(--header-height);
  background: white; /* Changed to white for dashboard look */
  border-bottom: 1px solid var(--gray-200);
  z-index: 90; /* Below sidebar (100) */
  transition: left var(--transition-base);
}

/* When sidebar is persistent (desktop), header might shift. 
   Currently designed to span full width, sitting on top of content area but right of sidebar if sidebar pushes content.
   However, common dashboard pattern: Header spans full width (above sidebar) or starts after sidebar.
   Here we'll let Layout handle the positioning context.
*/

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.btn-menu {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray-600);
  padding: var(--space-1);
  border-radius: var(--radius-md);
  display: flex; /* Always visible for toggling */
}

.btn-menu:hover {
  background: var(--gray-100);
  color: var(--primary-600);
}

/* Hide menu button on desktop if we want persistent sidebar */
@media (min-width: 1024px) {
  .btn-menu {
    display: none; /* Sidebar always visible on desktop */
  }
}

.header-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--primary-600);
  font-weight: 700;
  font-size: var(--font-size-lg);
  text-decoration: none;
}

.header-logo-img {
  height: 32px;
  width: auto;
}

@media (min-width: 1024px) {
  .mobile-only {
    display: none;
  }
}

.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
}

.app-brand-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--primary-600);
  margin: 0;
  line-height: 1.2;
  letter-spacing: 0.05em;
}

.app-brand-caption {
  font-size: 0.7rem;
  color: var(--gray-500);
  margin: 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

@media (max-width: 1023px) {
  .desktop-only {
    display: none;
  }
}

.header-user-section {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.header-user {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  color: var(--gray-700);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.header-user:hover {
  background: var(--gray-100);
}

.header-user.open {
  background: var(--gray-100);
}

.header-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 2px solid white;
  box-shadow: var(--shadow-sm);
}

.header-user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--primary-100);
  color: var(--primary-700);
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
  opacity: 0.5;
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
  border: 1px solid var(--gray-100);
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
  background: var(--gray-50);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
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
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--gray-600);
  cursor: pointer;
  font-size: 1.25rem;
  transition: background var(--transition-fast);
}

.btn-logout-mobile:hover {
  background: var(--gray-100);
  color: var(--danger);
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
