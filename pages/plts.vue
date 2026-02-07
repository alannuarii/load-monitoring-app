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
          <h1 class="page-title m-0">PLTS</h1>
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
    <div v-if="loading && !hasData" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p class="mt-4 text-muted">Loading PLTS Data...</p>
    </div>

    <template v-else>
      <!-- Power Quality Card (Aggregated LVSW1 + LVSW2) -->
      <div class="card mb-6 p-6">
        <div class="flex flex-col items-center justify-center gap-3 mb-6">
          <span class="status-badge mb-2" :class="statusBadgeClass">{{ statusText }}</span>
          <div class="flex items-baseline gap-3 mb-10">
            <span class="frequency-display">{{ formatValue(getFrequency, 2) }}</span>
            <span class="text-4xl font-medium text-gray-400">Hz</span>
          </div>
        </div>

        <div class="metrics-grid mb-6">
          <div class="metric-card">
            <span class="metric-label">Total Active Power</span>
            <span class="metric-value-primary">{{ formatValue(totalActivePower, 0) }} <small>kW</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Total Reactive Power</span>
            <span class="metric-value-primary">{{ formatValue(totalReactivePower, 0) }} <small>kVAR</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Avg Power Factor</span>
            <span class="metric-value-primary">{{ formatValue(avgPowerFactor, 2) }}</span>
          </div>
        </div>
      </div>

      <!-- Battery Storage System Card -->
      <div class="card mb-6 p-6">
        <div class="section-header mb-4">
          <span class="icon-box">🔋</span>
          <span class="section-title">Battery Storage System</span>
        </div>
        
        <!-- Two Columns: Feeder 1 & Feeder 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Feeder 1 -->
          <div class="feeder-block">
            <h4 class="feeder-title">Feeder 1</h4>
            <div class="metrics-grid-2">
               <div class="metric-card-sm">
                 <span class="metric-label">Active Power</span>
                 <span class="metric-value">{{ formatValue(getValue(it1Data, 'Active Power'), 0) }} <small>kW</small></span>
               </div>
               <div class="metric-card-sm">
                 <span class="metric-label">Reactive Power</span>
                 <span class="metric-value">{{ formatValue(getValue(it1Data, 'Reactive Power'), 0) }} <small>kVAR</small></span>
               </div>
               <!-- Add other params if space permits or request requires, but previous layout had 2 -->
               <!-- Sticking to power as per previous layout, but chart has all -->
            </div>
          </div>

          <!-- Feeder 2 -->
          <div class="feeder-block">
            <h4 class="feeder-title">Feeder 2</h4>
            <div class="metrics-grid-2">
               <div class="metric-card-sm">
                 <span class="metric-label">Active Power</span>
                 <span class="metric-value">{{ formatValue(getValue(it2Data, 'Active Power'), 0) }} <small>kW</small></span>
               </div>
               <div class="metric-card-sm">
                 <span class="metric-label">Reactive Power</span>
                 <span class="metric-value">{{ formatValue(getValue(it2Data, 'Reactive Power'), 0) }} <small>kVAR</small></span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weather Station Card -->
      <div class="card mb-6 p-6">
        <div class="section-header mb-4">
          <span class="icon-box">🌤️</span>
          <span class="section-title">Weather Station</span>
        </div>

        <!-- 3 Columns x 2 Rows Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
           <!-- Row 1 -->
           <div class="weather-metric">
             <span class="metric-label">Global Irradiance</span>
             <span class="metric-value">{{ formatValue(getValue(weatherData, 'Global Irradiance'), 0) }} <small>W/m²</small></span>
           </div>
           <div class="weather-metric">
             <span class="metric-label">Air Temperature</span>
             <span class="metric-value">{{ formatValue(getValue(weatherData, 'Air Temperature'), 1) }} <small>°C</small></span>
           </div>
           <div class="weather-metric">
             <span class="metric-label">External Temperature</span>
             <span class="metric-value">{{ formatValue(getValue(weatherData, 'External Temperature'), 1) }} <small>°C</small></span>
           </div>

           <!-- Row 2 -->
           <div class="weather-metric">
             <span class="metric-label">Relative Humidity</span>
             <span class="metric-value">{{ formatValue(getValue(weatherData, 'Relative Humidity'), 1) }} <small>%</small></span>
           </div>
           <div class="weather-metric">
             <span class="metric-label">Wind Speed</span>
             <span class="metric-value">{{ formatValue(getValue(weatherData, 'Wind Speed'), 1) }} <small>m/s</small></span>
           </div>
           <div class="weather-metric">
             <span class="metric-label">Wind Direction</span>
             <span class="metric-value">{{ formatValue(getValue(weatherData, 'Wind Direction'), 0) }} <small>°</small></span>
           </div>
        </div>
      </div>

      <!-- Chart Card -->
      <div class="card p-6">
        <!-- Chart Controls -->
        <div class="chart-controls mb-6">
          <div class="flex items-center gap-4">
            <label class="text-sm text-gray-600">Parameter:</label>
            <select v-model="activeTab" class="param-select" @change="fetchHistory">
              <optgroup label="Power">
                <option value="plts-total-active">Active Power</option>
                <option value="plts-total-reactive">Reactive Power</option>
              </optgroup>
              
              <optgroup label="LVSW Feeder 1">
                <option value="lvsw1-active">Active Power</option>
                <option value="lvsw1-reactive">Reactive Power</option>
                <option value="lvsw1-voltage">Voltage</option>
                <option value="lvsw1-current">Current</option>
                <option value="lvsw1-pf">Power Factor</option>
                <option value="lvsw1-freq">Frequency</option>
              </optgroup>

              <optgroup label="LVSW Feeder 2">
                <option value="lvsw2-active">Active Power</option>
                <option value="lvsw2-reactive">Reactive Power</option>
                <option value="lvsw2-voltage">Voltage</option>
                <option value="lvsw2-current">Current</option>
                <option value="lvsw2-pf">Power Factor</option>
                <option value="lvsw2-freq">Frequency</option>
              </optgroup>

              <optgroup label="BSS Feeder 1">
                <option value="it1-active">Active Power</option>
                <option value="it1-reactive">Reactive Power</option>
                <option value="it1-voltage">Voltage</option>
                <option value="it1-current">Current</option>
                <option value="it1-pf">Power Factor</option>
                <option value="it1-freq">Frequency</option>
              </optgroup>

              <optgroup label="BSS Feeder 2">
                <option value="it2-active">Active Power</option>
                <option value="it2-reactive">Reactive Power</option>
                <option value="it2-voltage">Voltage</option>
                <option value="it2-current">Current</option>
                <option value="it2-pf">Power Factor</option>
                <option value="it2-freq">Frequency</option>
              </optgroup>

              <optgroup label="Weather Station">
                <option value="irradiance">Global Irradiance</option>
                <option value="air-temp">Air Temperature</option>
                <option value="ext-temp">External Temperature</option>
                <option value="wind-speed">Wind Speed</option>
                <option value="wind-dir">Wind Direction</option>
                 <option value="humidity">Relative Humidity</option>
              </optgroup>
            </select>
          </div>
          
          <div class="chart-actions">
            <select v-model="timeRange" class="range-select" @change="onTimeRangeChange">
              <option v-for="r in timeRanges" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
            <button class="btn-export" @click="exportCSV" title="Export CSV">
              📥 Export
            </button>
          </div>
        </div>

        <!-- Custom Date Range -->
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
// State
const lvsw1Data = ref([])
const lvsw2Data = ref([])
const it1Data = ref([])
const it2Data = ref([])
const weatherData = ref([])
const historyData = ref([])

