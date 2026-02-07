// API endpoint for IT2 real-time monitoring data
import { queryInfluxDB, buildGenericQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    // Assuming IT2 has the same fields as IT1
    const fields = ["Active Power", "Reactive Power", "Voltage", "Current", "Power Factor", "Frequency"]
    const query = buildGenericQuery(config.influxBucket, 'IT2', fields)

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error('IT2 API error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch IT2 data'
        })
    }
})
