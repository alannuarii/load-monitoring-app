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
          <h1 class="page-title m-0">Inverter Feeder {{ feederParam }}</h1>
        </div>
        
        <!-- Feeder Switcher & Date/Time Display (Desktop) -->
        <div class="flex items-center gap-4">
          <div class="feeder-toggle-bar">
            <NuxtLink 
              to="/plts/inverter/1" 
              class="btn-feeder-tab" 
              :class="{ active: feederParam === '1' }"
            >
              Feeder 1
            </NuxtLink>
            <NuxtLink 
              to="/plts/inverter/2" 
              class="btn-feeder-tab" 
              :class="{ active: feederParam === '2' }"
            >
              Feeder 2
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
    <div v-if="loading && !inverters.length" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <p class="mt-4 text-muted">Loading Inverter Telemetry...</p>
    </div>

    <template v-else>
      <!-- CARD 1: Feeder Summary Metrics -->
      <div class="card mb-6 p-6">
        <div class="section-header-row mb-6">
          <div class="section-header m-0 p-0" style="border: none;">
            <span class="section-title">Inverter Feeder Summary - Feeder {{ feederParam }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="status-badge" :class="summary.onlineCount > 0 ? 'bg-success' : 'bg-danger'">
              {{ summary.onlineCount }} / {{ summary.totalInverters }} ONLINE
            </span>
          </div>
        </div>

        <!-- Metrics Grid (3 Columns) -->
        <div class="metrics-grid-3 mb-2">
          <div class="metric-card">
            <span class="metric-label">Total AC Active Power</span>
            <span class="metric-value-primary">{{ formatValue(summary.totalActivePower, 2) }} <small>kW</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Total DC Power</span>
            <span class="metric-value-primary">{{ formatValue(summary.totalDcPower, 2) }} <small>kW</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Total Reactive Power</span>
            <span class="metric-value-primary">{{ formatValue(summary.totalReactivePower, 2) }} <small>kvar</small></span>
          </div>
        </div>
      </div>

      <!-- CARD 2: Inverter Matrix Grid -->
      <div class="card mb-6 p-6">
        <div class="section-header-row mb-4">
          <div class="section-header m-0 p-0" style="border: none;">
            <span class="section-title">Inverter Matrix ({{ inverters.length }} Units)</span>
            <span class="text-xs text-muted ml-2">Click an inverter tile to view full telemetry and historical charts</span>
          </div>

          <!-- Matrix Filters -->
          <div class="matrix-filter-bar">
            <button 
              class="btn-filter" 
              :class="{ active: matrixFilter === 'all' }" 
              @click="matrixFilter = 'all'"
            >
              All ({{ inverters.length }})
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
              class="btn-filter btn-filter-success" 
              :class="{ active: matrixFilter === 'running' }" 
              @click="matrixFilter = 'running'"
            >
              Running ({{ summary.runningCount }})
            </button>
            <button 
              v-if="summary.faultCount > 0"
              class="btn-filter btn-filter-danger" 
              :class="{ active: matrixFilter === 'fault' }" 
              @click="matrixFilter = 'fault'"
            >
              Fault ({{ summary.faultCount }})
            </button>
          </div>
        </div>

        <!-- Inverter Tiles Grid -->
        <div class="inverter-matrix-grid">
          <div 
            v-for="inv in filteredInverters" 
            :key="inv.id" 
            class="inverter-tile"
            :class="{
              'tile-online': inv.online,
              'tile-offline': !inv.online,
              'tile-selected': selectedInverterId === inv.id,
              'tile-running': inv.online && inv.is_running,
              'tile-fault': inv.online && inv.is_fault
            }"
            @click="selectInverter(inv)"
          >
            <div class="tile-header">
              <span class="tile-name">{{ inv.name }}</span>
              <span class="tile-dot" :class="getTileDotClass(inv)"></span>
            </div>
            
            <template v-if="inv.online">
              <div class="tile-power-row">
                <span class="tile-power-val">{{ formatValue(inv.p_ac, 1) }}</span>
                <span class="tile-power-unit">kW</span>
              </div>
              <div class="tile-status-tag" :class="inv.badgeClass">
                {{ inv.status }}
              </div>
              <div class="tile-subtext">
                <span>DC: {{ formatValue(inv.p_dc, 1) }} kW</span>
                <span>Eff: {{ formatValue(inv.efficiency, 1) }}%</span>
              </div>
            </template>
            <template v-else>
              <div class="tile-offline-box">
                <span class="tile-offline-label">OFFLINE</span>
                <span class="tile-unit-info">ID #{{ inv.unit_id }} • {{ inv.gateway }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- CARD 3: Selected Inverter Telemetry Detail -->
      <div v-if="selectedInverter" id="inverter-detail" class="card mb-6 p-6 selected-inverter-card">
        <div class="section-header-row mb-6">
          <div class="section-header m-0 p-0" style="border: none;">
            <span class="section-title">
              Telemetry Details: {{ selectedInverter.name }} (Feeder {{ feederParam }} • String {{ selectedInverter.string }} • Modbus ID #{{ selectedInverter.unit_id }})
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-muted font-mono">Gateway: {{ selectedInverter.gateway }}:{{ selectedInverter.port }}</span>
            <span class="status-badge" :class="selectedInverter.badgeClass">
              {{ selectedInverter.status }}
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

        <!-- Offline Notice Banner if offline -->
        <div v-if="!selectedInverter.online" class="offline-banner mb-6 p-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-warning font-bold">⚠ OFFLINE</span>
            <span class="text-xs text-muted">Perangkat sedang offline atau dalam perbaikan. Menampilkan parameter terakhir dan grafik riwayat operasi.</span>
          </div>
          <span class="text-xs font-mono text-muted">ID: {{ selectedInverter.unit_id }} • {{ selectedInverter.gateway }}</span>
        </div>

        <!-- Top Telemetry Metrics (4 Cards) -->
        <div class="metrics-grid mb-6">
          <div class="metric-card">
            <span class="metric-label">AC Active Power (Pac)</span>
            <span class="metric-value-primary text-success">{{ formatValue(selectedInverter.p_ac, 2) }} <small>kW</small></span>
            <div class="progress-bar-track mt-2">
              <div 
                class="progress-bar-fill fill-green" 
                :style="{ width: `${Math.min(100, Math.max(0, (selectedInverter.p_ac / 110) * 100))}%` }"
              ></div>
            </div>
            <div class="text-xs text-muted mt-1 text-right">Rated: 110 kW</div>
          </div>

          <div class="metric-card">
            <span class="metric-label">DC Power (Pdc)</span>
            <span class="metric-value-primary text-info">{{ formatValue(selectedInverter.p_dc, 2) }} <small>kW</small></span>
            <div class="progress-bar-track mt-2">
              <div 
                class="progress-bar-fill fill-blue" 
                :style="{ width: `${Math.min(100, Math.max(0, (selectedInverter.p_dc / 115) * 100))}%` }"
              ></div>
            </div>
            <div class="text-xs text-muted mt-1 text-right">Estimated DC Input</div>
          </div>

          <div class="metric-card">
            <span class="metric-label">Inverter Efficiency</span>
            <span class="metric-value-primary">{{ formatValue(selectedInverter.efficiency, 1) }} <small>%</small></span>
            <div class="progress-bar-track mt-2">
              <div 
                class="progress-bar-fill fill-purple" 
                :style="{ width: `${Math.min(100, Math.max(0, selectedInverter.efficiency))}%` }"
              ></div>
            </div>
            <div class="text-xs text-muted mt-1 text-right">Peak: ~98.5%</div>
          </div>

          <div class="metric-card">
            <span class="metric-label">Power Factor</span>
            <span class="metric-value-primary">{{ formatValue(selectedInverter.power_factor, 3) }}</span>
            <div class="mt-2 flex justify-center">
              <span class="text-xs font-semibold" :class="selectedInverter.power_factor >= 0.95 ? 'text-success' : 'text-warning'">
                {{ selectedInverter.power_factor >= 0.95 ? 'Optimal (PF ≥ 0.95)' : 'Attention' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Electrical, Power Quality & Grid (3 Sub-Cards) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Voltages Sub-Card -->
          <div class="sub-card">
            <h5 class="sub-card-title">AC Voltage (Line to Line)</h5>
            <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
              <div class="value-block">
                <span class="value-label">Vab</span>
                <span class="value-number">{{ formatValue(selectedInverter.v_ab, 1) }} <small>V</small></span>
              </div>
              <div class="value-block">
                <span class="value-label">Vbc</span>
                <span class="value-number">{{ formatValue(selectedInverter.v_bc, 1) }} <small>V</small></span>
              </div>
              <div class="value-block">
                <span class="value-label">Vca</span>
                <span class="value-number">{{ formatValue(selectedInverter.v_ca, 1) }} <small>V</small></span>
              </div>
              <div class="value-block">
                <span class="value-label">Vavg</span>
                <span class="value-number text-info">{{ formatValue(selectedInverter.v_avg, 1) }} <small>V</small></span>
              </div>
            </div>
          </div>

          <!-- Currents Sub-Card -->
          <div class="sub-card">
            <h5 class="sub-card-title">AC Current (Phases)</h5>
            <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
              <div class="value-block">
                <span class="value-label">Ia</span>
                <span class="value-number">{{ formatValue(selectedInverter.i_a, 1) }} <small>A</small></span>
              </div>
              <div class="value-block">
                <span class="value-label">Ib</span>
                <span class="value-number">{{ formatValue(selectedInverter.i_b, 1) }} <small>A</small></span>
              </div>
              <div class="value-block">
                <span class="value-label">Ic</span>
                <span class="value-number">{{ formatValue(selectedInverter.i_c, 1) }} <small>A</small></span>
              </div>
              <div class="value-block">
                <span class="value-label">Iavg</span>
                <span class="value-number text-success">{{ formatValue(selectedInverter.i_avg, 1) }} <small>A</small></span>
              </div>
            </div>
          </div>

          <!-- Grid & Diagnostics Sub-Card -->
          <div class="sub-card">
            <h5 class="sub-card-title">Grid & Operating Status</h5>
            <div class="values-grid" style="grid-template-columns: repeat(3, 1fr);">
              <div class="value-block">
                <span class="value-label">Frequency</span>
                <span class="value-number">{{ formatValue(selectedInverter.frequency, 2) }} <small>Hz</small></span>
              </div>
              <div class="value-block">
                <span class="value-label">Qac</span>
                <span class="value-number">{{ formatValue(selectedInverter.q_ac, 2) }} <small>kvar</small></span>
              </div>
              <div class="value-block">
                <span class="value-label">Status Code</span>
                <span class="value-number font-mono text-sm">{{ selectedInverter.status_code }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Temperatures Sub-Card -->
        <div class="sub-card mb-2">
          <h5 class="sub-card-title">Inverter Temperature Sensors</h5>
          <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
            <div class="value-block">
              <span class="value-label">Heatsink</span>
              <span 
                class="value-number"
                :class="{ 'text-warning': selectedInverter.temp_heatsink >= 60, 'text-danger': selectedInverter.temp_heatsink >= 75 }"
              >
                {{ formatValue(selectedInverter.temp_heatsink, 1) }} <small>°C</small>
              </span>
            </div>
            <div class="value-block">
              <span class="value-label">Ambient</span>
              <span class="value-number">{{ formatValue(selectedInverter.temp_ambient, 1) }} <small>°C</small></span>
            </div>
            <div class="value-block">
              <span class="value-label">Power Module</span>
              <span 
                class="value-number"
                :class="{ 'text-warning': selectedInverter.temp_module >= 60, 'text-danger': selectedInverter.temp_module >= 75 }"
              >
                {{ formatValue(selectedInverter.temp_module, 1) }} <small>°C</small>
              </span>
            </div>
            <div class="value-block">
              <span class="value-label">Internal</span>
              <span class="value-number">{{ formatValue(selectedInverter.temp_internal, 1) }} <small>°C</small></span>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD 4: Historical Chart & Analytics -->
      <div v-if="selectedInverter" class="card p-6">
        <!-- Chart Controls -->
        <div class="chart-controls mb-6">
          <!-- Parameter Selector -->
          <div class="flex items-center gap-4">
            <label class="text-sm text-gray-600 font-medium">Parameter:</label>
            <select v-model="activeChartField" class="param-select" @change="fetchHistory">
              <optgroup label="Power & Energy">
                <option value="p_ac">AC Active Power (Pac)</option>
                <option value="p_dc">DC Power (Pdc)</option>
                <option value="power_compare">AC vs DC Power Comparison</option>
                <option value="q_ac">AC Reactive Power (Qac)</option>
                <option value="efficiency">Efficiency (%)</option>
                <option value="power_factor">Power Factor (cos φ)</option>
              </optgroup>
              <optgroup label="Electrical Parameters">
                <option value="voltages">Line-to-Line Voltages (Vab, Vbc, Vca)</option>
                <option value="currents">Phase Currents (Ia, Ib, Ic)</option>
                <option value="frequency">Grid Frequency (Hz)</option>
              </optgroup>
              <optgroup label="Thermal Parameters">
                <option value="temps">All Temperature Sensors (Multi-Line)</option>
                <option value="temp_heatsink">Heatsink Temperature</option>
                <option value="temp_ambient">Ambient Temperature</option>
                <option value="temp_module">Module Temperature</option>
                <option value="temp_internal">Internal Temperature</option>
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
            {{ currentChartConfig.label }} {{ currentChartConfig.unit ? `(${currentChartConfig.unit})` : '' }} — {{ selectedInverter.name }}
          </h3>
        </div>

        <!-- Chart Area -->
        <div class="chart-wrapper">
          <div v-if="historyLoading" class="flex justify-center items-center h-full text-muted">
            <div class="spinner mr-2"></div> Loading Chart...
          </div>
          <LineChart v-else-if="chartData && historyData.length" :chart-data="chartData" :chart-options="chartOptions" />
          <div v-else class="flex flex-col justify-center items-center h-full text-muted py-8 text-center">
            <p class="m-0 font-medium">No historical telemetry recorded for {{ currentChartConfig.label }} in this time range.</p>
            <span class="text-xs text-muted mt-1">Try selecting a different parameter or a wider time range (e.g. 1 Day or 7 Days).</span>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
    totalInverters: 5,
    onlineCount: 0,
    offlineCount: 5,
    runningCount: 0,
    faultCount: 0,
    totalActivePower: 0,
    totalDcPower: 0,
    totalReactivePower: 0,
    avgEfficiency: 0,
    avgPowerFactor: 0,
    maxTemp: 0,
    latestUpdate: null
})

const inverters = ref([])
const selectedInverterId = ref(null)
const matrixFilter = ref('all') // 'all' | 'online' | 'offline' | 'running' | 'fault'

// Selected Inverter computed
const selectedInverter = computed(() => {
    if (!inverters.value.length || !selectedInverterId.value) return null
    return inverters.value.find(inv => inv.id === selectedInverterId.value) || null
})

const selectInverter = (inv) => {
    if (selectedInverterId.value === inv.id) {
        selectedInverterId.value = null
        historyData.value = []
        return
    }
    selectedInverterId.value = inv.id
    fetchHistory()
    nextTick(() => {
        const el = document.getElementById('inverter-detail')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
}

const closeDetail = () => {
    selectedInverterId.value = null
    historyData.value = []
}

// Matrix filtering
const filteredInverters = computed(() => {
    if (matrixFilter.value === 'online') {
        return inverters.value.filter(inv => inv.online)
    }
    if (matrixFilter.value === 'offline') {
        return inverters.value.filter(inv => !inv.online)
    }
    if (matrixFilter.value === 'running') {
        return inverters.value.filter(inv => inv.online && inv.is_running)
    }
    if (matrixFilter.value === 'fault') {
        return inverters.value.filter(inv => inv.online && inv.is_fault)
    }
    return inverters.value
})

const getTileDotClass = (inv) => {
    if (!inv.online) return 'dot-offline'
    if (inv.is_fault) return 'dot-danger'
    if (inv.is_running) return 'dot-online'
    return 'dot-warning'
}

// Chart Configuration
const activeChartField = ref('p_ac')
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
    'p_ac': { label: 'AC Active Power', unit: 'kW', field: 'p_ac', color: '#10b981', isMulti: false },
    'p_dc': { label: 'DC Power', unit: 'kW', field: 'p_dc', color: '#3b82f6', isMulti: false },
    'power_compare': {
        label: 'AC vs DC Power Comparison',
        unit: 'kW',
        isMulti: true,
        fields: ['p_ac', 'p_dc'],
        colors: ['#10b981', '#3b82f6']
    },
    'q_ac': { label: 'AC Reactive Power', unit: 'kvar', field: 'q_ac', color: '#f59e0b', isMulti: false },
    'efficiency': { label: 'Inverter Efficiency', unit: '%', field: 'efficiency', color: '#8b5cf6', isMulti: false },
    'power_factor': { label: 'Power Factor', unit: '', field: 'power_factor', color: '#06b6d4', isMulti: false },
    'voltages': {
        label: 'Line-to-Line Voltages',
        unit: 'V',
        isMulti: true,
        fields: ['v_ab', 'v_bc', 'v_ca'],
        colors: ['#ef4444', '#f59e0b', '#06b6d4']
    },
    'currents': {
        label: 'Phase Currents',
        unit: 'A',
        isMulti: true,
        fields: ['i_a', 'i_b', 'i_c'],
        colors: ['#f43f5e', '#10b981', '#3b82f6']
    },
    'frequency': { label: 'Grid Frequency', unit: 'Hz', field: 'frequency', color: '#ec4899', isMulti: false },
    'temps': {
        label: 'Temperatures Comparison',
        unit: '°C',
        isMulti: true,
        fields: ['temp_heatsink', 'temp_ambient', 'temp_module', 'temp_internal'],
        colors: ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6']
    },
    'temp_heatsink': { label: 'Heatsink Temperature', unit: '°C', field: 'temp_heatsink', color: '#ef4444', isMulti: false },
    'temp_ambient': { label: 'Ambient Temperature', unit: '°C', field: 'temp_ambient', color: '#f59e0b', isMulti: false },
    'temp_module': { label: 'Module Temperature', unit: '°C', field: 'temp_module', color: '#10b981', isMulti: false },
    'temp_internal': { label: 'Internal Temperature', unit: '°C', field: 'temp_internal', color: '#8b5cf6', isMulti: false }
}

const currentChartConfig = computed(() => chartFieldMap[activeChartField.value] || chartFieldMap['p_ac'])

// Realtime Data Fetching
const fetchRealtime = async () => {
    try {
        const data = await $fetch('/api/monitoring/inverter/realtime', {
            params: { feeder: feederParam.value }
        })
        summary.value = data.summary
        inverters.value = data.inverters
        error.value = null
    } catch (err) {
        console.error('Inverter Realtime Fetch Error:', err)
        error.value = 'Failed to fetch Inverter realtime data'
    } finally {
        loading.value = false
    }
}

// History Data Fetching
const fetchHistory = async () => {
    if (!selectedInverter.value) return
    historyLoading.value = true
    try {
        const config = currentChartConfig.value
        let fieldParam = config.isMulti ? config.fields.join(',') : config.field

        const params = {
            inverter: selectedInverter.value.name,
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

        const data = await $fetch('/api/monitoring/inverter/history', { params })
        historyData.value = data || []
    } catch (err) {
        console.error('Inverter History Fetch Error:', err)
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
    if (selectedInverter.value) {
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
    let decimals = config.unit === '%' ? 1 : (config.unit === 'kW' || config.unit === 'kvar' ? 2 : (config.unit === 'V' || config.unit === 'A' ? 1 : 2))

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
                    gradient.addColorStop(0, hexToRgba(color, 0.35))
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
    if (!selectedInverter.value) return
    isExporting.value = true
    try {
        const config = currentChartConfig.value
        let fieldParam = config.isMulti ? config.fields.join(',') : config.field

        const params = {
            inverter: selectedInverter.value.name,
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

        const rawData = await $fetch('/api/monitoring/inverter/history', { params })
        if (!rawData || rawData.length === 0) {
            alert('No raw data available to export for this time range.')
            return
        }

        const rows = [['Timestamp', 'Inverter', 'Feeder', 'String', 'Unit ID', 'Field', 'Value']]
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
            rows.push([
                `"${time}"`, 
                `"${d.inverter || selectedInverter.value.name}"`, 
                `"${feederParam.value}"`,
                `"${d.string || selectedInverter.value.string}"`,
                `"${d.unit_id || selectedInverter.value.unit_id}"`,
                `"${d._field || ''}"`, 
                d._value
            ])
        })

        const csvContent = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `Inverter_${selectedInverter.value.name}_${config.label.replace(/[^a-zA-Z0-9_-]/g, '_')}_RAW_${timeRange.value}.csv`)
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
    selectedInverterId.value = null
    refreshData()
})

// Lifecycle
onMounted(() => {
    updateDate()
    refreshData()
    const dateInterval = setInterval(updateDate, 1000)
    const realtimeInterval = setInterval(fetchRealtime, 5000)
    const historyInterval = setInterval(fetchHistory, 15000)

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
.bg-muted { background-color: var(--bg-hover); color: var(--text-muted); border: 1px solid var(--border-color); }

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

/* 3 Columns for Inverter Summary */
.metrics-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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

.btn-filter-success.active {
    color: #10b981;
}

.btn-filter-danger.active {
    color: #ef4444;
}

/* Inverter Matrix Grid */
.inverter-matrix-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.inverter-tile {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0.75rem 0.85rem;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    user-select: none;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.inverter-tile:hover {
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
}

.tile-name {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-main);
}

.tile-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.dot-online { background-color: var(--success); box-shadow: 0 0 4px var(--success); }
.dot-offline { background-color: var(--gray-400); }
.dot-warning { background-color: var(--warning); box-shadow: 0 0 4px var(--warning); }
.dot-danger { background-color: #ef4444; box-shadow: 0 0 4px #ef4444; }

.tile-power-row {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.25rem;
    text-align: center;
}

.tile-power-val {
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--text-main);
    line-height: 1.1;
}

.tile-power-unit {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
}

.tile-status-tag {
    display: inline-block;
    align-self: center;
    margin: 0 auto;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: fit-content;
    text-align: center;
}

.tile-subtext {
    display: flex;
    justify-content: space-between;
    font-size: 0.68rem;
    color: var(--text-muted);
    font-weight: 500;
    margin-top: 0.2rem;
    border-top: 1px dashed var(--border-color);
    padding-top: 0.35rem;
}

.tile-offline {
    opacity: 0.7;
    background: var(--bg-hover);
}

.tile-offline-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 0;
    gap: 0.25rem;
}

.tile-offline-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: 0.05em;
}

.tile-unit-info {
    font-size: 0.65rem;
    color: var(--text-muted);
    font-family: monospace;
}

/* Selected Inverter Card */
.selected-inverter-card {
    border-top: 3px solid var(--primary-500);
}

.progress-bar-track {
    width: 100%;
    height: 5px;
    background: var(--border-color);
    border-radius: 999px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease;
}

.fill-green { background: linear-gradient(90deg, #10b981, #059669); }
.fill-blue { background: linear-gradient(90deg, #3b82f6, #0284c7); }
.fill-purple { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }

.offline-banner {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: var(--radius-md);
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

/* Chart Controls */
.chart-controls { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; }
.chart-actions { display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; }
.param-select { padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid var(--border-color); background: var(--bg-input); font-size: 0.875rem; color: var(--text-main); cursor: pointer; min-width: 220px; }
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
@media (max-width: 1200px) {
    .inverter-matrix-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
    .header-date-desktop { display: none; }
    .header-date-mobile { display: block; }
    .metrics-grid-3 { grid-template-columns: 1fr; }
    .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    .inverter-matrix-grid { grid-template-columns: repeat(2, 1fr); }
    .stats-bar { gap: 1.5rem; }
}

@media (max-width: 480px) {
    .inverter-matrix-grid { grid-template-columns: 1fr; }
}
</style>
