<template>
  <div class="animate-fade-in dashboard-container">
    <!-- Header with System Frequency & Total Power -->
    
    <!-- Mobile Date Display (Visible only on mobile) -->
    <div class="mobile-header-date">
      {{ currentDate }}
    </div>

    <!-- Header Card -->
    <div class="dashboard-header-card mb-6 animate-slide-down">
      <!-- Left: Total Power -->
      <div class="header-section left">
        <div class="power-metric">
          <span class="metric-label">Total Active Power</span>
          <div class="metric-value-group">
            <span class="metric-value">{{ totalActivePower }}</span>
            <span class="metric-unit">kW</span>
          </div>
        </div>
      </div>

      <!-- Center: Frequency -->
      <div class="header-section center">
        <span class="metric-label">Frequency</span>
        <div v-if="systemFrequency > 0" class="frequency-display">
          <span class="freq-value">{{ systemFrequency.toFixed(2) }}</span>
          <span class="metric-unit">Hz</span>
        </div>
      </div>
      
      <!-- Right: Date Display -->
      <div class="header-section right">
        <div class="header-date">
          <p class="text-sm text-muted font-medium m-0">{{ currentDate }}</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-card">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button class="btn btn-primary btn-sm" @click="fetchAllData">Coba Lagi</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p class="mt-4 text-muted">Menghubungkan ke sistem monitoring...</p>
    </div>

    <!-- Units Grid -->
    <div v-else class="units-grid grid-cols-1-mobile gap-mobile-4">
      <!-- Upper Row -->
      <UnitMonitor :unit="1" :data="dg1Data" :downtime="downtimeData[1]" />
      <UnitMonitor :unit="4" :data="[]" />
      <UnitMonitor :unit="5" :data="[]" />
      <UnitMonitor :unit="6" :data="dg6Data" :downtime="downtimeData[6]" />
      
      <!-- Lower Row -->
      <UnitMonitor :unit="7" :data="dg7Data" :downtime="downtimeData[7]" />
      <UnitMonitor :unit="8" :data="dg8Data" :downtime="downtimeData[8]" />
      <UnitMonitor :unit="9" :data="dg9Data" :downtime="downtimeData[9]" />
      
      <!-- PLTS Card -->
      <PLTSMonitor 
        :lvsw1Data="lvsw1Data"
        :lvsw2Data="lvsw2Data"
        :weatherData="weatherData"
      />
    </div>
  </div>
</template>

<script setup>
const dg1Data = ref([])
const dg6Data = ref([])
const dg7Data = ref([])
const dg8Data = ref([])
const dg9Data = ref([])
// New PLTS refs
const it1Data = ref([])
const it2Data = ref([])
const lvsw1Data = ref([])
const lvsw2Data = ref([])
const weatherData = ref([])
const downtimeData = ref({})

const error = ref(null)
const loading = ref(true)
const currentDate = ref('')

const updateDate = () => {
    const now = new Date()
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }
    currentDate.value = now.toLocaleString('id-ID', options).replace(/\./g, ':') + ' WITA'
}

// Calculate system frequency from first available unit
const systemFrequency = computed(() => {
  const datasets = [dg9Data.value, dg8Data.value, dg7Data.value, dg6Data.value, dg1Data.value]
  
  for (const data of datasets) {
    if (data && data.length > 0) {
      const freqItem = data.find(d => d._field === 'Frequency')
      if (freqItem && freqItem._value > 0) {
        return freqItem._value
      }
    }
  }
  return 0
})

// Calculate total active power from all operating units (including PLTS)
const totalActivePower = computed(() => {
  const datasets = [dg1Data.value, dg6Data.value, dg7Data.value, dg8Data.value, dg9Data.value]
  
  let total = 0
  // DG Units
  for (const data of datasets) {
    if (data && data.length > 0) {
      const powerItem = data.find(d => d._field === 'Active Power')
      if (powerItem && powerItem._value > 0) {
        total += powerItem._value
      }
    }
  }
  
  // Add PLTS (LVSW1 + LVSW2)
  if (lvsw1Data.value && lvsw1Data.value.length > 0) {
      const p1 = lvsw1Data.value.find(d => d._field === 'Active Power')?._value || 0
      if (p1 > 0) total += p1
  }
  if (lvsw2Data.value && lvsw2Data.value.length > 0) {
      const p2 = lvsw2Data.value.find(d => d._field === 'Active Power')?._value || 0
      if (p2 > 0) total += p2
  }

  return Math.round(total)
})