const loading = ref(true)
const error = ref(null)
const currentDate = ref('')
const activeTab = ref('plts-total-active')
const timeRange = ref('-30m')
const customStart = ref('')
const customStop = ref('')

const hasData = computed(() => {
    return lvsw1Data.value.length || lvsw2Data.value.length || it1Data.value.length || it2Data.value.length || weatherData.value.length
})

// Time Range Options
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

// Chart Tabs Config
const chartTabs = [
    // LVSW Combined (Total)
    { id: 'plts-total-active', label: 'LVSW Total Active Power', field: 'Active Power', source: 'Combined-LVSW', unit: 'kW', color: '#2563eb' },
    { id: 'plts-total-reactive', label: 'LVSW Total Reactive Power', field: 'Reactive Power', source: 'Combined-LVSW', unit: 'kVAR', color: '#4f46e5' },
    
    // LVSW Feeder 1
    { id: 'lvsw1-active', label: 'LVSW Feeder 1 Active Power', field: 'Active Power', source: 'LVSW1', unit: 'kW', color: '#10b981' },
    { id: 'lvsw1-reactive', label: 'LVSW Feeder 1 Reactive Power', field: 'Reactive Power', source: 'LVSW1', unit: 'kVAR', color: '#059669' },
    { id: 'lvsw1-voltage', label: 'LVSW Feeder 1 Voltage', field: 'Voltage', source: 'LVSW1', unit: 'V', color: '#34d399' },
    { id: 'lvsw1-current', label: 'LVSW Feeder 1 Current', field: 'Current', source: 'LVSW1', unit: 'A', color: '#6ee7b7' },
    { id: 'lvsw1-pf', label: 'LVSW Feeder 1 Power Factor', field: 'Power Factor', source: 'LVSW1', unit: '', color: '#047857' },
    { id: 'lvsw1-freq', label: 'LVSW Feeder 1 Frequency', field: 'Frequency', source: 'LVSW1', unit: 'Hz', color: '#064e3b' },

    // LVSW Feeder 2
    { id: 'lvsw2-active', label: 'LVSW Feeder 2 Active Power', field: 'Active Power', source: 'LVSW2', unit: 'kW', color: '#f59e0b' },
    { id: 'lvsw2-reactive', label: 'LVSW Feeder 2 Reactive Power', field: 'Reactive Power', source: 'LVSW2', unit: 'kVAR', color: '#d97706' },
    { id: 'lvsw2-voltage', label: 'LVSW Feeder 2 Voltage', field: 'Voltage', source: 'LVSW2', unit: 'V', color: '#fbbf24' },
    { id: 'lvsw2-current', label: 'LVSW Feeder 2 Current', field: 'Current', source: 'LVSW2', unit: 'A', color: '#fcd34d' },
    { id: 'lvsw2-pf', label: 'LVSW Feeder 2 Power Factor', field: 'Power Factor', source: 'LVSW2', unit: '', color: '#b45309' },
    { id: 'lvsw2-freq', label: 'LVSW Feeder 2 Frequency', field: 'Frequency', source: 'LVSW2', unit: 'Hz', color: '#78350f' },

    // Battery System (IT) Feeder 1
    { id: 'it1-active', label: 'IT Feeder 1 Active Power', field: 'Active Power', source: 'IT1', unit: 'kW', color: '#ec4899' },
    { id: 'it1-reactive', label: 'IT Feeder 1 Reactive Power', field: 'Reactive Power', source: 'IT1', unit: 'kVAR', color: '#db2777' },
    { id: 'it1-voltage', label: 'IT Feeder 1 Voltage', field: 'Voltage', source: 'IT1', unit: 'V', color: '#f472b6' },
    { id: 'it1-current', label: 'IT Feeder 1 Current', field: 'Current', source: 'IT1', unit: 'A', color: '#fbcfe8' },
    { id: 'it1-pf', label: 'IT Feeder 1 Power Factor', field: 'Power Factor', source: 'IT1', unit: '', color: '#be185d' },
    { id: 'it1-freq', label: 'IT Feeder 1 Frequency', field: 'Frequency', source: 'IT1', unit: 'Hz', color: '#831843' },

    // Battery System (IT) Feeder 2
    { id: 'it2-active', label: 'IT Feeder 2 Active Power', field: 'Active Power', source: 'IT2', unit: 'kW', color: '#8b5cf6' },
    { id: 'it2-reactive', label: 'IT Feeder 2 Reactive Power', field: 'Reactive Power', source: 'IT2', unit: 'kVAR', color: '#7c3aed' },
    { id: 'it2-voltage', label: 'IT Feeder 2 Voltage', field: 'Voltage', source: 'IT2', unit: 'V', color: '#a78bfa' },
    { id: 'it2-current', label: 'IT Feeder 2 Current', field: 'Current', source: 'IT2', unit: 'A', color: '#c4b5fd' },
    { id: 'it2-pf', label: 'IT Feeder 2 Power Factor', field: 'Power Factor', source: 'IT2', unit: '', color: '#6d28d9' },
    { id: 'it2-freq', label: 'IT Feeder 2 Frequency', field: 'Frequency', source: 'IT2', unit: 'Hz', color: '#4c1d95' },

    // Weather Station
    { id: 'irradiance', label: 'Global Irradiance', field: 'Global Irradiance', source: 'weather_station', unit: 'W/m²', color: '#ef4444' },
    { id: 'air-temp', label: 'Air Temperature', field: 'Air Temperature', source: 'weather_station', unit: '°C', color: '#10b981' },
    { id: 'ext-temp', label: 'External Temperature', field: 'External Temperature', source: 'weather_station', unit: '°C', color: '#059669' },
    { id: 'wind-speed', label: 'Wind Speed', field: 'Wind Speed', source: 'weather_station', unit: 'm/s', color: '#06b6d4' },
    { id: 'wind-dir', label: 'Wind Direction', field: 'Wind Direction', source: 'weather_station', unit: '°', color: '#0891b2' },
    { id: 'humidity', label: 'Relative Humidity', field: 'Relative Humidity', source: 'weather_station', unit: '%', color: '#8b5cf6' }
]

