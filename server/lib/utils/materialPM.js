import { fastMovingMaterials } from '../data/fastMoving.js'

// Add materials to schedule array based on PM cycle
export function addMaterialsToSchedule(scheduleArray) {
    const orderedCycles = ["P1", "P2", "P3", "P4", "P5"]

    return scheduleArray.map(item => {
        const [cycle, unitWithHash] = item.title.split(' ')
        const unit = parseInt(unitWithHash.replace('#', ''), 10)

        const unitMaterialData = fastMovingMaterials.find(m => m.unit === unit)

        const cycleIndex = orderedCycles.indexOf(cycle)
        const allowedCycles = orderedCycles.slice(0, cycleIndex + 1)

        const materialsForCycle = unitMaterialData
            ? unitMaterialData.material.filter(m => allowedCycles.includes(m.cycle))
            : []

        return {
            ...item,
            material: materialsForCycle
        }
    })
}

// Sum materials and PM by cycle
export function sumMaterialsAndPMByCycle(scheduleArray) {
    const orderedCycles = ["P1", "P2", "P3", "P4", "P5"]

    const pm = {
        totalPM: 0,
        cycles: orderedCycles.map(cycle => ({ cycle, total: 0 }))
    }

    const materialTotals = {}

    scheduleArray.forEach(item => {
        pm.totalPM += 1

        const [cycle, unitWithHash] = item.title.split(' ')
        const unit = parseInt(unitWithHash.replace('#', ''), 10)
        const unitMaterialData = fastMovingMaterials.find(m => m.unit === unit)

        const cycleIndex = orderedCycles.indexOf(cycle)
        if (cycleIndex !== -1) {
            pm.cycles[cycleIndex].total += 1
        }

        if (!unitMaterialData) return

        const allowedCycles = orderedCycles.slice(0, cycleIndex + 1)
        const filteredMaterials = unitMaterialData.material.filter(m => allowedCycles.includes(m.cycle))

        filteredMaterials.forEach(m => {
            const key = `${m.nama} (${m.satuan})`
            if (!materialTotals[key]) {
                materialTotals[key] = 0
            }
            materialTotals[key] += m.jumlah
        })
    })

    return {
        pm,
        totalMaterials: Object.entries(materialTotals).map(([key, jumlah]) => {
            const match = key.match(/(.+)\s\((.+)\)/)
            return {
                nama: match[1],
                jumlah,
                satuan: match[2]
            }
        })
    }
}
