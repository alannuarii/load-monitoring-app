<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h1 class="home-title m-0">Profil Unit Pembangkit</h1>
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

const selectUnit = (unit) => {
  selectedUnit.value = unit
  showDetailModal.value = true
}
</script>

<style scoped>
.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.unit-card {
  background: white;
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
  color: var(--gray-800);
}

.unit-card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--gray-500);
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
  color: var(--gray-500);
}

.spec-item .spec-value {
  color: var(--gray-800);
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
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 400px;
  margin: var(--space-4);
}

.modal-xl {
  max-width: 700px;
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
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

/* Section Cards */
.section-card {
  background: var(--gray-50);
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
  color: var(--gray-700);
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
  background: white;
  border-radius: var(--radius-md);
}

.spec-row .spec-label {
  color: var(--gray-500);
  font-size: var(--font-size-sm);
}

.spec-row .spec-value {
  color: var(--gray-800);
  font-weight: 500;
  font-size: var(--font-size-sm);
}
</style>
