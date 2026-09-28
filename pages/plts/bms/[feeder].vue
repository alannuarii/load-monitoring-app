<template>
  <div class="animate-fade-in unit-container">
    <!-- Header -->
    <div class="page-header mb-6">
      <div class="header-top-row">
        <div class="header-left-group">
          <NuxtLink to="/plts" class="btn-back" title="Back to PLTS Page">
            <span class="icon">←</span>
          </NuxtLink>
          <div class="divider-vertical"></div>
          <h1 class="page-title m-0">BMS Feeder {{ feederParam }} ({{ feederParam === '1' ? 'IT1' : 'IT2' }})</h1>
        </div>
        
        <!-- Feeder Switcher & Date/Time Display (Desktop) -->
        <div class="flex items-center gap-4">
          <div class="feeder-toggle-bar">
            <NuxtLink 
              to="/plts/bms/1" 
              class="btn-feeder-tab" 
              :class="{ active: feederParam === '1' }"
            >
              Feeder 1 (1–88)
            </NuxtLink>
            <NuxtLink 
              to="/plts/bms/2" 
              class="btn-feeder-tab" 
              :class="{ active: feederParam === '2' }"
            >
              Feeder 2 (89–176)
            </NuxtLink>
          </div>
          <div class="header-date-desktop">
            <p class="text-sm text-muted font-medium m-0">{{ currentDate }}</p>
          </div>
        </div>
      </div>

      <!-- Date/Time Display (Mobile) -->
      <div class="header-date-mobile mt-2">
        <p class="text-xs text-muted font-medium m-0">{{ currentDate }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger mb-6">
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ml-4" @click="refreshData">Try Again</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !modules.length" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p class="mt-4 text-muted">Loading BMS Data...</p>
    </div>

    <template v-else>
      <!-- CARD 1: Feeder Summary & Bank Health -->
      <div class="card mb-6 p-6">
        <div class="section-header-row mb-6">
          <div class="section-header m-0 p-0" style="border: none;">
            <span class="section-title">BSS Bank Summary - Feeder {{ feederParam }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="status-badge bg-success">{{ summary.onlineCount }} / {{ summary.totalModules }} ONLINE</span>
          </div>
        </div>

        <!-- Metrics Grid (5 Columns) -->
        <div class="metrics-grid-5 mb-2">
          <div class="metric-card">
            <span class="metric-label">Average Bank SOC</span>
            <span class="metric-value-primary">{{ formatValue(summary.avgSoc, 1) }} <small>%</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Average Bank SOH</span>
            <span class="metric-value-primary">{{ formatValue(summary.avgSoh, 1) }} <small>%</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Average Pack Voltage</span>
            <span class="metric-value-primary">{{ formatValue(summary.avgVoltage, 2) }} <small>V</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Max Cell Imbalance (Delta)</span>
            <span 
              class="metric-value-primary"
              :class="{
                'text-warning': summary.maxCellDelta >= 0.03 && summary.maxCellDelta < 0.05,
                'text-danger': summary.maxCellDelta >= 0.05
              }"
            >
              {{ (summary.maxCellDelta * 1000).toFixed(0) }} <small>mV</small>
            </span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Max Module Temperature</span>
            <span 
              class="metric-value-primary"
              :class="{ 'text-warning': summary.maxTemp >= 40 }"
            >
              {{ formatValue(summary.maxTemp, 1) }} <small>°C</small>
            </span>
          </div>
        </div>
      </div>

      <!-- CARD 2: Module Matrix Grid (88 Modules) -->
      <div class="card mb-6 p-6">
        <div class="section-header-row mb-4">
          <div class="section-header m-0 p-0" style="border: none;">
            <span class="section-title">BMS Rack Matrix (88 Modules)</span>
            <span class="text-xs text-muted ml-2">Select a module to view telemetry details and historical charts</span>
          </div>

          <!-- Matrix Filters -->
          <div class="matrix-filter-bar">
            <button 
              class="btn-filter" 
              :class="{ active: matrixFilter === 'all' }" 
              @click="matrixFilter = 'all'"
            >
              All ({{ modules.length }})
            </button>
            <button 
              class="btn-filter" 
              :class="{ active: matrixFilter === 'online' }" 
              @click="matrixFilter = 'online'"
            >
              Online ({{ summary.onlineCount }})
            </button>
            <button 
              class="btn-filter" 
              :class="{ active: matrixFilter === 'offline' }" 
              @click="matrixFilter = 'offline'"
            >
              Offline ({{ summary.offlineCount }})
            </button>
            <button 
              class="btn-filter btn-filter-warning" 
              :class="{ active: matrixFilter === 'warning' }" 
              @click="matrixFilter = 'warning'"
            >
              Attention ({{ warningModulesCount }})
            </button>
          </div>
        </div>

        <!-- 88-Tile Matrix Grid -->
        <div class="module-matrix-grid">
          <div 
            v-for="mod in filteredModules" 
            :key="mod.id" 
            class="matrix-tile"
            :class="{
              'tile-online': mod.online,
              'tile-offline': !mod.online,
              'tile-selected': selectedModule?.id === mod.id,
              'tile-warning': mod.online && (mod.cellDelta >= 0.04 || mod.tempModule >= 40)
            }"
            @click="selectModule(mod)"
          >
            <div class="tile-header">
              <span class="tile-id">#{{ mod.feederIndex }}</span>
              <span class="tile-dot" :class="getTileDotClass(mod)"></span>
            </div>
            
            <template v-if="mod.online">
              <div class="tile-soc">{{ formatValue(mod.soc, 0) }}%</div>
              <div class="tile-volts">{{ formatValue(mod.voltage, 1) }}V</div>
            </template>
            <template v-else>
              <div class="tile-offline-label">OFFLINE</div>
              <div class="tile-ip-suffix">.{{ mod.id }}</div>
            </template>
          </div>
        </div>
      </div>

      <!-- CARD 3: Selected Module Telemetry Detail -->
      <div v-if="selectedModule" id="bms-module-detail" class="card mb-6 p-6 selected-module-card">
        <div class="section-header-row mb-6">
          <div class="section-header m-0 p-0" style="border: none;">
            <span class="section-title">
              Telemetry Details: {{ selectedModule.moduleName }} (Feeder {{ feederParam }} - BMS #{{ selectedModule.feederIndex }})
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-muted font-mono">IP: {{ selectedModule.ip }}</span>
            <span class="status-badge" :class="selectedModule.online ? 'bg-success' : 'bg-warning'">
              {{ selectedModule.online ? 'OPERATING' : 'OFFLINE' }}
            </span>
            <button 
              class="btn-close-detail" 
              @click="closeDetail" 
              title="Close Telemetry Details"
            >
              ✕ Close
            </button>
          </div>
        </div>

        <template v-if="selectedModule.online">
          <!-- Module Pack Metrics -->
          <div class="metrics-grid mb-6">
            <div class="metric-card">
              <span class="metric-label">Pack Voltage</span>
              <span class="metric-value-primary">{{ formatValue(selectedModule.voltage, 2) }} <small>V</small></span>
            </div>
            <div class="metric-card">
              <span class="metric-label">State of Charge (SOC)</span>
              <div class="flex items-baseline justify-center gap-2">
                <span class="metric-value-primary">{{ formatValue(selectedModule.soc, 0) }} <small>%</small></span>
              </div>
              <div class="soc-progress-bar mt-2">
                <div 
                  class="soc-progress-fill" 
                  :style="{ width: `${Math.min(100, Math.max(0, selectedModule.soc))}%` }"
                ></div>
              </div>
            </div>
            <div class="metric-card">
              <span class="metric-label">State of Health (SOH)</span>
              <span class="metric-value-primary">{{ formatValue(selectedModule.soh, 0) }} <small>%</small></span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Capacity</span>
              <span class="metric-value-primary">{{ formatValueWithComma(selectedModule.capacity, 0) }} <small>mAh</small></span>
            </div>
          </div>

          <!-- Temperatures & Cell Balance Summary -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <!-- Temperatures Sub-Card -->
            <div class="sub-card">
              <h5 class="sub-card-title">Temperature Sensors</h5>
              <div class="values-grid" style="grid-template-columns: repeat(3, 1fr);">
                <div class="value-block">
                  <span class="value-label">Module</span>
                  <span class="value-number">{{ formatValue(selectedModule.tempModule, 1) }} <small>°C</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">Left Battery</span>
                  <span class="value-number">{{ formatValue(selectedModule.tempLeft, 1) }} <small>°C</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">Right Battery</span>
                  <span class="value-number">{{ formatValue(selectedModule.tempRight, 1) }} <small>°C</small></span>
                </div>
              </div>
            </div>

            <!-- Cell Balance Summary Sub-Card -->
            <div class="sub-card">
              <h5 class="sub-card-title">Cell Balance Statistics</h5>
              <div class="values-grid" style="grid-template-columns: repeat(3, 1fr);">
                <div class="value-block">
                  <span class="value-label">Min Cell Voltage</span>
                  <span class="value-number text-info">
                    {{ formatValue(selectedModule.cellMin, 3) }} <small>V</small>
                  </span>
                </div>
                <div class="value-block">
                  <span class="value-label">Max Cell Voltage</span>
                  <span class="value-number text-success">
                    {{ formatValue(selectedModule.cellMax, 3) }} <small>V</small>
                  </span>
                </div>
                <div class="value-block">
                  <span class="value-label">Cell Delta (Imbalance)</span>
                  <span 
                    class="value-number"
                    :class="{
                      'text-warning': selectedModule.cellDelta >= 0.03 && selectedModule.cellDelta < 0.05,
                      'text-danger': selectedModule.cellDelta >= 0.05
                    }"
                  >
                    {{ (selectedModule.cellDelta * 1000).toFixed(0) }} <small>mV</small>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 16-Cell Visualizer Grid -->
          <div class="detail-section">
            <div class="section-header-row mb-4">
              <div class="section-header m-0 p-0" style="border: none;">
                <span class="section-title">16-Cell Battery Visualizer (Cell 01 – 16)</span>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <span class="badge-legend badge-min">■ Min Cell: {{ formatValue(selectedModule.cellMin, 3) }}V</span>
                <span class="badge-legend badge-max">■ Max Cell: {{ formatValue(selectedModule.cellMax, 3) }}V</span>
              </div>
            </div>

            <div class="cell-bars-grid">
              <div 
                v-for="(cellVal, cIdx) in selectedModule.cells" 
                :key="cIdx"
                class="cell-bar-card"
                :class="{
                  'cell-is-min': cellVal !== null && cellVal === selectedModule.cellMin,
                  'cell-is-max': cellVal !== null && cellVal === selectedModule.cellMax
                }"
              >
                <div class="cell-card-top">
                  <span class="cell-num">C{{ String(cIdx + 1).padStart(2, '0') }}</span>
                  <span class="cell-val">{{ cellVal !== null ? formatValue(cellVal, 3) : '-' }} <small>V</small></span>
                </div>
                <!-- Relative height bar (based on 3.0V to 3.6V scale) -->
                <div class="cell-gauge-track">
                  <div 
                    class="cell-gauge-fill" 
                    :style="{ width: getCellGaugePercent(cellVal) }"
                    :class="{
                      'fill-min': cellVal === selectedModule.cellMin,
                      'fill-max': cellVal === selectedModule.cellMax
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="text-center py-8 text-muted">
            <p>This module is currently offline or under maintenance (no Modbus TCP response).</p>
          </div>
        </template>
      </div>

      <!-- CARD 4: Historical Chart & Analytics -->
      <div v-if="selectedModule && selectedModule.online" class="card p-6">
        <!-- Chart Controls -->
        <div class="chart-controls mb-6">
          <!-- Parameter Selector -->
          <div class="flex items-center gap-4">
            <label class="text-sm text-gray-600">Parameter:</label>
            <select v-model="activeChartField" class="param-select" @change="fetchHistory">
              <optgroup label="Pack Level">
                <option value="soc">State of Charge (SOC)</option>
                <option value="voltage">Pack Voltage</option>
                <option value="cell_delta">Cell Delta / Imbalance</option>
                <option value="temp_module">Module Temperature</option>
                <option value="temp_battery_left">Left Battery Temperature</option>
                <option value="temp_battery_right">Right Battery Temperature</option>
              </optgroup>
              <optgroup label="Battery Cell Level">
                <option value="all-cells">16 Cells Comparison (Multi-Line)</option>
                <option value="cell-summary">Min vs Max vs Average Cell</option>
              </optgroup>
            </select>
          </div>

          <!-- Time Range + Export -->
          <div class="chart-actions">
            <select v-model="timeRange" class="range-select" @change="onTimeRangeChange">
              <option v-for="r in timeRanges" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
            <button class="btn-export" @click="exportCSV" :disabled="isExporting" title="Export CSV Data Raw">
              <span v-if="isExporting">Exporting Raw...</span>
              <span v-else>Export CSV</span>
            </button>
          </div>
        </div>

        <!-- Custom Date Range (shown when 'custom' selected) -->
        <div v-if="timeRange === 'custom'" class="custom-range-picker mb-4">
          <div class="flex items-center gap-4 flex-wrap">
            <div class="date-input-group">
              <label class="text-sm text-gray-600">From:</label>
              <input type="datetime-local" v-model="customStart" class="date-input" />
            </div>
            <div class="date-input-group">
              <label class="text-sm text-gray-600">To:</label>
              <input type="datetime-local" v-model="customStop" class="date-input" />
            </div>
            <button class="btn-apply" @click="fetchHistory">Apply</button>
          </div>
        </div>

        <!-- Chart Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-700 font-medium m-0">
            {{ currentChartConfig.label }} {{ currentChartConfig.unit ? `(${currentChartConfig.unit})` : '' }} — {{ selectedModule.moduleName }}
          </h3>
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
            <span v-if="chartStats.minTime" class="stat-time">{{ chartStats.minTime }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Max</span>
            <span class="stat-value">{{ chartStats.max }}</span>
            <span v-if="chartStats.maxTime" class="stat-time">{{ chartStats.maxTime }}</span>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '~/composables/useTheme'
import LineChart from '~/components/LineChart.client.vue'

const route = useRoute()
const { isDark } = useTheme()

// State
const loading = ref(true)
const historyLoading = ref(false)
const error = ref(null)
const currentDate = ref('')
const isExporting = ref(false)

const feederParam = computed(() => route.params.feeder === '2' ? '2' : '1')

const summary = ref({
    feeder: 1,
    totalModules: 88,
    onlineCount: 0,
    offlineCount: 88,
    avgSoc: 0,
    avgSoh: 0,
    avgVoltage: 0,
    maxTemp: 0,
    maxCellDelta: 0,
    latestUpdate: null
})

const modules = ref([])
const selectedModuleId = ref(null)
const matrixFilter = ref('all') // 'all' | 'online' | 'offline' | 'warning'

// Selected Module (only populated when user selects a module)
const selectedModule = computed(() => {
    if (!modules.value.length || !selectedModuleId.value) return null
    return modules.value.find(m => m.id === selectedModuleId.value) || null
})

const selectModule = (mod) => {
    if (selectedModuleId.value === mod.id) {
        selectedModuleId.value = null
        historyData.value = []
        return
    }
    selectedModuleId.value = mod.id
    if (mod.online) {
        fetchHistory()
    } else {
        historyData.value = []
    }
    nextTick(() => {
        const el = document.getElementById('bms-module-detail')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
}

const closeDetail = () => {
    selectedModuleId.value = null
    historyData.value = []
}

// Matrix filtering
const warningModulesCount = computed(() => {
    return modules.value.filter(m => m.online && (m.cellDelta >= 0.04 || m.tempModule >= 40)).length
})

const filteredModules = computed(() => {
    if (matrixFilter.value === 'online') {
        return modules.value.filter(m => m.online)
    }
    if (matrixFilter.value === 'offline') {
        return modules.value.filter(m => !m.online)
    }
    if (matrixFilter.value === 'warning') {
        return modules.value.filter(m => m.online && (m.cellDelta >= 0.04 || m.tempModule >= 40))
    }
    return modules.value
})

const getTileDotClass = (mod) => {
    if (!mod.online) return 'dot-offline'
    if (mod.cellDelta >= 0.04 || mod.tempModule >= 40) return 'dot-warning'
    return 'dot-online'
}

const getCellGaugePercent = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return '0%'
    // Lithium iron phosphate typical operating range: 3.0V (0%) to 3.5V (100%)
    const pct = ((val - 3.0) / (3.5 - 3.0)) * 100
    return `${Math.min(100, Math.max(5, pct))}%`
}

// Chart Configuration
const activeChartField = ref('soc')
const timeRange = ref('-30m')
const customStart = ref('')
const customStop = ref('')
const historyData = ref([])
const rawTimestamps = ref([])

const timeRanges = [
    { value: '-5m', label: '5 Minutes' },
    { value: '-15m', label: '15 Minutes' },
    { value: '-30m', label: '30 Minutes' },
    { value: '-1h', label: '1 Hour' },
    { value: '-6h', label: '6 Hours' },
    { value: '-1d', label: '1 Day' },
    { value: '-7d', label: '7 Days' },
    { value: 'custom', label: 'Custom...' }
]

const chartFieldMap = {
    'soc': { label: 'State of Charge (SOC)', unit: '%', field: 'soc', color: '#10b981', isMulti: false },
    'voltage': { label: 'Pack Voltage', unit: 'V', field: 'voltage', color: '#3b82f6', isMulti: false },
    'cell_delta': { label: 'Cell Delta Imbalance', unit: 'V', field: 'cell_delta', color: '#f59e0b', isMulti: false },
    'temp_module': { label: 'Module Temperature', unit: '°C', field: 'temp_module', color: '#ef4444', isMulti: false },
    'temp_battery_left': { label: 'Left Battery Temperature', unit: '°C', field: 'temp_battery_left', color: '#8b5cf6', isMulti: false },
    'temp_battery_right': { label: 'Right Battery Temperature', unit: '°C', field: 'temp_battery_right', color: '#ec4899', isMulti: false },
    'all-cells': {
        label: '16-Cell Battery Voltages',
        unit: 'V',
        isMulti: true,
        fields: Array.from({ length: 16 }, (_, i) => `v_cell_${String(i + 1).padStart(2, '0')}`),
        colors: [
            '#ef4444', '#f97316', '#f59e0b', '#eab308',
            '#84cc16', '#22c55e', '#10b981', '#14b8a6',
            '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
            '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
        ]
    },
    'cell-summary': {
        label: 'Cell Voltage Summary (Min vs Max vs Avg)',
        unit: 'V',
        isMulti: true,
        fields: ['v_cell_min', 'v_cell_avg', 'v_cell_max'],
        colors: ['#06b6d4', '#10b981', '#f43f5e']
    }
}

const currentChartConfig = computed(() => chartFieldMap[activeChartField.value] || chartFieldMap['soc'])

// Realtime Data Fetching
const fetchRealtime = async () => {
    try {
        const data = await $fetch('/api/monitoring/bms/realtime', {
            params: { feeder: feederParam.value }
        })
        summary.value = data.summary
        modules.value = data.modules
        error.value = null
    } catch (err) {
        console.error('BMS Realtime Fetch Error:', err)
        error.value = 'Failed to fetch BMS realtime data'
    } finally {
        loading.value = false
    }
}

// History Data Fetching
const fetchHistory = async () => {
    if (!selectedModule.value || !selectedModule.value.online) return
    historyLoading.value = true
    try {
        const config = currentChartConfig.value
        let fieldParam = config.isMulti ? config.fields.join(',') : config.field

        const params = {
            ip: selectedModule.value.ip,
            field: fieldParam
        }

        if (timeRange.value === 'custom' && customStart.value && customStop.value) {
            params.start = new Date(customStart.value).toISOString()
            params.stop = new Date(customStop.value).toISOString()
        } else if (timeRange.value !== 'custom') {
            params.range = timeRange.value
        } else {
            return
        }

        const data = await $fetch('/api/monitoring/bms/history', { params })
        historyData.value = data || []
    } catch (err) {
        console.error('BMS History Fetch Error:', err)
    } finally {
        historyLoading.value = false
    }
}

const onTimeRangeChange = () => {
    if (timeRange.value !== 'custom') {
        fetchHistory()
    }
}

const refreshData = async () => {
    loading.value = true
    await fetchRealtime()
    if (selectedModule.value && selectedModule.value.online) {
        await fetchHistory()
    }
    loading.value = false
}

// Helpers
const updateDate = () => {
    const now = new Date()
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const day = now.getDate()
    const month = months[now.getMonth()]
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    currentDate.value = `${day} ${month} ${year} ${hours}:${minutes}:${seconds} (Local Time)`
}

const formatValue = (val, decimals = 0) => {
    if (typeof val !== 'number' || isNaN(val)) return '0'
    return val.toFixed(decimals)
}

const formatValueWithComma = (val, decimals = 0) => {
    if (typeof val !== 'number' || isNaN(val)) return '0'
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(val)
}

const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Multi-day and Date Formatting
const isMultiDay = computed(() => {
    const r = timeRange.value
    if (['-3d', '-7d', '-14d', '-30d'].includes(r)) return true
    if (r === 'custom' && customStart.value && customStop.value) {
        const diffMs = new Date(customStop.value) - new Date(customStart.value)
        return diffMs > 24 * 60 * 60 * 1000
    }
    return false
})

const formatLabelDate = (dStr) => {
    const date = new Date(dStr)
    if (isMultiDay.value) {
        const dayMonth = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        return `${dayMonth} ${time}`
    }
    let showSecs = false
    if (['-5m', '-15m', '-30m', '-1h'].includes(timeRange.value)) {
        showSecs = true
    } else if (timeRange.value === 'custom' && customStart.value && customStop.value) {
        const diffMs = new Date(customStop.value) - new Date(customStart.value)
        if (diffMs <= 60 * 60 * 1000) showSecs = true
    }
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: showSecs ? '2-digit' : undefined,
        hour12: false
    })
}

