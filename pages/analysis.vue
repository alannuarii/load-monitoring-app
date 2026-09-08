<template>
  <div class="animate-fade-in container analysis-page">
    <!-- Page Title -->
    <div class="analysis-title-row">
      <div>
        <h1 class="page-title">Advanced Analysis</h1>
        <p class="page-subtitle">Cross-Data Comparison &amp; Reporting</p>
      </div>
    </div>

    <!-- Top Control Bar -->
    <div class="card control-bar">
      <!-- Row 1: Mode + Time Range + Apply -->
      <div class="control-row">
        <div class="control-group">
          <label class="ctrl-label">Mode</label>
          <div class="mode-toggle">
            <button class="mode-btn" :class="{ active: mode === 'PLTD' }" @click="mode = 'PLTD'; seriesList = []">PLTD</button>
            <button class="mode-btn" :class="{ active: mode === 'PLTS' }" @click="mode = 'PLTS'; seriesList = []">PLTS</button>
          </div>
        </div>

        <div class="control-group">
          <label class="ctrl-label">Time Range</label>
          <select v-model="timeRange" class="form-control">
            <option value="-1h">Last 1 Hour</option>
            <option value="-6h">Last 6 Hours</option>
            <option value="-24h">Last 24 Hours</option>
            <option value="-7d">Last 7 Days</option>
            <option value="custom">Custom Date</option>
          </select>
        </div>

        <div v-if="timeRange === 'custom'" class="control-group">
          <label class="ctrl-label">Start</label>
          <input type="datetime-local" v-model="customStart" class="form-control" />
        </div>
        <div v-if="timeRange === 'custom'" class="control-group">
          <label class="ctrl-label">End</label>
          <input type="datetime-local" v-model="customStop" class="form-control" />
        </div>

        <div class="control-group control-group-action">
          <button class="btn btn-primary" @click="fetchData" :disabled="loading || seriesList.length === 0">
            <span v-if="loading" class="spinner-sm"></span>
            {{ loading ? 'Loading...' : '▶ Fetch Data' }}
          </button>
        </div>
      </div>

      <!-- Row 2: Series chips -->
      <div class="series-row">
        <div class="series-row-label">
          <span class="ctrl-label" style="margin: 0;">Series</span>
          <span class="series-badge">{{ seriesList.length }} / 5</span>
        </div>

        <div class="series-chips">
          <div v-for="(series, index) in seriesList" :key="series.id" class="series-chip">
            <div class="chip-color" :style="{ backgroundColor: series.color }"></div>

            <!-- Unit / Source selector -->
            <select v-if="mode === 'PLTD'" v-model="series.unit" class="chip-select" @change="onUnitChange(series)">
              <option value="" disabled>Unit</option>
              <option value="1">Unit 1</option>
              <option value="6">Unit 6</option>
              <option value="7">Unit 7</option>
              <option value="8">Unit 8</option>
              <option value="9">Unit 9</option>
            </select>

            <select v-else-if="mode === 'PLTS'" v-model="series.unit" class="chip-select" @change="onUnitChange(series)">
              <option value="" disabled>Unit / Bagian</option>
              <option value="Combined-LVSW">Total LVSW</option>
              <option value="LVSW1">LVSW Feeder 1</option>
              <option value="LVSW2">LVSW Feeder 2</option>
              <option value="IT1">BSS Feeder 1</option>
              <option value="IT2">BSS Feeder 2</option>
              <option value="weather_station">Weather Station</option>
            </select>

            <!-- Parameter selector: Only appears once unit/bagian is chosen! -->
            <select 
              v-if="series.unit" 
              v-model="series.parameter" 
              class="chip-select chip-select-param" 
              @change="series.data = null"
            >
              <option value="" disabled>Parameter</option>
              
              <!-- PLTD: Unit 6 & 7 (DSE 8610 MKII & DSE 7310) -->
              <template v-if="mode === 'PLTD' && (series.unit === '6' || series.unit === '7')">
                <optgroup label="DSE 8610 MKII">
                  <option v-for="p in paramsDSE8610" :key="p.value" :value="p.value">{{ p.label }}</option>
                </optgroup>
                <optgroup label="DSE 7310">
                  <option v-for="p in paramsDSE7310" :key="p.value" :value="p.value">{{ p.label }}</option>
                </optgroup>
              </template>

              <!-- PLTD: Unit 1, 8, 9 (Power Meter only) -->
              <template v-else-if="mode === 'PLTD'">
                <optgroup label="Electrical (Power Meter)">
                  <option v-for="p in paramsUnit891" :key="p.value" :value="p.value">{{ p.label }}</option>
                </optgroup>
              </template>

              <!-- PLTS (By Selected Bagian/Feeder) -->
              <template v-else-if="mode === 'PLTS'">
                <option v-for="p in getPLTSParameters(series.unit)" :key="p.value" :value="p.value">
                  {{ p.label }}
                </option>
              </template>
            </select>

            <button class="chip-remove" @click="removeSeries(index)" title="Remove series">✕</button>
          </div>

          <button class="btn-add-series" @click="addSeries" :disabled="seriesList.length >= 5">+ Add Series</button>
        </div>
      </div>
    </div>

    <!-- Full-width Chart -->
    <div class="card chart-card">
      <div class="chart-top-bar">
        <h2 class="chart-title">Analysis Chart</h2>
        <div class="chart-actions">
          <div v-if="hasData" class="zoom-hint">
            <span>Drag to zoom · Scroll to zoom · Shift+Drag to pan</span>
          </div>
          <button v-if="hasData" class="btn-reset-zoom" @click="resetChartZoom" title="Reset Zoom">↩ Reset Zoom</button>
          <button class="btn-export" @click="exportCSV" :disabled="!hasData">Export CSV</button>
        </div>
      </div>

      <div class="chart-area">
        <div v-if="loading" class="chart-overlay">
          <div class="spinner"></div>
          <p style="margin-top: 1rem; color: var(--text-muted);">Fetching data from InfluxDB...</p>
        </div>

        <div v-if="!hasData && !loading" class="chart-empty">
          <span class="chart-empty-icon"></span>
          <p class="chart-empty-text">Add series above and click <strong>Fetch Data</strong> to display chart.</p>
        </div>

        <div v-if="hasData && !loading" class="chart-canvas-wrap">
          <LineChart ref="chartComponentRef" :chart-data="chartData" :chart-options="chartOptions" :chart-plugins="inlinePlugins" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Chart ref for reset zoom
