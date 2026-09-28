<template>
  <div class="animate-fade-in">
    <!-- Page Header with Site Switcher -->
    <div class="page-header">
      <div class="header-top-row">
        <div class="header-title-group">
          <h1 class="page-title">Single Line Diagram</h1>
          <p class="page-subtitle">{{ currentSite.name }}</p>
        </div>

        <!-- Site Switcher Tabs -->
        <div class="site-toggle-bar">
          <NuxtLink 
            to="/sld/tahuna" 
            class="btn-site-tab" 
            :class="{ active: currentSiteKey === 'tahuna' }"
          >
            PLTD Tahuna
          </NuxtLink>
          <NuxtLink 
            to="/sld/sangihe" 
            class="btn-site-tab" 
            :class="{ active: currentSiteKey === 'sangihe' }"
          >
            PLTS Sangihe
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="sld-viewer">
      <div class="sld-controls">
        <button 
          @click="zoomIn" 
          class="control-btn"
          title="Zoom In"
        >
          Zoom +
        </button>
        <button 
          @click="zoomOut" 
          class="control-btn"
          title="Zoom Out"
        >
          Zoom -
        </button>
        <button 
          @click="resetZoom" 
          class="control-btn"
          title="Reset Zoom"
        >
          ↺
        </button>
        <button 
          @click="toggleFullscreen" 
          class="control-btn"
          title="Fullscreen"
        >
          {{ isFullscreen ? '⊡' : '⊞' }}
        </button>
      </div>

      <div 
        ref="imageContainer" 
        class="sld-image-container"
        :class="{ 'fullscreen': isFullscreen }"
        @wheel.prevent="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <img 
          ref="sldImage"
          :src="currentSite.image" 
          :alt="currentSite.alt"
          class="sld-image"
          :style="imageStyle"
          @dragstart.prevent
        />
      </div>

      <div class="sld-update-info">
        <p><em>{{ currentSite.updated }}</em></p>
      </div>

      <div class="sld-instructions">
        <p><strong>Desktop:</strong> Gunakan scroll mouse untuk zoom, klik dan drag untuk menggeser</p>
        <p><strong>Mobile:</strong> Pinch untuk zoom, swipe untuk menggeser</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Sites configuration
const sites = {
  tahuna: {
    id: 'tahuna',
    name: 'PLTD Tahuna',
    image: '/images/sld_tahuna.png',
    alt: 'Single Line Diagram PLTD Tahuna',
    updated: 'Terakhir diperbarui: 19 September 2025'
  },
  sangihe: {
    id: 'sangihe',
    name: 'PLTS Sangihe',
    image: '/images/sld_sangihe.png',
    alt: 'Single Line Diagram PLTS Sangihe',
    updated: 'Terakhir diperbarui: -'
  }
}

const currentSiteKey = computed(() => {
  const param = String(route.params.site || '').toLowerCase()
  return param === 'sangihe' ? 'sangihe' : 'tahuna'
})

const currentSite = computed(() => sites[currentSiteKey.value])

// Viewer State
const imageContainer = ref(null)
const sldImage = ref(null)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const isFullscreen = ref(false)

// Touch handling
const initialDistance = ref(0)
const initialScale = ref(1)

const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  cursor: isDragging.value ? 'grabbing' : 'grab'
}))

const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 5)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.5)
}

const resetZoom = () => {
  scale.value = window.innerWidth <= 768 ? 0.8 : 1
  translateX.value = 0
  translateY.value = 0
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    imageContainer.value?.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// Mouse wheel zoom
const handleWheel = (e) => {
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.min(Math.max(scale.value * delta, 0.5), 5)
  scale.value = newScale
}

// Mouse drag
const handleMouseDown = (e) => {
  isDragging.value = true
  startX.value = e.clientX - translateX.value
  startY.value = e.clientY - translateY.value
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return
  translateX.value = e.clientX - startX.value
  translateY.value = e.clientY - startY.value
}

const handleMouseUp = () => {
  isDragging.value = false
}

// Touch handling
const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    initialDistance.value = getDistance(e.touches[0], e.touches[1])
    initialScale.value = scale.value
  } else if (e.touches.length === 1) {
    isDragging.value = true
    startX.value = e.touches[0].clientX - translateX.value
    startY.value = e.touches[0].clientY - translateY.value
  }
}