// Statistics Computation
const chartStats = computed(() => {
    if (!historyData.value || historyData.value.length === 0) return null
    const config = currentChartConfig.value
    if (!config) return null
    let decimals = config.unit === '%' ? 1 : (config.unit === 'V' ? 3 : 1)

    const formatStat = (val) => {
        if (typeof val !== 'number' || isNaN(val)) return '0'
        return val.toFixed(decimals)
    }

    const formatDateWithSeconds = (dStr) => {
        if (!dStr) return null
        const date = new Date(dStr)
        return date.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })
    }

    let validRecords = []
    if (config.isMulti) {
        validRecords = historyData.value.filter(d => config.fields.includes(d._field) && typeof d._value === 'number' && !isNaN(d._value))
    } else {
        validRecords = historyData.value.filter(d => typeof d._value === 'number' && !isNaN(d._value))
    }

    if (validRecords.length === 0) return null

    let minRec = validRecords[0]
    let maxRec = validRecords[0]
    let sum = 0

    validRecords.forEach(d => {
        sum += d._value
        if (d._value < minRec._value) minRec = d
        if (d._value > maxRec._value) maxRec = d
    })

    const avg = sum / validRecords.length

    return {
        min: formatStat(minRec._value),
        minTime: formatDateWithSeconds(minRec._time),
        max: formatStat(maxRec._value),
        maxTime: formatDateWithSeconds(maxRec._time),
        avg: formatStat(avg)
    }
})