const chartComponentRef = ref(null)

const resetChartZoom = () => {
  if (chartComponentRef.value) {
    chartComponentRef.value.resetZoom()
  }
}

// Crosshair vertical line plugin (inline)
const crosshairPlugin = {
  id: 'crosshairLine',
  afterDatasetsDraw(chart) {
    const active = chart.tooltip?.getActiveElements?.() || chart.tooltip?._active
    if (active && active.length > 0) {
      const activePoint = active[0]
      if (!activePoint?.element) return

      const ctx = chart.ctx
      const { top, bottom, left, right } = chart.chartArea
      const x = activePoint.element.x

      if (x < left || x > right) return

      ctx.save()
      ctx.beginPath()
      ctx.setLineDash([4, 4])
      ctx.moveTo(x, top)
      ctx.lineTo(x, bottom)
      ctx.lineWidth = 1.5
      ctx.strokeStyle = '#64748b'
      ctx.stroke()
      ctx.restore()
    }
  }
}

const inlinePlugins = [crosshairPlugin]

// State
const mode = ref('PLTD')
const timeRange = ref('-1h')
const customStart = ref('')
const customStop = ref('')
const seriesList = ref([])
const loading = ref(false)

const PALETTE = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e']

// Parameters for Unit 6 & 7 (PLTD DSE 8610 & DSE 7310)
const paramsDSE8610 = [
  { label: 'Active Power (kW)', value: 'pm|Active Power' },
  { label: 'Reactive Power (kVAR)', value: 'pm|Reactive Power' },
  { label: 'Power Factor', value: 'pm|Power Factor' },
  { label: 'Frequency (Hz)', value: 'pm|Frequency' },
  { label: 'Voltage L1-L2 (V)', value: 'pm|Voltage L1 L2' },
  { label: 'Voltage L2-L3 (V)', value: 'pm|Voltage L2 L3' },
  { label: 'Voltage L3-L1 (V)', value: 'pm|Voltage L3 L1' },
  { label: 'Voltage L1-N (V)', value: 'pm|Voltage L1 N' },
  { label: 'Voltage L2-N (V)', value: 'pm|Voltage L2 N' },
  { label: 'Voltage L3-N (V)', value: 'pm|Voltage L3 N' },
  { label: 'Current L1 (A)', value: 'pm|Current L1' },
  { label: 'Current L2 (A)', value: 'pm|Current L2' },
  { label: 'Current L3 (A)', value: 'pm|Current L3' },
  { label: 'Current Earth (A)', value: 'pm|Current Earth' },
  { label: 'Active Power L1 (kW)', value: 'pm|Active Power L1 kW' },
  { label: 'Active Power L2 (kW)', value: 'pm|Active Power L2 kW' },
  { label: 'Active Power L3 (kW)', value: 'pm|Active Power L3 kW' },
  { label: 'Reactive Power L1 (kVAR)', value: 'pm|Reactive Power L1 kVAr' },
  { label: 'Reactive Power L2 (kVAR)', value: 'pm|Reactive Power L2 kVAr' },
  { label: 'Reactive Power L3 (kVAR)', value: 'pm|Reactive Power L3 kVAr' },
  { label: 'Power Factor L1', value: 'pm|Power Factor L1' },
  { label: 'Power Factor L2', value: 'pm|Power Factor L2' },
  { label: 'Power Factor L3', value: 'pm|Power Factor L3' }
]

