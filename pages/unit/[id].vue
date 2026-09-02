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

        <!-- Row 2: Total Power & Energy Metrics -->
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

        <!-- Row 3: Phase Power Details -->
        <div class="detail-section mb-6">
          <div class="section-header">
            <span class="icon-box">🔌</span>
            <span class="section-title">Phase Power Details</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
            <!-- Phase L1 -->
            <div style="background: var(--bg-hover, #f8f9fa); border: 1px solid var(--border-color, #e5e7eb); padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <h4 style="text-align: center; font-size: 0.875rem; font-weight: 700; color: inherit; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color, #e5e7eb); padding-bottom: 0.5rem;">Phase L1</h4>
              <div class="values-grid">
                <div class="value-block">
                  <span class="value-label">Active</span>
                  <span class="value-number">{{ formatValue(getValue('Active Power L1 kW'), 0) }} <small>kW</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">Reactive</span>
                  <span class="value-number">{{ formatValue(getValue('Reactive Power L1 kVAr'), 0) }} <small>kVAR</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">PF</span>
                  <span class="value-number">{{ formatValue(getValue('Power Factor L1'), 2) }}</span>
                </div>
              </div>
            </div>
            <!-- Phase L2 -->
            <div style="background: var(--bg-hover, #f8f9fa); border: 1px solid var(--border-color, #e5e7eb); padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <h4 style="text-align: center; font-size: 0.875rem; font-weight: 700; color: inherit; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color, #e5e7eb); padding-bottom: 0.5rem;">Phase L2</h4>
              <div class="values-grid">
                <div class="value-block">
                  <span class="value-label">Active</span>
                  <span class="value-number">{{ formatValue(getValue('Active Power L2 kW'), 0) }} <small>kW</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">Reactive</span>
                  <span class="value-number">{{ formatValue(getValue('Reactive Power L2 kVAr'), 0) }} <small>kVAR</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">PF</span>
                  <span class="value-number">{{ formatValue(getValue('Power Factor L2'), 2) }}</span>
                </div>
              </div>
            </div>
            <!-- Phase L3 -->
            <div style="background: var(--bg-hover, #f8f9fa); border: 1px solid var(--border-color, #e5e7eb); padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <h4 style="text-align: center; font-size: 0.875rem; font-weight: 700; color: inherit; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color, #e5e7eb); padding-bottom: 0.5rem;">Phase L3</h4>
              <div class="values-grid">
                <div class="value-block">
                  <span class="value-label">Active</span>
                  <span class="value-number">{{ formatValue(getValue('Active Power L3 kW'), 0) }} <small>kW</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">Reactive</span>
                  <span class="value-number">{{ formatValue(getValue('Reactive Power L3 kVAr'), 0) }} <small>kVAR</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">PF</span>
                  <span class="value-number">{{ formatValue(getValue('Power Factor L3'), 2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 4: Voltage Generator -->
        <div class="detail-section mb-6">
          <div class="section-header">
            <span class="icon-box">⚡</span>
            <span class="section-title">Voltage Generator</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
            <div style="background: var(--bg-hover, #f8f9fa); border: 1px solid var(--border-color, #e5e7eb); padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <h4 style="text-align: center; font-size: 0.875rem; font-weight: 700; color: inherit; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color, #e5e7eb); padding-bottom: 0.5rem;">Line to Line (L-L)</h4>
              <div class="values-grid" style="grid-template-columns: repeat(2, 1fr);">
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
                <div class="value-block">
                  <span class="value-label">Average L-L</span>
                  <span class="value-number">{{ formatValue(getValue('Voltage L L Avg'), 0) }} <small>V</small></span>
                </div>
              </div>
            </div>
            
            <div style="background: var(--bg-hover, #f8f9fa); border: 1px solid var(--border-color, #e5e7eb); padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <h4 style="text-align: center; font-size: 0.875rem; font-weight: 700; color: inherit; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color, #e5e7eb); padding-bottom: 0.5rem;">Line to Neutral (L-N)</h4>
              <div class="values-grid" style="grid-template-columns: repeat(2, 1fr);">
                <div class="value-block">
                  <span class="value-label">L1-N</span>
                  <span class="value-number">{{ formatValue(getValue('Voltage L1 N'), 0) }} <small>V</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">L2-N</span>
                  <span class="value-number">{{ formatValue(getValue('Voltage L2 N'), 0) }} <small>V</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">L3-N</span>
                  <span class="value-number">{{ formatValue(getValue('Voltage L3 N'), 0) }} <small>V</small></span>
                </div>
                <div class="value-block">
                  <span class="value-label">Average L-N</span>
                  <span class="value-number">{{ formatValue(getValue('Voltage L N Avg'), 0) }} <small>V</small></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 5: Current & System -->
        <div class="detail-section mb-6">
          <div class="section-header">
            <span class="icon-box">🌊</span>
            <span class="section-title">Current & System</span>
          </div>
          <div class="values-grid" style="grid-template-columns: repeat(3, 1fr);">
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
            <div class="value-block">
              <span class="value-label">Average</span>
              <span class="value-number">{{ formatValue(getValue('Current Avg'), 0) }} <small>A</small></span>
            </div>
            <div class="value-block">
              <span class="value-label">{{ (unitId === '8' || unitId === '9') ? 'Neutral Current' : 'Earth Current' }}</span>
              <span class="value-number">{{ formatValue((unitId === '8' || unitId === '9') ? getValue('Current Neutral') : getValue('Current Earth'), 0) }} <small>A</small></span>
            </div>
          </div>
        </div>

        <!-- Row 6: Power Quality -->
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

        <!-- Row 6: Engine Parameters (Only for Unit 6 & 7) -->
        <div v-if="unitId === '6' || unitId === '7'" class="detail-section mt-4">
          <div class="section-header mb-4">
            <span class="icon-box">⚙️</span>
            <span class="section-title">Engine Parameters</span>
          </div>
          <div class="engine-grid">
            <div class="engine-metric">
              <span class="metric-label">Oil Pressure</span>
              <div class="pq-value-row">
                <span class="metric-value">{{ oilPressureStatus.value }} <small>Bar</small></span>
                <span class="pq-status-badge" :class="oilPressureStatus.class">{{ oilPressureStatus.status }}</span>
              </div>
              <div class="pq-threshold">Batas: &gt; 4.0 (Good), 1.5-4.0 (Warning), &lt; 1.5 (Shutdown)</div>
            </div>
            <div class="engine-metric">
              <span class="metric-label">Coolant Temperature</span>
              <div class="pq-value-row">
                <span class="metric-value">{{ coolantTempStatus.value }} <small>°C</small></span>
                <span class="pq-status-badge" :class="coolantTempStatus.class">{{ coolantTempStatus.status }}</span>
              </div>
              <div class="pq-threshold">Batas: &lt; 95 (Good), 95-98 (Warning), &gt; 98 (Shutdown)</div>
            </div>
            <div class="engine-metric">
              <span class="metric-label">Charge Alternator</span>
              <div class="pq-value-row">
                <span class="metric-value">{{ chargeAltStatus.value }} <small>V</small></span>
                <span class="pq-status-badge" :class="chargeAltStatus.class">{{ chargeAltStatus.status }}</span>
              </div>
              <div class="pq-threshold">Batas: &gt; 19.2 (Good), &lt; 19.2 (Warning)</div>
            </div>
            <div class="engine-metric">
              <span class="metric-label">Battery Voltage</span>
              <div class="pq-value-row">
                <span class="metric-value">{{ batteryVoltStatus.value }} <small>V</small></span>
                <span class="pq-status-badge" :class="batteryVoltStatus.class">{{ batteryVoltStatus.status }}</span>
              </div>
              <div class="pq-threshold">Batas: 18.0-31.2 (Good), &lt;18.0 / &gt;31.2 (Warning)</div>
            </div>
            <div class="engine-metric engine-metric-full">
              <span class="metric-label">Engine RPM</span>
              <div class="pq-value-row">
                <span class="metric-value">{{ engineRpmStatus.value }} <small>RPM</small></span>
                <span class="pq-status-badge" :class="engineRpmStatus.class">{{ engineRpmStatus.status }}</span>
              </div>
              <div class="pq-threshold">Batas: 1200-1650 (Good), 900-1200 / 1650-1725 (Warning)</div>
            </div>
          </div>
        </div>


        <!-- Row 7: Engine Statistics & Accumulation (Only for Unit 6 & 7) -->
        <div v-if="unitId === '6' || unitId === '7'" class="detail-section mt-4">
          <div class="section-header mb-4">
            <span class="icon-box">📊</span>
            <span class="section-title">Engine Statistics & Accumulation</span>
          </div>
          <div class="engine-grid">
            <!-- Engine Run Time -->
            <div class="engine-metric">
              <span class="metric-label">Engine Run Time</span>
              <span class="metric-value">{{ formatValueWithComma(getValue('Engine Run Time Hours'), 1) }} <small>Hours</small></span>
            </div>
            
            <!-- Energy Active -->
            <div class="engine-metric">
              <span class="metric-label">Total Energy Active</span>
              <span class="metric-value">{{ formatValueWithComma(getValue('Energy Active kWh'), 0) }} <small>kWh</small></span>
            </div>
            
            <!-- Energy Reactive -->
            <div class="engine-metric">
              <span class="metric-label">Total Energy Reactive</span>
              <span class="metric-value">{{ formatValueWithComma(getValue('Energy Reactive kVARh'), 0) }} <small>kVARh</small></span>
            </div>
            
            <!-- Start Count -->
            <div class="engine-metric">
              <span class="metric-label">Engine Start Count</span>
              <span class="metric-value">{{ formatValueWithComma(getValue('Start Count'), 0) }} <small>Times</small></span>
            </div>
          </div>
        </div>

        <!-- Row: Engine Parameters (Calculated for Unit 8 & 9) -->
        <div v-if="unitId === '8' || unitId === '9'" class="detail-section mt-4">
          <div class="section-header mb-4">
            <span class="icon-box">⚙️</span>
            <span class="section-title">Engine Parameters (Calculated)</span>
          </div>
          <div class="engine-grid" style="grid-template-columns: 1fr;">
            <div class="engine-metric">
              <span class="metric-label">Engine RPM</span>
              <div class="pq-value-row justify-center">
                <span class="metric-value">{{ formatValue(getValue('Frequency') * 30, 0) }} <small>RPM</small></span>
              </div>
              <div class="pq-threshold text-center mt-2">Batas: Mengikuti Frekuensi Grid (Frekuensi × 30)</div>
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
              <!-- FOR UNIT 6 & 7 (DSE 8610 MKII & DSE 7310 ENGINE) -->
              <optgroup label="DSE 8610 MKII (PM-DG)" v-if="unitId === '6' || unitId === '7'">
                <option value="pm-active-power">Active Power</option>
                <option value="pm-reactive-power">Reactive Power</option>
                <option value="pm-power-factor">Power Factor</option>
                <option value="pm-all-currents">All Currents</option>
                <option value="pm-all-voltages">All Voltages (L-L)</option>
                <option value="pm-frequency">Frequency</option>
              </optgroup>
              
              <optgroup label="DSE 7310 (ENGINE-DG)" v-if="unitId === '6' || unitId === '7'">
                <option value="en-active-power-total">Active Power (Total)</option>
                <option value="en-active-power-phases">Phase Active Powers</option>
                <option value="en-reactive-power-total">Reactive Power (Total)</option>
                <option value="en-reactive-power-phases">Phase Reactive Powers</option>
                <option value="en-power-factor-total">Power Factor (Total)</option>
                <option value="en-power-factor-phases">Phase Power Factors</option>
                <option value="en-all-currents">All Currents</option>
                <option value="en-current-earth">Current Earth</option>
                <option value="en-all-voltages">All Voltages (L-L)</option>
                <option value="en-all-voltages-ln">All Voltages (L-N)</option>
                <option value="en-frequency">Frequency</option>
                <option value="en-engine-rpm">Engine RPM</option>
                <option value="en-oil-pressure">Oil Pressure</option>
                <option value="en-coolant-temp">Coolant Temp</option>
                <option value="en-battery-voltage">Battery Voltage</option>
                <option value="en-charge-alt">Charge Alt</option>
              </optgroup>

              <!-- FOR UNIT 8 & 9 (PM 5350) -->
              <optgroup label="PM 5350 (PM-DG)" v-if="unitId === '8' || unitId === '9'">
                <option value="pm5-active-power-total">Active Power (Total)</option>
                <option value="pm5-active-power-phases">Phase Active Powers</option>
                <option value="pm5-reactive-power-total">Reactive Power (Total)</option>
                <option value="pm5-reactive-power-phases">Phase Reactive Powers</option>
                <option value="pm5-power-factor-total">Power Factor (Total)</option>
                <option value="pm5-power-factor-phases">Phase Power Factors</option>
                <option value="pm5-all-currents">All Currents</option>
                <option value="pm5-current-neutral">Current Neutral</option>
                <option value="pm5-current-avg">Current Avg</option>
                <option value="pm5-all-voltages">All Voltages (L-L)</option>
                <option value="pm5-voltage-ll-avg">Voltage L-L Avg</option>
                <option value="pm5-all-voltages-ln">All Voltages (L-N)</option>
                <option value="pm5-voltage-ln-avg">Voltage L-N Avg</option>
                <option value="pm5-frequency">Frequency</option>
              </optgroup>
            </select>
          </div>
          
          <!-- Time Range + Export -->
          <div class="chart-actions">
            <select v-model="timeRange" class="range-select" @change="onTimeRangeChange">
              <option v-for="r in timeRanges" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
            <button class="btn-export" @click="exportCSV" :disabled="isExporting" title="Export CSV Data Raw">
              <span v-if="isExporting">⏳ Exporting Raw...</span>
              <span v-else>📥 Export CSV</span>
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
const route = useRoute()
const unitId = route.params.id

// State
const realtimeData = ref([])
const historyData = ref([])
const loading = ref(true)
const error = ref(null)
const currentDate = ref('')
const activeTab = ref(unitId === '1' ? 'pm-active-power' : (unitId === '8' || unitId === '9' ? 'pm5-active-power-total' : 'en-active-power-total'))
const timeRange = ref('-1h')
const customStart = ref('')
const customStop = ref('')
const unitDowntime = ref(null)
const rawTimestamps = ref([])
const isExporting = ref(false)
const rawStats = ref(null)

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

const chartTabs = [
  // PM-DG (Unit 6, 7)
  { id: 'pm-active-power', label: 'Active Power (PM)', field: 'Active Power', unit: 'kW', color: '#0ea5e9', source: 'pm' },
  { id: 'pm-reactive-power', label: 'Reactive Power (PM)', field: 'Reactive Power', unit: 'kVAR', color: '#f97316', source: 'pm' },
  { id: 'pm-power-factor', label: 'Power Factor (PM)', field: 'Power Factor', unit: '', color: '#14b8a6', source: 'pm' },
  { id: 'pm-all-currents', label: 'All Currents (PM)', fields: ['Current L1', 'Current L2', 'Current L3'], unit: 'A', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true, source: 'pm' },
  { id: 'pm-all-voltages', label: 'All Voltages L-L (PM)', fields: ['Voltage L1 L2', 'Voltage L2 L3', 'Voltage L3 L1'], unit: 'V', colors: ['#ef4444', '#eab308', '#06b6d4'], isMulti: true, source: 'pm' },
  { id: 'pm-frequency', label: 'Frequency (PM)', field: 'Frequency', unit: 'Hz', color: '#a855f7', source: 'pm' },

  // ENGINE-DG (Unit 6, 7)
  { id: 'en-active-power-total', label: 'Active Power (Total)', field: 'Active Power', unit: 'kW', color: '#0ea5e9', source: 'engine' },
  { id: 'en-active-power-phases', label: 'Phase Active Powers', fields: ['Active Power L1 kW', 'Active Power L2 kW', 'Active Power L3 kW'], unit: 'kW', colors: ['#ef4444', '#eab308', '#06b6d4'], isMulti: true, source: 'engine' },
  { id: 'en-reactive-power-total', label: 'Reactive Power (Total)', field: 'Reactive Power', unit: 'kVAR', color: '#f97316', source: 'engine' },
  { id: 'en-reactive-power-phases', label: 'Phase Reactive Powers', fields: ['Reactive Power L1 kVAr', 'Reactive Power L2 kVAr', 'Reactive Power L3 kVAr'], unit: 'kVAR', colors: ['#f43f5e', '#f59e0b', '#0ea5e9'], isMulti: true, source: 'engine' },
  { id: 'en-power-factor-total', label: 'Power Factor (Total)', field: 'Power Factor', unit: '', color: '#14b8a6', source: 'engine' },
  { id: 'en-power-factor-phases', label: 'Phase Power Factors', fields: ['Power Factor L1', 'Power Factor L2', 'Power Factor L3'], unit: '', colors: ['#10b981', '#3b82f6', '#8b5cf6'], isMulti: true, source: 'engine' },
  { id: 'en-all-currents', label: 'All Currents', fields: ['Current L1', 'Current L2', 'Current L3'], unit: 'A', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true, source: 'engine' },
  { id: 'en-current-earth', label: 'Current Earth', field: 'Current Earth', unit: 'A', color: '#8b5cf6', source: 'engine' },
  { id: 'en-all-voltages', label: 'All Voltages (L-L)', fields: ['Voltage L1 L2', 'Voltage L2 L3', 'Voltage L3 L1'], unit: 'V', colors: ['#ef4444', '#eab308', '#06b6d4'], isMulti: true, source: 'engine' },
  { id: 'en-all-voltages-ln', label: 'All Voltages (L-N)', fields: ['Voltage L1 N', 'Voltage L2 N', 'Voltage L3 N'], unit: 'V', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true, source: 'engine' },
  { id: 'en-frequency', label: 'Frequency', field: 'Frequency', unit: 'Hz', color: '#a855f7', source: 'engine' },
  { id: 'en-engine-rpm', label: 'Engine RPM', field: 'Engine RPM', unit: 'RPM', color: '#8b5cf6', source: 'engine' },
  { id: 'en-oil-pressure', label: 'Oil Pressure', field: 'Oil Pressure', unit: 'Bar', color: '#eab308', source: 'engine' },
  { id: 'en-coolant-temp', label: 'Coolant Temp', field: 'Coolant Temp', unit: '°C', color: '#ef4444', source: 'engine' },
  { id: 'en-battery-voltage', label: 'Battery Voltage', field: 'Battery Voltage', unit: 'V', color: '#3b82f6', source: 'engine' },
  { id: 'en-charge-alt', label: 'Charge Alt', field: 'Charge Alt', unit: 'V', color: '#10b981', source: 'engine' },

  // PM 5350 (Unit 8, 9)
  { id: 'pm5-active-power-total', label: 'Active Power (Total)', field: 'Active Power', unit: 'kW', color: '#0ea5e9', source: 'pm' },
  { id: 'pm5-active-power-phases', label: 'Phase Active Powers', fields: ['Active Power L1 kW', 'Active Power L2 kW', 'Active Power L3 kW'], unit: 'kW', colors: ['#ef4444', '#eab308', '#06b6d4'], isMulti: true, source: 'pm' },
  { id: 'pm5-reactive-power-total', label: 'Reactive Power (Total)', field: 'Reactive Power', unit: 'kVAR', color: '#f97316', source: 'pm' },
  { id: 'pm5-reactive-power-phases', label: 'Phase Reactive Powers', fields: ['Reactive Power L1 kVAr', 'Reactive Power L2 kVAr', 'Reactive Power L3 kVAr'], unit: 'kVAR', colors: ['#f43f5e', '#f59e0b', '#0ea5e9'], isMulti: true, source: 'pm' },
  { id: 'pm5-power-factor-total', label: 'Power Factor (Total)', field: 'Power Factor', unit: '', color: '#14b8a6', source: 'pm' },
  { id: 'pm5-power-factor-phases', label: 'Phase Power Factors', fields: ['Power Factor L1', 'Power Factor L2', 'Power Factor L3'], unit: '', colors: ['#10b981', '#3b82f6', '#8b5cf6'], isMulti: true, source: 'pm' },
  { id: 'pm5-all-currents', label: 'All Currents', fields: ['Current L1', 'Current L2', 'Current L3'], unit: 'A', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true, source: 'pm' },
  { id: 'pm5-current-neutral', label: 'Current Neutral', field: 'Current Neutral', unit: 'A', color: '#8b5cf6', source: 'pm' },
  { id: 'pm5-current-avg', label: 'Current Avg', field: 'Current Avg', unit: 'A', color: '#0ea5e9', source: 'pm' },
  { id: 'pm5-all-voltages', label: 'All Voltages (L-L)', fields: ['Voltage L1 L2', 'Voltage L2 L3', 'Voltage L3 L1'], unit: 'V', colors: ['#ef4444', '#eab308', '#06b6d4'], isMulti: true, source: 'pm' },
  { id: 'pm5-voltage-ll-avg', label: 'Voltage L-L Avg', field: 'Voltage L L Avg', unit: 'V', color: '#eab308', source: 'pm' },
  { id: 'pm5-all-voltages-ln', label: 'All Voltages (L-N)', fields: ['Voltage L1 N', 'Voltage L2 N', 'Voltage L3 N'], unit: 'V', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true, source: 'pm' },
  { id: 'pm5-voltage-ln-avg', label: 'Voltage L-N Avg', field: 'Voltage L N Avg', unit: 'V', color: '#10b981', source: 'pm' },
  { id: 'pm5-frequency', label: 'Frequency', field: 'Frequency', unit: 'Hz', color: '#a855f7', source: 'pm' }
]

const activeTabConfig = computed(() => chartTabs.find(t => t.id === activeTab.value))
const activeTabLabel = computed(() => activeTabConfig.value?.label || '')
const activeTabUnit = computed(() => activeTabConfig.value?.unit || '')

// Data Fetching
const fetchRealtime = async () => {
    try {
        const [data, downtime] = await Promise.all([
            $fetch(`/api/monitoring/unit/${unitId}`).catch(() => []),
            $fetch('/api/monitoring/downtime').catch(() => ({}))
        ])
        realtimeData.value = data
        unitDowntime.value = downtime ? downtime[unitId] : null
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
        
        if (config.source) {
            params.source = config.source
        }
        
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
        
        const [data, stats] = await Promise.all([
            $fetch(`/api/monitoring/history/${unitId}`, { params }),
            $fetch(`/api/monitoring/stats/${unitId}`, { params }).catch(() => null)
        ])
        historyData.value = data
        rawStats.value = stats
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
    
    const realtimeInterval = setInterval(fetchRealtime, 1000)
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
    currentDate.value = now.toLocaleString('id-ID', options)
        .replace(/\s*pukul\s*/gi, ' ')
        .replace(/\./g, ':') + ' WITA'
}

const getValue = (fieldName) => {
    if (!realtimeData.value || !realtimeData.value.length) return 0
    const item = realtimeData.value.find(d => d._field === fieldName)
    return item?._value ?? 0
}

const getValueRaw = (fieldName) => {
    if (!realtimeData.value || !realtimeData.value.length) return null
    const item = realtimeData.value.find(d => d._field === fieldName)
    return item?._value
}

const formatPhaseRotation = (val) => {
    if (val === null || val === undefined) return 'N/A'
    if (val === 0) return 'ABC'
    if (val === 1) return 'CBA'
    return val
}

const formatValue = (val, decimals = 0) => {
    if (typeof val !== 'number') return '0'
    return val.toFixed(decimals)
}

const formatValueWithComma = (val, decimals = 0) => {
    if (typeof val !== 'number') return '0'
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(val)
}

const getEngineValue = (fieldName, decimals = 1) => {
    if (!realtimeData.value || !realtimeData.value.length) return 'N/A'
    const item = realtimeData.value.find(d => d._field === fieldName)
    if (!item || item._value == null) return 'N/A'
    return formatValue(item._value, decimals)
}

// Computed Status
const statusInfo = computed(() => {
    const power = getValue('Active Power')
    const current = getValue('Current L1')
    const voltage = getValue('Voltage L1 L2')
    
    if (current > 0 || power > 0) {
        return { text: 'OPERATING (SYNC)', badgeClass: 'bg-success text-white' }
    }
    if (voltage > 100) {
        return { text: 'OPERATING (NO LOAD)', badgeClass: 'bg-info text-white' }
    }
    if (unitDowntime.value && unitDowntime.value.status) {
        const s = unitDowntime.value.status.trim()
        const lower = s.toLowerCase()
        if (lower.includes('gangguan')) {
            return { text: 'OUTAGE', badgeClass: 'bg-danger text-white' }
        }
        if (lower.includes('pemeliharaan')) {
            return { text: 'MAINTENANCE', badgeClass: 'bg-info text-white' }
        }
        if (lower.includes('overhaul')) {
            return { text: 'OVERHAUL', badgeClass: 'bg-info text-white' }
        }
        if (lower.includes('standby')) {
            return { text: 'STANDBY', badgeClass: 'bg-warning text-gray-800' }
        }
        if (lower.includes('offline') || lower.includes('tidak aktif')) {
            return { text: 'OFFLINE', badgeClass: 'bg-secondary text-white' }
        }
        if (lower.includes('not available') || lower.includes('tidak tersedia')) {
            return { text: 'NOT AVAILABLE', badgeClass: 'bg-secondary text-white' }
        }
        return { text: s.toUpperCase(), badgeClass: 'bg-warning text-gray-800' }
    }
    return { text: 'STANDBY', badgeClass: 'bg-warning text-gray-800' }
})

const statusText = computed(() => statusInfo.value.text)
const statusBadgeClass = computed(() => statusInfo.value.badgeClass)

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

// Engine Parameters Status
const oilPressureStatus = computed(() => {
    const val = getEngineValue('Oil Pressure')
    if (val === 'N/A') return { value: 'N/A', status: 'N/A', class: 'pq-neutral' }
    
    const num = parseFloat(val)
    let status = 'Good'
    let cssClass = 'pq-good'
    
    if (num < 1.5) {
        status = 'Shutdown'
        cssClass = 'pq-poor'
    } else if (num <= 4.0) {
        status = 'Warning'
        cssClass = 'pq-warning'
    }
    
    return { value: val, status, class: cssClass }
})

const coolantTempStatus = computed(() => {
    const val = getEngineValue('Coolant Temp')
    if (val === 'N/A') return { value: 'N/A', status: 'N/A', class: 'pq-neutral' }
    
    const num = parseFloat(val)
    let status = 'Good'
    let cssClass = 'pq-good'
    
    if (num > 98) {
        status = 'Shutdown'
        cssClass = 'pq-poor'
    } else if (num >= 95) {
        status = 'Warning'
        cssClass = 'pq-warning'
    }
    
    return { value: val, status, class: cssClass }
})

const engineRpmStatus = computed(() => {
    const val = getEngineValue('Engine RPM', 0)
    if (val === 'N/A') return { value: 'N/A', status: 'N/A', class: 'pq-neutral' }
    
    const num = parseFloat(val)
    let status = 'Good'
    let cssClass = 'pq-good'
    
    if (num < 900 || num > 1725) {
        status = 'Shutdown'
        cssClass = 'pq-poor'
    } else if (num <= 1200 || num >= 1650) {
        status = 'Warning'
        cssClass = 'pq-warning'
    }
    
    return { value: val, status, class: cssClass }
})

const batteryVoltStatus = computed(() => {
    const val = getEngineValue('Battery Voltage')
    if (val === 'N/A') return { value: 'N/A', status: 'N/A', class: 'pq-neutral' }
    
    const num = parseFloat(val)
    let status = 'Good'
    let cssClass = 'pq-good'
    
    if (num < 18.0 || num > 31.2) {
        status = 'Warning'
        cssClass = 'pq-warning'
    }
    
    return { value: val, status, class: cssClass }
})

const chargeAltStatus = computed(() => {
    const val = getEngineValue('Charge Alt')
    if (val === 'N/A') return { value: 'N/A', status: 'N/A', class: 'pq-neutral' }
    
    const num = parseFloat(val)
    let status = 'Good'
    let cssClass = 'pq-good'
    
    if (num < 19.2) {
        status = 'Warning'
        cssClass = 'pq-warning'
    }
    
    return { value: val, status, class: cssClass }
})

// Chart Stats (Always using true RAW min, max, avg statistics from InfluxDB)
const chartStats = computed(() => {
    if (!historyData.value || historyData.value.length === 0) return null
    
    const config = activeTabConfig.value
    if (!config) return null
    
    const decimals = config.field === 'Power Factor' ? 2 : 0

    const formatStat = (val) => {
        if (Math.abs(val) < 0.01) return (0).toFixed(decimals)
        return val.toFixed(decimals)
    }

    const formatDateWithSeconds = (dStr) => {
        if (!dStr) return null
        const date = new Date(dStr)
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/\./g, ':')
    }

    if (rawStats.value) {
        return {
            min: formatStat(rawStats.value.min),
            minTime: formatDateWithSeconds(rawStats.value.minTime),
            max: formatStat(rawStats.value.max),
            maxTime: formatDateWithSeconds(rawStats.value.maxTime),
            avg: formatStat(rawStats.value.avg)
        }
    }
    
    // Fallback calculation from historyData
    const targetField = config.isMulti ? config.fields[0] : config.field
    const values = historyData.value
        .filter(d => d._field === targetField)
        .map(d => d._value)
        .filter(v => typeof v === 'number')
    
    if (values.length === 0) return null
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    
    return {
        min: formatStat(min),
        max: formatStat(max),
        avg: formatStat(avg)
    }
})

// Chart Data Construction
const chartData = computed(() => {
    if (!historyData.value || historyData.value.length === 0) return null
    
    const config = activeTabConfig.value
    if (!config) return null

    // Handle calculated Power Quality fields
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
            const dayMonth = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
            const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            return `${dayMonth} ${time}`
        }
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }

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
        rawTimestamps.value = sortedTimes
        const labels = sortedTimes.map(t => formatLabelDate(t))

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
        rawTimestamps.value = firstFieldData.map(d => d._time)
        const labels = firstFieldData.map(d => formatLabelDate(d._time))

        return { labels, datasets }
    } else {
        // Single line chart
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
            borderWidth: 1,
            callbacks: {
                title: (tooltipItems) => {
                    if (!tooltipItems || !tooltipItems.length) return ''
                    const idx = tooltipItems[0].dataIndex
                    const rawTime = rawTimestamps.value[idx]
                    if (rawTime) {
                        const date = new Date(rawTime)
                        return date.toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        }).replace(/\./g, ':')
                    }
                    return tooltipItems[0].label
                }
            }
        }
    },
    scales: {
        y: {
            grid: { color: isDark.value ? '#334155' : '#f1f5f9' },
            beginAtZero: true,
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

// Export CSV (Always fetches raw 3-second interval data from InfluxDB)
const exportCSV = async () => {
    const config = activeTabConfig.value
    if (!config) return

    try {
        isExporting.value = true
        
        let fieldParam
        if (config.isCalculated || config.isMulti) {
            fieldParam = config.fields.join(',')
        } else {
            fieldParam = config.field
        }
        
        const params = { 
            field: fieldParam,
            raw: 'true' // Request unaggregated raw data (3-second interval)
        }
        if (config.source) {
            params.source = config.source
        }
        
        if (timeRange.value === 'custom' && customStart.value && customStop.value) {
            params.start = new Date(customStart.value).toISOString()
            params.stop = new Date(customStop.value).toISOString()
        } else if (timeRange.value !== 'custom') {
            params.range = timeRange.value
        } else {
            alert('Silakan pilih rentang tanggal custom terlebih dahulu.')
            return
        }
        
        const rawData = await $fetch(`/api/monitoring/history/${unitId}`, { params })
        if (!rawData || rawData.length === 0) {
            alert('Tidak ada data raw untuk diexport pada rentang waktu ini.')
            return
        }
        
        const rows = [['Timestamp', 'Measurement', 'Field', 'Value']]
        rawData.forEach(d => {
            const time = new Date(d._time).toLocaleString('id-ID', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\./g, ':')
            rows.push([`"${time}"`, `"${d._measurement || ''}"`, `"${d._field || ''}"`, d._value])
        })
        
        const csvContent = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `Unit${unitId}_${config.label.replace(/\s+/g, '_')}_RAW_${timeRange.value}.csv`)
        link.click()
        
        URL.revokeObjectURL(url)
    } catch (err) {
        console.error('Export CSV Error:', err)
        alert('Gagal mengunduh data CSV raw.')
    } finally {
        isExporting.value = false
    }
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

.bg-success { background-color: var(--success); color: white; }
.bg-warning { background-color: var(--warning); color: #1f2937; }
.bg-info { background-color: #0284c7; color: white; }
.bg-danger { background-color: #ef4444; color: white; }

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

.engine-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
}

.engine-metric {
    background: var(--bg-hover);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.engine-metric-full {
    grid-column: span 2;
}

.metric-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
}

.metric-value small {
    font-size: 0.875rem;
    font-weight: 400;
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
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.25rem;
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

.stat-time {
    display: block;
    font-size: 0.68rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
    font-weight: 400;
}

@media (max-width: 768px) {
    .stats-bar {
        gap: 1rem;
        padding: var(--space-3) var(--space-2);
    }

    .stat-time {
        font-size: 0.55rem;
        letter-spacing: -0.02em;
        line-height: 1.1;
        margin-top: 0.15rem;
    }

    .metrics-grid {
        grid-template-columns: 1fr;
    }

    /* User requested Voltage/Current parameters to be inline (sejajar) on mobile */
    .values-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem; /* Tighter gap for mobile */
    }

    .engine-grid {
        grid-template-columns: 1fr;
    }

    .engine-metric-full {
        grid-column: span 1;
    }
    
    .chart-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .chart-actions {
        justify-content: space-between;
        width: 100%;
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

    /* Custom Date Picker Mobile Fix */
    .custom-range-picker .flex {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .date-input-group {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        gap: 0.25rem;
    }

    .date-input {
        width: 100%;
    }

    .btn-apply {
        width: 100%;
        margin-top: 0.5rem;
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
