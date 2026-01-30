// Get list of PM realizations with optional filters
import { query } from '~/server/lib/db/postgres'

export default defineEventHandler(async (event) => {
    const queryParams = getQuery(event)
    const { start, end, unit } = queryParams

    let sql = `
        SELECT 
            r.id,
            r.tanggal_pelaksanaan,
            r.unit,
            r.mesin,
            r.jenis_pm,
            r.catatan,
            r.created_at,
            r.updated_at
        FROM pm_realizations r
        WHERE 1=1
    `
    const params = []
    let paramIndex = 1

    if (start) {
        sql += ` AND r.tanggal_pelaksanaan >= $${paramIndex}`
        params.push(start)
        paramIndex++
    }

    if (end) {
        sql += ` AND r.tanggal_pelaksanaan <= $${paramIndex}`
        params.push(end)
        paramIndex++
    }

    if (unit) {
        sql += ` AND r.unit = $${paramIndex}`
        params.push(parseInt(unit))
        paramIndex++
    }

    sql += ` ORDER BY r.tanggal_pelaksanaan DESC, r.created_at DESC`

    try {
        const realizations = await query(sql, params)
        return realizations
    } catch (error) {
        console.error('Error fetching realizations:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch realizations'
        })
    }
})