const chartData = computed(() => {
    if (!historyData.value || historyData.value.length === 0) return null
    const config = currentChartConfig.value

    if (config.isMulti) {
        const timeMap = new Map()
        historyData.value.forEach(d => {
            if (!timeMap.has(d._time)) {
                timeMap.set(d._time, {})
            }
            timeMap.get(d._time)[d._field] = d._value
        })

        const sortedTimes = Array.from(timeMap.keys()).sort()
        rawTimestamps.value = sortedTimes
        const labels = sortedTimes.map(t => formatLabelDate(t))

        const datasets = config.fields.map((field, index) => ({
            label: field,
            data: sortedTimes.map(t => timeMap.get(t)[field] ?? null),
            borderColor: config.colors[index % config.colors.length],
            backgroundColor: 'transparent',
            fill: false,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6
        }))

        return { labels, datasets }
    } else {
        rawTimestamps.value = historyData.value.map(d => d._time)
        const labels = historyData.value.map(d => formatLabelDate(d._time))
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

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { 
            display: currentChartConfig.value?.isMulti || false,
            position: 'top',
            labels: {
                usePointStyle: true,
                padding: 15,
                color: isDark.value ? '#cbd5e1' : '#64748b',
                boxWidth: 8
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: isDark.value ? '#1e293b' : '#ffffff',
            titleColor: isDark.value ? '#f1f5f9' : '#1f2937',
            bodyColor: isDark.value ? '#cbd5e1' : '#4b5563',
            borderColor: isDark.value ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            callbacks: {
                title: (tooltipItems) => {
                    if (!tooltipItems || !tooltipItems.length) return ''
                    const idx = tooltipItems[0].dataIndex
                    const rawTime = rawTimestamps.value[idx]
                    if (rawTime) {
                        const date = new Date(rawTime)
                        let showSecs = false
                        if (['-5m', '-15m', '-30m', '-1h'].includes(timeRange.value)) {
                            showSecs = true
                        } else if (timeRange.value === 'custom' && customStart.value && customStop.value) {
                            const diffMs = new Date(customStop.value) - new Date(customStart.value)
                            if (diffMs <= 60 * 60 * 1000) showSecs = true
                        }
                        return date.toLocaleString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: showSecs ? '2-digit' : undefined,
                            hour12: false
                        })
                    }
                    return tooltipItems[0].label
                }
            }
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

// Export Raw CSV
const exportCSV = async () => {
    if (!selectedModule.value || !selectedModule.value.online) return
    isExporting.value = true
    try {
        const config = currentChartConfig.value
        let fieldParam = config.isMulti ? config.fields.join(',') : config.field

        const params = {
            ip: selectedModule.value.ip,
            field: fieldParam,
            raw: 'true'
        }

        if (timeRange.value === 'custom' && customStart.value && customStop.value) {
            params.start = new Date(customStart.value).toISOString()
            params.stop = new Date(customStop.value).toISOString()
        } else if (timeRange.value !== 'custom') {
            params.range = timeRange.value
        } else {
            alert('Please select a custom date range first.')
            return
        }

        const rawData = await $fetch('/api/monitoring/bms/history', { params })
        if (!rawData || rawData.length === 0) {
            alert('No raw data available to export for this time range.')
            return
        }

        const rows = [['Timestamp', 'Module', 'IP', 'Field', 'Value']]
        rawData.forEach(d => {
            const time = new Date(d._time).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })
            rows.push([`"${time}"`, `"${d.module || selectedModule.value.moduleName}"`, `"${d.ip || selectedModule.value.ip}"`, `"${d._field || ''}"`, d._value])
        })

        const csvContent = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `BMS_${selectedModule.value.moduleName}_${config.label.replace(/[^a-zA-Z0-9_-]/g, '_')}_RAW_${timeRange.value}.csv`)
        link.click()

        URL.revokeObjectURL(url)
    } catch (err) {
        console.error('Export CSV Error:', err)
        alert('Failed to export raw CSV data.')
    } finally {
        isExporting.value = false
    }
}

