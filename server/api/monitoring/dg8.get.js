// API endpoint for DG8 real-time monitoring data
import { queryInfluxDB, buildDGQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = buildDGQuery(config.influxBucket, 'PM-DG8')

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error('DG8 API error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch DG8 data'
        })
    }
})
