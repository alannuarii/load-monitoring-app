// API endpoint for DG7 real-time monitoring data
import { queryInfluxDB, buildDGQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = buildDGQuery(config.influxBucket, 'ENGINE-DG7')

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error('DG7 API error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch DG7 data'
        })
    }
})
