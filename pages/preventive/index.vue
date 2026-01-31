<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h1 class="home-title m-0">Jadwal Preventive Maintenance</h1>
      
      <div class="flex gap-2">
        <!-- View Toggle -->
        <div class="view-toggle">
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            <span class="icon">📋</span> Tabel
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'calendar' }"
            @click="viewMode = 'calendar'"
          >
            <span class="icon">📅</span> Kalender
          </button>
        </div>

        <!-- Date Filters (Calendar View Only) -->
        <template v-if="viewMode === 'calendar'">
          <input 
            type="date" 
            v-model="startDate" 
            class="form-input form-input-sm"
            style="width: 140px;"
          />
          <input 
            type="date" 
            v-model="endDate" 
            class="form-input form-input-sm"
            style="width: 140px;"
          />
          <button class="btn btn-primary btn-sm" @click="filterSchedule">
            Filter
          </button>
        </template>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading || pending" class="text-center py-4">
      <div class="spinner spinner-lg"></div>
      <p class="mt-4 text-muted">Memuat data...</p>
    </div>
    
    <!-- Table View -->
    <MaintenanceTable v-else-if="viewMode === 'table'" :data="tableData" />
    
    <!-- Calendar View -->
    <PMCalendar v-else :events="events || []" @event-click="handleEventClick" />
  </div>
</template>

<script setup>
const viewMode = ref('table')
const startDate = ref('')
const endDate = ref('')

// Data for Table View
const { serviceHours, isLoading, getEngineName, gantiOliCycles, overhaulCycles } = useMaintenanceData()

// Fetch PM schedule (used by both views)
const { data: pmSchedule, pending: schedulePending, refresh } = await useFetch('/api/pm/schedule', {
  key: 'pm-schedule',
  default: () => []
})

// For calendar view, events = pmSchedule
const events = pmSchedule
const pending = schedulePending

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

// Calendar functions
const filterSchedule = async () => {
  const params = new URLSearchParams()
  if (startDate.value) params.append('start', startDate.value)
  if (endDate.value) params.append('end', endDate.value)
  
  await refresh()
}

const handleEventClick = (event) => {
  if (event.extendedProps?.url) {
    // Save to localStorage
    const eventData = {
      id: event.id,
      pm: event.title.split(' ')[0],
      unit: event.extendedProps.unit,
      ...event.extendedProps
    }
    localStorage.setItem('selectedEvent', JSON.stringify(eventData))
    
    navigateTo(event.extendedProps.url)
  }
}
</script>

<style scoped>
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

.icon {
  font-size: 1rem;
}
</style>
