<template>
  <div class="chart-container">
    <Line ref="chartRef" :data="chartData" :options="chartOptions" :plugins="chartPlugins" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler,
  zoomPlugin
)

const chartRef = ref(null)

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
            display: false
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            titleColor: '#e2e8f0',
            bodyColor: '#e2e8f0',
            borderColor: '#475569',
            borderWidth: 1
        }
      },
      scales: {
        x: {
            grid: {
                display: false,
                drawBorder: false
            },
            ticks: {
                color: '#94a3b8',
                font: {
                    family: "'Inter', sans-serif",
                    size: 11
                }
            }
        },
        y: {
            grid: {
                color: 'rgba(148, 163, 184, 0.1)',
                drawBorder: false
            },
            ticks: {
                color: '#94a3b8',
                font: {
                    family: "'Inter', sans-serif",
                    size: 11
                }
            }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      elements: {
        line: {
            tension: 0.4
        },
        point: {
            radius: 0,
            hoverRadius: 6
        }
      }
    })
  },
  chartPlugins: {
    type: Array,
    default: () => []
  }
})

defineExpose({
  resetZoom: () => {
    if (chartRef.value?.chart) {
      chartRef.value.chart.resetZoom()
    }
  },
  getChartInstance: () => chartRef.value?.chart || null
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
