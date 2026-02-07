<template>
  <div class="animate-fade-in unit-container">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="header-top-row">
        <div class="header-left-group">
          <NuxtLink to="/" class="btn-back">
            <span class="icon">←</span>
          </NuxtLink>
          <div class="divider-vertical"></div>
          <h1 class="page-title m-0">Unit {{ unitId }}</h1>
        </div>
        
        <!-- Date/Time Display (Desktop) -->
        <div class="header-date-desktop">
          <p class="text-sm text-muted font-medium">{{ currentDate }}</p>
        </div>
      </div>

      <!-- Date/Time Display (Mobile) -->
      <div class="header-date-mobile">
        <p class="text-xs text-muted font-medium">{{ currentDate }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger mb-6">
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ml-4" @click="refreshData">Try Again</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !realtimeData.length" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p class="mt-4 text-muted">Loading Unit Data...</p>
    </div>

    <template v-else>
      <!-- Status Card - All Parameters -->
      <div class="card mb-6 p-6">
        <!-- Row 1: Status & Frequency (Centered) -->
        <div class="flex flex-col items-center justify-center gap-3 mb-6">
          <span class="status-badge mb-2" :class="statusBadgeClass">{{ statusText }}</span>
          <div class="flex items-baseline gap-3 mb-10">
            <span class="frequency-display">{{ formatValue(getValue('Frequency'), 2) }}</span>
            <span class="text-4xl font-medium text-gray-400">Hz</span>
          </div>
        </div>

        <!-- Row 2: Power Metrics -->
        <div class="metrics-grid mb-6">
          <div class="metric-card">
            <span class="metric-label">Active Power</span>
            <span class="metric-value-primary">{{ formatValue(getValue('Active Power'), 0) }} <small>kW</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Reactive Power</span>
            <span class="metric-value-primary">{{ formatValue(getValue('Reactive Power'), 0) }} <small>kVAR</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Power Factor</span>
            <span class="metric-value-primary">{{ formatValue(getValue('Power Factor'), 2) }}</span>
          </div>
        </div>

        <!-- Row 3: Voltage Generator (Line-to-Line) -->
        <div class="detail-section mb-4">
          <div class="section-header">
            <span class="icon-box">⚡</span>
            <span class="section-title">Voltage Generator</span>
          </div>
          <div class="values-grid">
            <div class="value-block">
              <span class="value-label">L1-L2</span>
              <span class="value-number">{{ formatValue(getValue('Voltage L1 L2'), 0) }} <small>V</small></span>
            </div>
            <div class="value-block">
              <span class="value-label">L2-L3</span>
              <span class="value-number">{{ formatValue(getValue('Voltage L2 L3'), 0) }} <small>V</small></span>
            </div>
            <div class="value-block">
              <span class="value-label">L3-L1</span>
              <span class="value-number">{{ formatValue(getValue('Voltage L3 L1'), 0) }} <small>V</small></span>
            </div>
          </div>
        </div>

        <!-- Row 4: Current Generator -->
        <div class="detail-section">
          <div class="section-header">
            <span class="icon-box">🌊</span>
            <span class="section-title">Current Generator</span>
          </div>
          <div class="values-grid">
            <div class="value-block">
              <span class="value-label">L1</span>
              <span class="value-number">{{ formatValue(getValue('Current L1'), 0) }} <small>A</small></span>
            </div>
            <div class="value-block">
              <span class="value-label">L2</span>
              <span class="value-number">{{ formatValue(getValue('Current L2'), 0) }} <small>A</small></span>
            </div>
            <div class="value-block">
              <span class="value-label">L3</span>
              <span class="value-number">{{ formatValue(getValue('Current L3'), 0) }} <small>A</small></span>
            </div>
          </div>
        </div>

        <!-- Row 5: Power Quality -->
        <div class="detail-section mt-4">
          <div class="section-header">
            <span class="icon-box">📊</span>
            <span class="section-title">Power Quality</span>
            <span class="overall-status-badge" :class="overallPowerQualityClass">{{ overallPowerQualityStatus }}</span>
          </div>
          <div class="pq-grid">
            <div class="pq-item">
              <div class="pq-label">Voltage Unbalance</div>
              <div class="pq-value-row">
                <span class="pq-value">{{ voltageUnbalance.value }}%</span>
                <span class="pq-status-badge" :class="voltageUnbalance.class">{{ voltageUnbalance.status }}</span>
              </div>
              <div class="pq-threshold">Batas: &lt; 2% (Good), 2-5% (Warning)</div>
            </div>
            <div class="pq-item">
              <div class="pq-label">Current Unbalance</div>
              <div class="pq-value-row">
                <span class="pq-value">{{ currentUnbalance.value }}%</span>
                <span class="pq-status-badge" :class="currentUnbalance.class">{{ currentUnbalance.status }}</span>
              </div>
              <div class="pq-threshold">Batas: &lt; 10% (Good), 10-20% (Warning)</div>
            </div>
            <div class="pq-item">
              <div class="pq-label">Power Factor</div>
              <div class="pq-value-row">
                <span class="pq-value">{{ powerFactorStatus.value }}</span>
                <span class="pq-status-badge" :class="powerFactorStatus.class">{{ powerFactorStatus.status }}</span>
              </div>
              <div class="pq-threshold">Batas: &gt; 0.9 (Good), 0.8-0.9 (Fair)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Card -->
      <div class="card p-6">
        <!-- Chart Controls -->
        <div class="chart-controls mb-6">
          <!-- Parameter Selector -->
          <div class="flex items-center gap-4">
            <label class="text-sm text-gray-600">Parameter:</label>
            <select v-model="activeTab" class="param-select" @change="fetchHistory">
              <optgroup label="Power">
                <option value="active-power">Active Power</option>
                <option value="reactive-power">Reactive Power</option>
                <option value="power-factor">Power Factor</option>
              </optgroup>
              <optgroup label="Frequency">
                <option value="frequency">Frequency</option>
              </optgroup>
              <optgroup label="Voltage">
                <option value="all-voltages">All Voltages</option>
                <option value="voltage-l1l2">└ Voltage L1-L2</option>
                <option value="voltage-l2l3">└ Voltage L2-L3</option>
                <option value="voltage-l3l1">└ Voltage L3-L1</option>
              </optgroup>
              <optgroup label="Current">
                <option value="all-currents">All Currents</option>
                <option value="current-l1">└ Current L1</option>
                <option value="current-l2">└ Current L2</option>
                <option value="current-l3">└ Current L3</option>
              </optgroup>
              <optgroup label="Power Quality">
                <option value="voltage-unbalance">Voltage Unbalance (%)</option>
                <option value="current-unbalance">Current Unbalance (%)</option>
              </optgroup>
            </select>
          </div>
          
          <!-- Time Range + Export -->
          <div class="chart-actions">
            <select v-model="timeRange" class="range-select" @change="onTimeRangeChange">
              <option v-for="r in timeRanges" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
            <button class="btn-export" @click="exportCSV" title="Export CSV">
              📥 Export
            </button>
          </div>
        </div>

        <!-- Custom Date Range (shown when 'custom' selected) -->
        <div v-if="timeRange === 'custom'" class="custom-range-picker mb-4">
          <div class="flex items-center gap-4 flex-wrap">
            <div class="date-input-group">
              <label class="text-sm text-gray-600">Dari:</label>
              <input type="datetime-local" v-model="customStart" class="date-input" />
            </div>
            <div class="date-input-group">
              <label class="text-sm text-gray-600">Sampai:</label>
              <input type="datetime-local" v-model="customStop" class="date-input" />
            </div>
            <button class="btn-apply" @click="fetchHistory">Terapkan</button>
          </div>
        </div>

        <!-- Chart Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-700 font-medium m-0">{{ activeTabLabel }} {{ activeTabUnit ? `(${activeTabUnit})` : '' }}</h3>
        </div>

        <!-- Chart Area -->
        <div class="chart-wrapper">
          <LineChart v-if="chartData" :chart-data="chartData" :chart-options="chartOptions" />
          <div v-else class="flex justify-center items-center h-full text-muted">
            <div class="spinner mr-2"></div> Loading Chart...
          </div>
        </div>

        <!-- Stats Bar -->
        <div v-if="chartStats" class="stats-bar mt-4">
          <div class="stat-item">
            <span class="stat-label">Min</span>
            <span class="stat-value">{{ chartStats.min }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Max</span>
            <span class="stat-value">{{ chartStats.max }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Avg</span>
            <span class="stat-value">{{ chartStats.avg }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const route = useRoute()
const unitId = route.params.id

// State
const realtimeData = ref([])
const historyData = ref([])
const loading = ref(true)
const error = ref(null)
const currentDate = ref('')
const activeTab = ref('active-power')
const timeRange = ref('-30m')
const customStart = ref('')
const customStop = ref('')

// Time Range Options (extended to 30 days + custom)
const timeRanges = [
  { value: '-5m', label: '5 Menit' },
  { value: '-15m', label: '15 Menit' },
  { value: '-30m', label: '30 Menit' },
  { value: '-1h', label: '1 Jam' },
  { value: '-6h', label: '6 Jam' },
  { value: '-1d', label: '1 Hari' },
  { value: '-3d', label: '3 Hari' },
  { value: '-7d', label: '7 Hari' },
  { value: '-14d', label: '14 Hari' },
  { value: '-30d', label: '30 Hari' },
  { value: 'custom', label: 'Custom...' }
]

// Tabs Config - All Parameters + Combined
const chartTabs = [
  { id: 'active-power', label: 'Active Power', field: 'Active Power', unit: 'kW', color: '#3b82f6' },
  { id: 'reactive-power', label: 'Reactive Power', field: 'Reactive Power', unit: 'kVAR', color: '#6366f1' },
  { id: 'power-factor', label: 'Power Factor', field: 'Power Factor', unit: '', color: '#14b8a6' },
  { id: 'frequency', label: 'Frequency', field: 'Frequency', unit: 'Hz', color: '#8b5cf6' },
  // Combined Charts
  { id: 'all-voltages', label: 'All Voltages', fields: ['Voltage L1 L2', 'Voltage L2 L3', 'Voltage L3 L1'], unit: 'V', colors: ['#10b981', '#22c55e', '#059669'], isMulti: true },
  { id: 'all-currents', label: 'All Currents', fields: ['Current L1', 'Current L2', 'Current L3'], unit: 'A', colors: ['#f59e0b', '#f97316', '#ef4444'], isMulti: true },
  // Individual
  { id: 'voltage-l1l2', label: 'Voltage L1-L2', field: 'Voltage L1 L2', unit: 'V', color: '#10b981' },
  { id: 'voltage-l2l3', label: 'Voltage L2-L3', field: 'Voltage L2 L3', unit: 'V', color: '#22c55e' },
  { id: 'voltage-l3l1', label: 'Voltage L3-L1', field: 'Voltage L3 L1', unit: 'V', color: '#059669' },
  { id: 'current-l1', label: 'Current L1', field: 'Current L1', unit: 'A', color: '#f59e0b' },
  { id: 'current-l2', label: 'Current L2', field: 'Current L2', unit: 'A', color: '#f97316' },
  { id: 'current-l3', label: 'Current L3', field: 'Current L3', unit: 'A', color: '#ef4444' },
  // Power Quality (calculated values)
  { id: 'voltage-unbalance', label: 'Voltage Unbalance', fields: ['Voltage L1 L2', 'Voltage L2 L3', 'Voltage L3 L1'], unit: '%', color: '#ec4899', isCalculated: 'voltage-unbalance' },
  { id: 'current-unbalance', label: 'Current Unbalance', fields: ['Current L1', 'Current L2', 'Current L3'], unit: '%', color: '#8b5cf6', isCalculated: 'current-unbalance' }
]

const activeTabConfig = computed(() => chartTabs.find(t => t.id === activeTab.value))
const activeTabLabel = computed(() => activeTabConfig.value?.label || '')
const activeTabUnit = computed(() => activeTabConfig.value?.unit || '')

// Data Fetching
const fetchRealtime = async () => {
    try {
        const data = await $fetch(`/api/monitoring/unit/${unitId}`)
        realtimeData.value = data
        error.value = null
    } catch (err) {
        console.error('Realtime Fetch Error:', err)
    }
}

const fetchHistory = async () => {
    try {
        const config = activeTabConfig.value
        if (!config) return
        
        // Determine fields to fetch
        let fieldParam
        if (config.isCalculated) {
            // For calculated fields, fetch source fields
            fieldParam = config.fields.join(',')
        } else if (config.isMulti) {
            fieldParam = config.fields.join(',')
        } else {
            fieldParam = config.field
        }
        
        // Build params based on range type
        const params = { field: fieldParam }
        
        if (timeRange.value === 'custom' && customStart.value && customStop.value) {
            // Use absolute time for custom range
            params.start = new Date(customStart.value).toISOString()
            params.stop = new Date(customStop.value).toISOString()
        } else if (timeRange.value !== 'custom') {
            params.range = timeRange.value
        } else {
            // Custom selected but no dates yet
            return
        }
        
        const data = await $fetch(`/api/monitoring/history/${unitId}`, { params })
        historyData.value = data
    } catch (err) {
        console.error('History Fetch Error:', err)
    }
}

const onTimeRangeChange = () => {
    if (timeRange.value !== 'custom') {
        fetchHistory()
    }
    // For custom, wait for user to set dates and click Apply
}

const refreshData = async () => {
    loading.value = true
    error.value = null
    try {
        await Promise.all([fetchRealtime(), fetchHistory()])
    } catch (err) {
        error.value = 'Failed to load unit data'
    } finally {
        loading.value = false
    }
}

// Watch tab change to refetch history
watch(activeTab, () => {
    fetchHistory()
})

// Lifecycle
onMounted(() => {
    updateDate()
    refreshData()
    
    const dateInterval = setInterval(updateDate, 1000)
    
    const realtimeInterval = setInterval(fetchRealtime, 2000)
    const historyInterval = setInterval(fetchHistory, 30000)
    
    onUnmounted(() => {
        clearInterval(dateInterval)
        clearInterval(realtimeInterval)
        clearInterval(historyInterval)
    })
})

// Helpers
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

const getValue = (fieldName) => {
    if (!realtimeData.value || !realtimeData.value.length) return 0
    const item = realtimeData.value.find(d => d._field === fieldName)
    return item?._value ?? 0
}

const formatValue = (val, decimals = 0) => {
    if (typeof val !== 'number') return '0'
    return val.toFixed(decimals)
}

// Computed Status
const status = computed(() => {
  const power = getValue('Active Power')
  return power > 0 ? 'operating' : 'standby'
})

const statusText = computed(() => status.value === 'operating' ? 'Operating' : 'Standby')

const statusBadgeClass = computed(() => {
    return status.value === 'operating' 
        ? 'bg-success text-white' 
        : 'bg-warning text-gray-800'
})

// Power Quality Calculations
// Voltage Unbalance: Max deviation from average / Average × 100
const voltageUnbalance = computed(() => {
    const v1 = getValue('Voltage L1 L2')
    const v2 = getValue('Voltage L2 L3')
    const v3 = getValue('Voltage L3 L1')
    
    if (v1 === 0 && v2 === 0 && v3 === 0) {
        return { value: '0.00', status: 'N/A', class: 'pq-neutral' }
    }
    
    const avg = (v1 + v2 + v3) / 3
    const maxDev = Math.max(Math.abs(v1 - avg), Math.abs(v2 - avg), Math.abs(v3 - avg))
    const unbalance = (maxDev / avg) * 100
    
    let status = 'Good'
    let cssClass = 'pq-good'
    if (unbalance >= 5) {
        status = 'Poor'
        cssClass = 'pq-poor'
    } else if (unbalance >= 2) {
        status = 'Warning'
        cssClass = 'pq-warning'
    }
    
    return { value: unbalance.toFixed(2), status, class: cssClass }
})

// Current Unbalance: Max deviation from average / Average × 100
const currentUnbalance = computed(() => {
    const i1 = getValue('Current L1')
    const i2 = getValue('Current L2')
    const i3 = getValue('Current L3')
    
    if (i1 === 0 && i2 === 0 && i3 === 0) {
        return { value: '0.00', status: 'N/A', class: 'pq-neutral' }
    }
    
    const avg = (i1 + i2 + i3) / 3
    const maxDev = Math.max(Math.abs(i1 - avg), Math.abs(i2 - avg), Math.abs(i3 - avg))
    const unbalance = (maxDev / avg) * 100
    
    let status = 'Good'
    let cssClass = 'pq-good'
    if (unbalance >= 20) {
        status = 'Poor'
        cssClass = 'pq-poor'
    } else if (unbalance >= 10) {
        status = 'Warning'
        cssClass = 'pq-warning'
    }
    
    return { value: unbalance.toFixed(2), status, class: cssClass }
})

// Power Factor Status
const powerFactorStatus = computed(() => {
    const pf = getValue('Power Factor')
    
    if (pf === 0) {
        return { value: '0.00', status: 'N/A', class: 'pq-neutral' }
    }
    
    let status = 'Good'
    let cssClass = 'pq-good'
    if (pf < 0.8) {
        status = 'Poor'
        cssClass = 'pq-poor'
    } else if (pf < 0.9) {
        status = 'Fair'
        cssClass = 'pq-warning'
    }
    
    return { value: pf.toFixed(2), status, class: cssClass }
})

// Overall Power Quality Status
const overallPowerQualityStatus = computed(() => {
    const statuses = [voltageUnbalance.value.status, currentUnbalance.value.status, powerFactorStatus.value.status]
    
    if (statuses.includes('Poor')) return 'Poor'
    if (statuses.includes('Warning') || statuses.includes('Fair')) return 'Fair'
    if (statuses.every(s => s === 'N/A')) return 'N/A'
    return 'Good'
})

const overallPowerQualityClass = computed(() => {
    const status = overallPowerQualityStatus.value
    if (status === 'Poor') return 'pq-overall-poor'
    if (status === 'Fair') return 'pq-overall-warning'
    if (status === 'N/A') return 'pq-overall-neutral'
    return 'pq-overall-good'
})

// Chart Stats
const chartStats = computed(() => {
    if (!historyData.value || historyData.value.length === 0) return null
    
    const config = activeTabConfig.value
    if (!config) return null
    
    // For multi-field, use first field for stats
    const targetField = config.isMulti ? config.fields[0] : config.field
    const values = historyData.value
        .filter(d => d._field === targetField)
        .map(d => d._value)
        .filter(v => typeof v === 'number')
    
    if (values.length === 0) return null
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    
    const decimals = config.field === 'Power Factor' ? 2 : 0
    
    return {
        min: min.toFixed(decimals),
        max: max.toFixed(decimals),
        avg: avg.toFixed(decimals)
    }
})

// Chart Data Construction
const chartData = computed(() => {
    if (!historyData.value || historyData.value.length === 0) return null
    
    const config = activeTabConfig.value
    if (!config) return null

    // Handle calculated Power Quality fields
    if (config.isCalculated) {
        // Group data by timestamp
        const timeMap = new Map()
        historyData.value.forEach(d => {
            const time = d._time
            if (!timeMap.has(time)) {
                timeMap.set(time, {})
            }
            timeMap.get(time)[d._field] = d._value
        })

        // Calculate unbalance for each timestamp
        const sortedTimes = Array.from(timeMap.keys()).sort()
        const labels = sortedTimes.map(t => {
            const date = new Date(t)
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        })

        const dataPoints = sortedTimes.map(time => {
            const values = timeMap.get(time)
            const fieldNames = config.fields
            const vals = fieldNames.map(f => values[f] || 0)
            
            const avg = vals.reduce((a, b) => a + b, 0) / vals.length
            if (avg === 0) return 0
            
            const maxDev = Math.max(...vals.map(v => Math.abs(v - avg)))
            return (maxDev / avg) * 100
        })

        return {
            labels,
            datasets: [{
                label: config.label,
                data: dataPoints,
                borderColor: config.color,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
                    gradient.addColorStop(0, hexToRgba(config.color, 0.4))
                    gradient.addColorStop(1, hexToRgba(config.color, 0.0))
                    return gradient
                },
                fill: true,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        }
    }

    if (config.isMulti) {
        // Multi-line chart
        const datasets = config.fields.map((field, index) => {
            const fieldData = historyData.value.filter(d => d._field === field)
            return {
                label: field,
                data: fieldData.map(d => d._value),
                borderColor: config.colors[index],
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6
            }
        })

        // Use first field's timestamps for labels
        const firstFieldData = historyData.value.filter(d => d._field === config.fields[0])
        const labels = firstFieldData.map(d => {
            const date = new Date(d._time)
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        })

        return { labels, datasets }
    } else {
        // Single line chart
        const labels = historyData.value.map(d => {
            const date = new Date(d._time)
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        })
        
        const dataPoints = historyData.value.map(d => d._value)
        const color = config.color

        return {
            labels,
            datasets: [{
                label: config.label,
                data: dataPoints,
                borderColor: color,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
                    gradient.addColorStop(0, hexToRgba(color, 0.4))
                    gradient.addColorStop(1, hexToRgba(color, 0.0))
                    return gradient
                },
                fill: true,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        }
    }
})

const { isDark } = useTheme()

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { 
            display: activeTabConfig.value?.isMulti || false,
            position: 'top',
            labels: {
                usePointStyle: true,
                padding: 20,
                color: isDark.value ? '#cbd5e1' : '#64748b'
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: isDark.value ? '#1e293b' : '#ffffff',
            titleColor: isDark.value ? '#f1f5f9' : '#1f2937',
            bodyColor: isDark.value ? '#cbd5e1' : '#4b5563',
            borderColor: isDark.value ? '#334155' : '#e2e8f0',
            borderWidth: 1
        }
    },
    scales: {
        y: {
            grid: { color: isDark.value ? '#334155' : '#f1f5f9' },
            beginAtZero: false,
            ticks: { color: isDark.value ? '#94a3b8' : '#64748b' }
        },
        x: {
            grid: { display: false },
            ticks: { 
                color: isDark.value ? '#94a3b8' : '#64748b',
                maxRotation: 45,
                minRotation: 45
            }
        }
    },
    elements: {
        line: { tension: 0.4 }
    }
}))

const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Export CSV
const exportCSV = () => {
    if (!historyData.value || historyData.value.length === 0) return
    
    const config = activeTabConfig.value
    const rows = [['Time', 'Field', 'Value']]
    
    historyData.value.forEach(d => {
        const time = new Date(d._time).toLocaleString('id-ID')
        rows.push([time, d._field, d._value])
    })
    
    const csvContent = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `unit${unitId}_${config.label.replace(/\s+/g, '_')}_${timeRange.value}.csv`)
    link.click()
    
    URL.revokeObjectURL(url)
}
</script>

<style scoped>
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.btn-back:hover {
    color: var(--primary-600);
}

.divider-vertical {
    width: 1px;
    background-color: var(--border-color);
    height: 1.5rem;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.bg-success { background-color: var(--success); }
.bg-warning { background-color: var(--warning); }

/* Frequency Display */
.frequency-display {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-main);
    line-height: 1;
    letter-spacing: -0.02em;
}


/* Metrics Grid */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
}

.metric-card {
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    text-align: center;
}

.metric-label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.metric-value-primary {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-main);
}