const paramsDSE7310 = [
  { label: 'Engine RPM', value: 'engine|Engine RPM' },
  { label: 'Oil Pressure (Bar)', value: 'engine|Oil Pressure' },
  { label: 'Coolant Temp (°C)', value: 'engine|Coolant Temp' },
  { label: 'Battery Voltage (V)', value: 'engine|Battery Voltage' },
  { label: 'Charge Alt (V)', value: 'engine|Charge Alt' },
  { label: 'Active Power (kW)', value: 'engine|Active Power' },
  { label: 'Reactive Power (kVAR)', value: 'engine|Reactive Power' },
  { label: 'Power Factor', value: 'engine|Power Factor' },
  { label: 'Frequency (Hz)', value: 'engine|Frequency' },
  { label: 'Voltage L1-L2 (V)', value: 'engine|Voltage L1 L2' },
  { label: 'Voltage L2-L3 (V)', value: 'engine|Voltage L2 L3' },
  { label: 'Voltage L3-L1 (V)', value: 'engine|Voltage L3 L1' },
  { label: 'Voltage L1-N (V)', value: 'engine|Voltage L1 N' },
  { label: 'Voltage L2-N (V)', value: 'engine|Voltage L2 N' },
  { label: 'Voltage L3-N (V)', value: 'engine|Voltage L3 N' },
  { label: 'Current L1 (A)', value: 'engine|Current L1' },
  { label: 'Current L2 (A)', value: 'engine|Current L2' },
  { label: 'Current L3 (A)', value: 'engine|Current L3' },
  { label: 'Current Earth (A)', value: 'engine|Current Earth' },
  { label: 'Active Power L1 (kW)', value: 'engine|Active Power L1 kW' },
  { label: 'Active Power L2 (kW)', value: 'engine|Active Power L2 kW' },
  { label: 'Active Power L3 (kW)', value: 'engine|Active Power L3 kW' },
  { label: 'Reactive Power L1 (kVAR)', value: 'engine|Reactive Power L1 kVAr' },
  { label: 'Reactive Power L2 (kVAR)', value: 'engine|Reactive Power L2 kVAr' },
  { label: 'Reactive Power L3 (kVAR)', value: 'engine|Reactive Power L3 kVAr' },
  { label: 'Power Factor L1', value: 'engine|Power Factor L1' },
  { label: 'Power Factor L2', value: 'engine|Power Factor L2' },
  { label: 'Power Factor L3', value: 'engine|Power Factor L3' }
]

