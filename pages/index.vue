<template>
  <div class="animate-fade-in">
    <h1 class="home-title">PLTD Tahuna Maintenance App</h1>
    
    <div v-if="isLoading" class="text-center py-4">
      <div class="spinner spinner-lg"></div>
      <p class="mt-4 text-muted">Memuat data...</p>
    </div>
    
    <MaintenanceTable v-else :data="tableData" />
  </div>
</template>

<script setup>
const { serviceHours, isLoading, getEngineName, gantiOliCycles, overhaulCycles } = useMaintenanceData()

// Fetch PM schedule
const { data: pmSchedule } = await useFetch('/api/pm/schedule', {
  default: () => []
})

// Computed table data
const tableData = computed(() => {
  if (!serviceHours.value || serviceHours.value.length === 0) return []
  
  return serviceHours.value.map((item, index) => {
    const pm = pmSchedule.value?.find(pm => pm.extendedProps?.unit === item.unit) || {
      title: 'No PM Scheduled',
      id: '',
      extendedProps: { daysFromToday: 0, targetHours: 0, currentHours: 0 }
    }
    
    return {
      ...item,
      gantiOliCycles: gantiOliCycles[index] || 250,
      overhaulCycles: overhaulCycles[index] || 6000,
      mesin: getEngineName(item.unit),
      pm
    }
  })
})
</script>
