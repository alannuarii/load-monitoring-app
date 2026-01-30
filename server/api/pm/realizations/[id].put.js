// Update a PM realization
import { query, getPool } from '~/server/lib/db/postgres'
import { engines } from '~/server/lib/data/engineData'

export default defineEventHandler(async (event) => {
    const id = parseInt(getRouterParam(event, 'id'))

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid id parameter'
        })
    }

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

    const pool = getPool()
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // Update main realization record
        const updateResult = await client.query(
            `UPDATE pm_realizations 
             SET tanggal_pelaksanaan = $1, unit = $2, mesin = $3, jenis_pm = $4, catatan = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING id`,
            [tanggal_pelaksanaan, unit, engine.mesin, jenis_pm, catatan || null, id]
        )

        if (updateResult.rows.length === 0) {
            throw createError({
                statusCode: 404,
                message: 'Realization not found'
            })
        }

        // Delete existing materials
        await client.query(
            `DELETE FROM pm_realization_materials WHERE realization_id = $1`,
            [id]
        )

        // Insert new materials if provided
        if (materials && Array.isArray(materials) && materials.length > 0) {
            for (const material of materials) {
                await client.query(
                    `INSERT INTO pm_realization_materials 
                     (realization_id, nama_material, jumlah_standar, jumlah_realisasi, satuan, cycle)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        id,
                        material.nama,
                        material.jumlah_standar,
                        material.jumlah_realisasi,
                        material.satuan,
                        material.cycle
                    ]
                )
            }
        }

        await client.query('COMMIT')

        return {
            success: true,
            id,
            message: 'Realization updated successfully'
        }
    } catch (error) {
        await client.query('ROLLBACK')

        if (error.statusCode) throw error

        console.error('Error updating realization:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to update realization'
        })
    } finally {
        client.release()
    }
})
