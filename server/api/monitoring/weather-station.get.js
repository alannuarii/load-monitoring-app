// API endpoint for Weather Station real-time monitoring data
import { queryInfluxDB, buildGenericQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    // Fields based on referensi/src/routes/api/weather-station/+server.js
    const fields = ["Air Temperature", "External Temperature", "Global Irradiance", "Wind Direction", "Wind Speed", "Relative Humidity"]

    // Note: Reference uses "weather_station" (underscore) as measurement name
    const query = buildGenericQuery(config.influxBucket, 'weather_station', fields)

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error('Weather Station API error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch Weather Station data'
        })
    }
})