const fetchAllData = async () => {
  try {
    error.value = null
    
    // Use Promise.all with timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )

    const fetchPromise = Promise.all([
      $fetch('/api/monitoring/dg1').catch(() => []),
      $fetch('/api/monitoring/dg6').catch(() => []),
      $fetch('/api/monitoring/dg7').catch(() => []),
      $fetch('/api/monitoring/dg8').catch(() => []),
      $fetch('/api/monitoring/dg9').catch(() => []),
      $fetch('/api/monitoring/lvsw1').catch(() => []),
      $fetch('/api/monitoring/lvsw2').catch(() => []),
      $fetch('/api/monitoring/weather-station').catch(() => []),
      $fetch('/api/monitoring/downtime').catch(() => ({}))
    ])

    const [dg1, dg6, dg7, dg8, dg9, lvsw1, lvsw2, weather, downtime] = await Promise.race([fetchPromise, timeoutPromise])
    
    dg1Data.value = dg1
    dg6Data.value = dg6
    dg7Data.value = dg7
    dg8Data.value = dg8
    dg9Data.value = dg9
    lvsw1Data.value = lvsw1
    lvsw2Data.value = lvsw2
    weatherData.value = weather
    downtimeData.value = downtime || {}
    
    loading.value = false
  } catch (err) {
    // Silent fail for polling updates unless it's the first load
    if (loading.value) {
      console.error('Failed to fetch monitoring data:', err)
      error.value = 'Gagal terhubung ke sistem monitoring'
      loading.value = false
    }
  }
}

// Initial fetch
onMounted(() => {
  fetchAllData()
  updateDate()
  
  // Auto-refresh every 1 second
  const interval = setInterval(fetchAllData, 1000)
  const dateInterval = setInterval(updateDate, 1000)
  
  onUnmounted(() => {
    clearInterval(interval)
    clearInterval(dateInterval)
  })
})
</script>

<style scoped>
/* Force compact sizing for dashboard */
.dashboard-container {
  min-height: calc(100vh - 140px); /* Fill available space */
  display: flex;
  flex-direction: column;
  padding: 0 var(--space-6); /* Increased horizontal padding */
}

/* Mobile Header Date */
.mobile-header-date {
  display: none;
}

@media (max-width: 768px) {
  .mobile-header-date {
    display: block;
    text-align: right;
    width: 100%;
    margin-bottom: var(--space-1);
    margin-top: var(--space-1);
    padding-right: 1rem;
    color: var(--text-muted);
    font-size: 0.6rem;
    font-weight: 400;
  }

  
}

/* Dashboard Header Card */
.dashboard-header-card {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-6);
  box-shadow: var(--shadow-sm);
  margin-top: var(--space-2);
}

.header-section {
  display: flex;
  align-items: center;
}

.header-section.left {
  justify-content: flex-start;
}

.header-section.center {
  justify-content: center;
}

.header-section.right {
  justify-content: flex-end;
}

/* Power Metric (Left) */
.power-metric {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center; /* Centered as requested */
}

.metric-label {
  font-size: 0.75rem;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.45rem;
}

.metric-value-group {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.metric-value {
  font-size: 1.5rem !important;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
}

.metric-unit {
  font-size: 1rem !important;
  font-weight: 500;
  color: var(--gray-500);
}

/* Frequency Display (Center) */
.frequency-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-hover); /* Subtle background circle/box */
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-lg);
  position: relative;
}

/* Hide metric label for frequency on desktop */
.header-section.center .metric-label {
  display: none;
}

.freq-value {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--primary-600);
  font-variant-numeric: tabular-nums;
}

.freq-unit {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-500);
  margin-top: -0.25rem;
}

