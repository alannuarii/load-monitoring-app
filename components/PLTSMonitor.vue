<template>
  <div class="unit-card plts-card" :class="statusClass">
    <div class="unit-header">
      <NuxtLink to="/plts" class="unit-title plts-link">PLTS</NuxtLink>
      <span class="status-badge" :class="statusBadgeClass">{{ statusText }}</span>
    </div>
    
    <div class="unit-body">
      <!-- Active Power (Sum of LVSW1 + LVSW2) -->
      <div class="metric-card">
        <div class="metric-label">Active Power</div>
        <div class="metric-value">{{ activePower }} <span class="metric-unit">kW</span></div>
      </div>
      
      <!-- Reactive Power (Sum of LVSW1 + LVSW2) -->
      <div class="metric-card">
        <div class="metric-label">Reactive Power</div>
        <div class="metric-value">{{ reactivePower }} <span class="metric-unit">kVAR</span></div>
      </div>
      
      <!-- Global Irradiance (from Weather Station) -->
      <div class="metric-card">
        <div class="metric-label">Global Irradiance</div>
        <div class="metric-value">{{ irradiance }} <span class="metric-unit">W/m²</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lvsw1Data: {
    type: Array,
    default: () => []
  },
  lvsw2Data: {
    type: Array,
    default: () => []
  },
  weatherData: {
    type: Array,
    default: () => []
  }
})

// Helper to get value by field name from a specific dataset
const getValue = (data, fieldName) => {
  if (!data) return 0
  const item = data.find(d => d._field === fieldName)
  return item?._value ?? 0
}

// Computed metrics
const activePower = computed(() => {
  const p1 = getValue(props.lvsw1Data, 'Active Power')
  const p2 = getValue(props.lvsw2Data, 'Active Power')
  const total = p1 + p2
  return total > 0 ? Math.round(total) : 0
})

const reactivePower = computed(() => {
  const p1 = getValue(props.lvsw1Data, 'Reactive Power')
  const p2 = getValue(props.lvsw2Data, 'Reactive Power')
  const total = p1 + p2
  return total > 0 ? Math.round(total) : 0
})

const irradiance = computed(() => {
  const val = getValue(props.weatherData, 'Global Irradiance')
  return val > 0 ? Math.round(val) : 0
})

const powerFactor = computed(() => {
    // Average PF? Or just show one?
    // User didn't specify PF for PLTS card, but usually it's good to have.
    // For now, let's take average if both active, or just 1.
    // Let's stick to the request: "Active Power, Reactive Power, Global Irradiance".
    // I added PF in the template but I will just make it calculate average for completeness
    // or return 1.0 if ideal.
    
    // Actually, user request: "tampilan pada halaman utama yang biasanya adalah active power, reactive power dan power factor, untuk PLTS yang tampil adalah active power..., reactive power..., dan global irradiance..."
    // So distinct replacement of PF with Irradiance.
    // I will keep PF in code but maybe hide it or just show average.
    // Let's calculate weighted average based on power if possible, or simple average.
    const pf1 = getValue(props.lvsw1Data, 'Power Factor')
    const pf2 = getValue(props.lvsw2Data, 'Power Factor')
    
    if (pf1 > 0 && pf2 > 0) return ((pf1 + pf2) / 2).toFixed(2)
    if (pf1 > 0) return pf1.toFixed(2)
    if (pf2 > 0) return pf2.toFixed(2)
    return '0.00'
})

// Status logic
const status = computed(() => {
  // If we have no data at all
  if ((!props.lvsw1Data || props.lvsw1Data.length === 0) && 
      (!props.lvsw2Data || props.lvsw2Data.length === 0)) {
        return 'offline'  
  }

  // Operating if producing power
  if (activePower.value > 0) return 'operating'
  
  // Standby (night time?)
  return 'standby'
})

const statusText = computed(() => {
  const map = {
    operating: 'Operating',
    standby: 'Standby',
    offline: 'Offline'
  }
  return map[status.value]
})

const statusClass = computed(() => `status-${status.value}`)

const statusBadgeClass = computed(() => {
  const map = {
    operating: 'badge-success',
    standby: 'badge-warning',
    offline: 'badge-secondary'
  }
  return map[status.value]
})
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

.unit-card.status-operating {
  border-left: 4px solid var(--success);
}

.unit-card.status-standby {
  border-left: 4px solid var(--warning);
}

.unit-card.status-offline {
  border-left: 4px solid var(--gray-400);
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
    gap: 0; 
  }

  /* Show first 3 metrics, hide 4th (Power Factor) if exists */
  .metric-card:nth-child(4) {
    display: none;
  }
  
  /* On Mobile, layout similar to UnitMonitor */
  .metric-card:nth-child(2),
  .metric-card:nth-child(3) {
      /* User requested Active, Reactive, Global Irradiance. 
         UnitMonitor hides 2nd and 3rd metric on mobile.
         I should check if I should do the same.
         "Untuk tampilan pada halaman utama yang biasanya adalah active power, reactive power dan power factor, untuk PLTS yang tampil adalah active power..., reactive power..., dan global irradiance..."
         UnitMonitor mobile: hides Reactive & PF.
         If I hide Reactive & Irradiance, user sees only Active Power.
         Let's try to keep them visible if possible, or follow the same pattern if space is tight.
         However, for PLTS, Irradiance is key.
         Let's keep Active Power and Irradiance at least? 
         Or just show them all in the abbreviated list if possible.
         The existing CSS in UnitMonitor hides 2nd and 3rd child.
         Let's follow suit for consistency but maybe prioritize Irradiance?
         Actually, let's keep it simple and consistent for now. 
         Wait, UnitMonitor mobile CSS:
         .metric-card:nth-child(2), .metric-card:nth-child(3) { display: none; }
         So it only shows the first one (Active Power).
         For PLTS, I will also show Active Power as primary.
         But Irradiance is quite distinct.
         Let's stick to the requested main view first.
         If I replicate the CSS exactly, only Active Power shows on mobile.
         I'll stick to that for consistency unless I see a reason not to.
      */
    display: none;
  }

  .metric-card {
    padding: 0;
    background: transparent;
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
    font-size: 1.125rem;
  }
  
  .unit-header {
    padding: 0.5rem 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .status-badge {
    font-size: 0.6rem;
    padding: 0.1rem 0.4rem;
    align-self: flex-start;
  }
  
  .unit-title {
    font-size: 0.875rem;
  }
}
</style>
