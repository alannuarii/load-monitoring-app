<template>
  <div class="animate-fade-in">
    <h1 class="home-title">Perencanaan Material Fast Moving</h1>
    
    <!-- Filter Section -->
    <DataCard class="mb-6">
      <template #header>
        🔍 Filter Perencanaan
      </template>
      
      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-label">Waktu Awal</label>
          <input 
            type="date" 
            v-model="startDate" 
            class="form-input"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Waktu Akhir</label>
          <input 
            type="date" 
            v-model="endDate" 
            class="form-input"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Mesin/Unit</label>
          <select v-model="selectedUnit" class="form-select">
            <option value="">Pilih unit...</option>
            <optgroup label="Unit Individu">
              <option v-for="unit in availableUnits" :key="unit.value" :value="unit.value">
                {{ unit.label }}
              </option>
            </optgroup>
            <optgroup label="Mesin Sejenis">
              <option v-for="group in engineGroups" :key="group.value" :value="group.value">
                {{ group.label }}
              </option>
            </optgroup>
          </select>
        </div>
        
        <div class="filter-group filter-action">
          <button 
            class="btn btn-primary btn-lg" 
            @click="calculateMaterials"
            :disabled="!canCalculate || isLoading"
          >
            <span v-if="isLoading" class="spinner spinner-sm mr-2"></span>
            {{ isLoading ? 'Menghitung...' : 'Hitung' }}
          </button>
        </div>
      </div>
    </DataCard>
    
    <!-- Results Section -->
    <div v-if="hasResults" class="results-section">
      <!-- PM Summary -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <DataCard>
          <template #header>
            📊 Total PM
          </template>
          
          <div class="total-pm-display">
            <span class="total-pm-value">{{ planData.totalPM }}</span>
            <span class="total-pm-label">Pemeliharaan</span>
          </div>
          
          <div class="pm-breakdown">
            <div v-for="pm in ['P1', 'P2', 'P3', 'P4', 'P5']" :key="pm" class="pm-item">
              <span class="pm-label">{{ pm }}</span>
              <span class="pm-count">{{ planData.pmCounts[pm] || 0 }}</span>
            </div>
          </div>
        </DataCard>
        
        <DataCard>
          <template #header>
            ⚙️ Informasi Mesin
          </template>
          
          <div class="engine-info">
            <div v-for="engine in planData.engineInfo" :key="engine.unit" class="engine-item">
              <span class="engine-unit">Unit {{ engine.unit }}</span>
              <span class="engine-name">{{ engine.mesin }}</span>
            </div>
          </div>
          
          <div class="date-range-info">
            <span class="text-muted">Periode:</span>
            <span class="font-semibold">{{ formatDate(planData.dateRange?.start) }} - {{ formatDate(planData.dateRange?.end) }}</span>
          </div>
        </DataCard>
      </div>
      
      <!-- Materials Table -->
      <DataCard>
        <template #header>
          🛠️ Material Fast Moving
        </template>
        
        <div v-if="planData.materials?.length" class="materials-table-container">
          <table class="materials-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 50px;">No</th>
                <th>Nama Material</th>
                <th class="text-center" style="width: 120px;">Jumlah</th>
                <th class="text-center" style="width: 100px;">Satuan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in planData.materials" :key="index">
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ item.nama }}</td>
                <td class="text-center">
                  <div class="qty-display">
                    <span class="material-qty">{{ formatNumber(item.jumlah) }}</span>
                    <span v-if="item.nama === 'Lube Oil' && item.satuan === 'liter'" class="drum-conversion">
                      ≈ {{ formatDrums(item.jumlah) }} drum
                    </span>
                  </div>
                </td>
                <td class="text-center">{{ item.satuan }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="empty-state">
          <p class="text-muted">Tidak ada material yang ditemukan untuk periode ini</p>
        </div>
      </DataCard>
    </div>
    
    <!-- Empty State -->
    <DataCard v-else-if="!isLoading && !hasResults">
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p class="text-muted">Pilih rentang waktu dan unit mesin, lalu klik "Hitung" untuk melihat perencanaan material.</p>
      </div>
    </DataCard>
  </div>
</template>

<script setup>
const startDate = ref('')
const endDate = ref('')
const selectedUnit = ref('')
const isLoading = ref(false)
const planData = ref(null)

// Available individual units
const availableUnits = [
  { value: '1', label: 'SWD 6FHD 240 Unit 1' },
  { value: '4', label: 'Deutz MWM 212 V12 Unit 4' },
  { value: '5', label: 'Deutz MWM 212 V12 Unit 5' },
  { value: '6', label: 'Mitsubishi S16R PTA-S Unit 6' },
  { value: '7', label: 'Mitsubishi S16R PTA-S Unit 7' },
  { value: '8', label: 'Cummins KTA50-G8 Unit 8' },
  { value: '9', label: 'Cummins KTA50-G8 Unit 9' }
]

// Grouped similar engines
const engineGroups = [
  { value: '4,5', label: 'Deutz MWM 212 V12 (Unit 4 & 5)' },
  { value: '6,7', label: 'Mitsubishi S16R PTA-S (Unit 6 & 7)' },
  { value: '8,9', label: 'Cummins KTA50-G8 (Unit 8 & 9)' }
]

// Set default date range (current year)
onMounted(() => {
  const now = new Date()
  const year = now.getFullYear()
  startDate.value = `${year}-01-01`
  endDate.value = `${year}-12-31`
})

const canCalculate = computed(() => {
  return startDate.value && endDate.value && selectedUnit.value
})

const hasResults = computed(() => {
  return planData.value && planData.value.totalPM !== undefined
})

const calculateMaterials = async () => {
  if (!canCalculate.value) return
  
  isLoading.value = true
  
  try {
    const response = await $fetch('/api/materials/plan', {
      query: {
        start: startDate.value,
        end: endDate.value,
        units: selectedUnit.value
      }
    })
    
    planData.value = response
  } catch (error) {
    console.error('Error calculating materials:', error)
    planData.value = null
  } finally {
    isLoading.value = false
  }
}

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString('id-ID')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatDrums = (liters) => {
  const drums = liters / 209
  return drums.toFixed(1)
}
</script>

<style scoped>
.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr auto;
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary, #6b7280);
}

