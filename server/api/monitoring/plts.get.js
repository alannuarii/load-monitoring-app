// API endpoint for PLTS aggregated real-time monitoring data
import { queryInfluxDB, buildGenericQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    // Helper to fetch data for a specific measurement
    const fetchData = async (measurement, fields) => {
        const query = buildGenericQuery(config.influxBucket, measurement, fields)
        try {
            return await queryInfluxDB(config, query)
        } catch (error) {
            console.error(`Error fetching ${measurement}:`, error)
            return []
        }
    }

    // Fields for each component
    const powerFields = ["Active Power", "Reactive Power", "Voltage", "Current", "Power Factor", "Frequency", "Voltage L1 L2", "Voltage L2 L3", "Voltage L3 L1", "Current L1", "Current L2", "Current L3"]
    const weatherFields = ["Air Temperature", "External Temperature", "Global Irradiance", "Wind Direction", "Wind Speed", "Relative Humidity"]

    try {
        // Fetch all data in parallel
        const [lvsw1, lvsw2, it1, it2, weather] = await Promise.all([
            fetchData('LVSW1', powerFields),
            fetchData('LVSW2', powerFields),
            fetchData('IT1', powerFields),
            fetchData('IT2', powerFields),
            fetchData('weather_station', weatherFields)
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