const activeTabConfig = computed(() => chartTabs.find(t => t.id === activeTab.value))
const activeTabLabel = computed(() => activeTabConfig.value?.label || '')
const activeTabUnit = computed(() => activeTabConfig.value?.unit || '')

// Data Fetching
const fetchRealtime = async () => {
    try {
        const data = await $fetch('/api/monitoring/plts')
        lvsw1Data.value = data.lvsw1 || []
        lvsw2Data.value = data.lvsw2 || []
        it1Data.value = data.it1 || []
        it2Data.value = data.it2 || []
        weatherData.value = data.weather || []
        error.value = null
    } catch (err) {
        console.error('Realtime Fetch Error:', err)
        error.value = 'Failed to fetch PLTS data'
    }
}

const fetchHistory = async () => {
    try {
        const config = activeTabConfig.value
        if (!config) return

        let params = { field: config.field, source: config.source }
        
        if (timeRange.value === 'custom' && customStart.value && customStop.value) {
            params.start = new Date(customStart.value).toISOString()
            params.stop = new Date(customStop.value).toISOString()
        } else if (timeRange.value !== 'custom') {
            params.range = timeRange.value
        } else {
            return
        }

        const data = await $fetch('/api/monitoring/history/plts', { params })
        historyData.value = data
    } catch (err) {
        console.error('History Fetch Error:', err)
    }
}