// Watchers
watch(feederParam, () => {
    selectedModuleId.value = null
    refreshData()
})

// Lifecycle
onMounted(() => {
    updateDate()
    refreshData()
    const dateInterval = setInterval(updateDate, 1000)
    const realtimeInterval = setInterval(fetchRealtime, 15000)
    const historyInterval = setInterval(fetchHistory, 30000)

    onUnmounted(() => {
        clearInterval(dateInterval)
        clearInterval(realtimeInterval)
        clearInterval(historyInterval)
    })
})
</script>

<style scoped>
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
    height: 60vh;
    width: 100%;
    text-align: center;
}

/* Header & Navigation Styles matching plts */
.page-header { display: flex; flex-direction: column; width: 100%; }
.header-top-row { display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 1rem; }
.header-left-group { display: flex; align-items: center; gap: var(--space-4); }
.header-date-mobile { display: none; }
.btn-back { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); text-decoration: none; font-weight: 500; transition: color 0.2s; }
.btn-back:hover { color: var(--primary-600); }
.divider-vertical { width: 1px; background-color: var(--border-color); height: 1.5rem; }

.status-badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.bg-success { background-color: var(--success); color: white; }
.bg-warning { background-color: var(--warning); color: #1f2937; }
.bg-danger { background-color: #ef4444; color: white; }
.bg-info { background-color: #0284c7; color: white; }

.text-info { color: #0284c7; }
.text-warning { color: var(--warning); }
.text-danger { color: #ef4444; }
.text-success { color: var(--success); }

/* Feeder Toggle Bar */
.feeder-toggle-bar {
    display: inline-flex;
    background: var(--bg-hover);
    padding: 0.25rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    gap: 0.25rem;
}

.btn-feeder-tab {
    padding: 0.35rem 0.85rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-muted);
    background: transparent;
    border: none;
    border-radius: calc(var(--radius-md) - 2px);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
}

.btn-feeder-tab:hover {
    color: var(--text-main);
    background: rgba(0, 0, 0, 0.05);
}

.btn-feeder-tab.active {
    color: var(--primary-600);
    background: var(--bg-card);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 5 Columns for BMS Summary */
.metrics-grid-5 {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--space-4);
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
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

/* Section Header */
.section-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.section-title {
    font-weight: 700;
    color: var(--text-main);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-title::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    background-color: var(--primary-500);
    border-radius: 2px;
}

/* Matrix Filters */
.matrix-filter-bar {
    display: inline-flex;
    background: var(--bg-hover);
    padding: 0.2rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    gap: 0.25rem;
}

.btn-filter {
    padding: 0.25rem 0.65rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    background: transparent;
    border: none;
    border-radius: calc(var(--radius-md) - 2px);
    cursor: pointer;
    transition: all 0.15s;
}

.btn-filter.active {
    color: var(--text-main);
    background: var(--bg-card);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

/* Module Matrix 88 Tiles */
.module-matrix-grid {
    display: grid;
    grid-template-columns: repeat(11, 1fr);
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.matrix-tile {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    user-select: none;
    position: relative;
}

.matrix-tile:hover {
    border-color: var(--primary-400);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tile-selected {
    border-color: var(--primary-500) !important;
    background: var(--bg-hover) !important;
    box-shadow: 0 0 0 2px rgba(57, 148, 176, 0.3) !important;
}

.tile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.15rem;
}

.tile-id {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-main);
}

.tile-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.dot-online { background-color: var(--success); }
.dot-offline { background-color: var(--gray-400); }
.dot-warning { background-color: var(--warning); box-shadow: 0 0 4px var(--warning); }

.tile-soc {
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--primary-600);
    line-height: 1.1;
}

.tile-volts {
    font-size: 0.65rem;
    color: var(--text-muted);
}

.tile-offline {
    opacity: 0.6;
    background: var(--bg-hover);
}

.tile-offline-label {
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: 0.05em;
}

.tile-ip-suffix {
    font-size: 0.65rem;
    color: var(--text-muted);
}

.tile-warning {
    border-color: var(--warning);
}

/* Selected Module Card & SOC Progress */
.selected-module-card {
    border-top: 3px solid var(--primary-500);
}

.soc-progress-bar {
    width: 100%;
    height: 6px;
    background: var(--border-color);
    border-radius: 999px;
    overflow: hidden;
}

.soc-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #06b6d4);
    border-radius: 999px;
    transition: width 0.3s ease;
}

.sub-card {
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    padding: var(--space-4);
}

.sub-card-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-main);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-3);
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--border-color);
}