/* Date (Right) */
.header-date {
  text-align: right;
  white-space: nowrap;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh; /* Fixed height to ensure centering */
  width: 100%;
  text-align: center;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .dashboard-header-card {
    grid-template-columns: 1fr 1fr;
    gap: 0;
    padding: var(--space-4);
    align-items: center; /* Center items vertically */
    background: var(--bg-card); /* Use theme variable for dark mode support */
    border: 1px solid var(--border-color); /* standardized border */
    position: relative;
    box-shadow: var(--shadow-sm); /* Use theme shadow */
  }

  /* Vertical Divider */
  .dashboard-header-card::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background: var(--border-color); /* Use theme border color */
  }

  /* Reset header sections */
  .header-section {
    padding: 0 var(--space-2);
    display: flex;
    flex-direction: column;
    justify-content: center !important;
    align-items: center;
    text-align: center;
    height: 100%; /* Fill height */
  }
  
  /* Frequency (Left Col) */
  .header-section.center {
    grid-column: 1;
    grid-row: 1;
    margin: 0;
    order: unset; /* Use grid-column instead */
  }

  /* Show metric label for frequency regarding mobile */
  .header-section.center .metric-label {
    display: block;
    margin-top: 0;
    margin-bottom: 0.25rem;
  }

  /* Power (Right Col) */
  .header-section.left {
    grid-column: 2;
    grid-row: 1;
    order: unset;
  }

  .header-date {
    display: none;
  }

  /* Frequency Styling */
  .frequency-display {
    background: transparent;
    padding: 0;
    box-shadow: none;
    border: none;
  }

  .freq-value {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--primary-600);
    line-height: 1.1;
  }

  .freq-unit {
    font-size: 0.875rem;
    color: var(--text-muted); /* Use theme color */
    font-weight: 600;
  }

  /* Power Styling */
  .power-metric {
    align-items: center;
    justify-content: center;
    gap: 0;
  }

  .metric-value-group {
    display: flex;
    flex-direction: column; /* Stack value and unit */
    align-items: center;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .metric-value {
    font-size: 1.75rem !important;
    font-weight: 700;
    color: var(--text-main); /* Ensure visible in dark mode */
  }

  .metric-unit {
    font-size: 1rem !important;
    color: var(--text-muted); /* Ensure visible in dark mode */
    font-weight: 500;
  }

  .metric-label {
    font-size: 0.65rem;
    color: var(--text-muted); /* Ensure visible in dark mode */
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    margin-top: 0;
  }
}

/* Updated Grid Layout - Left Aligned */
.units-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* Align left */
  /* Consistent spacing for grid */
  column-gap: var(--space-3); /* Keep horizontal gap */
  row-gap: var(--space-6); /* Increased vertical gap as requested */
  align-content: flex-start;
  height: 100%;
}

.units-grid > * {
  /* 4 cards per row with gap consideration */
  /* width = (100% - (3 * gap)) / 4 */
  width: calc((100% - (3 * var(--space-3))) / 4);
  display: flex;
  flex-direction: column;
}

.error-card {
  background: var(--bg-card);
  border: 1px solid var(--danger);
  color: var(--danger);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  margin: auto;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: var(--space-3);
}

/* Compact overrides for UnitMonitor component */
:deep(.unit-card) {
  border-radius: var(--radius-md);
}

:deep(.unit-header) {
  padding: var(--space-2) var(--space-3); /* Tighter header */
}

:deep(.unit-title) {
  font-size: var(--font-size-base); /* Smaller title */
}

:deep(.status-badge) {
  padding: 0.15rem 0.5rem;
  font-size: 0.7rem;
}

:deep(.unit-body) {
  padding: var(--space-3); /* Reduced body padding */
  gap: var(--space-2);
}

:deep(.metric-card) {
  padding: var(--space-1) var(--space-2);
}

:deep(.metric-label) {
  font-size: 0.75rem; /* Smaller labels */
}

:deep(.metric-value) {
  font-size: var(--font-size-base); /* Smaller values */
}

:deep(.metric-unit) {
  font-size: 0.7rem;
}

@media (max-width: 1200px) {
  .units-grid > * {
    width: calc((100% - (2 * var(--space-3))) / 3); /* 3 items per row */
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    height: auto;
    overflow: auto;
    padding: 0 var(--space-4); /* Slightly reduced padding for mobile */
  }
  
  .units-grid {
    column-gap: var(--space-2); /* Smaller gap for mobile grid */
    row-gap: var(--space-3);
  }
  
  .units-grid > * {
    /* 2 columns on mobile: (100% - gap) / 2 */
    width: calc((100% - var(--space-2)) / 2);
  }
}
</style>
