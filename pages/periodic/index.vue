<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h1 class="home-title m-0">Pemeliharaan Periodik (Overhaul)</h1>
      
      <div class="flex gap-2">
        <!-- View Toggles -->
        <div class="view-toggle">
          <button 
            class="toggle-btn" 
            :class="{ active: activeTab === 'monitoring' }"
            @click="activeTab = 'monitoring'"
          >
            <span class="icon">📊</span> Monitoring
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: activeTab === 'reference' }"
            @click="activeTab = 'reference'"
          >
            <span class="icon">🗺️</span> Referensi Siklus
          </button>
        </div>

        <!-- Input Realization Button -->
        <button class="btn btn-primary" @click="showInputModal = true">
          + Input Realisasi
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-8">
      <div class="spinner spinner-lg"></div>
      <p class="mt-4 text-muted">Memuat data...</p>
    </div>

    <!-- Monitoring View -->
    <div v-else-if="activeTab === 'monitoring'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="unit in combinedData" :key="unit.unit" class="card">
        <div class="card-header justify-between">
          <div class="flex items-center gap-2">
            <span class="unit-badge">Unit {{ unit.unit }}</span>
            <span class="text-sm text-muted">{{ unit.mesin_type }}</span>
          </div>
          <div class="status-indicator" :class="unit.statusClass">
            {{ unit.statusText }}
          </div>
        </div>
        
        <div class="card-body">
          <div class="flex justify-between items-end mb-2">
            <div>
              <div class="text-xs text-muted uppercase font-bold">Total Jam Operasi (JSO)</div>
              <div class="text-2xl font-bold">{{ formatNumber(unit.total_hours) }}</div>
              <div class="text-xs text-muted mt-1">
                Baseline: {{ formatNumber(unit.baseline_hours) }}<br>
                Running: +{{ formatNumber(unit.current_running_hours) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-muted uppercase font-bold">Target: {{ unit.next_cycle_name }}</div>
              <div class="text-lg font-semibold">{{ formatNumber(unit.next_cycle_interval) }}</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <div 
              class="progress-bar" 
              :class="unit.progressColor"
              :style="{ width: `${Math.min(unit.progress, 100)}%` }"
            ></div>
          </div>
          
          <div class="flex justify-between mt-2 text-xs">
            <span class="text-muted">Progress: {{ unit.progress }}%</span>
            <span :class="unit.gapClass">
              {{ unit.gapText }}
            </span>
          </div>
          
          <div class="mt-3 pt-3 border-t border-gray-100 text-xs text-muted">
            Last Overhaul: 
            <span v-if="unit.last_overhaul_type">
              {{ unit.last_overhaul_type }} ({{ formatDate(unit.last_overhaul_date) }})
            </span>
            <span v-else>Belum ada data</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reference View (Timeline) -->
    <div v-else-if="activeTab === 'reference'" class="card">
      <div class="card-body">
        <h3 class="text-lg font-semibold mb-6">Peta Siklus Pemeliharaan</h3>
        
        <div class="timeline-container">
          <div v-for="engine in uniqueEngines" :key="engine.name" class="timeline-row">
            <div class="timeline-header">
              <div class="font-bold">{{ engine.name }}</div>
              <div class="text-xs text-muted">Unit: {{ engine.units.join(', ') }}</div>
            </div>
            
            <div class="timeline-track-wrapper">
              <div class="timeline-track">
                <!-- Intervals -->
                <div 
                  v-for="(point, idx) in engine.cycles" 
                  :key="idx"
                  class="timeline-point"
                  :style="{ left: `${(point.interval / engine.maxInterval) * 100}%` }"
                >
                  <div class="point-marker"></div>
                  <div class="point-label">
                    <div class="cycle-name">{{ point.cycles }}</div>
                    <div class="cycle-interval">{{ formatNumber2(point.interval) }}</div>
                    <div class="cycle-duration">{{ point.duration }} hari</div>
                  </div>
                </div>
                
                <!-- Base Line -->
                <div class="timeline-line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Modal -->
    <div v-if="showInputModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Input Realisasi Overhaul</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Unit</label>
            <select v-model="form.unit" class="form-select">
              <option value="" disabled>Pilih Unit</option>
              <option v-for="engine in engines" :key="engine.unit" :value="engine.unit">
                Unit {{ engine.unit }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Jenis Overhaul</label>
            <select v-model="form.jenis_overhaul" class="form-select">
              <option value="" disabled>Pilih Jenis</option>
              <option value="TO">Top Overhaul (TO)</option>
              <option value="SO">Semi Overhaul (SO)</option>
              <option value="MO">Major Overhaul (MO)</option>
              <option value="2nd Stage">2nd Stage (Cummins)</option>
              <option value="Final Stage">Final Stage (Cummins)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Tanggal Selesai</label>
            <input type="date" v-model="form.tanggal_selesai" class="form-input">
          </div>
          
          <div class="form-group">
            <label class="form-label">Jam Overhaul (Baseline)</label>
            <input 
              type="number" 
              v-model="form.jam_overhaul" 
              class="form-input" 
              placeholder="Contoh: 15000"
            >
            <p class="text-xs text-muted mt-1">Masukkan total jam operasi saat overhaul selesai.</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">Keterangan</label>
            <textarea v-model="form.keterangan" class="form-input" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Batal</button>
          <button class="btn btn-primary" @click="submitRealization" :disabled="submitting">
            {{ submitting ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { overhaulCycles } from '~/server/lib/data/overhaul'
import { engines } from '~/server/lib/data/engineData'

const activeTab = ref('monitoring')
const showInputModal = ref(false)
const submitting = ref(false)

const form = reactive({
  unit: '',
  jenis_overhaul: '',
  tanggal_selesai: '',
  jam_overhaul: '',
  keterangan: ''
})

// Fetch Data
const { data: serviceHours, pending: hoursPending, refresh: refreshHours } = await useFetch('/api/servicehour', {
  key: 'service-hours-periodic'
})

const { data: latestOverhauls, pending: overhaulPending, refresh: refreshOverhauls } = await useFetch('/api/overhaul/latest', {
  key: 'latest-overhauls'
})

const pending = computed(() => hoursPending.value || overhaulPending.value)

// Format helpers
const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(num)
const formatNumber2 = (num) => {
  if (num >= 1000) return (num / 1000) + 'k'
  return num
}
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Compute Monitoring Data
const combinedData = computed(() => {
  if (!serviceHours.value) return []

  const result = []
  
  // Create maps for quick lookup
  const hoursMap = {}
  serviceHours.value.forEach(item => {
    hoursMap[item.unit] = item.jamoperasi || 0
  })

  const overhaulMap = {}
  if (latestOverhauls.value) {
    latestOverhauls.value.forEach(item => {
      overhaulMap[item.unit] = item
    })
  }

  // Process each defined cycle unit
  overhaulCycles.forEach(cycleData => {
    const unit = cycleData.unit
    const currentRun = hoursMap[unit] || 0
    const lastOverhaul = overhaulMap[unit]
    
    // Calculate Absolute Total Hours
    // Total = Baseline (Last Overhaul) + Current Running (Since Reset)
    const baseline = lastOverhaul ? parseInt(lastOverhaul.jam_overhaul) : 0
    const totalHours = baseline + currentRun
    
    // Find next cycle
    const cycles = cycleData.cycles
    let nextCycle = cycles.find(c => c.interval > totalHours)
    
    // Handle overdue / max exceeded
    let isMaxExceeded = false
    if (!nextCycle) {
      nextCycle = cycles[cycles.length - 1]
      isMaxExceeded = true
    }
    
    // Calculate progress
    let progress = 0
    let gap = 0
    
    // Logic: Progress is relative to Total Hours vs Target Interval
    // But for visual bar, it usually looks better if start point is the previous cycle
    // For simplicity as per previous agreement: absolute specific
    
    if (isMaxExceeded) {
      progress = 100
      gap = totalHours - nextCycle.interval
    } else {
      progress = Math.round((totalHours / nextCycle.interval) * 100)
      gap = nextCycle.interval - totalHours
    }

    // Status logic
    let statusText = 'Normal'
    let statusClass = 'text-success'
    let progressColor = 'bg-primary'
    let gapText = `${formatNumber(gap)} jam lagi`
    let gapClass = 'text-muted'

    if (isMaxExceeded) {
       statusText = 'Overdue'
       statusClass = 'badge badge-danger'
       progressColor = 'bg-danger'
       gapText = `+${formatNumber(gap)} jam (Lewat)`
       gapClass = 'text-danger font-bold'
    } else if (progress >= 90) {
       statusText = 'Warning'
       statusClass = 'badge badge-warning'
       progressColor = 'bg-warning'
    } else {
       statusClass = 'badge badge-success'
    }

    result.push({
      unit,
      mesin_type: cycleData.mesin,
      current_running_hours: currentRun,
      baseline_hours: baseline,
      total_hours: totalHours,
      last_overhaul_type: lastOverhaul?.jenis_overhaul,
      last_overhaul_date: lastOverhaul?.tanggal_selesai,
      next_cycle_name: nextCycle.cycles,
      next_cycle_interval: nextCycle.interval,
      progress,
      statusText,
      statusClass,
      progressColor,
      gapText,
      gapClass
    })
  })

  return result
})

// Compute Reference Data
const uniqueEngines = computed(() => {
  const groups = {}
  
  overhaulCycles.forEach(item => {
    const key = item.mesin
    if (!groups[key]) {
      groups[key] = {
        name: key,
        units: [],
        cycles: item.cycles,
        maxInterval: item.cycles[item.cycles.length - 1].interval * 1.1
      }
    }
    groups[key].units.push(item.unit)
  })
  
  return Object.values(groups)
})

// Modal Actions
const closeModal = () => {
  showInputModal.value = false
  // Reset form
  form.unit = ''
  form.jenis_overhaul = ''
  form.tanggal_selesai = ''
  form.jam_overhaul = ''
  form.keterangan = ''
}

const submitRealization = async () => {
  if (!form.unit || !form.jenis_overhaul || !form.tanggal_selesai || !form.jam_overhaul) {
    alert('Mohon lengkapi semua field yang wajib diisi')
    return
  }
  
  submitting.value = true
  try {
    await $fetch('/api/overhaul/realization', {
      method: 'POST',
      body: { ...form, unit: parseInt(form.unit), jam_overhaul: parseInt(form.jam_overhaul) }
    })
    
    alert('Data realisasi berhasil disimpan')
    closeModal()
    await refreshOverhauls() // Update data
  } catch (error) {
    console.error('Error saving:', error)
    alert('Gagal menyimpan data')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* Reuse existing styles plus modal styles */
.view-toggle {
  display: flex;
  background: var(--gray-100);
  border-radius: var(--radius-md);
  padding: 2px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--gray-600);
  transition: all var(--transition-fast);
}

.toggle-btn:hover {
  background: var(--gray-200);
  color: var(--gray-800);
}

.toggle-btn.active {
  background: white;
  color: var(--primary-600);
  box-shadow: var(--shadow-sm);
}

.unit-badge {
  background: var(--primary-100);
  color: var(--primary-700);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.85rem;
}

.progress-container {
  height: 12px;
  background: var(--gray-100);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--space-2);
}

.progress-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.bg-primary { background: var(--primary-500); }
.bg-warning { background: var(--warning); }
.bg-danger { background: var(--danger); }

.text-success { color: var(--success); }

/* Timeline Reference */
.timeline-row {
  margin-bottom: var(--space-8);
}

.timeline-header {
  margin-bottom: var(--space-4);
}

.timeline-track-wrapper {
  padding: 0 var(--space-4);
}

.timeline-track {
  position: relative;
  height: 60px;
}

.timeline-line {
  position: absolute;
  top: 14px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gray-200);
  z-index: 1;
}

.timeline-point {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  items-align: center;
  z-index: 2;
  text-align: center;
}

.point-marker {
  width: 30px;
  height: 30px;
  background: white;
  border: 4px solid var(--primary-500);
  border-radius: 50%;
  margin: 0 auto var(--space-2) auto;
  box-shadow: 0 0 0 4px white;
}

.point-label {
  white-space: nowrap;
}

.cycle-name {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--gray-800);
}

.cycle-interval {
  font-size: 0.75rem;
  color: var(--gray-500);
  background: var(--gray-100);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  display: inline-block;
  margin-top: 2px;
}

.cycle-duration {
  font-size: 0.7rem;
  color: var(--primary-600);
  font-weight: 500;
  margin-top: 2px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  margin: var(--space-4);
}

.modal-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-lg);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--gray-500);
  padding: 0;
  line-height: 1;
}

.modal-body {
  padding: var(--space-4);
}

.modal-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
</style>