.metric-value-primary small {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-muted);
}

/* Detail Sections */
.detail-section {
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    padding: var(--space-4);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: var(--space-3);
}

.section-title {
    font-weight: 500;
    color: var(--text-main);
}

.icon-box {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    border-radius: 0.375rem;
    font-size: 1rem;
}

.values-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
}

.value-block {
    text-align: center;
}

.value-label {
    display: block;
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-bottom: 0.25rem;
}

.value-number {
    font-family: monospace;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-main);
}

.value-number small {
    font-size: 0.75rem;
    color: var(--text-muted);
}

/* Power Quality Styles */
.pq-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
}

.pq-item {
    background: var(--bg-hover);
    border-radius: var(--radius-sm);
    padding: var(--space-3);
    text-align: center;
}

.pq-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.pq-value-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.pq-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
}

.pq-status-badge {
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
}

.pq-good {
    background: var(--success-light);
    color: #166534;
}

.pq-warning {
    background: var(--warning-light);
    color: #92400e;
}

.pq-poor {
    background: var(--danger-light);
    color: #991b1b;
}

.pq-neutral {
    background: var(--gray-200);
    color: var(--gray-600);
}

.pq-threshold {
    font-size: 0.65rem;
    color: var(--gray-400);
}

.overall-status-badge {
    margin-left: auto;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
}

