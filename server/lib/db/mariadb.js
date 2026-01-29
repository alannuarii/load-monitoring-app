// Database connection using mysql2 with connection pooling
import mysql from 'mysql2/promise'

let poolMain = null
let poolAuth = null

// Get main database pool
export const getMainPool = () => {
    if (!poolMain) {
        const config = useRuntimeConfig()
        poolMain = mysql.createPool({
            host: config.dbHost,
            port: parseInt(config.dbPort),
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbMainName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        })
    }
    return poolMain
}

// Get auth database pool
export const getAuthPool = () => {
    if (!poolAuth) {
        const config = useRuntimeConfig()
        poolAuth = mysql.createPool({
            host: config.dbHost,
            port: parseInt(config.dbPort),
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbAuthName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        })
    }
    return poolAuth
}

// Legacy exports for compatibility
export { poolMain, poolAuth }
