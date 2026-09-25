// API endpoint for PLTS aggregated real-time monitoring data
import { queryInfluxDB, buildDGQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // Helper to fetch all fields for a specific measurement using buildDGQuery
    const fetchData = async (measurement) => {
        const query = buildDGQuery(config.influxBucket, measurement)
        try {
            return await queryInfluxDB(config, query)
        } catch (error) {
            console.error(`Error fetching ${measurement}:`, error)
            return []
        }
    }

    try {
        // Fetch all data in parallel
        const [lvsw1, lvsw2, it1, it2, weather] = await Promise.all([
            fetchData('LVSW1'),
            fetchData('LVSW2'),
            fetchData('IT1'),
            fetchData('IT2'),
            fetchData('weather_station')
        ])

        return {
            lvsw1,
            lvsw2,
            it1,
            it2,
            weather
        }
    } catch (error) {
        console.error('PLTS API error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch PLTS data'
        })
    }
})