// Parameters for Unit 8 & 9 and Unit 1 (PLTD PM 5350 / Power Meter)
const paramsUnit891 = [
  { label: 'Active Power (kW)', value: 'Active Power' },
  { label: 'Reactive Power (kVAR)', value: 'Reactive Power' },
  { label: 'Power Factor', value: 'Power Factor' },
  { label: 'Frequency (Hz)', value: 'Frequency' },
  { label: 'Voltage L1-L2 (V)', value: 'Voltage L1 L2' },
  { label: 'Voltage L2-L3 (V)', value: 'Voltage L2 L3' },
  { label: 'Voltage L3-L1 (V)', value: 'Voltage L3 L1' },
  { label: 'Voltage L1-N (V)', value: 'Voltage L1 N' },
  { label: 'Voltage L2-N (V)', value: 'Voltage L2 N' },
  { label: 'Voltage L3-N (V)', value: 'Voltage L3 N' },
  { label: 'Current L1 (A)', value: 'Current L1' },
  { label: 'Current L2 (A)', value: 'Current L2' },
  { label: 'Current L3 (A)', value: 'Current L3' },
  { label: 'Current Neutral (A)', value: 'Current Neutral' },
  { label: 'Active Power L1 (kW)', value: 'Active Power L1 kW' },
  { label: 'Active Power L2 (kW)', value: 'Active Power L2 kW' },
  { label: 'Active Power L3 (kW)', value: 'Active Power L3 kW' },
  { label: 'Reactive Power L1 (kVAR)', value: 'Reactive Power L1 kVAr' },
  { label: 'Reactive Power L2 (kVAR)', value: 'Reactive Power L2 kVAr' },
  { label: 'Reactive Power L3 (kVAR)', value: 'Reactive Power L3 kVAr' },
  { label: 'Power Factor L1', value: 'Power Factor L1' },
  { label: 'Power Factor L2', value: 'Power Factor L2' },
  { label: 'Power Factor L3', value: 'Power Factor L3' }
]

// Parameters for PLTS by Section
const pltsParamsMap = {
  'Combined-LVSW': [
    { label: 'Total Active Power (kW)', value: 'Active Power' },
    { label: 'Total Reactive Power (kVAR)', value: 'Reactive Power' }
  ],
  'LVSW1': [
    { label: 'Active Power (kW)', value: 'Active Power' },
    { label: 'Reactive Power (kVAR)', value: 'Reactive Power' },
    { label: 'Voltage (V)', value: 'Voltage' },
    { label: 'Current (A)', value: 'Current' },
    { label: 'Power Factor', value: 'Power Factor' },
    { label: 'Frequency (Hz)', value: 'Frequency' }
  ],
  'LVSW2': [
    { label: 'Active Power (kW)', value: 'Active Power' },
    { label: 'Reactive Power (kVAR)', value: 'Reactive Power' },
    { label: 'Voltage (V)', value: 'Voltage' },
    { label: 'Current (A)', value: 'Current' },
    { label: 'Power Factor', value: 'Power Factor' },
    { label: 'Frequency (Hz)', value: 'Frequency' }
  ],
  'IT1': [
    { label: 'Active Power (kW)', value: 'Active Power' },
    { label: 'Reactive Power (kVAR)', value: 'Reactive Power' },
    { label: 'Voltage (V)', value: 'Voltage' },
    { label: 'Current (A)', value: 'Current' },
    { label: 'Power Factor', value: 'Power Factor' },
    { label: 'Frequency (Hz)', value: 'Frequency' }
  ],
  'IT2': [
    { label: 'Active Power (kW)', value: 'Active Power' },
    { label: 'Reactive Power (kVAR)', value: 'Reactive Power' },
    { label: 'Voltage (V)', value: 'Voltage' },
    { label: 'Current (A)', value: 'Current' },
    { label: 'Power Factor', value: 'Power Factor' },
    { label: 'Frequency (Hz)', value: 'Frequency' }
  ],
  'weather_station': [
    { label: 'Global Irradiance (W/m²)', value: 'Global Irradiance' },
    { label: 'Air Temperature (°C)', value: 'Air Temperature' },
    { label: 'External Temperature (°C)', value: 'External Temperature' },
    { label: 'Wind Speed (m/s)', value: 'Wind Speed' },
    { label: 'Wind Direction (°)', value: 'Wind Direction' },
    { label: 'Relative Humidity (%)', value: 'Relative Humidity' }
  ]
}

