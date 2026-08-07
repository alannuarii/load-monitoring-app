import { queryInfluxDB, buildDGQuery, buildEngineQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const id = event.context.params.id

    // Map unit ID to measurement name
    // Units 4 and 5 do not have sensors
    const unitMap = {
        '1': 'PM-DG1',
        '6': 'PM-DG6',
        '7': 'PM-DG7',
        '8': 'PM-DG8',
        '9': 'PM-DG9'
    }

    const measurement = unitMap[id]

    if (!measurement) {
        if (id === '4' || id === '5') {
            return [] // Return empty for units without sensors
        }
        throw createError({
            statusCode: 400,
            message: 'Invalid Unit ID'
        })
    }

    try {
        const pmQuery = buildDGQuery(config.influxBucket, measurement)
        const pmResult = await queryInfluxDB(config, pmQuery)
        
        if (id === '6' || id === '7') {
            const engineMeasurement = `ENGINE-DG${id}`
            const engineQuery = buildEngineQuery(config.influxBucket, engineMeasurement)
            const engineResult = await queryInfluxDB(config, engineQuery).catch(() => [])
            return [...pmResult, ...engineResult]
        }

        return pmResult
    } catch (error) {
        console.error(`Unit ${id} API error:`, error)
        throw createError({
            statusCode: 500,
            message: `Failed to fetch Unit ${id} data`
        })
    }
})
