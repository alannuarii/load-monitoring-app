// Material Planning API - calculate materials based on PM schedule
import { generatePMSchedule } from '~/server/lib/utils/pmSchedule.js'
import { fastMovingMaterials } from '~/server/lib/data/fastMoving.js'
import { query as dbQuery } from '~/server/lib/db/postgres.js'

export default defineEventHandler(async (event) => {
    const queryParams = getQuery(event)
    const { start, end, units } = queryParams

    if (!start || !end) {
        throw createError({
            statusCode: 400,
            message: 'Start and end dates are required'
        })
    }

    // Parse selected units (can be single unit or comma-separated for grouped engines)
    let selectedUnits = []
    if (units) {
        selectedUnits = units.split(',').map(u => parseInt(u.trim()))
    }

    // Get current service hours from database
    const sqlQuery = `
        SELECT unit, overhaul AS jamoperasi FROM (
            SELECT unit, overhaul
            FROM service_hour
            ORDER BY id DESC
            LIMIT 7
        ) AS subquery
        ORDER BY unit ASC;
    `

    try {
        let dbUnits = await dbQuery(sqlQuery)

        // Filter units if specific units are selected
        if (selectedUnits.length > 0) {
            dbUnits = dbUnits.filter(u => selectedUnits.includes(u.unit))
        }

        if (dbUnits.length === 0) {
            return {
                units: selectedUnits,
                pmCounts: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 },
                totalPM: 0,
                materials: []
            }
        }

        // Generate PM schedule for selected units in date range
        const schedule = generatePMSchedule(dbUnits, start, end)

        // Count PM types
        const pmCounts = { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 }
        schedule.forEach(event => {
            const pmType = event.title.split(' ')[0] // "P1 #7" -> "P1"
            if (pmCounts.hasOwnProperty(pmType)) {
                pmCounts[pmType]++
            }
        })

        const totalPM = Object.values(pmCounts).reduce((a, b) => a + b, 0)

        // Calculate materials based on PM counts with accumulation logic
        // P1 material = used at P1, P2, P3, P4, P5 (every PM)
        // P2 material = used at P2, P3, P4, P5
        // P3 material = used at P3, P4, P5
        // P4 material = used at P4, P5
        // P5 material = used at P5 only
        const pmUsage = {
            P1: pmCounts.P1 + pmCounts.P2 + pmCounts.P3 + pmCounts.P4 + pmCounts.P5,
            P2: pmCounts.P2 + pmCounts.P3 + pmCounts.P4 + pmCounts.P5,
            P3: pmCounts.P3 + pmCounts.P4 + pmCounts.P5,
            P4: pmCounts.P4 + pmCounts.P5,
            P5: pmCounts.P5
        }

        // Get materials for selected units
        const materialsMap = new Map()

        const unitsToProcess = selectedUnits.length > 0 ? selectedUnits : dbUnits.map(u => u.unit)

        unitsToProcess.forEach(unitNum => {
            const unitData = fastMovingMaterials.find(u => u.unit === unitNum)
            if (!unitData) return

            unitData.material.forEach(mat => {
                const cycle = mat.cycle
                const usageCount = pmUsage[cycle] || 0
                const totalQty = mat.jumlah * usageCount

                if (totalQty === 0) return

                const key = `${mat.nama}-${mat.satuan}`
                if (materialsMap.has(key)) {
                    const existing = materialsMap.get(key)
                    existing.jumlah += totalQty
                    if (!existing.units.includes(unitNum)) {
                        existing.units.push(unitNum)
                    }
                } else {
                    materialsMap.set(key, {
                        nama: mat.nama,
                        jumlah: totalQty,
                        satuan: mat.satuan,
                        cycle: cycle,
                        units: [unitNum]
                    })
                }
            })
        })

        // Convert map to sorted array
        const materials = Array.from(materialsMap.values()).sort((a, b) => {
            return a.nama.localeCompare(b.nama)
        })

        // Get engine info for display
        const engineInfo = unitsToProcess.map(unitNum => {
            const unitData = fastMovingMaterials.find(u => u.unit === unitNum)
            return {
                unit: unitNum,
                mesin: unitData?.mesin || 'Unknown'
            }
        })

        return {
            units: unitsToProcess,
            engineInfo,
            pmCounts,
            totalPM,
            materials,
            dateRange: { start, end }
        }

    } catch (err) {
        console.error('Database error:', err)
        throw createError({
            statusCode: 500,
            message: 'Failed to calculate material planning'
        })
    }
})