.pq-overall-good {
    background: var(--success-light);
    color: #166534;
}

.pq-overall-warning {
    background: var(--warning-light);
    color: #92400e;
}

.pq-overall-poor {
    background: var(--danger-light);
    color: #991b1b;
}

.pq-overall-neutral {
    background: var(--bg-hover);
    color: var(--text-muted);
}

/* Chart Controls */
.chart-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.chart-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-shrink: 0;
}

.param-select {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: 1px solid var(--border-color);
    background: var(--bg-input);
    font-size: 0.875rem;
    color: var(--text-main);
    cursor: pointer;
    min-width: 180px;
}

.param-select:focus {
    outline: none;
    border-color: var(--primary-500);
}

.range-select {
    padding: 0.4rem 0.75rem;
    border-radius: 0.375rem;
    border: 1px solid var(--border-color);
    background: var(--bg-input);
    font-size: 0.8rem;
    color: var(--text-main);
    cursor: pointer;
}

.range-select:focus {
    outline: none;
    border-color: var(--primary-500);
}

/* Custom Date Range Picker */
.custom-range-picker {
    padding: var(--space-4);
    background: var(--bg-hover);
    border-radius: var(--radius-md);
}

.date-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.date-input {
    padding: 0.4rem 0.75rem;
    border-radius: 0.375rem;
    border: 1px solid var(--border-color);
    background: var(--bg-input);
    font-size: 0.8rem;
    color: var(--text-main);
}

