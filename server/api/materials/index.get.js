// Materials API - get materials for a specific unit and PM cycle
import { fastMovingMaterials } from '~/server/lib/data/fastMoving.js'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { unit, pm } = query

    if (!unit || !pm) {
        throw createError({
            statusCode: 400,
            message: 'Unit and PM cycle are required'
        })
    }

    const unitNumber = parseInt(unit)
    const pmCycle = pm.toUpperCase()

    // Find unit data
    const unitData = fastMovingMaterials.find(u => u.unit === unitNumber)

    if (!unitData) {
        return {
            unit: unitNumber,
            mesin: null,
            materials: [],
            message: 'Unit tidak ditemukan'
        }
    }

    // Get PM level (P1=1, P2=2, etc.)
    const pmLevel = parseInt(pmCycle.replace('P', ''))

    if (pmLevel < 1 || pmLevel > 5) {
        throw createError({
            statusCode: 400,
            message: 'PM cycle must be P1-P5'
        })
    }

    // Get all materials up to the current PM level
    // P1 = P1 materials only
    // P2 = P1 + P2 materials
    // P3 = P1 + P2 + P3 materials
    // etc.
    const applicableCycles = []
    for (let i = 1; i <= pmLevel; i++) {
        applicableCycles.push(`P${i}`)
    }

    const materials = unitData.material
        .filter(m => applicableCycles.includes(m.cycle))
        .map(m => ({
            ...m,
            isCurrentCycle: m.cycle === pmCycle
        }))
        .sort((a, b) => {
            // Sort by cycle level first, then by name
            const cycleA = parseInt(a.cycle.replace('P', ''))
            const cycleB = parseInt(b.cycle.replace('P', ''))
            if (cycleA !== cycleB) return cycleA - cycleB
            return a.nama.localeCompare(b.nama)
        })

    return {
        unit: unitNumber,
        mesin: unitData.mesin,
        pmCycle: pmCycle,
        applicableCycles: applicableCycles,
        materials: materials
    }
})
