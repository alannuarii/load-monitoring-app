// Database connection using pg (node-postgres) with connection pooling
import pg from 'pg'

const { Pool } = pg

let pool = null

// Get database pool
export const getPool = () => {
    if (!pool) {
        const config = useRuntimeConfig()
        pool = new Pool({
            host: config.dbHost,
            port: parseInt(config.dbPort),
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        })
    }
    return pool
}

// Helper function to execute queries (for easier migration from mysql2)
export const query = async (text, params) => {
    const pool = getPool()
    const result = await pool.query(text, params)
    return result.rows
}

// Legacy export for compatibility
export { pool }
