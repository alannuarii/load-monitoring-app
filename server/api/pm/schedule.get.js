// PM Schedule API - generate PM schedules
import { generatePMSchedule } from '~/server/lib/utils/pmSchedule.js'
import { query as dbQuery } from '~/server/lib/db/postgres.js'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const { start, end } = queryParams

  // Get current service hours
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
    const units = await dbQuery(sqlQuery)
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