const getPLTSParameters = (source) => {
  return pltsParamsMap[source] || []
}

const onUnitChange = (series) => {
  series.parameter = ''
  series.data = null
}

// Actions
const addSeries = () => {
  if (seriesList.value.length >= 5) return
  seriesList.value.push({
    id: Date.now().toString(),
    unit: '',
    parameter: '',
    color: PALETTE[seriesList.value.length % PALETTE.length],
    data: null
  })
}

const removeSeries = (index) => {
  seriesList.value.splice(index, 1)
}

const hasData = computed(() => {
  return seriesList.value.some(s => s.data && s.data.length > 0)
})

// Determine Y-Axis side based on parameter
const getAxisID = (param) => {
  if (!param) return 'yLeft'
  const cleanParam = param.includes('|') ? param.split('|')[1] : param
  const lower = cleanParam.toLowerCase()
  if (
    lower.includes('voltage') || 
    lower.includes('temp') || 
    lower.includes('rpm') || 
    lower.includes('irradiance') ||
    lower.includes('humidity') ||
    lower.includes('speed') ||
    lower.includes('direction') ||
    lower.includes('pressure') ||
    lower.includes('hours') ||
    lower.includes('count')
  ) {
    return 'yRight'
  }
  return 'yLeft'
}

const pltsSourceLabels = {
  'Combined-LVSW': 'Total LVSW',
  'LVSW1': 'LVSW 1',
  'LVSW2': 'LVSW 2',
  'IT1': 'BSS 1',
  'IT2': 'BSS 2',
  'weather_station': 'Weather'
}

const getSeriesLabel = (series) => {
  if (mode.value === 'PLTD') {
    let paramDisplay = series.parameter
    let sourceLabel = ''
    if (paramDisplay.includes('|')) {
      const parts = paramDisplay.split('|')
      paramDisplay = parts[1]
      sourceLabel = parts[0] === 'pm' ? ' (8610)' : ' (7310)'
    }
    return `Unit ${series.unit} - ${paramDisplay}${sourceLabel}`
  } else {
    const src = pltsSourceLabels[series.unit] || series.unit || 'PLTS'
    return `${src} - ${series.parameter}`
  }
}

