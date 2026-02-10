<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1 class="page-title">Profil Unit Pembangkit</h1>
      <p class="page-subtitle">PLTD Tahuna</p>
    </div>

    <!-- PLTD Summary Card -->
    <div class="pltd-summary-card">
      <!-- Left: Photo Placeholder -->
      <div class="pltd-photo-placeholder">
        <span class="pltd-photo-icon">🏭</span>
        <span class="pltd-photo-text">Foto PLTD Tahuna</span>
      </div>
      
      <!-- Center: Info -->
      <div class="pltd-info">
        <h2 class="pltd-name">PLTD Tahuna</h2>
        <p class="pltd-location">📍 Kabupaten Kepulauan Sangihe, Sulawesi Utara</p>
        <div class="pltd-stats-grid">
          <div class="pltd-stat">
            <span class="pltd-stat-label">DAYA TERPASANG</span>
            <div class="pltd-stat-row">
              <span class="pltd-stat-value">{{ totalDayaTerpasang.toLocaleString('id-ID') }}</span>
              <span class="pltd-stat-unit">kW</span>
            </div>
          </div>
          <div class="pltd-stat">
            <span class="pltd-stat-label">DAYA MAMPU</span>
            <div class="pltd-stat-row">
              <span class="pltd-stat-value">{{ totalDayaMampu.toLocaleString('id-ID') }}</span>
              <span class="pltd-stat-unit">kW</span>
            </div>
          </div>
          <div class="pltd-stat">
            <span class="pltd-stat-label">JUMLAH MESIN</span>
            <div class="pltd-stat-row">
              <span class="pltd-stat-value">{{ jumlahMesin }}</span>
              <span class="pltd-stat-unit">Unit</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right: Map Snapshot -->
      <div class="pltd-map-container">
        <img src="/images/sangihe_map.png" alt="Peta Pulau Sangihe" class="pltd-map-image" />
      </div>
    </div>

    <!-- Units Grid -->
    <div class="units-grid">
      <div 
        v-for="unit in unitsProfile" 
        :key="unit.unit" 
        class="unit-card"
        @click="selectUnit(unit)"
      >
        <div class="unit-card-image">
          <div class="unit-placeholder">
            <span class="unit-placeholder-icon">🏭</span>
          </div>
        </div>
        <div class="unit-card-body">
          <h3 class="unit-card-title">Unit {{ unit.unit }}</h3>
          <p class="unit-card-subtitle">{{ unit.mesin.merek }} {{ unit.mesin.tipe }}</p>
          <div class="unit-card-specs">
            <div class="spec-item">
              <span class="spec-label">Daya Terpasang</span>
              <span class="spec-value">{{ unit.mesin.dayaTerpasang }} kW</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Daya Mampu</span>
              <span class="spec-value">{{ unit.mesin.dayaMampu }} kW</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Tahun Operasi</span>
              <span class="spec-value">{{ unit.mesin.tahunOperasi }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal modal-xl">
        <div class="modal-header">
          <h3 class="modal-title">Detail Unit {{ selectedUnit?.unit }}</h3>
          <button class="modal-close" @click="showDetailModal = false">✕</button>
        </div>
        <div class="modal-body" v-if="selectedUnit">
          <!-- Engine Section -->
          <div class="section-card">
            <h4 class="section-title">⚙️ Data Mesin</h4>
            <div class="specs-grid">
              <div class="spec-row">
                <span class="spec-label">Merek</span>
                <span class="spec-value">{{ selectedUnit.mesin.merek }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Tipe</span>
                <span class="spec-value">{{ selectedUnit.mesin.tipe }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Nomor Seri</span>
                <span class="spec-value">{{ selectedUnit.mesin.nomorSeri }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Daya Terpasang</span>
                <span class="spec-value">{{ selectedUnit.mesin.dayaTerpasang }} kW</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Daya Mampu</span>
                <span class="spec-value">{{ selectedUnit.mesin.dayaMampu }} kW</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Speed</span>
                <span class="spec-value">{{ selectedUnit.mesin.speed }} RPM</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Jumlah Silinder</span>
                <span class="spec-value">{{ selectedUnit.mesin.jumlahSilinder }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Tahun Operasi</span>
                <span class="spec-value">{{ selectedUnit.mesin.tahunOperasi }}</span>
              </div>
            </div>
          </div>

          <!-- Generator Section -->
          <div class="section-card">
            <h4 class="section-title">🔌 Data Generator</h4>
            <div class="specs-grid">
              <div class="spec-row">
                <span class="spec-label">Merek</span>
                <span class="spec-value">{{ selectedUnit.generator.merek }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Tipe</span>
                <span class="spec-value">{{ selectedUnit.generator.tipe }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Nomor Seri</span>
                <span class="spec-value">{{ selectedUnit.generator.nomorSeri }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Daya</span>
                <span class="spec-value">
                  {{ selectedUnit.generator.dayaKW ? selectedUnit.generator.dayaKW + ' kW / ' : '' }}{{ selectedUnit.generator.dayaKVA }} kVA
                </span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Speed</span>
                <span class="spec-value">{{ selectedUnit.generator.speed }} RPM</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Tegangan</span>
                <span class="spec-value">{{ selectedUnit.generator.tegangan }} V</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Arus</span>
                <span class="spec-value">{{ selectedUnit.generator.arus }} A</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Cos Phi</span>
                <span class="spec-value">{{ selectedUnit.generator.cosPhi }}</span>
              </div>
            </div>
          </div>

          <!-- Transformer Section -->
          <div class="section-card">
            <h4 class="section-title">🔋 Data Transformator</h4>
            <div class="specs-grid">
              <div class="spec-row">
                <span class="spec-label">Merek</span>
                <span class="spec-value">{{ selectedUnit.transformator.merek }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Tipe</span>
                <span class="spec-value">{{ selectedUnit.transformator.tipe }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Nomor Seri</span>
                <span class="spec-value">{{ selectedUnit.transformator.nomorSeri }}</span>
              </div>
              <div class="spec-row">
                <span class="spec-label">Daya</span>
                <span class="spec-value">{{ selectedUnit.transformator.dayaKVA }} kVA</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDetailModal = false">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { unitsProfile } from '~/server/lib/data/unitsProfile'

const showDetailModal = ref(false)
const selectedUnit = ref(null)

// PLTD Summary computed values
const totalDayaTerpasang = computed(() => {
  return unitsProfile.reduce((sum, unit) => sum + (unit.mesin.dayaTerpasang || 0), 0)
})

const totalDayaMampu = computed(() => {
  return unitsProfile.reduce((sum, unit) => sum + (unit.mesin.dayaMampu || 0), 0)
})

const jumlahMesin = computed(() => unitsProfile.length)

// Map image exists flag
const mapImageExists = ref(true)

const selectUnit = (unit) => {
  selectedUnit.value = unit
  showDetailModal.value = true
}
</script>

<style scoped>
/* Page Header */
.page-header {
  margin-bottom: var(--space-4);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 var(--space-1) 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0 0 var(--space-4) 0;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
}

/* PLTD Summary Card */
.pltd-summary-card {
  display: flex;
  gap: var(--space-6);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.pltd-photo-placeholder {
  width: 280px;
  min-height: 200px;
  background: linear-gradient(135deg, var(--gray-200), var(--gray-300));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.pltd-photo-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.pltd-photo-text {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.pltd-info {
  flex: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.pltd-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 var(--space-1) 0;
}

.pltd-location {
  font-size: 0.9rem;
  color: var(--gray-500);
  margin: 0 0 var(--space-4) 0;
}

.pltd-stats-grid {
  display: flex;
  gap: var(--space-8);
}

.pltd-stat {
  display: flex;
  flex-direction: column;
}

.pltd-stat-label {
  font-size: 0.7rem;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: var(--space-1);
  font-weight: 700;
}

.pltd-stat-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.pltd-stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary-600);
  line-height: 1;
}

.pltd-stat-unit {
  font-size: 0.875rem;
  color: var(--gray-500);
}

.pltd-map-container {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #87CEEB;
}

.pltd-map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .pltd-summary-card {
    flex-direction: column;
  }
  
  .pltd-photo-placeholder {
    width: 100%;
    min-height: 150px;
  }
  
  .pltd-map-container {
    width: 100%;
    height: 150px;
  }
  
  .pltd-stats-grid {
    flex-wrap: wrap;
    gap: var(--space-4);
  }
}

@media (max-width: 480px) {
  .pltd-stat-value {
    font-size: 1.5rem;
  }
}

.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-4);
}

.unit-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
}

.unit-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.unit-card-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  display: flex;
  align-items: center;
  justify-content: center;
}

.unit-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.unit-placeholder-icon {
  font-size: 4rem;
  filter: grayscale(100%) brightness(200%);
}

.unit-card-body {
  padding: var(--space-4);
}

.unit-card-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0 0 var(--space-1) 0;
  color: var(--text-main);
}

.unit-card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0 0 var(--space-3) 0;
}

.unit-card-specs {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--gray-100);
}

.spec-item {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.spec-item .spec-label {
  color: var(--text-muted);
}

.spec-item .spec-value {
  color: var(--text-main);
  font-weight: 600;
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
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  margin: var(--space-4);
}

@media (max-width: 640px) {
  .modal {
    margin: var(--space-2);
    width: calc(100% - var(--space-4));
    max-height: 85vh;
  }

  .modal-body {
    max-height: 60vh;
  }
}

.modal-xl {
  max-width: 700px;
}

.modal-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-color);
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
  color: var(--text-muted);
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: var(--gray-700);
}

.modal-body {
  padding: var(--space-4);
  max-height: 70vh;
  overflow-y: auto;
}

.modal-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

/* Section Cards */
.section-card {
  background: var(--bg-hover);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.section-card:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 var(--space-3) 0;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}

@media (max-width: 480px) {
  .specs-grid {
    grid-template-columns: 1fr;
  }
}

.spec-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2);
  background: var(--bg-input);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.spec-row .spec-label {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.spec-row .spec-value {
  color: var(--text-main);
  font-weight: 500;
  font-size: var(--font-size-sm);
}
</style>
