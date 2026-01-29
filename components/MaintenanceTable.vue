<template>
  <div class="table-wrapper">
    <table class="table">
      <caption class="home-caption">
        Data tanggal {{ dataDate }}
      </caption>
      
      <thead>
        <tr>
          <th>Unit</th>
          <th>Operasi (Jam)</th>
          <th>Ganti Oli (Jam)</th>
          <th>Overhaul (Jam)</th>
          <th>PM (P1-P5)</th>
        </tr>
      </thead>
      
      <tbody>
        <tr v-for="item in data" :key="item.unit">
          <td class="font-semibold">Unit {{ item.unit }}</td>
          <td :class="getOperasiClass(item)">
            {{ operasiValue(item) }} / <span class="font-semibold">{{ operasiTarget(item) }}</span>
          </td>
          <td :class="getGantiOliClass(item)">
            {{ Math.floor(item.gantiOli || item.ganti_oli) }} / <span class="font-semibold">{{ item.gantiOliCycles }}</span>
          </td>
          <td :class="getOverhaulClass(item)">
            {{ Math.floor(item.jamoperasi) }} / <span class="font-semibold">{{ item.overhaulCycles }}</span>
          </td>
          <td>
            <NuxtLink 
              :to="`/preventive/detail/${item.pm?.id || ''}`" 
              class="badge badge-primary"
              @click="savePmToLocalStorage(item)"
            >
              {{ pmTimeToGo(item) }}h → {{ pmTitle(item) }}
            </NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { convertTime } from '~/server/lib/utils/date.js'
import { gantiOliHours } from '~/server/lib/data/pmCycles.js'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Computed data date
const dataDate = computed(() => {
  if (props.data.length > 0 && props.data[0].waktu) {
    return convertTime(props.data[0].waktu, 1)
  }
  return 'Loading...'
})

// Operasi calculations
const operasiValue = (item) => {
  return Math.floor((item.jamoperasi % 3000) % item.gantiOliCycles)
}

const operasiTarget = (item) => {
  return gantiOliHours((item.jamoperasi % 3000) % item.gantiOliCycles, item.unit)
}

// PM display values
const pmTimeToGo = (item) => {
  const target = operasiTarget(item)
  const current = operasiValue(item)
  return target ? target - current : 0
}

const pmTitle = (item) => {
  return item.pm?.title?.replace(/\s#\d+$/, '') || 'N/A'
}

// CSS classes for status colors
const getOperasiClass = (item) => {
  const val = operasiValue(item)
  const cycle = item.gantiOliCycles
  if (val > cycle) return 'table-status-danger'
  if (val >= 0.9 * cycle && cycle === 250) return 'table-status-warning'
  if (val >= 0.95 * cycle && cycle === 500) return 'table-status-warning'
  return ''
}

const getGantiOliClass = (item) => {
  const val = item.gantiOli || item.ganti_oli || 0
  const cycle = item.gantiOliCycles
  if (val > cycle) return 'table-status-danger'
  if (val >= 0.9 * cycle && cycle === 250) return 'table-status-warning'
  if (val >= 0.95 * cycle && cycle === 500) return 'table-status-warning'
  return ''
}

const getOverhaulClass = (item) => {
  const val = item.jamoperasi
  const cycle = item.overhaulCycles
  if (val > cycle) return 'table-status-danger'
  if (val >= 0.75 * cycle) return 'table-status-warning'
  return ''
}

// Save PM data to localStorage
const savePmToLocalStorage = (item) => {
  if (!item?.pm) return
  
  const eventData = {
    id: item.pm.id,
    mesin: item.mesin,
    unit: item.unit,
    pm: pmTitle(item),
    gantiOli: item.gantiOli || item.ganti_oli,
    gantiOliCycles: item.gantiOliCycles,
    overhaul: item.jamoperasi,
    overhaulCycles: item.overhaulCycles,
    operasi: operasiValue(item),
    tanggalPM: item.pm.start,
    timeToGo: item.pm.extendedProps?.daysFromToday,
    targetHours: item.pm.extendedProps?.targetHours,
    currentHours: item.pm.extendedProps?.currentHours
  }
  
  if (import.meta.client) {
    localStorage.setItem('selectedEvent', JSON.stringify(eventData))
  }
}
</script>
