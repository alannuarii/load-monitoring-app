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
  const val = getValue('Active Power')
  return val > 0 ? Math.round(val) : 0
})

const reactivePower = computed(() => {
  const val = getValue('Reactive Power')
  return val > 0 ? Math.round(val) : 0
})

const powerFactor = computed(() => {
  const val = getValue('Power Factor')
  return val > 0 ? val.toFixed(2) : '0.00'
})

// Status logic
// - "Not Available" = only for units 4 and 5 (no sensors installed)
// - "Standby" = units that have no data or power = 0 (machine stopped)
// - "Operating" = units with power > 0
const status = computed(() => {
  // Units 4 and 5 don't have sensors
  if ([4, 5].includes(props.unit)) return 'unavailable'
  
  // For other units, check if data exists and power > 0
  if (!props.data || props.data.length === 0) return 'standby'
  
  const power = getValue('Active Power')
  if (power > 0) return 'operating'
  return 'standby'
})

const statusText = computed(() => {
  const map = {
    operating: 'Operating',
    standby: 'Standby',
    unavailable: 'Not Available'
  }
  return map[status.value]
})

const statusClass = computed(() => `status-${status.value}`)

const statusBadgeClass = computed(() => {
  const map = {
    operating: 'badge-success',
    standby: 'badge-warning',
    unavailable: 'badge-secondary'
  }
  return map[status.value]
})
</script>

<style scoped>
.unit-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-base);
}

.unit-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.unit-card.status-operating {
  border-left: 4px solid var(--success);
}

.unit-card.status-standby {
  border-left: 4px solid var(--warning);
}

.unit-card.status-unavailable {
  border-left: 4px solid var(--gray-400);
}

.unit-header {
  padding: var(--space-3) var(--space-4);
  background: var(--gray-50);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin: 0;
  color: var(--gray-800);
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
  background: var(--gray-50);
  border-radius: var(--radius-md);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--gray-600);
  font-weight: 500;
}

.metric-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--gray-800);
}

.metric-unit {
  font-size: var(--font-size-sm);
  font-weight: 400;
  color: var(--gray-500);
}
</style>
