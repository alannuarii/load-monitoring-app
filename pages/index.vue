<template>
  <div class="animate-fade-in dashboard-container">
    <!-- Header with System Frequency & Total Power -->
    <div class="dashboard-header">
      <div class="header-stats">
        <div v-if="systemFrequency > 0" class="system-frequency">
          <span class="freq-value">{{ systemFrequency.toFixed(2) }}</span>
          <span class="freq-unit">Hz</span>
        </div>
        <div class="total-power">
          <span class="power-label">Total Active Power:</span>
          <span class="power-value">{{ totalActivePower }}</span>
          <span class="power-unit">kW</span>
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
    <div v-else-if="loading" class="text-center py-8">
      <div class="spinner spinner-lg"></div>
      <p class="mt-4 text-muted">Menghubungkan ke sistem monitoring...</p>
    </div>

    <!-- Units Grid -->
    <div v-else class="units-grid">
      <!-- Upper Row -->
      <UnitMonitor :unit="1" :data="dg1Data" />
      <UnitMonitor :unit="4" :data="[]" />
      <UnitMonitor :unit="5" :data="[]" />
      <UnitMonitor :unit="6" :data="dg6Data" />
      
      <!-- Lower Row -->
      <UnitMonitor :unit="7" :data="dg7Data" />
      <UnitMonitor :unit="8" :data="dg8Data" />
      <UnitMonitor :unit="9" :data="dg9Data" />
    </div>
  </div>
</template>

<script setup>
const dg1Data = ref([])
const dg6Data = ref([])
const dg7Data = ref([])
const dg8Data = ref([])
const dg9Data = ref([])
const error = ref(null)
const loading = ref(true)

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

// Calculate total active power from all operating units
const totalActivePower = computed(() => {
  const datasets = [dg1Data.value, dg6Data.value, dg7Data.value, dg8Data.value, dg9Data.value]
  
  let total = 0
  for (const data of datasets) {
    if (data && data.length > 0) {
      const powerItem = data.find(d => d._field === 'Active Power')
      if (powerItem && powerItem._value > 0) {
        total += powerItem._value
      }
    }
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
      $fetch('/api/monitoring/dg9').catch(() => [])
    ])

    const [dg1, dg6, dg7, dg8, dg9] = await Promise.race([fetchPromise, timeoutPromise])
    
    dg1Data.value = dg1
    dg6Data.value = dg6
    dg7Data.value = dg7
    dg8Data.value = dg8
    dg9Data.value = dg9
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
  
  // Auto-refresh every 1 second
  const interval = setInterval(fetchAllData, 1000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
/* Force compact sizing for dashboard */
.dashboard-container {
  height: calc(100vh - 65px); /* Adjusted for better fit */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 var(--space-6); /* Increased horizontal padding */
}

.dashboard-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--space-2);
  margin-bottom: var(--space-3);
  flex-shrink: 0;
}

.system-frequency {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  background: white;
  border: 1px solid var(--gray-200);
  padding: 0.25rem 1.5rem; /* Reduced padding */
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  color: var(--primary-600);
}

.freq-value {
  font-size: 2rem; /* Reduced from 2.5rem */
  font-weight: 800;
  line-height: 1;
}

.freq-unit {
  font-size: 1rem; /* Reduced from 1.25rem */
  font-weight: 600;
  color: var(--gray-500);
}

.header-stats {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.total-power {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-md);
}

.power-label {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.power-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-800);
}

.power-unit {
  font-size: 0.875rem;
  color: var(--gray-500);
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
  background: #FEF2F2;
  border: 1px solid #FECACA;
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
  }
  
  .units-grid > * {
    width: 100%;
  }
}
</style>
