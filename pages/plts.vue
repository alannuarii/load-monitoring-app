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
      <!-- CARD 1: PLTS Solar Generation (LVSW1 + LVSW2) -->
      <div class="card mb-6 p-6">
        <!-- Row 1: Status & Frequency (Centered) -->
        <div class="flex flex-col items-center justify-center gap-3 mb-6">
          <span class="status-badge mb-2" :class="pltsStatusBadgeClass">{{ pltsStatusText }}</span>
          <div class="flex items-baseline gap-3 mb-6">
            <span class="frequency-display">{{ formatValue(getFrequency, 2) }}</span>
            <span class="text-4xl font-medium text-gray-400">Hz</span>
          </div>
        </div>

        <!-- Row 2: Total PLTS Solar Power Metrics (3 Columns) -->
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
            <span class="metric-label">Power Factor</span>
            <span class="metric-value-primary">{{ formatValue(avgPowerFactor, 2) }}</span>
          </div>
        </div>

        <!-- Section: Feeder Breakdown (LVSW1 & LVSW2) -->
        <div class="detail-section mb-2">
          <div class="section-header-row mb-4">
            <div class="section-header m-0 p-0" style="border: none;">
              <span class="section-title">PLTS Feeder Telemetry</span>
            </div>
            
            <!-- Feeder View Toggle Tabs -->
            <div class="feeder-toggle-bar">
              <button 
                class="btn-feeder-tab" 
                :class="{ active: pltsFeederTab === 'all' }" 
                @click="pltsFeederTab = 'all'"
              >
                All Feeders
              </button>
              <button 
                class="btn-feeder-tab" 
                :class="{ active: pltsFeederTab === '1' }" 
                @click="pltsFeederTab = '1'"
              >
                Feeder 1 (LVSW1)
              </button>
              <button 
                class="btn-feeder-tab" 
                :class="{ active: pltsFeederTab === '2' }" 
                @click="pltsFeederTab = '2'"
              >
                Feeder 2 (LVSW2)
              </button>
            </div>
          </div>

          <!-- Total Energy Accumulation within PLTS Feeder Telemetry -->
          <div class="energy-summary-grid mb-4">
            <div class="energy-summary-card">
              <span class="energy-summary-label">Total Energy Delivered</span>
              <span class="energy-summary-value">{{ formatValueWithComma(totalEnergyDelivered, 1) }} <small>kWh</small></span>
            </div>
            <div class="energy-summary-card">
              <span class="energy-summary-label">Total Energy Received</span>
              <span class="energy-summary-value">{{ formatValueWithComma(totalEnergyReceived, 1) }} <small>kWh</small></span>
            </div>
          </div>

          <!-- Feeders Grid Container -->
          <div 
            class="feeders-container"
            :class="{ 'grid-2-cols': pltsFeederTab === 'all', 'grid-1-col': pltsFeederTab !== 'all' }"
          >
            <!-- FEEDER 1: LVSW1 -->
            <div v-if="pltsFeederTab === 'all' || pltsFeederTab === '1'" class="feeder-box">
              <div class="feeder-header">
                <div class="flex items-center gap-2">
                  <span class="feeder-name">Feeder 1 (LVSW1)</span>
                  <span class="status-badge" :class="lvsw1_status.badgeClass">{{ lvsw1_status.text }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted">PQ:</span>
                  <span class="overall-status-badge" :class="lvsw1_overallPQ.class">{{ lvsw1_overallPQ.status }}</span>
                </div>
              </div>

              <!-- Power & Frequency -->
              <div class="sub-card">
                <h5 class="sub-card-title">Power & Frequency</h5>
                <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                  <div class="value-block">
                    <span class="value-label">Active</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Active Power'), 0) }} <small>kW</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Reactive</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Reactive Power'), 0) }} <small>kVAR</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">PF</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Power Factor'), 2) }}</span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Freq</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Frequency'), 2) }} <small>Hz</small></span>
                  </div>
                </div>
              </div>

              <!-- Voltage Details (L-L & L-N) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Voltage L-L -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Voltage (Line to Line)</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="value-block">
                      <span class="value-label">L1-L2</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Voltage L1 L2'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L2-L3</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Voltage L2 L3'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L3-L1</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Voltage L3 L1'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Avg</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Voltage'), 0) }} <small>V</small></span>
                    </div>
                  </div>
                </div>

                <!-- Voltage L-N -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Voltage (Line to Neutral)</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="value-block">
                      <span class="value-label">L1-N</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Voltage L1 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L2-N</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Voltage L2 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L3-N</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Voltage L3 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Avg</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Voltage LN Avg'), 0) }} <small>V</small></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Current Details -->
              <div class="sub-card">
                <h5 class="sub-card-title">Current & Phases</h5>
                <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                  <div class="value-block">
                    <span class="value-label">Current L1</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Current L1'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Current L2</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Current L2'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Current L3</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Current L3'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Average</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw1Data, 'Current'), 0) }} <small>A</small></span>
                  </div>
                </div>
              </div>

              <!-- Power Quality & Energy Accumulation -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Power Quality -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Power Quality</h5>
                  <div class="pq-grid" style="grid-template-columns: repeat(3, 1fr);">
                    <div class="pq-item">
                      <div class="pq-label">V. Unbal</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ lvsw1_vUnb.value }}%</span>
                        <span class="pq-status-badge" :class="lvsw1_vUnb.class">{{ lvsw1_vUnb.status }}</span>
                      </div>
                      <div class="pq-threshold">&lt; 2% (Good)</div>
                    </div>
                    <div class="pq-item">
                      <div class="pq-label">I. Unbal</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ lvsw1_iUnb.value }}%</span>
                        <span class="pq-status-badge" :class="lvsw1_iUnb.class">{{ lvsw1_iUnb.status }}</span>
                      </div>
                      <div class="pq-threshold">&lt; 10% (Good)</div>
                    </div>
                    <div class="pq-item">
                      <div class="pq-label">PF Stat</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ lvsw1_pfStat.value }}</span>
                        <span class="pq-status-badge" :class="lvsw1_pfStat.class">{{ lvsw1_pfStat.status }}</span>
                      </div>
                      <div class="pq-threshold">&gt; 0.9 (Good)</div>
                    </div>
                  </div>
                </div>

                <!-- Energy Accumulation -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Energy Accumulation</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(2, 1fr); height: calc(100% - 30px); align-items: center;">
                    <div class="value-block">
                      <span class="value-label">Energy Delivered</span>
                      <span class="value-number">{{ formatValueWithComma(getValue(lvsw1Data, 'Active Energy Delivered'), 1) }} <small>kWh</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Energy Received</span>
                      <span class="value-number">{{ formatValueWithComma(getValue(lvsw1Data, 'Active Energy Received'), 1) }} <small>kWh</small></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- FEEDER 2: LVSW2 -->
            <div v-if="pltsFeederTab === 'all' || pltsFeederTab === '2'" class="feeder-box">
              <div class="feeder-header">
                <div class="flex items-center gap-2">
                  <span class="feeder-name">Feeder 2 (LVSW2)</span>
                  <span class="status-badge" :class="lvsw2_status.badgeClass">{{ lvsw2_status.text }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted">PQ:</span>
                  <span class="overall-status-badge" :class="lvsw2_overallPQ.class">{{ lvsw2_overallPQ.status }}</span>
                </div>
              </div>

              <!-- Power & Frequency -->
              <div class="sub-card">
                <h5 class="sub-card-title">Power & Frequency</h5>
                <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                  <div class="value-block">
                    <span class="value-label">Active</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Active Power'), 0) }} <small>kW</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Reactive</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Reactive Power'), 0) }} <small>kVAR</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">PF</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Power Factor'), 2) }}</span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Freq</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Frequency'), 2) }} <small>Hz</small></span>
                  </div>
                </div>
              </div>

              <!-- Voltage Details (L-L & L-N) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Voltage L-L -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Voltage (Line to Line)</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="value-block">
                      <span class="value-label">L1-L2</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Voltage L1 L2'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L2-L3</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Voltage L2 L3'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L3-L1</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Voltage L3 L1'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Avg</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Voltage'), 0) }} <small>V</small></span>
                    </div>
                  </div>
                </div>

                <!-- Voltage L-N -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Voltage (Line to Neutral)</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="value-block">
                      <span class="value-label">L1-N</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Voltage L1 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L2-N</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Voltage L2 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L3-N</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Voltage L3 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Avg</span>
                      <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Voltage LN Avg'), 0) }} <small>V</small></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Current Details -->
              <div class="sub-card">
                <h5 class="sub-card-title">Current & Phases</h5>
                <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                  <div class="value-block">
                    <span class="value-label">Current L1</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Current L1'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Current L2</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Current L2'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Current L3</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Current L3'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Average</span>
                    <span class="value-number">{{ formatValue(getValue(lvsw2Data, 'Current'), 0) }} <small>A</small></span>
                  </div>
                </div>
              </div>

              <!-- Power Quality & Energy Accumulation -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Power Quality -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Power Quality</h5>
                  <div class="pq-grid" style="grid-template-columns: repeat(3, 1fr);">
                    <div class="pq-item">
                      <div class="pq-label">V. Unbal</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ lvsw2_vUnb.value }}%</span>
                        <span class="pq-status-badge" :class="lvsw2_vUnb.class">{{ lvsw2_vUnb.status }}</span>
                      </div>
                      <div class="pq-threshold">&lt; 2% (Good)</div>
                    </div>
                    <div class="pq-item">
                      <div class="pq-label">I. Unbal</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ lvsw2_iUnb.value }}%</span>
                        <span class="pq-status-badge" :class="lvsw2_iUnb.class">{{ lvsw2_iUnb.status }}</span>
                      </div>
                      <div class="pq-threshold">&lt; 10% (Good)</div>
                    </div>
                    <div class="pq-item">
                      <div class="pq-label">PF Stat</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ lvsw2_pfStat.value }}</span>
                        <span class="pq-status-badge" :class="lvsw2_pfStat.class">{{ lvsw2_pfStat.status }}</span>
                      </div>
                      <div class="pq-threshold">&gt; 0.9 (Good)</div>
                    </div>
                  </div>
                </div>

                <!-- Energy Accumulation -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Energy Accumulation</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(2, 1fr); height: calc(100% - 30px); align-items: center;">
                    <div class="value-block">
                      <span class="value-label">Energy Delivered</span>
                      <span class="value-number">{{ formatValueWithComma(getValue(lvsw2Data, 'Active Energy Delivered'), 1) }} <small>kWh</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Energy Received</span>
                      <span class="value-number">{{ formatValueWithComma(getValue(lvsw2Data, 'Active Energy Received'), 1) }} <small>kWh</small></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD 2: Battery Storage System (BSS - IT1 + IT2) -->
      <div class="card mb-6 p-6">
        <!-- Row 1: Header (No combined status, No frequency) -->
        <div class="section-header mb-6">
          <span class="section-title" style="font-size: 1rem;">Battery Storage System (BSS)</span>
        </div>

        <!-- Row 2: Total BSS Power Metrics (3 Columns) -->
        <div class="metrics-grid mb-6">
          <div class="metric-card">
            <span class="metric-label">Total Active Power</span>
            <span class="metric-value-primary">{{ formatValue(bssTotalActivePower, 0) }} <small>kW</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Total Reactive Power</span>
            <span class="metric-value-primary">{{ formatValue(bssTotalReactivePower, 0) }} <small>kVAR</small></span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Power Factor</span>
            <span class="metric-value-primary">{{ formatValue(bssAvgPowerFactor, 2) }}</span>
          </div>
        </div>

        <!-- Section: BSS Feeder Breakdown (IT1 & IT2) -->
        <div class="detail-section mb-2">
          <div class="section-header-row mb-4">
            <div class="section-header m-0 p-0" style="border: none;">
              <span class="section-title">BSS Feeder Telemetry</span>
            </div>
            
            <!-- Feeder View Toggle Tabs -->
            <div class="feeder-toggle-bar">
              <button 
                class="btn-feeder-tab" 
                :class="{ active: bssFeederTab === 'all' }" 
                @click="bssFeederTab = 'all'"
              >
                All Feeders
              </button>
              <button 
                class="btn-feeder-tab" 
                :class="{ active: bssFeederTab === '1' }" 
                @click="bssFeederTab = '1'"
              >
                Feeder 1 (IT1)
              </button>
              <button 
                class="btn-feeder-tab" 
                :class="{ active: bssFeederTab === '2' }" 
                @click="bssFeederTab = '2'"
              >
                Feeder 2 (IT2)
              </button>
            </div>
          </div>

          <!-- Total Energy Accumulation within BSS Feeder Telemetry -->
          <div class="energy-summary-grid mb-4">
            <div class="energy-summary-card">
              <span class="energy-summary-label">Total Energy Delivered</span>
              <span class="energy-summary-value">{{ formatValueWithComma(bssTotalEnergyDelivered, 1) }} <small>kWh</small></span>
            </div>
            <div class="energy-summary-card">
              <span class="energy-summary-label">Total Energy Received</span>
              <span class="energy-summary-value">{{ formatValueWithComma(bssTotalEnergyReceived, 1) }} <small>kWh</small></span>
            </div>
          </div>

          <!-- BSS Feeders Grid Container -->
          <div 
            class="feeders-container"
            :class="{ 'grid-2-cols': bssFeederTab === 'all', 'grid-1-col': bssFeederTab !== 'all' }"
          >
            <!-- BSS FEEDER 1: IT1 -->
            <div v-if="bssFeederTab === 'all' || bssFeederTab === '1'" class="feeder-box">
              <div class="feeder-header">
                <div class="flex items-center gap-2">
                  <span class="feeder-name">Feeder 1 (IT1)</span>
                  <span class="status-badge" :class="it1_status.badgeClass">{{ it1_status.text }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted">PQ:</span>
                  <span class="overall-status-badge" :class="it1_overallPQ.class">{{ it1_overallPQ.status }}</span>
                </div>
              </div>

              <!-- Power & Frequency -->
              <div class="sub-card">
                <h5 class="sub-card-title">Power & Frequency</h5>
                <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                  <div class="value-block">
                    <span class="value-label">Active</span>
                    <span class="value-number">{{ formatValue(getValue(it1Data, 'Active Power'), 0) }} <small>kW</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Reactive</span>
                    <span class="value-number">{{ formatValue(getValue(it1Data, 'Reactive Power'), 0) }} <small>kVAR</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">PF</span>
                    <span class="value-number">{{ formatValue(getValue(it1Data, 'Power Factor'), 2) }}</span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Freq</span>
                    <span class="value-number">{{ formatValue(getValue(it1Data, 'Frequency'), 2) }} <small>Hz</small></span>
                  </div>
                </div>
              </div>

              <!-- Voltage Details (L-L & L-N) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Voltage L-L -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Voltage (Line to Line)</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="value-block">
                      <span class="value-label">L1-L2</span>
                      <span class="value-number">{{ formatValue(getValue(it1Data, 'Voltage L1 L2'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L2-L3</span>
                      <span class="value-number">{{ formatValue(getValue(it1Data, 'Voltage L2 L3'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L3-L1</span>
                      <span class="value-number">{{ formatValue(getValue(it1Data, 'Voltage L3 L1'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Avg</span>
                      <span class="value-number">{{ formatValue(getValue(it1Data, 'Voltage'), 0) }} <small>V</small></span>
                    </div>
                  </div>
                </div>

                <!-- Voltage L-N -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Voltage (Line to Neutral)</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="value-block">
                      <span class="value-label">L1-N</span>
                      <span class="value-number">{{ formatValue(getValue(it1Data, 'Voltage L1 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L2-N</span>
                      <span class="value-number">{{ formatValue(getValue(it1Data, 'Voltage L2 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L3-N</span>
                      <span class="value-number">{{ formatValue(getValue(it1Data, 'Voltage L3 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Avg</span>
                      <span class="value-number">{{ formatValue(getValue(it1Data, 'Voltage LN Avg'), 0) }} <small>V</small></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Current Details -->
              <div class="sub-card">
                <h5 class="sub-card-title">Current & Phases</h5>
                <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                  <div class="value-block">
                    <span class="value-label">Current L1</span>
                    <span class="value-number">{{ formatValue(getValue(it1Data, 'Current L1'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Current L2</span>
                    <span class="value-number">{{ formatValue(getValue(it1Data, 'Current L2'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Current L3</span>
                    <span class="value-number">{{ formatValue(getValue(it1Data, 'Current L3'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Average</span>
                    <span class="value-number">{{ formatValue(getValue(it1Data, 'Current'), 0) }} <small>A</small></span>
                  </div>
                </div>
              </div>

              <!-- Power Quality & Energy Accumulation -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Power Quality -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Power Quality</h5>
                  <div class="pq-grid" style="grid-template-columns: repeat(3, 1fr);">
                    <div class="pq-item">
                      <div class="pq-label">V. Unbal</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ it1_vUnb.value }}%</span>
                        <span class="pq-status-badge" :class="it1_vUnb.class">{{ it1_vUnb.status }}</span>
                      </div>
                      <div class="pq-threshold">&lt; 2% (Good)</div>
                    </div>
                    <div class="pq-item">
                      <div class="pq-label">I. Unbal</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ it1_iUnb.value }}%</span>
                        <span class="pq-status-badge" :class="it1_iUnb.class">{{ it1_iUnb.status }}</span>
                      </div>
                      <div class="pq-threshold">&lt; 10% (Good)</div>
                    </div>
                    <div class="pq-item">
                      <div class="pq-label">PF Stat</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ it1_pfStat.value }}</span>
                        <span class="pq-status-badge" :class="it1_pfStat.class">{{ it1_pfStat.status }}</span>
                      </div>
                      <div class="pq-threshold">&gt; 0.9 (Good)</div>
                    </div>
                  </div>
                </div>

                <!-- Energy Accumulation -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Energy Accumulation</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(2, 1fr); height: calc(100% - 30px); align-items: center;">
                    <div class="value-block">
                      <span class="value-label">Energy Delivered</span>
                      <span class="value-number">{{ formatValueWithComma(getValue(it1Data, 'Active Energy Delivered'), 1) }} <small>kWh</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Energy Received</span>
                      <span class="value-number">{{ formatValueWithComma(getValue(it1Data, 'Active Energy Received'), 1) }} <small>kWh</small></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- BSS FEEDER 2: IT2 -->
            <div v-if="bssFeederTab === 'all' || bssFeederTab === '2'" class="feeder-box">
              <div class="feeder-header">
                <div class="flex items-center gap-2">
                  <span class="feeder-name">Feeder 2 (IT2)</span>
                  <span class="status-badge" :class="it2_status.badgeClass">{{ it2_status.text }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted">PQ:</span>
                  <span class="overall-status-badge" :class="it2_overallPQ.class">{{ it2_overallPQ.status }}</span>
                </div>
              </div>

              <!-- Power & Frequency -->
              <div class="sub-card">
                <h5 class="sub-card-title">Power & Frequency</h5>
                <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                  <div class="value-block">
                    <span class="value-label">Active</span>
                    <span class="value-number">{{ formatValue(getValue(it2Data, 'Active Power'), 0) }} <small>kW</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Reactive</span>
                    <span class="value-number">{{ formatValue(getValue(it2Data, 'Reactive Power'), 0) }} <small>kVAR</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">PF</span>
                    <span class="value-number">{{ formatValue(getValue(it2Data, 'Power Factor'), 2) }}</span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Freq</span>
                    <span class="value-number">{{ formatValue(getValue(it2Data, 'Frequency'), 2) }} <small>Hz</small></span>
                  </div>
                </div>
              </div>

              <!-- Voltage Details (L-L & L-N) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Voltage L-L -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Voltage (Line to Line)</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="value-block">
                      <span class="value-label">L1-L2</span>
                      <span class="value-number">{{ formatValue(getValue(it2Data, 'Voltage L1 L2'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L2-L3</span>
                      <span class="value-number">{{ formatValue(getValue(it2Data, 'Voltage L2 L3'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L3-L1</span>
                      <span class="value-number">{{ formatValue(getValue(it2Data, 'Voltage L3 L1'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Avg</span>
                      <span class="value-number">{{ formatValue(getValue(it2Data, 'Voltage'), 0) }} <small>V</small></span>
                    </div>
                  </div>
                </div>

                <!-- Voltage L-N -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Voltage (Line to Neutral)</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="value-block">
                      <span class="value-label">L1-N</span>
                      <span class="value-number">{{ formatValue(getValue(it2Data, 'Voltage L1 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L2-N</span>
                      <span class="value-number">{{ formatValue(getValue(it2Data, 'Voltage L2 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">L3-N</span>
                      <span class="value-number">{{ formatValue(getValue(it2Data, 'Voltage L3 N'), 0) }} <small>V</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Avg</span>
                      <span class="value-number">{{ formatValue(getValue(it2Data, 'Voltage LN Avg'), 0) }} <small>V</small></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Current Details -->
              <div class="sub-card">
                <h5 class="sub-card-title">Current & Phases</h5>
                <div class="values-grid" style="grid-template-columns: repeat(4, 1fr);">
                  <div class="value-block">
                    <span class="value-label">Current L1</span>
                    <span class="value-number">{{ formatValue(getValue(it2Data, 'Current L1'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Current L2</span>
                    <span class="value-number">{{ formatValue(getValue(it2Data, 'Current L2'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Current L3</span>
                    <span class="value-number">{{ formatValue(getValue(it2Data, 'Current L3'), 0) }} <small>A</small></span>
                  </div>
                  <div class="value-block">
                    <span class="value-label">Average</span>
                    <span class="value-number">{{ formatValue(getValue(it2Data, 'Current'), 0) }} <small>A</small></span>
                  </div>
                </div>
              </div>

              <!-- Power Quality & Energy Accumulation -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Power Quality -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Power Quality</h5>
                  <div class="pq-grid" style="grid-template-columns: repeat(3, 1fr);">
                    <div class="pq-item">
                      <div class="pq-label">V. Unbal</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ it2_vUnb.value }}%</span>
                        <span class="pq-status-badge" :class="it2_vUnb.class">{{ it2_vUnb.status }}</span>
                      </div>
                      <div class="pq-threshold">&lt; 2% (Good)</div>
                    </div>
                    <div class="pq-item">
                      <div class="pq-label">I. Unbal</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ it2_iUnb.value }}%</span>
                        <span class="pq-status-badge" :class="it2_iUnb.class">{{ it2_iUnb.status }}</span>
                      </div>
                      <div class="pq-threshold">&lt; 10% (Good)</div>
                    </div>
                    <div class="pq-item">
                      <div class="pq-label">PF Stat</div>
                      <div class="pq-value-row">
                        <span class="pq-value">{{ it2_pfStat.value }}</span>
                        <span class="pq-status-badge" :class="it2_pfStat.class">{{ it2_pfStat.status }}</span>
                      </div>
                      <div class="pq-threshold">&gt; 0.9 (Good)</div>
                    </div>
                  </div>
                </div>

                <!-- Energy Accumulation -->
                <div class="sub-card">
                  <h5 class="sub-card-title">Energy Accumulation</h5>
                  <div class="values-grid" style="grid-template-columns: repeat(2, 1fr); height: calc(100% - 30px); align-items: center;">
                    <div class="value-block">
                      <span class="value-label">Energy Delivered</span>
                      <span class="value-number">{{ formatValueWithComma(getValue(it2Data, 'Active Energy Delivered'), 1) }} <small>kWh</small></span>
                    </div>
                    <div class="value-block">
                      <span class="value-label">Energy Received</span>
                      <span class="value-number">{{ formatValueWithComma(getValue(it2Data, 'Active Energy Received'), 1) }} <small>kWh</small></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD 3: Weather Station -->
      <div class="card mb-6 p-6">
        <div class="section-header mb-4">
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

      <!-- CARD 4: Chart Card -->
      <div class="card p-6">
        <!-- Chart Controls -->
        <div class="chart-controls mb-6">
          <div class="flex items-center gap-4">
            <label class="text-sm text-gray-600">Parameter:</label>
            <select v-model="activeTab" class="param-select" @change="fetchHistory">
              <optgroup label="Total PLTS (Solar Generation)">
                <option value="plts-total-active">PLTS Total Active Power</option>
                <option value="plts-compare-active">PLTS Active Power (Feeder 1 vs Feeder 2)</option>
                <option value="plts-total-reactive">PLTS Total Reactive Power</option>
                <option value="plts-compare-reactive">PLTS Reactive Power (Feeder 1 vs Feeder 2)</option>
              </optgroup>
              
              <optgroup label="PLTS Feeder 1 (LVSW1)">
                <option value="lvsw1-active">Active Power</option>
                <option value="lvsw1-reactive">Reactive Power</option>
                <option value="lvsw1-pf">Power Factor</option>
                <option value="lvsw1-freq">Frequency</option>
                <option value="lvsw1-all-currents">All Currents</option>
                <option value="lvsw1-current-avg">Average Current</option>
                <option value="lvsw1-all-voltages-ll">All Voltages (L-L)</option>
                <option value="lvsw1-voltage-ll-avg">Average Voltage (L-L)</option>
                <option value="lvsw1-all-voltages-ln">All Voltages (L-N)</option>
                <option value="lvsw1-voltage-ln-avg">Average Voltage (L-N)</option>
              </optgroup>

              <optgroup label="PLTS Feeder 2 (LVSW2)">
                <option value="lvsw2-active">Active Power</option>
                <option value="lvsw2-reactive">Reactive Power</option>
                <option value="lvsw2-pf">Power Factor</option>
                <option value="lvsw2-freq">Frequency</option>
                <option value="lvsw2-all-currents">All Currents</option>
                <option value="lvsw2-current-avg">Average Current</option>
                <option value="lvsw2-all-voltages-ll">All Voltages (L-L)</option>
                <option value="lvsw2-voltage-ll-avg">Average Voltage (L-L)</option>
                <option value="lvsw2-all-voltages-ln">All Voltages (L-N)</option>
                <option value="lvsw2-voltage-ln-avg">Average Voltage (L-N)</option>
              </optgroup>

              <optgroup label="Total BSS (Battery Storage System)">
                <option value="bss-total-active">BSS Total Active Power</option>
                <option value="bss-compare-active">BSS Active Power (Feeder 1 vs Feeder 2)</option>
                <option value="bss-total-reactive">BSS Total Reactive Power</option>
                <option value="bss-compare-reactive">BSS Reactive Power (Feeder 1 vs Feeder 2)</option>
              </optgroup>

              <optgroup label="BSS Feeder 1 (IT1)">
                <option value="it1-active">Active Power</option>
                <option value="it1-reactive">Reactive Power</option>
                <option value="it1-pf">Power Factor</option>
                <option value="it1-freq">Frequency</option>
                <option value="it1-all-currents">All Currents</option>
                <option value="it1-current-avg">Average Current</option>
                <option value="it1-all-voltages-ll">All Voltages (L-L)</option>
                <option value="it1-voltage-ll-avg">Average Voltage (L-L)</option>
                <option value="it1-all-voltages-ln">All Voltages (L-N)</option>
                <option value="it1-voltage-ln-avg">Average Voltage (L-N)</option>
              </optgroup>

              <optgroup label="BSS Feeder 2 (IT2)">
                <option value="it2-active">Active Power</option>
                <option value="it2-reactive">Reactive Power</option>
                <option value="it2-pf">Power Factor</option>
                <option value="it2-freq">Frequency</option>
                <option value="it2-all-currents">All Currents</option>
                <option value="it2-current-avg">Average Current</option>
                <option value="it2-all-voltages-ll">All Voltages (L-L)</option>
                <option value="it2-voltage-ll-avg">Average Voltage (L-L)</option>
                <option value="it2-all-voltages-ln">All Voltages (L-N)</option>
                <option value="it2-voltage-ln-avg">Average Voltage (L-N)</option>
              </optgroup>

              <optgroup label="Weather Station">
                <option value="irradiance">Global Irradiance</option>
                <option value="air-temp">Air Temperature</option>
                <option value="ext-temp">External Temperature</option>
                <option value="humidity">Relative Humidity</option>
                <option value="wind-speed">Wind Speed</option>
                <option value="wind-dir">Wind Direction</option>
              </optgroup>
            </select>
          </div>
          
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

        <!-- Custom Date Range -->
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
// State
const lvsw1Data = ref([])
const lvsw2Data = ref([])
const it1Data = ref([])
const it2Data = ref([])
const weatherData = ref([])
const historyData = ref([])
const rawTimestamps = ref([])

const loading = ref(true)
const error = ref(null)
const currentDate = ref('')
const pltsFeederTab = ref('all') // 'all', '1', '2'
const bssFeederTab = ref('all')  // 'all', '1', '2'
const activeTab = ref('plts-total-active')
const timeRange = ref('-30m')
const customStart = ref('')
const customStop = ref('')
const isExporting = ref(false)

const hasData = computed(() => {
    return lvsw1Data.value.length || lvsw2Data.value.length || it1Data.value.length || it2Data.value.length || weatherData.value.length
})

// Time Range Options
const timeRanges = [
  { value: '-5m', label: '5 Minutes' },
  { value: '-15m', label: '15 Minutes' },
  { value: '-30m', label: '30 Minutes' },
  { value: '-1h', label: '1 Hour' },
  { value: '-6h', label: '6 Hours' },
  { value: '-1d', label: '1 Day' },
  { value: '-3d', label: '3 Days' },
  { value: '-7d', label: '7 Days' },
  { value: '-14d', label: '14 Days' },
  { value: '-30d', label: '30 Days' },
  { value: 'custom', label: 'Custom...' }
]

// Chart Tabs Config
const chartTabs = [
    // Total PLTS (Solar Generation)
    { id: 'plts-total-active', label: 'PLTS Total Active Power', field: 'Active Power', source: 'Combined-LVSW', unit: 'kW', color: '#2563eb' },
    { id: 'plts-compare-active', label: 'PLTS Active Power (Feeder 1 vs Feeder 2)', field: 'Active Power', fields: ['Feeder 1 (LVSW1)', 'Feeder 2 (LVSW2)'], source: 'Compare-LVSW', unit: 'kW', colors: ['#10b981', '#f59e0b'], isMulti: true },
    { id: 'plts-total-reactive', label: 'PLTS Total Reactive Power', field: 'Reactive Power', source: 'Combined-LVSW', unit: 'kVAR', color: '#4f46e5' },
    { id: 'plts-compare-reactive', label: 'PLTS Reactive Power (Feeder 1 vs Feeder 2)', field: 'Reactive Power', fields: ['Feeder 1 (LVSW1)', 'Feeder 2 (LVSW2)'], source: 'Compare-LVSW', unit: 'kVAR', colors: ['#059669', '#d97706'], isMulti: true },

    // PLTS Feeder 1 (LVSW1)
    { id: 'lvsw1-active', label: 'LVSW1 Active Power', field: 'Active Power', source: 'LVSW1', unit: 'kW', color: '#10b981' },
    { id: 'lvsw1-reactive', label: 'LVSW1 Reactive Power', field: 'Reactive Power', source: 'LVSW1', unit: 'kVAR', color: '#059669' },
    { id: 'lvsw1-pf', label: 'LVSW1 Power Factor', field: 'Power Factor', source: 'LVSW1', unit: '', color: '#047857' },
    { id: 'lvsw1-freq', label: 'LVSW1 Frequency', field: 'Frequency', source: 'LVSW1', unit: 'Hz', color: '#064e3b' },
    { id: 'lvsw1-all-currents', label: 'LVSW1 All Currents', fields: ['Current L1', 'Current L2', 'Current L3'], source: 'LVSW1', unit: 'A', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true },
    { id: 'lvsw1-current-avg', label: 'LVSW1 Average Current', field: 'Current', source: 'LVSW1', unit: 'A', color: '#6ee7b7' },
    { id: 'lvsw1-all-voltages-ll', label: 'LVSW1 All Voltages (L-L)', fields: ['Voltage L1 L2', 'Voltage L2 L3', 'Voltage L3 L1'], source: 'LVSW1', unit: 'V', colors: ['#ef4444', '#eab308', '#06b6d4'], isMulti: true },
    { id: 'lvsw1-voltage-ll-avg', label: 'LVSW1 Average Voltage (L-L)', field: 'Voltage', source: 'LVSW1', unit: 'V', color: '#34d399' },
    { id: 'lvsw1-all-voltages-ln', label: 'LVSW1 All Voltages (L-N)', fields: ['Voltage L1 N', 'Voltage L2 N', 'Voltage L3 N'], source: 'LVSW1', unit: 'V', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true },
    { id: 'lvsw1-voltage-ln-avg', label: 'LVSW1 Average Voltage (L-N)', field: 'Voltage LN Avg', source: 'LVSW1', unit: 'V', color: '#14b8a6' },

    // PLTS Feeder 2 (LVSW2)
    { id: 'lvsw2-active', label: 'LVSW2 Active Power', field: 'Active Power', source: 'LVSW2', unit: 'kW', color: '#f59e0b' },
    { id: 'lvsw2-reactive', label: 'LVSW2 Reactive Power', field: 'Reactive Power', source: 'LVSW2', unit: 'kVAR', color: '#d97706' },
    { id: 'lvsw2-pf', label: 'LVSW2 Power Factor', field: 'Power Factor', source: 'LVSW2', unit: '', color: '#b45309' },
    { id: 'lvsw2-freq', label: 'LVSW2 Frequency', field: 'Frequency', source: 'LVSW2', unit: 'Hz', color: '#78350f' },
    { id: 'lvsw2-all-currents', label: 'LVSW2 All Currents', fields: ['Current L1', 'Current L2', 'Current L3'], source: 'LVSW2', unit: 'A', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true },
    { id: 'lvsw2-current-avg', label: 'LVSW2 Average Current', field: 'Current', source: 'LVSW2', unit: 'A', color: '#fcd34d' },
    { id: 'lvsw2-all-voltages-ll', label: 'LVSW2 All Voltages (L-L)', fields: ['Voltage L1 L2', 'Voltage L2 L3', 'Voltage L3 L1'], source: 'LVSW2', unit: 'V', colors: ['#ef4444', '#eab308', '#06b6d4'], isMulti: true },
    { id: 'lvsw2-voltage-ll-avg', label: 'LVSW2 Average Voltage (L-L)', field: 'Voltage', source: 'LVSW2', unit: 'V', color: '#fbbf24' },
    { id: 'lvsw2-all-voltages-ln', label: 'LVSW2 All Voltages (L-N)', fields: ['Voltage L1 N', 'Voltage L2 N', 'Voltage L3 N'], source: 'LVSW2', unit: 'V', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true },
    { id: 'lvsw2-voltage-ln-avg', label: 'LVSW2 Average Voltage (L-N)', field: 'Voltage LN Avg', source: 'LVSW2', unit: 'V', color: '#d97706' },

    // Total BSS (Battery Storage System)
    { id: 'bss-total-active', label: 'BSS Total Active Power', field: 'Active Power', source: 'Combined-IT', unit: 'kW', color: '#ec4899' },
    { id: 'bss-compare-active', label: 'BSS Active Power (Feeder 1 vs Feeder 2)', field: 'Active Power', fields: ['Feeder 1 (IT1)', 'Feeder 2 (IT2)'], source: 'Compare-IT', unit: 'kW', colors: ['#ec4899', '#8b5cf6'], isMulti: true },
    { id: 'bss-total-reactive', label: 'BSS Total Reactive Power', field: 'Reactive Power', source: 'Combined-IT', unit: 'kVAR', color: '#db2777' },
    { id: 'bss-compare-reactive', label: 'BSS Reactive Power (Feeder 1 vs Feeder 2)', field: 'Reactive Power', fields: ['Feeder 1 (IT1)', 'Feeder 2 (IT2)'], source: 'Compare-IT', unit: 'kVAR', colors: ['#be185d', '#7c3aed'], isMulti: true },

    // BSS Feeder 1 (IT1)
    { id: 'it1-active', label: 'IT1 Active Power', field: 'Active Power', source: 'IT1', unit: 'kW', color: '#ec4899' },
    { id: 'it1-reactive', label: 'IT1 Reactive Power', field: 'Reactive Power', source: 'IT1', unit: 'kVAR', color: '#db2777' },
    { id: 'it1-pf', label: 'IT1 Power Factor', field: 'Power Factor', source: 'IT1', unit: '', color: '#be185d' },
    { id: 'it1-freq', label: 'IT1 Frequency', field: 'Frequency', source: 'IT1', unit: 'Hz', color: '#831843' },
    { id: 'it1-all-currents', label: 'IT1 All Currents', fields: ['Current L1', 'Current L2', 'Current L3'], source: 'IT1', unit: 'A', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true },
    { id: 'it1-current-avg', label: 'IT1 Average Current', field: 'Current', source: 'IT1', unit: 'A', color: '#fbcfe8' },
    { id: 'it1-all-voltages-ll', label: 'IT1 All Voltages (L-L)', fields: ['Voltage L1 L2', 'Voltage L2 L3', 'Voltage L3 L1'], source: 'IT1', unit: 'V', colors: ['#ef4444', '#eab308', '#06b6d4'], isMulti: true },
    { id: 'it1-voltage-ll-avg', label: 'IT1 Average Voltage (L-L)', field: 'Voltage', source: 'IT1', unit: 'V', color: '#f472b6' },
    { id: 'it1-all-voltages-ln', label: 'IT1 All Voltages (L-N)', fields: ['Voltage L1 N', 'Voltage L2 N', 'Voltage L3 N'], source: 'IT1', unit: 'V', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true },
    { id: 'it1-voltage-ln-avg', label: 'IT1 Average Voltage (L-N)', field: 'Voltage LN Avg', source: 'IT1', unit: 'V', color: '#f43f5e' },

    // BSS Feeder 2 (IT2)
    { id: 'it2-active', label: 'IT2 Active Power', field: 'Active Power', source: 'IT2', unit: 'kW', color: '#8b5cf6' },
    { id: 'it2-reactive', label: 'IT2 Reactive Power', field: 'Reactive Power', source: 'IT2', unit: 'kVAR', color: '#7c3aed' },
    { id: 'it2-pf', label: 'IT2 Power Factor', field: 'Power Factor', source: 'IT2', unit: '', color: '#6d28d9' },
    { id: 'it2-freq', label: 'IT2 Frequency', field: 'Frequency', source: 'IT2', unit: 'Hz', color: '#4c1d95' },
    { id: 'it2-all-currents', label: 'IT2 All Currents', fields: ['Current L1', 'Current L2', 'Current L3'], source: 'IT2', unit: 'A', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true },
    { id: 'it2-current-avg', label: 'IT2 Average Current', field: 'Current', source: 'IT2', unit: 'A', color: '#c4b5fd' },
    { id: 'it2-all-voltages-ll', label: 'IT2 All Voltages (L-L)', fields: ['Voltage L1 L2', 'Voltage L2 L3', 'Voltage L3 L1'], source: 'IT2', unit: 'V', colors: ['#ef4444', '#eab308', '#06b6d4'], isMulti: true },
    { id: 'it2-voltage-ll-avg', label: 'IT2 Average Voltage (L-L)', field: 'Voltage', source: 'IT2', unit: 'V', color: '#a78bfa' },
    { id: 'it2-all-voltages-ln', label: 'IT2 All Voltages (L-N)', fields: ['Voltage L1 N', 'Voltage L2 N', 'Voltage L3 N'], source: 'IT2', unit: 'V', colors: ['#f43f5e', '#10b981', '#3b82f6'], isMulti: true },
    { id: 'it2-voltage-ln-avg', label: 'IT2 Average Voltage (L-N)', field: 'Voltage LN Avg', source: 'IT2', unit: 'V', color: '#a855f7' },

    // Weather Station
    { id: 'irradiance', label: 'Global Irradiance', field: 'Global Irradiance', source: 'weather_station', unit: 'W/m²', color: '#ef4444' },
    { id: 'air-temp', label: 'Air Temperature', field: 'Air Temperature', source: 'weather_station', unit: '°C', color: '#10b981' },
    { id: 'ext-temp', label: 'External Temperature', field: 'External Temperature', source: 'weather_station', unit: '°C', color: '#059669' },
    { id: 'humidity', label: 'Relative Humidity', field: 'Relative Humidity', source: 'weather_station', unit: '%', color: '#8b5cf6' },
    { id: 'wind-speed', label: 'Wind Speed', field: 'Wind Speed', source: 'weather_station', unit: 'm/s', color: '#06b6d4' },
    { id: 'wind-dir', label: 'Wind Direction', field: 'Wind Direction', source: 'weather_station', unit: '°', color: '#0891b2' }
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

        let fieldParam
        if (config.isMulti && config.source !== 'Compare-LVSW' && config.source !== 'Compare-IT') {
            fieldParam = config.fields.join(',')
        } else {
            fieldParam = config.field
        }

        let params = { field: fieldParam, source: config.source }
        
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

const getValue = (dataset, fieldName) => {
    if (!dataset || !dataset.length) return 0
    const item = dataset.find(d => d._field === fieldName)
    return item?._value ?? 0
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

// Power Quality Calculators
const calcVoltageUnbalance = (v1, v2, v3) => {
    if (!v1 && !v2 && !v3) return { value: '0.00', status: 'N/A', class: 'pq-neutral' }
    const avg = (v1 + v2 + v3) / 3
    if (avg === 0) return { value: '0.00', status: 'N/A', class: 'pq-neutral' }
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
}

const calcCurrentUnbalance = (i1, i2, i3) => {
    if (!i1 && !i2 && !i3) return { value: '0.00', status: 'N/A', class: 'pq-neutral' }
    const avg = (i1 + i2 + i3) / 3
    if (avg === 0) return { value: '0.00', status: 'N/A', class: 'pq-neutral' }
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
}

const calcPowerFactorStatus = (pf) => {
    if (!pf || pf === 0) return { value: '0.00', status: 'N/A', class: 'pq-neutral' }
    let status = 'Good'
    let cssClass = 'pq-good'
    const absPf = Math.abs(pf)
    if (absPf < 0.8) {
        status = 'Poor'
        cssClass = 'pq-poor'
    } else if (absPf < 0.9) {
        status = 'Fair'
        cssClass = 'pq-warning'
    }
    return { value: pf.toFixed(2), status, class: cssClass }
}

const calcOverallPQ = (vUnb, iUnb, pfStat) => {
    const statuses = [vUnb.status, iUnb.status, pfStat.status]
    if (statuses.includes('Poor')) return { status: 'Poor', class: 'pq-overall-poor' }
    if (statuses.includes('Warning') || statuses.includes('Fair')) return { status: 'Fair', class: 'pq-overall-warning' }
    if (statuses.every(s => s === 'N/A')) return { status: 'N/A', class: 'pq-overall-neutral' }
    return { status: 'Good', class: 'pq-overall-good' }
}

// PLTS Solar Totals & Metrics
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

const totalEnergyDelivered = computed(() => {
    return getValue(lvsw1Data.value, 'Active Energy Delivered') + getValue(lvsw2Data.value, 'Active Energy Delivered')
})

const totalEnergyReceived = computed(() => {
    return getValue(lvsw1Data.value, 'Active Energy Received') + getValue(lvsw2Data.value, 'Active Energy Received')
})

const pltsStatus = computed(() => totalActivePower.value > 0.5 ? 'operating' : 'standby')
const pltsStatusText = computed(() => pltsStatus.value === 'operating' ? 'OPERATING' : 'STANDBY')
const pltsStatusBadgeClass = computed(() => pltsStatus.value === 'operating' ? 'bg-success text-white' : 'bg-warning text-gray-800')

// PLTS Feeder 1 (LVSW1) Computeds
const lvsw1_status = computed(() => getValue(lvsw1Data.value, 'Active Power') > 0.5 ? { text: 'OPERATING', badgeClass: 'bg-success text-white' } : { text: 'STANDBY', badgeClass: 'bg-warning text-gray-800' })
const lvsw1_vUnb = computed(() => calcVoltageUnbalance(getValue(lvsw1Data.value, 'Voltage L1 L2'), getValue(lvsw1Data.value, 'Voltage L2 L3'), getValue(lvsw1Data.value, 'Voltage L3 L1')))
const lvsw1_iUnb = computed(() => calcCurrentUnbalance(getValue(lvsw1Data.value, 'Current L1'), getValue(lvsw1Data.value, 'Current L2'), getValue(lvsw1Data.value, 'Current L3')))
const lvsw1_pfStat = computed(() => calcPowerFactorStatus(getValue(lvsw1Data.value, 'Power Factor')))
const lvsw1_overallPQ = computed(() => calcOverallPQ(lvsw1_vUnb.value, lvsw1_iUnb.value, lvsw1_pfStat.value))

// PLTS Feeder 2 (LVSW2) Computeds
const lvsw2_status = computed(() => getValue(lvsw2Data.value, 'Active Power') > 0.5 ? { text: 'OPERATING', badgeClass: 'bg-success text-white' } : { text: 'STANDBY', badgeClass: 'bg-warning text-gray-800' })
const lvsw2_vUnb = computed(() => calcVoltageUnbalance(getValue(lvsw2Data.value, 'Voltage L1 L2'), getValue(lvsw2Data.value, 'Voltage L2 L3'), getValue(lvsw2Data.value, 'Voltage L3 L1')))
const lvsw2_iUnb = computed(() => calcCurrentUnbalance(getValue(lvsw2Data.value, 'Current L1'), getValue(lvsw2Data.value, 'Current L2'), getValue(lvsw2Data.value, 'Current L3')))
const lvsw2_pfStat = computed(() => calcPowerFactorStatus(getValue(lvsw2Data.value, 'Power Factor')))
const lvsw2_overallPQ = computed(() => calcOverallPQ(lvsw2_vUnb.value, lvsw2_iUnb.value, lvsw2_pfStat.value))

// BSS Totals & Metrics
const bssTotalActivePower = computed(() => {
    return getValue(it1Data.value, 'Active Power') + getValue(it2Data.value, 'Active Power')
})

const bssTotalReactivePower = computed(() => {
    return getValue(it1Data.value, 'Reactive Power') + getValue(it2Data.value, 'Reactive Power')
})

const bssAvgPowerFactor = computed(() => {
    const pf1 = getValue(it1Data.value, 'Power Factor')
    const pf2 = getValue(it2Data.value, 'Power Factor')
    if (pf1 && pf2) return (pf1 + pf2) / 2
    return pf1 || pf2 || 0
})

const bssTotalEnergyDelivered = computed(() => {
    return getValue(it1Data.value, 'Active Energy Delivered') + getValue(it2Data.value, 'Active Energy Delivered')
})

const bssTotalEnergyReceived = computed(() => {
    return getValue(it1Data.value, 'Active Energy Received') + getValue(it2Data.value, 'Active Energy Received')
})

// BSS Feeder 1 (IT1) Computeds
const it1_status = computed(() => {
    const p = getValue(it1Data.value, 'Active Power')
    if (p > 0.5) return { text: 'DISCHARGING', badgeClass: 'bg-success text-white' }
    if (p < -0.5) return { text: 'CHARGING', badgeClass: 'bg-info text-white' }
    return { text: 'STANDBY', badgeClass: 'bg-warning text-gray-800' }
})
const it1_vUnb = computed(() => calcVoltageUnbalance(getValue(it1Data.value, 'Voltage L1 L2'), getValue(it1Data.value, 'Voltage L2 L3'), getValue(it1Data.value, 'Voltage L3 L1')))
const it1_iUnb = computed(() => calcCurrentUnbalance(getValue(it1Data.value, 'Current L1'), getValue(it1Data.value, 'Current L2'), getValue(it1Data.value, 'Current L3')))
const it1_pfStat = computed(() => calcPowerFactorStatus(getValue(it1Data.value, 'Power Factor')))
const it1_overallPQ = computed(() => calcOverallPQ(it1_vUnb.value, it1_iUnb.value, it1_pfStat.value))

// BSS Feeder 2 (IT2) Computeds
const it2_status = computed(() => {
    const p = getValue(it2Data.value, 'Active Power')
    if (p > 0.5) return { text: 'DISCHARGING', badgeClass: 'bg-success text-white' }
    if (p < -0.5) return { text: 'CHARGING', badgeClass: 'bg-info text-white' }
    return { text: 'STANDBY', badgeClass: 'bg-warning text-gray-800' }
})
const it2_vUnb = computed(() => calcVoltageUnbalance(getValue(it2Data.value, 'Voltage L1 L2'), getValue(it2Data.value, 'Voltage L2 L3'), getValue(it2Data.value, 'Voltage L3 L1')))
const it2_iUnb = computed(() => calcCurrentUnbalance(getValue(it2Data.value, 'Current L1'), getValue(it2Data.value, 'Current L2'), getValue(it2Data.value, 'Current L3')))
const it2_pfStat = computed(() => calcPowerFactorStatus(getValue(it2Data.value, 'Power Factor')))
const it2_overallPQ = computed(() => calcOverallPQ(it2_vUnb.value, it2_iUnb.value, it2_pfStat.value))

const { isDark } = useTheme()

// Chart Stats
const chartStats = computed(() => {
    if (!historyData.value || historyData.value.length === 0) return null
    
    const config = activeTabConfig.value
    if (!config) return null
    
    let decimals = 0
    const f = config.field || (config.fields ? config.fields[0] : '')
    if (f.includes('Power Factor') || f === 'Frequency' || f === 'Wind Speed' || f === 'Air Temperature' || f === 'External Temperature' || f === 'Relative Humidity') {
        decimals = 2
    } else {
        decimals = 0
    }

    const formatStat = (val) => {
        if (typeof val !== 'number' || isNaN(val)) return '0'
        if (Math.abs(val) < 0.01) return (0).toFixed(decimals)
        return val.toFixed(decimals)
    }

    const formatDateWithSeconds = (dStr) => {
        if (!dStr) return null
        const date = new Date(dStr)
        return date.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
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

// Chart Data Construction
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

const chartData = computed(() => {
    if (!historyData.value || historyData.value.length === 0) return null
    
    const config = activeTabConfig.value
    if (!config) return null

    if (config.isMulti) {
        // Multi-line chart (align all timestamps via timeMap)
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
        // Single-line chart with gradient fill
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

const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const exportCSV = async () => {
    const config = activeTabConfig.value
    if (!config) return

    try {
        isExporting.value = true
        let fieldParam
        if (config.isMulti && config.source !== 'Compare-LVSW' && config.source !== 'Compare-IT') {
            fieldParam = config.fields.join(',')
        } else {
            fieldParam = config.field
        }

        const params = { 
            field: fieldParam,
            source: config.source,
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
        
        const rawData = await $fetch(`/api/monitoring/history/plts`, { params })
        if (!rawData || rawData.length === 0) {
            alert('No raw data available to export for this time range.')
            return
        }
        
        const rows = [['Timestamp', 'Measurement', 'Field', 'Value']]
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
            rows.push([`"${time}"`, `"${d._measurement || ''}"`, `"${d._field || ''}"`, d._value])
        })
        
        const csvContent = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `PLTS_${config.label.replace(/[^a-zA-Z0-9_-]/g, '_')}_RAW_${timeRange.value}.csv`)
        link.click()
        
        URL.revokeObjectURL(url)
    } catch (err) {
        console.error('Export CSV Error:', err)
        alert('Failed to export raw CSV data.')
    } finally {
        isExporting.value = false
    }
}
</script>

<style scoped>
/* Design system styles matching [id].vue */
.page-header { display: flex; flex-direction: column; width: 100%; }
.header-top-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.header-left-group { display: flex; align-items: center; gap: var(--space-4); }
.header-date-mobile { display: none; }
.btn-back { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); text-decoration: none; font-weight: 500; transition: color 0.2s; }
.btn-back:hover { color: var(--primary-600); }
.divider-vertical { width: 1px; background-color: var(--border-color); height: 1.5rem; }

.status-badge { padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.bg-success { background-color: var(--success); color: white; }
.bg-warning { background-color: var(--warning); color: #1f2937; }
.bg-info { background-color: #0284c7; color: white; }
.bg-danger { background-color: #ef4444; color: white; }

.frequency-display { font-size: 2rem; font-weight: 800; color: var(--text-main); line-height: 1; letter-spacing: -0.02em; }

/* 3 Columns strictly for primary metrics */
.metrics-grid { 
    display: grid; 
    grid-template-columns: repeat(3, 1fr); 
    gap: var(--space-4); 
}

.metric-card { background: var(--bg-hover); border-radius: var(--radius-md); padding: var(--space-4); text-align: center; }
.metric-label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
.metric-value-primary { font-size: 1.5rem; font-weight: 700; color: var(--text-main); }
.metric-value-primary small { font-size: 0.875rem; font-weight: 400; color: var(--text-muted); }

.detail-section {
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    padding: var(--space-4);
}

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
    margin-bottom: var(--space-4);
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

/* Energy Summary Grid (Inside Feeder Telemetry Card) */
.energy-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
}

.energy-summary-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    text-align: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.energy-summary-label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
}

.energy-summary-value {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-main);
    font-family: monospace;
}

.energy-summary-value small {
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--text-muted);
}

/* Feeder Selector Toggle */
.feeder-toggle-bar {
    display: inline-flex;
    background: var(--bg-card);
    padding: 0.25rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
    gap: 0.25rem;
}

.btn-feeder-tab {
    padding: 0.35rem 0.85rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-feeder-tab:hover {
    color: var(--text-main);
}

.btn-feeder-tab.active {
    background: var(--primary-500);
    color: white;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* Feeders Container */
.feeders-container {
    display: grid;
    gap: 1.25rem;
    margin-top: 1rem;
}

.grid-2-cols {
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}

.grid-1-col {
    grid-template-columns: 1fr;
}

/* Feeder Box */
.feeder-box {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    padding: 1.25rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.feeder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.feeder-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Sub Card */
.sub-card {
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    padding: 0.85rem;
    border-radius: 0.5rem;
}

.sub-card-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.25rem;
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
    margin-bottom: 0.25rem;
}

.value-number {
    font-family: monospace;
    font-size: 1.05rem;
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
    gap: var(--space-2);
}

.pq-item {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.25rem;
    text-align: center;
}

.pq-label {
    display: block;
    font-size: 0.65rem;
    color: var(--text-muted);
    margin-bottom: 0.2rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.pq-value-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    margin-bottom: 0.25rem;
    flex-wrap: wrap;
}

.pq-value {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-main);
}

.pq-status-badge {
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    font-size: 0.6rem;
    font-weight: 600;
    text-transform: uppercase;
}

.pq-good { background: var(--success-light); color: #166534; }
.pq-warning { background: var(--warning-light); color: #92400e; }
.pq-poor { background: var(--danger-light); color: #991b1b; }
.pq-neutral { background: var(--gray-200); color: var(--gray-600); }
.pq-threshold { font-size: 0.6rem; color: var(--gray-400); }

.overall-status-badge {
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
}

.pq-overall-good { background: var(--success-light); color: #166534; }
.pq-overall-warning { background: var(--warning-light); color: #92400e; }
.pq-overall-poor { background: var(--danger-light); color: #991b1b; }
.pq-overall-neutral { background: var(--bg-hover); color: var(--text-muted); }

/* Weather Card */
.weather-metric {
    background: var(--bg-hover);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
    .energy-summary-grid { grid-template-columns: 1fr; }
    
    .chart-controls { 
        flex-direction: column; 
        align-items: stretch; 
        gap: 1rem;
    }

    .chart-controls > div:first-child {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .param-select {
        flex: 1;
        width: 100%;
        min-width: 0;
    }

    .chart-actions { 
        justify-content: space-between; 
        width: 100%;
    }

    .stats-bar { gap: 1.5rem; flex-wrap: wrap; }
    .stat-time {
        font-size: 0.55rem;
        letter-spacing: -0.02em;
        line-height: 1.1;
        margin-top: 0.15rem;
    }

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

    .feeder-toggle-bar {
        width: 100%;
        justify-content: space-between;
    }

    .btn-feeder-tab {
        flex: 1;
        padding: 0.35rem 0.4rem;
        font-size: 0.7rem;
        text-align: center;
    }

    .values-grid {
        grid-template-columns: repeat(2, 1fr) !important;
    }
}
</style>
