// Create a new PM realization
import { query } from '~/server/lib/db/postgres'
import { engines } from '~/server/lib/data/engineData'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const { tanggal_pelaksanaan, unit, jenis_pm, catatan, materials } = body

    // Validate required fields
    if (!tanggal_pelaksanaan || !unit || !jenis_pm) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields: tanggal_pelaksanaan, unit, jenis_pm'
        })
    }

    // Get engine name
    const engine = engines.find(e => e.unit === unit)
    if (!engine) {
        throw createError({
            statusCode: 400,
            message: `Invalid unit: ${unit}`
        })
    }

    try {
        // Insert main realization record
        const realizationResult = await query(
            `INSERT INTO pm_realizations (tanggal_pelaksanaan, unit, mesin, jenis_pm, catatan)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [tanggal_pelaksanaan, unit, engine.mesin, jenis_pm, catatan || null]
        )

        const realizationId = realizationResult[0].id

        // Insert materials if provided
        if (materials && Array.isArray(materials) && materials.length > 0) {
            for (const material of materials) {
                await query(
                    `INSERT INTO pm_realization_materials 
                     (realization_id, nama_material, jumlah_standar, jumlah_realisasi, satuan, cycle)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        realizationId,
                        material.nama,
                        material.jumlah_standar,
                        material.jumlah_realisasi,
                        material.satuan,
                        material.cycle
                    ]
                )
            }
        }

        return {
            success: true,
            id: realizationId,
            message: 'Realization created successfully'
        }
    } catch (error) {
        console.error('Error creating realization:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to create realization'
        })
    }
})
