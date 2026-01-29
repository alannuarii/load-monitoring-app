// PM Schedule API - generate PM schedules
import { generatePMSchedule } from '~/server/lib/utils/pmSchedule.js'
import { getMainPool } from '~/server/lib/db/mariadb.js'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { start, end } = query

    const pool = getMainPool()

    // Get current service hours
    const dbQuery = `
    SELECT unit, overhaul AS jamoperasi FROM (
      SELECT unit, overhaul
      FROM preventive
      ORDER BY id DESC
      LIMIT 7
    ) AS subquery
    ORDER BY unit ASC;
  `

    try {
        const [units] = await pool.query(dbQuery)
        const schedule = generatePMSchedule(units, start || null, end || null)
        return schedule
    } catch (err) {
        console.error('Database error:', err)
        throw createError({
            statusCode: 500,
            message: 'Failed to generate PM schedule'
        })
    }
})
