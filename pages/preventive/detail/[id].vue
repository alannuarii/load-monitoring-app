<template>
  <div class="animate-fade-in">
    <div class="flex items-center gap-4 mb-6">
      <button class="btn btn-ghost btn-icon" @click="goBack">
        ←
      </button>
      <h1 class="home-title m-0">Detail PM {{ eventData?.pm }}</h1>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <DataCard>
        <template #header>
          ℹ️ Informasi Mesin
        </template>
        
        <div class="flex flex-col gap-3">
          <div class="flex justify-between">
            <span class="text-muted">Unit</span>
            <span class="font-semibold">Unit {{ eventData?.unit }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Mesin</span>
            <span class="font-semibold">{{ eventData?.mesin || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Jenis PM</span>
            <span class="badge badge-primary">{{ eventData?.pm }}</span>
          </div>
        </div>
      </DataCard>
      
      <DataCard>
        <template #header>
          ⏱️ Jam Operasi
        </template>
        
        <div class="flex flex-col gap-3">
          <div class="flex justify-between">
            <span class="text-muted">Current</span>
            <span class="font-semibold">{{ eventData?.currentHours }} jam</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Target</span>
            <span class="font-semibold">{{ eventData?.targetHours }} jam</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Tanggal PM</span>
            <span class="font-semibold">{{ eventData?.tanggalPM }}</span>
          </div>
        </div>
      </DataCard>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const eventData = ref(null)

onMounted(() => {
  // Get data from localStorage
  const stored = localStorage.getItem('selectedEvent')
  if (stored) {
    eventData.value = JSON.parse(stored)
  }
})

const goBack = () => {
  router.back()
}
</script>