const fetchData = async () => {
  const validSeries = seriesList.value.filter(s => s.unit && s.parameter)
  if (validSeries.length === 0) {
    alert(mode.value === 'PLTD' 
      ? 'Please select both Unit and Parameter for each series.' 
      : 'Please select both Unit/Bagian and Parameter for each series.')
    return
  }

  if (timeRange.value === 'custom' && (!customStart.value || !customStop.value)) {
    alert('Please specify both start and end times for custom range.')
    return
  }

  loading.value = true
  try {
    const promises = validSeries.map(async (series) => {
      let fieldStr = series.parameter
      let sourceOverride = null
      
      if (mode.value === 'PLTD' && fieldStr.includes('|')) {
        const parts = fieldStr.split('|')
        sourceOverride = parts[0]
        fieldStr = parts[1]
      }

      const params = {
        field: fieldStr,
        raw: 'false'
      }
      
      if (mode.value === 'PLTS') {
        params.source = series.unit
      } else if (sourceOverride) {
        params.source = sourceOverride
      }

      if (timeRange.value === 'custom') {
        params.start = new Date(customStart.value).toISOString()
        params.stop = new Date(customStop.value).toISOString()
      } else {
        params.range = timeRange.value
      }

      const endpoint = mode.value === 'PLTS' 
        ? `/api/monitoring/history/plts` 
        : `/api/monitoring/history/${series.unit}`

      const rawData = await $fetch(endpoint, { params }).catch(() => [])
      series.data = rawData
    })

    await Promise.all(promises)
  } catch (e) {
    console.error('Failed to fetch analysis data', e)
    alert('Failed to fetch some data.')
  } finally {
    loading.value = false
  }
}

// Helper to safely parse numbers
const parseVal = (v) => {
  if (v === null || v === undefined || v === '') return null
  const num = typeof v === 'number' ? v : parseFloat(v)
  return isNaN(num) ? null : num
}

// Synchronized time series data computation
const alignedData = computed(() => {
  const validSeries = seriesList.value.filter(s => s.data && s.data.length > 0)
  if (validSeries.length === 0) {
    return { timestamps: [], seriesPoints: [], isShortRange: false }
  }

  // 1. Build a Map<roundedMs, value> for each series (rounded to nearest second)
  const seriesMaps = validSeries.map(s => {
    const map = new Map()
    s.data.forEach(d => {
      const ms = new Date(d._time).getTime()
      if (isNaN(ms)) return
      const roundedMs = Math.round(ms / 1000) * 1000
      const val = parseVal(d._value)
      if (val !== null) {
        map.set(roundedMs, val)
      }
    })
    return map
  })

  // 2. Collect unique timestamps across all series
  const allTimesSet = new Set()
  seriesMaps.forEach(map => {
    for (const t of map.keys()) {
      allTimesSet.add(t)
    }
  })

  const sortedTimestamps = Array.from(allTimesSet).sort((a, b) => a - b)
  if (sortedTimestamps.length === 0) {
    return { timestamps: [], seriesPoints: [], isShortRange: false }
  }

  const minTime = sortedTimestamps[0]
  const maxTime = sortedTimestamps[sortedTimestamps.length - 1]
  const totalSpanMs = maxTime - minTime
  const isShortRange = totalSpanMs <= 2 * 3600 * 1000 // <= 2 hours

  // Estimate step size to determine max tolerance fill gap
  const avgStep = sortedTimestamps.length > 1 ? totalSpanMs / sortedTimestamps.length : 1000
  // For 1s-3s telemetry, maxFillGap is 6s so minor phase differences or 3s PM intervals stay aligned.
  // For aggregated 1m data (e.g. -6h), maxFillGap is 2 minutes.
  const maxFillGapMs = Math.max(6000, avgStep * 2)

  // 3. For each series, align values against sortedTimestamps with sample-and-hold within maxFillGapMs
  const seriesPoints = validSeries.map((s, idx) => {
    const map = seriesMaps[idx]
    let lastVal = null
    let lastTime = 0

    const points = sortedTimestamps.map(t => {
      if (map.has(t)) {
        lastVal = map.get(t)
        lastTime = t
        return lastVal
      } else if (lastVal !== null && (t - lastTime) <= maxFillGapMs) {
        return lastVal
      } else {
        lastVal = null
        return null
      }
    })

    return {
      series: s,
      points
    }
  })

  return {
    timestamps: sortedTimestamps,
    seriesPoints,
    isShortRange
  }
})