const onTimeRangeChange = () => {
    if (timeRange.value !== 'custom') {
        fetchHistory()
    }
}

const refreshData = async () => {
    loading.value = true
    await Promise.all([fetchRealtime(), fetchHistory()])
    loading.value = false
}

// Watch tab/time change
watch(activeTab, () => fetchHistory())

// Lifecycle
onMounted(() => {
    updateDate()
    refreshData()
    const interval = setInterval(fetchRealtime, 2000)
    const dateInterval = setInterval(updateDate, 1000)
    const historyInterval = setInterval(fetchHistory, 30000)
    
    onUnmounted(() => {
        clearInterval(interval)
        clearInterval(dateInterval)
        clearInterval(historyInterval)
    })
})

// Helpers
const updateDate = () => {
    const now = new Date()
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
    currentDate.value = now.toLocaleString('id-ID', options).replace(/\./g, ':') + ' WITA'
}

const getValue = (dataset, fieldName) => {
    if (!dataset || !dataset.length) return 0
    const item = dataset.find(d => d._field === fieldName)
    return item?._value ?? 0
}

const formatValue = (val, decimals = 0) => {
    if (typeof val !== 'number') return '0'
    return val.toFixed(decimals)
}

// Computed
const totalActivePower = computed(() => {
    return getValue(lvsw1Data.value, 'Active Power') + getValue(lvsw2Data.value, 'Active Power')
})

const totalReactivePower = computed(() => {
    return getValue(lvsw1Data.value, 'Reactive Power') + getValue(lvsw2Data.value, 'Reactive Power')
})

const avgPowerFactor = computed(() => {
    const pf1 = getValue(lvsw1Data.value, 'Power Factor')
    const pf2 = getValue(lvsw2Data.value, 'Power Factor')
    if (pf1 && pf2) return (pf1 + pf2) / 2
    return pf1 || pf2 || 0
})

const getFrequency = computed(() => {
    const f1 = getValue(lvsw1Data.value, 'Frequency')
    const f2 = getValue(lvsw2Data.value, 'Frequency')
    return Math.max(f1, f2)
})

const status = computed(() => totalActivePower.value > 0 ? 'operating' : 'standby')
const statusText = computed(() => status.value === 'operating' ? 'Operating' : 'Standby')
const statusBadgeClass = computed(() => status.value === 'operating' ? 'bg-success text-white' : 'bg-warning text-gray-800')

const { isDark } = useTheme()