.filter-action {
  padding-top: 24px;
}

.form-input,
.form-select {
  padding: 10px 14px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--color-bg, #fff);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-lg {
  padding: 10px 24px;
  font-size: 1rem;
}

.mr-2 {
  margin-right: 8px;
}

/* PM Summary */
.total-pm-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.total-pm-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary, #3b82f6);
  line-height: 1;
}

.total-pm-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #6b7280);
  margin-top: 4px;
}

.pm-breakdown {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.pm-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 12px 8px;
  background: var(--color-bg-secondary, #f9fafb);
  border-radius: 8px;
}

.pm-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary, #6b7280);
}

.pm-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text, #1f2937);
}

/* Engine Info */
.engine-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.engine-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.engine-item:last-child {
  border-bottom: none;
}

.engine-unit {
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
}

.engine-name {
  color: var(--color-text-secondary, #6b7280);
}

.date-range-info {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--color-border, #e5e7eb);
  font-size: 0.9rem;
}

/* Materials Table */
.materials-table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e5e7eb);
}

.materials-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.materials-table th {
  background: var(--color-bg-secondary, #f9fafb);
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary, #6b7280);
  border-bottom: 2px solid var(--color-border, #e5e7eb);
}

.materials-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.materials-table tbody tr:last-child td {
  border-bottom: none;
}

.materials-table tbody tr:hover {
  background: var(--color-bg-hover, #f3f4f6);
}

.material-qty {
  display: inline-block;
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary, #3b82f6);
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  min-width: 60px;
}

.qty-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.drum-conversion {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #6b7280);
  font-style: italic;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .pm-breakdown {
    flex-wrap: wrap;
  }
  
  .pm-item {
    flex: 0 0 calc(50% - 8px);
  }
}
</style>