.values-grid {
    display: grid;
    gap: var(--space-3);
}

.value-block {
    text-align: center;
}

.value-label {
    display: block;
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-bottom: 0.2rem;
    text-transform: uppercase;
}

.value-number {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-main);
}

.value-number small {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--text-muted);
}

.detail-section {
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    padding: var(--space-4);
}

/* 16 Cell Bars Grid */
.cell-bars-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.75rem;
}

.cell-bar-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 0.5rem;
    text-align: center;
    transition: all 0.15s ease;
}

.cell-bar-card:hover {
    border-color: var(--primary-400);
}

.cell-card-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.35rem;
}

.cell-num {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-muted);
}

.cell-val {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-main);
}

.cell-val small {
    font-size: 0.65rem;
    font-weight: 400;
    color: var(--text-muted);
}

.cell-gauge-track {
    width: 100%;
    height: 4px;
    background: var(--border-color);
    border-radius: 999px;
    overflow: hidden;
}

.cell-gauge-fill {
    height: 100%;
    background-color: var(--primary-500);
    border-radius: 999px;
    transition: width 0.3s;
}

.cell-is-min {
    border-color: #06b6d4;
    background: rgba(6, 182, 212, 0.05);
}

.cell-is-min .cell-num { color: #06b6d4; }
.fill-min { background-color: #06b6d4 !important; }

.cell-is-max {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
}

.cell-is-max .cell-num { color: #10b981; }
.fill-max { background-color: #10b981 !important; }

.badge-legend {
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
}
.badge-min { color: #06b6d4; background: rgba(6, 182, 212, 0.1); }
.badge-max { color: #10b981; background: rgba(16, 185, 129, 0.1); }

/* Chart Controls */
.chart-controls { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; }
.chart-actions { display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; }
.param-select { padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid var(--border-color); background: var(--bg-input); font-size: 0.875rem; color: var(--text-main); cursor: pointer; min-width: 180px; }
.range-select { padding: 0.4rem 0.75rem; border-radius: 0.375rem; border: 1px solid var(--border-color); background: var(--bg-input); font-size: 0.8rem; color: var(--text-main); cursor: pointer; }
.btn-export {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.45rem 0.85rem;
    border-radius: 0.375rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #ffffff;
    background: #2563eb;
    border: 1px solid #3b82f6;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-export:hover:not(:disabled) {
    background: #1d4ed8;
    border-color: #60a5fa;
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(29, 78, 216, 0.4);
}

.btn-export:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
}

.btn-export:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.chart-wrapper { height: 350px; width: 100%; margin-top: 1rem; }

/* Stats Bar */
.stats-bar { display: flex; justify-content: center; gap: 3rem; padding: var(--space-4); background: var(--bg-hover); border-radius: var(--radius-md); }
.stat-item { text-align: center; }
.stat-label { display: block; font-size: 0.7rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: 0.25rem; }
.stat-value { font-family: monospace; font-size: 1.125rem; font-weight: 600; color: var(--text-main); }
.stat-time {
    display: block;
    font-size: 0.68rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
    font-weight: 400;
}

/* Custom Range */
.custom-range-picker { padding: var(--space-4); background: var(--bg-hover); border-radius: var(--radius-md); }
.date-input-group { display: flex; align-items: center; gap: 0.5rem; }
.date-input { padding: 0.4rem 0.75rem; border-radius: 0.375rem; border: 1px solid var(--border-color); background: var(--bg-input); font-size: 0.8rem; color: var(--text-main); }
.btn-apply {
    padding: 0.5rem 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: #ffffff;
    background: #2563eb;
    border: 1px solid #3b82f6;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-apply:hover {
    background: #1d4ed8;
    border-color: #60a5fa;
    box-shadow: 0 4px 10px rgba(29, 78, 216, 0.5);
    transform: translateY(-1px);
}

.btn-close-detail {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-close-detail:hover {
    color: #ef4444;
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
}

/* Responsiveness */
@media (max-width: 1024px) {
    .metrics-grid-5 { grid-template-columns: repeat(3, 1fr); }
    .module-matrix-grid { grid-template-columns: repeat(8, 1fr); }
    .cell-bars-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 768px) {
    .header-date-desktop { display: none; }
    .header-date-mobile { display: block; }
    .metrics-grid-5 { grid-template-columns: repeat(2, 1fr); }
    .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    .module-matrix-grid { grid-template-columns: repeat(4, 1fr); }
    .cell-bars-grid { grid-template-columns: repeat(2, 1fr); }
    .stats-grid { grid-template-columns: 1fr; }
}
</style>