// Chart computation
const chartData = computed(() => {
  const { timestamps, seriesPoints, isShortRange } = alignedData.value
  if (!timestamps.length || !seriesPoints.length) {
    return { labels: [], datasets: [] }
  }

  const labels = timestamps.map(t => {
    const d = new Date(t)
    if (isShortRange) {
      return d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\./g, ':')
    } else {
      return d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\./g, ':')
    }
  })

  const datasets = seriesPoints.map(({ series, points }) => {
    const labelName = getSeriesLabel(series)

    return {
      label: labelName,
      data: points,
      borderColor: series.color,
      backgroundColor: series.color,
      yAxisID: getAxisID(series.parameter),
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 2,
      spanGaps: true
    }
  })

  return { labels, datasets }
})

const chartOptions = computed(() => {
  const needsLeft = seriesList.value.some(s => s.data && getAxisID(s.parameter) === 'yLeft')
  const needsRight = seriesList.value.some(s => s.data && getAxisID(s.parameter) === 'yRight')

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { family: "'Inter', sans-serif", size: 12 }
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: "'Inter', sans-serif", size: 13, weight: '600' },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        bodySpacing: 6,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          title: (items) => {
            if (!items.length) return ''
            const index = items[0].dataIndex
            const timeMs = alignedData.value.timestamps[index]
            if (!timeMs) return items[0].label
            const d = new Date(timeMs)
            return d.toLocaleString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }).replace(/\./g, ':')
          },
          label: (context) => {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (value === null || value === undefined) return null
            return ` ${label}: ${Number(value).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          }
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'shift'
        },
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          },
          drag: {
            enabled: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.4)',
            borderWidth: 1
          },
          mode: 'x'
        },
        limits: {
          x: { minRange: 5 }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(100, 116, 139, 0.2)',
          drawBorder: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          color: '#64748b',
          font: { family: "'Inter', sans-serif", size: 11 },
          maxTicksLimit: 14,
          autoSkip: true
        }
      },
      yLeft: {
        type: 'linear',
        display: needsLeft,
        position: 'left',
        title: {
          display: needsLeft,
          text: 'Values (kW, A, Hz, PF)',
          color: '#64748b',
          font: { family: "'Inter', sans-serif", size: 12 }
        },
        grid: {
          display: true,
          color: 'rgba(100, 116, 139, 0.2)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: { family: "'Inter', sans-serif", size: 11 }
        }
      },
      yRight: {
        type: 'linear',
        display: needsRight,
        position: 'right',
        title: {
          display: needsRight,
          text: 'Values (V, Temp, RPM, W/m²)',
          color: '#64748b',
          font: { family: "'Inter', sans-serif", size: 12 }
        },
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: '#64748b',
          font: { family: "'Inter', sans-serif", size: 11 }
        }
      }
    },
    interaction: {
      mode: 'index',
      axis: 'x',
      intersect: false
    },
    hover: {
      mode: 'index',
      intersect: false
    }
  }
})

const exportCSV = () => {
  const { timestamps, seriesPoints } = alignedData.value
  if (!timestamps.length || !seriesPoints.length) return

  const header = ['Timestamp']
  seriesPoints.forEach(({ series }) => {
    const name = getSeriesLabel(series)
    header.push(`"${name}"`)
  })

  const rows = [header.join(',')]

  timestamps.forEach((t, i) => {
    const date = new Date(t).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\./g, ':')

    const rowData = [`"${date}"`]
    seriesPoints.forEach(({ points }) => {
      const val = points[i]
      rowData.push(val !== null && val !== undefined ? val : '')
    })
    rows.push(rowData.join(','))
  })

  const csvContent = rows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Analysis_Export_${timeRange.value}.csv`)
  link.click()
  
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* ========== Page Layout ========== */
.analysis-page {
  padding: 1.25rem 1.5rem;
  max-width: 1600px;
  margin: 0 auto;
}

