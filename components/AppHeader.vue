<template>
  <header class="app-header" :class="{ 'is-dark': isDark }">
    <div class="container header-content">
      <div class="header-left">
        <!-- Logo -->
        <NuxtLink to="/" class="header-logo">
          <img :src="isDark ? '/images/npwhite.png' : '/images/npblue.png'" alt="PLTD Tahuna" class="header-logo-img" />
          <div class="brand-text">
            <h1 class="app-brand-title">LOAD MONITORING</h1>
            <span class="app-brand-subtitle">PLTD TAHUNA</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Desktop Navigation -->
      <nav class="header-nav hidden-mobile">
        <NuxtLink to="/" class="nav-link" :class="{ active: route.path === '/' }">
          Home
        </NuxtLink>
        <NuxtLink to="/profile" class="nav-link" :class="{ active: route.path === '/profile' }">
          Profile
        </NuxtLink>
        <NuxtLink to="/sld" class="nav-link" :class="{ active: route.path === '/sld' }">
          SLD
        </NuxtLink>
        <NuxtLink to="/analysis" class="nav-link" :class="{ active: route.path === '/analysis' }">
          Analysis
        </NuxtLink>
      </nav>
      
      <!-- User section -->
      <div class="header-user-section">
        <!-- Theme Toggle -->
        <div class="theme-toggle-container" @click="toggleTheme" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <span class="theme-toggle-label" :class="{ active: !isDark }">Light</span>
          <div class="theme-toggle-switch" :class="{ 'is-dark': isDark }">
            <div class="theme-toggle-thumb"></div>
          </div>
          <span class="theme-toggle-label" :class="{ active: isDark }">Dark</span>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="btn-mobile-menu visible-mobile" @click="toggleMobileMenu">
          <span class="hamburger-icon">☰</span>
        </button>

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
                Sign Out
              </button>
            </div>
          </div>
        </template>
        
      </div>
    </div>

    <!-- Mobile Navigation Menu (Slide down) -->
    <div class="mobile-nav-menu" :class="{ open: isMobileMenuOpen }">
      <NuxtLink to="/" class="mobile-nav-link" :class="{ active: route.path === '/' }" @click="closeMobileMenu">
        Home
      </NuxtLink>
      <NuxtLink to="/profile" class="mobile-nav-link" :class="{ active: route.path === '/profile' }" @click="closeMobileMenu">
        Profile
      </NuxtLink>
      <NuxtLink to="/sld" class="mobile-nav-link" :class="{ active: route.path === '/sld' }" @click="closeMobileMenu">
        SLD
      </NuxtLink>
      <div class="mobile-nav-divider"></div>
      <button class="mobile-nav-link danger" @click="handleLogout">
        Sign Out
      </button>
    </div>
  </header>
</template>

<script setup>
const route = useRoute()
const { user, logout } = useAuth()
const { isDark, toggleTheme } = useTheme()
const isDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

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
  left: 0;
  right: 0;
  height: var(--header-height);
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  z-index: 100;
}

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
  gap: var(--space-4);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
}

.header-logo-img {
  height: 40px;
  width: auto;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.app-brand-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--primary-600);
  margin: 0;
  line-height: 1.1;
  letter-spacing: 0.02em;
}

.app-brand-subtitle {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-500);
  letter-spacing: 0.05em;
}

/* Navigation Menu */
.header-nav {
  display: flex;
  gap: var(--space-1);
  margin: 0 var(--space-4);
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.5rem 1rem;
  color: var(--gray-600);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  background: var(--bg-hover);
  color: var(--primary-600);
}

.nav-link.active {
  background: var(--primary-50);
  color: var(--primary-700);
  font-weight: 600;
}

.is-dark .nav-link.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary-300);
}

.nav-icon {
  font-size: 1.1em;
}

.header-user-section {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.theme-toggle-container {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-lg);
  transition: background var(--transition-fast);
}

.theme-toggle-container:hover {
  background: var(--bg-hover);
}

.theme-toggle-label {
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 500;
  transition: color var(--transition-fast);
}

.theme-toggle-label.active {
  color: var(--text-main);
  font-weight: 600;
}

.theme-toggle-switch {
  width: 44px;
  height: 24px;
  background: var(--gray-300);
  border-radius: var(--radius-full);
  position: relative;
  transition: background var(--transition-base);
}

.theme-toggle-switch.is-dark {
  background: var(--primary-600);
}

.theme-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-base);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.theme-toggle-switch.is-dark .theme-toggle-thumb {
  transform: translateX(20px);
}

@media (max-width: 768px) {
  .brand-text {
    display: none;
  }
  
  .app-brand-title {
    font-size: 0.8rem;
  }
  
  .header-nav {
    display: none; /* Consider a mobile menu if needed, or keeping it simple for now */
    border-top: 1px solid var(--gray-200);
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: var(--space-2);
    box-shadow: var(--shadow-md);
  }
  
  /* Show nav if needed, but for now simple header */
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
  background: var(--bg-hover);
}

.header-user.open {
  background: var(--bg-hover);
}

.header-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border-color);
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
  background: var(--bg-dropdown);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
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
  background: var(--bg-hover);
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
  color: var(--text-main);
}

.dropdown-user-email {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.user-dropdown-divider {
  height: 1px;
  background: var(--border-color);
}

.user-dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: auto;
  margin: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--text-main);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.user-dropdown-item:hover {
  background: var(--bg-hover);
}

.user-dropdown-item.danger {
  color: var(--danger);
}

.user-dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
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
}
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

/* Mobile Navigation Styles */
.btn-mobile-menu {
  display: none;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  padding: var(--space-2);
  cursor: pointer;
  color: var(--gray-600);
}

.mobile-nav-menu {
  display: none;
  background: var(--bg-header);
  border-top: 1px solid var(--border-color);
  padding: var(--space-2);
  flex-direction: column;
  gap: var(--space-1);
  box-shadow: var(--shadow-md);
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  transform: translateY(-100%);
  opacity: 0;
  z-index: -1;
  transition: all var(--transition-base);
}

.mobile-nav-menu.open {
  transform: translateY(0);
  opacity: 1;
  z-index: 90;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--gray-600);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--radius-md);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background: var(--bg-hover);
  color: var(--primary-600);
}

.is-dark .mobile-nav-link.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary-300);
}

.mobile-nav-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--space-1) 0;
}

.mobile-nav-link.danger {
  color: var(--danger);
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.mobile-nav-link.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

@media (max-width: 768px) {
  .btn-mobile-menu {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-nav-menu {
    display: flex;
  }
}

@media (min-width: 769px) {
  /* No special styles needed for desktop regarding mobile menu hidden elements */
}
</style>
