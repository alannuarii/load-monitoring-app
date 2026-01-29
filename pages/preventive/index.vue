<template>
  <div class="animate-fade-in">
    <div class="flex justify-between items-center mb-6">
      <h1 class="home-title m-0">Jadwal Preventive Maintenance</h1>
      
      <div class="flex gap-2">
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
      </div>
    </div>
    
    <div v-if="pending" class="text-center py-4">
      <div class="spinner spinner-lg"></div>
      <p class="mt-4 text-muted">Memuat jadwal...</p>
    </div>
    
    <PMCalendar v-else :events="events || []" @event-click="handleEventClick" />
  </div>
</template>

<script setup>
const startDate = ref('')
const endDate = ref('')

const { data: events, pending, refresh } = await useFetch('/api/pm/schedule', {
  key: 'pm-schedule',
  default: () => []
})

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
