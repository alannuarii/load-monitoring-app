import { query } from '~/server/lib/db/postgres'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { unit, jenis_overhaul, tanggal_selesai, jam_overhaul, keterangan } = body

    if (!unit || !jenis_overhaul || !tanggal_selesai || jam_overhaul === undefined) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields'
        })
    }

    try {
        const result = await query(
            `INSERT INTO overhaul_realizations (unit, jenis_overhaul, tanggal_selesai, jam_overhaul, keterangan)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [unit, jenis_overhaul, tanggal_selesai, jam_overhaul, keterangan || null]
        )
        return { success: true, id: result[0].id }
    } catch (error) {
        console.error('Error creating overhaul realization:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to create realization'
        })
    }
})
