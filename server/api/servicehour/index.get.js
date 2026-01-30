// Service hour API - get latest service hours for all units
import { query } from '~/server/lib/db/postgres.js'

export default defineEventHandler(async (event) => {
  const sqlQuery = `
    SELECT waktu, unit, ganti_oli, jamoperasi FROM (
      SELECT waktu, unit, ganti_oli, overhaul AS jamoperasi
      FROM service_hour
      ORDER BY id DESC
      LIMIT 7
    ) AS subquery
    ORDER BY unit ASC;
  `

  try {
    const rows = await query(sqlQuery)
    return rows
  } catch (err) {
    console.error('Database error:', err)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch service hours'
    })
  }
})