const handleTouchMove = (e) => {
  e.preventDefault()
  
  if (e.touches.length === 2) {
    const currentDistance = getDistance(e.touches[0], e.touches[1])
    const scaleChange = currentDistance / initialDistance.value
    scale.value = Math.min(Math.max(initialScale.value * scaleChange, 0.5), 5)
  } else if (e.touches.length === 1 && isDragging.value) {
    translateX.value = e.touches[0].clientX - startX.value
    translateY.value = e.touches[0].clientY - startY.value
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// Reset viewer on route change between sites
watch(() => route.params.site, () => {
  resetZoom()
})

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  if (window.innerWidth <= 768) {
    scale.value = 0.8
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
/* Page Header */
.page-header {
  margin-bottom: var(--space-4);
}

.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.header-title-group {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 var(--space-1) 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

/* Site Switcher Toggle Bar */
.site-toggle-bar {
  display: inline-flex;
  background: var(--bg-hover);
  padding: 0.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  gap: 0.25rem;
}

.btn-site-tab {
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-site-tab:hover {
  color: var(--text-main);
  background: rgba(0, 0, 0, 0.05);
}

.btn-site-tab.active {
  color: var(--primary-600);
  background: var(--bg-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-mode .btn-site-tab:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dark-mode .btn-site-tab.active {
  color: #38bdf8;
  background: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

/* SLD Viewer */
.sld-viewer {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.sld-controls {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.control-btn {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: #ffffff;
  border: 1px solid #3b82f6;
  border-radius: var(--radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
  font-weight: 700;
  min-width: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: #1d4ed8;
  border-color: #60a5fa;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(29, 78, 216, 0.5);
}

.control-btn:active {
  transform: translateY(0);
}

.dark-mode .control-btn {
  background: #1e293b;
  color: #38bdf8;
  border: 1px solid #334155;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.dark-mode .control-btn:hover {
  background: #2563eb;
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.5);
}

.sld-image-container {
  position: relative;
  width: 100%;
  height: 70vh;
  overflow: hidden;
  background: var(--bg-main, #f8fafc);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sld-image-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border-radius: 0;
}

.sld-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.1s ease-out;
  user-select: none;
  -webkit-user-drag: none;
}

.sld-update-info {
  text-align: center;
  margin-top: var(--space-3);
}

.sld-update-info p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

.sld-instructions {
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-600);
}

.sld-instructions p {
  margin: var(--space-2) 0;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.sld-instructions strong {
  color: var(--text-main);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }

  .header-top-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .site-toggle-bar {
    width: 100%;
    display: flex;
  }

  .btn-site-tab {
    flex: 1;
    text-align: center;
  }

  .sld-viewer {
    padding: var(--space-3);
  }

  .sld-image-container {
    height: 60vh;
  }

  .control-btn {
    padding: var(--space-2) var(--space-3);
    font-size: 0.9rem;
    min-width: 44px;
  }

  .sld-instructions p {
    font-size: var(--font-size-xs);
  }

  .sld-update-info p {
    font-size: 0.65rem;
  }
}

/* Portrait mode optimization */
@media (max-width: 768px) and (orientation: portrait) {
  .sld-image-container {
    height: 50vh;
  }
  
  .sld-image {
    width: 100%;
    height: auto;
  }
}

/* Landscape mode optimization */
@media (max-width: 768px) and (orientation: landscape) {
  .sld-image-container {
    height: 80vh;
  }
}

/* Dark mode specific adjustments */
.dark-mode .sld-image-container {
  background: var(--gray-900, #0f172a);
}
</style>