// Chart Stats
const chartStats = computed(() => {
    if (!historyData.value || historyData.value.length === 0) return null
    
    const config = activeTabConfig.value
    if (!config) return null
    
    const values = historyData.value.map(d => d._value).filter(v => typeof v === 'number')
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

// Chart Data (Full Implementation from Unit Detail)
const chartData = computed(() => {
    if (!historyData.value || historyData.value.length === 0) return null
    
    const config = activeTabConfig.value
    if (!config) return null
    
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
})

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { 
            display: false,
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
    link.setAttribute('download', `plts_${config.label.replace(/\s+/g, '_')}_${timeRange.value}.csv`)
    link.click()
    
    URL.revokeObjectURL(url)
}

</script>

<style scoped>
/* Full copy of [id].vue styles + PLTS distinct ones */
.page-header { display: flex; flex-direction: column; width: 100%; }
.header-top-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.header-left-group { display: flex; align-items: center; gap: var(--space-4); }
.header-date-mobile { display: none; }
.btn-back { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); text-decoration: none; font-weight: 500; transition: color 0.2s; }
.btn-back:hover { color: var(--primary-600); }
.divider-vertical { width: 1px; background-color: var(--border-color); height: 1.5rem; }

.status-badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.bg-success { background-color: var(--success); }
.bg-warning { background-color: var(--warning); }

.frequency-display { font-size: 2rem; font-weight: 800; color: var(--text-main); line-height: 1; letter-spacing: -0.02em; }

.metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.metrics-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }

.metric-card { background: var(--bg-hover); border-radius: var(--radius-md); padding: var(--space-4); text-align: center; }
.metric-card-sm { background: var(--bg-hover); border-radius: var(--radius-sm); padding: var(--space-3); text-align: center; display: flex; flex-direction: column; }

.metric-label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
.metric-value-primary { font-size: 1.5rem; font-weight: 700; color: var(--text-main); }
.metric-value-primary small { font-size: 0.875rem; font-weight: 400; color: var(--text-muted); }
.metric-value { font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
.metric-value small { font-size: 0.875rem; font-weight: 400; color: var(--text-muted);}

.feeder-block { background: var(--bg-subtle); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-color); }
.feeder-title { font-size: 1rem; font-weight: 600; margin-bottom: var(--space-4); color: var(--text-main); text-align: center; }

.section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: var(--space-3); }
.section-title { font-weight: 500; color: var(--text-main); }
.icon-box { width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; background: var(--bg-card); border-radius: 0.375rem; font-size: 1rem; }

.weather-metric { background: var(--bg-hover); padding: var(--space-3); border-radius: var(--radius-md); text-align: center; display: flex; flex-direction: column; justify-content: center; }

/* Chart Controls */
.chart-controls { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; }
.chart-actions { display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; }
.param-select { padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid var(--border-color); background: var(--bg-input); font-size: 0.875rem; color: var(--text-main); cursor: pointer; min-width: 180px; }
.range-select { padding: 0.4rem 0.75rem; border-radius: 0.375rem; border: 1px solid var(--border-color); background: var(--bg-input); font-size: 0.8rem; color: var(--text-main); cursor: pointer; }
.btn-export { padding: 0.4rem 0.75rem; border-radius: 0.375rem; font-size: 0.8rem; font-weight: 500; color: var(--text-muted); background: var(--bg-hover); border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s; }
.chart-wrapper { height: 350px; width: 100%; margin-top: 1rem; }

/* Stats Bar */
.stats-bar { display: flex; justify-content: center; gap: 3rem; padding: var(--space-4); background: var(--bg-hover); border-radius: var(--radius-md); }
.stat-item { text-align: center; }
.stat-label { display: block; font-size: 0.7rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: 0.25rem; }
.stat-value { font-family: monospace; font-size: 1.125rem; font-weight: 600; color: var(--text-main); }

/* Custom Range */
.custom-range-picker { padding: var(--space-4); background: var(--bg-hover); border-radius: var(--radius-md); }
.date-input-group { display: flex; align-items: center; gap: 0.5rem; }
.date-input { padding: 0.4rem 0.75rem; border-radius: 0.375rem; border: 1px solid var(--border-color); background: var(--bg-input); font-size: 0.8rem; color: var(--text-main); }
.btn-apply { padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.8rem; font-weight: 600; color: white; background: var(--primary-600); border: none; cursor: pointer; }

/* Loading State */
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; width: 100%; text-align: center; }
.unit-container { min-height: calc(100vh - 140px); display: flex; flex-direction: column; }

/* Mobile */
@media (max-width: 768px) {
    .header-date-desktop { display: none; }
    .header-date-mobile { display: block; text-align: center; margin-top: var(--space-2); width: 100%; }
    .back-text, .divider-vertical { display: none; }
    .header-left-group { width: 100%; }
    
    .metrics-grid { grid-template-columns: 1fr; }
    .metrics-grid-2 { grid-template-columns: 1fr 1fr; }
    
    .chart-controls { flex-direction: column; align-items: stretch; }
    .chart-actions { justify-content: space-between; }
    .stats-bar { gap: 1.5rem; flex-wrap: wrap; }
}
</style>
