// API endpoint for LVSW2 real-time monitoring data
import { queryInfluxDB, buildGenericQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    // Assuming LVSW2 has the same fields as LVSW1
    const fields = ["Active Power", "Reactive Power", "Voltage", "Current", "Power Factor", "Frequency"]
    const query = buildGenericQuery(config.influxBucket, 'LVSW2', fields)

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error('LVSW2 API error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch LVSW2 data'
        })
    }
})
