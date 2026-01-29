// Service hour API - get latest service hours for all units
import { getMainPool } from '~/server/lib/db/mariadb.js'

export default defineEventHandler(async (event) => {
    const pool = getMainPool()

    const query = `
    SELECT waktu, unit, ganti_oli, jamoperasi FROM (
      SELECT waktu, unit, ganti_oli, overhaul AS jamoperasi
      FROM preventive
      ORDER BY id DESC
      LIMIT 7
    ) AS subquery
    ORDER BY unit ASC;
  `

    try {
        const [rows] = await pool.query(query)
        return rows
    } catch (err) {
        console.error('Database error:', err)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch service hours'
        })
    }
})
