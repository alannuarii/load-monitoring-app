import {
    queryInfluxDB,
    buildRawStatsQuery,
    buildRawStatsQueryAbsolute
} from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const id = event.context.params.id
    const queryParams = getQuery(event)

    const fieldParam = queryParams.field || 'Active Power'
    // If comma-separated (multi-field), take the first field for stats calculation
    const field = fieldParam.includes(',') ? fieldParam.split(',')[0] : fieldParam

    const range = queryParams.range || '-1h'
    const startTime = queryParams.start
    const stopTime = queryParams.stop

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
            return { min: 0, minTime: null, max: 0, maxTime: null, avg: 0 }
        }
        throw createError({
            statusCode: 400,
            message: 'Invalid Unit ID'
        })
    }

    const query = (startTime && stopTime)
        ? buildRawStatsQueryAbsolute(config.influxBucket, measurement, field, startTime, stopTime)
        : buildRawStatsQuery(config.influxBucket, measurement, field, range)

    try {
        const rows = await queryInfluxDB(config, query)
        
        let min = 0
        let minTime = null
        let max = 0
        let maxTime = null
        let avg = 0

        rows.forEach(r => {
            if (r.stat === 'min') {
                min = r._value ?? 0
                minTime = r._time ?? null
            }
            if (r.stat === 'max') {
                max = r._value ?? 0
                maxTime = r._time ?? null
            }
            if (r.stat === 'avg') {
                avg = r._value ?? 0
            }
        })

        // Sanitize -0 values
        if (Math.abs(min) < 0.01) min = 0
        if (Math.abs(max) < 0.01) max = 0
        if (Math.abs(avg) < 0.01) avg = 0

        return { min, minTime, max, maxTime, avg }
    } catch (error) {
        console.error(`Stats Unit ${id} API error:`, error)
        return { min: 0, minTime: null, max: 0, maxTime: null, avg: 0 }
    }
})
