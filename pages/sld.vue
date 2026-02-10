<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">Single Line Diagram</h1>
      <p class="page-subtitle">PLTD Tahuna</p>
    </div>

    <div class="sld-viewer">
      <div class="sld-controls">
        <button 
          @click="zoomIn" 
          class="control-btn"
          title="Zoom In"
        >
          🔍+
        </button>
        <button 
          @click="zoomOut" 
          class="control-btn"
          title="Zoom Out"
        >
          🔍-
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
          src="/images/sld_tahuna.png" 
          alt="Single Line Diagram PLTD Tahuna"
          class="sld-image"
          :style="imageStyle"
          @dragstart.prevent
        />
      </div>

      <div class="sld-update-info">
        <p><em>Terakhir diperbarui: 19 September 2025</em></p>
      </div>

      <div class="sld-instructions">
        <p>💡 <strong>Desktop:</strong> Gunakan scroll mouse untuk zoom, klik dan drag untuk menggeser</p>
        <p>💡 <strong>Mobile:</strong> Pinch untuk zoom, swipe untuk menggeser</p>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  scale.value = 1
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
    // Pinch zoom
    initialDistance.value = getDistance(e.touches[0], e.touches[1])
    initialScale.value = scale.value
  } else if (e.touches.length === 1) {
    // Pan
    isDragging.value = true
    startX.value = e.touches[0].clientX - translateX.value
    startY.value = e.touches[0].clientY - translateY.value
  }
}

const handleTouchMove = (e) => {
  e.preventDefault()
  
  if (e.touches.length === 2) {
    // Pinch zoom
    const currentDistance = getDistance(e.touches[0], e.touches[1])
    const scaleChange = currentDistance / initialDistance.value
    scale.value = Math.min(Math.max(initialScale.value * scaleChange, 0.5), 5)
  } else if (e.touches.length === 1 && isDragging.value) {
    // Pan
    translateX.value = e.touches[0].clientX - startX.value
    translateY.value = e.touches[0].clientY - startY.value
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
}

// Listen for fullscreen changes
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
  
  // Set initial scale for mobile
  if (window.innerWidth <= 768) {
    scale.value = 0.8
  }
})
</script>

<style scoped>
/* Page Header */
.page-header {
  margin-bottom: var(--space-4);
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
  margin: 0 0 var(--space-4) 0;
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
  padding: var(--space-2) var(--space-4);
  background: var(--primary-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
  font-weight: 600;
  min-width: 48px;
}

.control-btn:hover {
  background: var(--primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.control-btn:active {
  transform: translateY(0);
}

.sld-image-container {
  position: relative;
  width: 100%;
  height: 70vh;
  overflow: hidden;
  background: var(--bg-main);
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
@media (prefers-color-scheme: dark) {
  .sld-image-container {
    background: var(--gray-900);
  }
}
</style>
