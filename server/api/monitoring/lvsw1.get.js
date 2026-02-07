// API endpoint for LVSW1 real-time monitoring data
import { queryInfluxDB, buildGenericQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    // Fields based on referensi/src/routes/api/lvsw1/+server.js
    const fields = ["Active Power", "Reactive Power", "Voltage", "Current", "Power Factor", "Frequency"]
    const query = buildGenericQuery(config.influxBucket, 'LVSW1', fields)

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error('LVSW1 API error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch LVSW1 data'
        })
    }
})