.date-input:focus {
    outline: none;
    border-color: var(--primary-500);
}

.btn-apply {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    background: var(--primary-600);
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-apply:hover {
    background: var(--primary-700);
}

.btn-export {
    padding: 0.4rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-muted);
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s;
}

.btn-export:hover {
    background: var(--gray-200);
    color: var(--gray-800);
}

.tab-btn {
    padding: 0.4rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-muted);
    background: var(--bg-hover);
    border: 1px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
}

.tab-btn:hover {
    background: var(--gray-200);
    color: var(--gray-800);
}

.tab-btn.active {
    background: var(--primary-600);
    color: white;
}

.chart-wrapper {
    height: 350px;
    width: 100%;
    margin-top: 1rem;
}

/* Stats Bar */
.stats-bar {
    display: flex;
    justify-content: center;
    gap: 3rem;
    padding: var(--space-4);
    background: var(--bg-hover);
    border-radius: var(--radius-md);
}

.stat-item {
    text-align: center;
}

.stat-label {
    display: block;
    font-size: 0.7rem;
    color: var(--gray-500);
    text-transform: uppercase;
    margin-bottom: 0.25rem;
}

.stat-value {
    font-family: monospace;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-main);
}

@media (max-width: 768px) {
    .metrics-grid {
        grid-template-columns: 1fr;
    }

    /* User requested Voltage/Current parameters to be inline (sejajar) on mobile */
    .values-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem; /* Tighter gap for mobile */
    }
    
    .chart-controls {
        flex-direction: column;
    }
    
    .tabs-container {
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: 0.5rem;
    }
    
    .stats-bar {
        gap: 1.5rem;
        flex-wrap: wrap;
    }
    
    .pq-grid {
        grid-template-columns: 1fr;
        gap: var(--space-4);
    }
}

@media (max-width: 480px) {
    .stats-bar {
        gap: 1rem;
        justify-content: space-around;
        padding: var(--space-3);
    }
    
    .stat-value {
        font-size: 1rem;
    }
    
    .pq-grid {
        grid-template-columns: 1fr;
    }
    
    .pq-card {
        padding: var(--space-3);
    }
}


.unit-container {
    min-height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
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

/* Header Responsiveness */
.header-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.header-left-group {
    display: flex;
    align-items: center;
    gap: var(--space-4);
}

.header-date-mobile {
    display: none;
    text-align: center;
    margin-top: var(--space-2);
    width: 100%;
}

@media (max-width: 768px) {
    .header-date-desktop {
        display: none;
    }

    .header-date-mobile {
        display: none;

    }

    .back-text,
    .divider-vertical {
        display: none;
    }
    
    .header-left-group {
        width: 100%;
        /* justify-content: center; If we wanted title centered, but user asked for date centered only */
    }
}
</style>
