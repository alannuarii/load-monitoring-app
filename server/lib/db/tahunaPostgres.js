import pkg from 'pg'
const { Pool } = pkg

let pool

export function getTahunaPool() {
  if (!pool) {
    const config = useRuntimeConfig()
    const connectionString = config.databaseTahunaUrl || process.env.DATABASE_TAHUNA_URL || 'postgresql://alannuarii:Al4nNu4r1@100.101.143.95:5432/db_tahuna'
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000
    })
  }
  return pool
}
