import { getTahunaPool } from '~/server/lib/db/tahunaPostgres'

export default defineEventHandler(async (event) => {
  try {
    const pool = getTahunaPool()
    // Fetch active downtime records where end_date IS NULL OR end_date >= NOW()
    const query = `
      SELECT DISTINCT ON (unit) unit, status, start_date, end_date, notes
      FROM engine_downtime
      WHERE end_date IS NULL OR end_date >= NOW()
      ORDER BY unit, updated_at DESC
    `
    const { rows } = await pool.query(query)
    
    const downtimeMap = {}
    rows.forEach(row => {
      downtimeMap[row.unit] = row
    })
    
    return downtimeMap
  } catch (error) {
    console.error('Error fetching engine downtime from db_tahuna:', error)
    return {}
  }
})
