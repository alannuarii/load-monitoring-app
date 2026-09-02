<template>
  <div class="unit-card" :class="statusClass">
    <div class="unit-header">
      <NuxtLink v-if="hasDetailPage" :to="`/unit/${unit}`" class="unit-title">
        Unit {{ unit }}
      </NuxtLink>
      <h3 v-else class="unit-title">Unit {{ unit }}</h3>
      <span class="status-badge" :class="statusBadgeClass">{{ statusText }}</span>
    </div>
    
    <div class="unit-body">
      <!-- Active Power -->
      <div class="metric-card">
        <div class="metric-label">Active Power</div>
        <div class="metric-value">{{ activePower }} <span class="metric-unit">kW</span></div>
      </div>
      
      <!-- Reactive Power -->
      <div class="metric-card">
        <div class="metric-label">Reactive Power</div>
        <div class="metric-value">{{ reactivePower }} <span class="metric-unit">kVAR</span></div>
      </div>
      
      <!-- Power Factor -->
      <div class="metric-card">
        <div class="metric-label">Power Factor</div>
        <div class="metric-value">{{ powerFactor }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  unit: {
    type: Number,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  downtime: {
    type: Object,
    default: null
  }
})

// Check if unit has detail page (4 and 5 don't have sensors)
const hasDetailPage = computed(() => ![4, 5].includes(props.unit))

// Helper to get value by field name
const getValue = (fieldName) => {
  const item = props.data.find(d => d._field === fieldName)
  return item?._value ?? 0
}

// Computed metrics
const activePower = computed(() => {
  const item = props.data.find(d => d._field === 'Active Power')
  if (!item) return 0
  return item._value > 0 ? Math.round(item._value) : 0
})

const reactivePower = computed(() => {
  const item = props.data.find(d => d._field === 'Reactive Power')
  if (!item) return 0
  return Math.round(item._value)
})

const powerFactor = computed(() => {
  if (activePower.value === 0) return '0.00'
  const item = props.data.find(d => d._field === 'Power Factor')
  if (!item) return '0.00'
  return item._value > 0 ? item._value.toFixed(2) : '0.00'
})

// Status logic:
// - Units 4 and 5: ALWAYS "Not Available"
// - Operating: power > 0
// - Downtime from db_tahuna (Gangguan / Pemeliharaan / etc) if power == 0 and active downtime exists
// - Standby: power == 0 and no active downtime record
const statusInfo = computed(() => {
  if ([4, 5].includes(props.unit)) {
    return { key: 'unavailable', text: 'NOT AVAILABLE', badgeClass: 'badge-secondary' }
  }
  
  const power = getValue('Active Power')
  const current = getValue('Current L1')
  const voltage = getValue('Voltage L1 L2')
  
  if (current > 0 || power > 0) {
    return { key: 'operating-sync', text: 'OPERATING (SYNC)', badgeClass: 'badge-success' }
  }
  
  if (voltage > 100) {
    return { key: 'operating-noload', text: 'OPERATING (NO LOAD)', badgeClass: 'badge-info' }
  }
  
  if (props.downtime && props.downtime.status) {
    const s = props.downtime.status.trim()
    const lower = s.toLowerCase()
    let badgeClass = 'badge-warning'
    let text = s.toUpperCase()
    let key = lower.replace(/\s+/g, '-')

    if (lower.includes('gangguan')) {
      badgeClass = 'badge-danger'
      text = 'OUTAGE'
      key = 'outage'
    } else if (lower.includes('pemeliharaan')) {
      badgeClass = 'badge-info'
      text = 'MAINTENANCE'
      key = 'maintenance'
    } else if (lower.includes('overhaul')) {
      badgeClass = 'badge-info'
      text = 'OVERHAUL'
      key = 'overhaul'
    } else if (lower.includes('standby')) {
      badgeClass = 'badge-warning'
      text = 'STANDBY'
      key = 'standby'
    } else if (lower.includes('offline') || lower.includes('tidak aktif')) {
      badgeClass = 'badge-secondary'
      text = 'OFFLINE'
      key = 'offline'
    } else if (lower.includes('not available') || lower.includes('tidak tersedia')) {
      badgeClass = 'badge-secondary'
      text = 'NOT AVAILABLE'
      key = 'unavailable'
    }

    return { key, text, badgeClass }
  }
  
  return { key: 'standby', text: 'STANDBY', badgeClass: 'badge-warning' }
})

const statusText = computed(() => statusInfo.value.text)
const statusClass = computed(() => `status-${statusInfo.value.key}`)
const statusBadgeClass = computed(() => statusInfo.value.badgeClass)
</script>

<style scoped>
.unit-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-base);
}

.unit-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.unit-card.status-operating-sync {
  border-left: 4px solid var(--success);
}

.unit-card.status-operating-noload {
  border-left: 4px solid #0284c7;
}

.unit-card.status-standby {
  border-left: 4px solid var(--warning);
}

.unit-card.status-unavailable {
  border-left: 4px solid var(--gray-400);
}

.unit-card.status-gangguan,
.unit-card.status-outage {
  border-left: 4px solid #ef4444;
}

.unit-card.status-pemeliharaan,
.unit-card.status-maintenance,
.unit-card.status-overhaul {
  border-left: 4px solid #0284c7;
}

.badge-danger {
  background: #ef4444;
  color: white;
}

.badge-info {
  background: #0284c7;
  color: white;
}

.unit-header {
  padding: var(--space-3) var(--space-4);
  background: var(--bg-hover);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
  text-decoration: none;
}

.unit-title:hover {
  color: var(--primary-600);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-success {
  background: var(--success);
  color: white;
}

.badge-warning {
  background: var(--warning);
  color: var(--gray-800);
}

.badge-secondary {
  background: var(--gray-400);
  color: white;
}

.unit-body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.metric-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-hover);
  border-radius: var(--radius-md);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-weight: 500;
}

.metric-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-main);
}

.metric-unit {
  font-size: var(--font-size-sm);
  font-weight: 400;
  color: var(--text-muted);
}
@media (max-width: 768px) {
  .unit-body {
    padding: var(--space-3);
    gap: 0; /* Removing gap since we only show one item */
  }

  /* Hide Reactive Power (2nd) and Power Factor (3rd) on mobile */
  .metric-card:nth-child(2),
  .metric-card:nth-child(3) {
    display: none;
  }

  .metric-card {
    padding: 0;
    background: transparent; /* Remove background for cleaner look on mobile */
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
  }

  .metric-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metric-value {
    font-size: 1.125rem; /* Larger value for readability */
  }
  
  .unit-header {
    padding: 0.5rem 0.6rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .status-badge {
    font-size: 0.52rem;
    padding: 0.12rem 0.35rem;
    align-self: flex-start;
    white-space: nowrap;
    letter-spacing: -0.01em;
  }
  
  .unit-title {
    font-size: 0.875rem;
  }
}
</style>
