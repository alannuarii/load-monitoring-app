// API endpoint for PLTS history data
import {
    queryInfluxDB,
    buildHistoryQuery,
    buildMultiFieldHistoryQuery,
    buildHistoryQueryAbsolute,
    buildMultiFieldHistoryQueryAbsolute
} from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const queryParams = getQuery(event)

    // Support single field or multiple fields (comma-separated)
    const fieldParam = queryParams.field || 'Active Power'
    const fields = fieldParam.includes(',') ? fieldParam.split(',') : null
    const range = queryParams.range || '-30m'

    // Support absolute time range
    const startTime = queryParams.start
    const stopTime = queryParams.stop

    // Determine measurement based on field or explicit source param
    // Since we have multiple sources (LVSW1, LVSW2, IT1, IT2, Weather), 
    // we need to know which measurement to query.
    // The frontend should pass a 'source' param, or we can infer it.
    // Let's require a 'source' param for clarity.

    const source = queryParams.source // 'LVSW1', 'LVSW2', 'IT1', 'IT2', 'weather_station', 'Combined-LVSW'

    if (!source) {
        throw createError({
            statusCode: 400,
            message: 'Source parameter is required (LVSW1, LVSW2, IT1, IT2, weather_station, Combined-LVSW)'
        })
    }

    // Handle Combined-LVSW separately
    if (source === 'Combined-LVSW') {
        // We only support summing for now.
        // Fetch LVSW1 and LVSW2 separately
        let query1, query2

        if (startTime && stopTime) {
            query1 = fields
                ? buildMultiFieldHistoryQueryAbsolute(config.influxBucket, 'LVSW1', fields, startTime, stopTime)
                : buildHistoryQueryAbsolute(config.influxBucket, 'LVSW1', fieldParam, startTime, stopTime)
            query2 = fields
                ? buildMultiFieldHistoryQueryAbsolute(config.influxBucket, 'LVSW2', fields, startTime, stopTime)
                : buildHistoryQueryAbsolute(config.influxBucket, 'LVSW2', fieldParam, startTime, stopTime)
        } else {
            query1 = fields
                ? buildMultiFieldHistoryQuery(config.influxBucket, 'LVSW1', fields, range)
                : buildHistoryQuery(config.influxBucket, 'LVSW1', fieldParam, range)
            query2 = fields
                ? buildMultiFieldHistoryQuery(config.influxBucket, 'LVSW2', fields, range)
                : buildHistoryQuery(config.influxBucket, 'LVSW2', fieldParam, range)
        }

        try {
            const [result1, result2] = await Promise.all([
                queryInfluxDB(config, query1),
                queryInfluxDB(config, query2)
            ])

            // Aggregate results
            // We need to merge based on time. 
            // Result structure: [{_time: ..., _value: ..., _field: ...}, ...]
            // Map by time-field key
            const map = new Map()

            const processResult = (res) => {
                res.forEach(row => {
                    const key = `${row._time}_${row._field}`
                    if (!map.has(key)) {
                        map.set(key, { ...row }) // clone
                    } else {
                        const existing = map.get(key)
                        // Sum values if numeric
                        if (typeof row._value === 'number') {
                            existing._value += row._value
                        }
                    }
                })
            }

            processResult(result1)
            processResult(result2)

            return Array.from(map.values()).sort((a, b) => new Date(a._time) - new Date(b._time))

        } catch (error) {
            console.error('PLTS Combined Query Error:', error)
            throw createError({ statusCode: 500, message: 'Failed to fetch combined PLTS data' })
        }
    }

    // Map friendly names to actual measurement names if needed
    const measurementMap = {
        'it1': 'IT1',
        'it2': 'IT2',
        'lvsw1': 'LVSW1',
        'lvsw2': 'LVSW2',
        'weather': 'weather_station',
        'weather_station': 'weather_station'
    }

    const measurement = measurementMap[source.toLowerCase()] || source

    let query

    if (startTime && stopTime) {
        query = fields
            ? buildMultiFieldHistoryQueryAbsolute(config.influxBucket, measurement, fields, startTime, stopTime)
            : buildHistoryQueryAbsolute(config.influxBucket, measurement, fieldParam, startTime, stopTime)
    } else {
        query = fields
            ? buildMultiFieldHistoryQuery(config.influxBucket, measurement, fields, range)
            : buildHistoryQuery(config.influxBucket, measurement, fieldParam, range)
    }

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error(`PLTS History API error (${source}):`, error)
        throw createError({
            statusCode: 500,
            message: `Failed to fetch history for ${source}`
        })
    }
})
