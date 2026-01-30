import { query } from '~/server/lib/db/postgres'

export default defineEventHandler(async (event) => {
    try {
        // Get the latest realization for EACH unit
        // Uses DISTINCT ON pattern for Postgres
        const result = await query(
            `SELECT DISTINCT ON (unit) *
             FROM overhaul_realizations
             ORDER BY unit, tanggal_selesai DESC, id DESC`
        )
        return result
    } catch (error) {
        console.error('Error fetching latest overhaul:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch latest overhaul'
        })
    }
})