.analysis-title-row {
  margin-bottom: 1rem;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}
.page-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0.125rem 0 0 0;
}

/* ========== Shared Card ========== */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

/* ========== Top Control Bar ========== */
.control-bar {
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.control-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.control-group-action {
  margin-left: auto;
}

.ctrl-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.125rem;
}

/* Mode Toggle */
.mode-toggle {
  display: inline-flex;
  background: var(--bg-hover);
  padding: 0.1875rem;
  border-radius: var(--radius-md);
}
.mode-btn {
  padding: 0.3rem 0.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.3rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
  transition: all 0.15s;
  font-family: inherit;
}
.mode-btn.active {
  background: var(--bg-card);
  color: var(--primary-600);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* Form Controls */
.form-control {
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  color: var(--text-main);
  font-size: 0.8125rem;
  font-family: inherit;
  min-width: 150px;
}

/* (Fetch Button styles removed to use global .btn-primary) */

/* ========== Series Row ========== */
.series-row {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.series-row-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  flex-shrink: 0;
}
.series-badge {
  background: var(--primary-100);
  color: var(--primary-700);
  font-size: 0.6875rem;
  padding: 0.1rem 0.45rem;
  border-radius: 1rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.dark-mode .series-badge {
  background: rgba(56, 189, 248, 0.18);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.series-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  flex: 1;
}

.series-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.3rem 0.375rem 0.3rem 0.5rem;
}
.chip-color {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  flex-shrink: 0;
}
.chip-select {
  padding: 0.25rem 0.375rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 0.75rem;
  font-family: inherit;
  min-width: 70px;
}
.chip-select-param {
  min-width: 140px;
}
.chip-remove {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0 0.25rem;
  line-height: 1;
}
.chip-remove:hover {
  color: var(--danger);
}

.btn-add-series {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  background: transparent;
  color: var(--primary-600);
  border: 1px dashed var(--primary-600);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  white-space: nowrap;
}
.btn-add-series:hover:not(:disabled) {
  background: rgba(2, 132, 199, 0.06);
}
.btn-add-series:disabled { opacity: 0.45; cursor: not-allowed; }

/* ========== Full-Width Chart Card ========== */
.chart-card {
  display: flex;
  flex-direction: column;
}
.chart-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}
.chart-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}
.chart-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.zoom-hint {
  font-size: 0.6875rem;
  color: var(--text-muted);
  opacity: 0.7;
}

.btn-reset-zoom {
  padding: 0.25rem 0.625rem;
  background: transparent;
  color: var(--info, #06b6d4);
  border: 1px solid var(--info, #06b6d4);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.btn-reset-zoom:hover {
  background: var(--info, #06b6d4);
  color: #fff;
}

.btn-export {
  padding: 0.3rem 0.75rem;
  background: transparent;
  color: var(--success);
  border: 1px solid var(--success);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.btn-export:hover:not(:disabled) {
  background: var(--success);
  color: #fff;
}
.btn-export:disabled { opacity: 0.45; cursor: not-allowed; }

/* Chart Area */
.chart-area {
  position: relative;
  padding: 1rem 1.25rem;
  min-height: 480px;
}

.chart-canvas-wrap {
  width: 100%;
  height: 460px;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--text-muted);
}
.chart-empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  opacity: 0.6;
}
.chart-empty-text {
  font-size: 0.875rem;
}

.chart-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(2px);
  z-index: 10;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
.dark-mode .chart-overlay {
  background: rgba(30, 41, 59, 0.6);
}

/* Spinners */
.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(0,0,0,0.1);
  border-top-color: var(--primary-600);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.spinner-sm {
  display: inline-block;
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== Responsive ========== */
@media (max-width: 768px) {
  .control-row {
    flex-direction: column;
    align-items: stretch;
  }
  .control-group-action {
    margin-left: 0;
  }
  .series-row {
    flex-direction: column;
  }
}
</style>
