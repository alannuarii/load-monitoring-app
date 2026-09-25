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
    const isRaw = queryParams.raw === 'true' || queryParams.raw === true

    // Support absolute time range
    const startTime = queryParams.start
    const stopTime = queryParams.stop

    const source = queryParams.source

    if (!source) {
        throw createError({
            statusCode: 400,
            message: 'Source parameter is required (Combined-LVSW, Compare-LVSW, Combined-IT, Compare-IT, LVSW1, LVSW2, IT1, IT2, weather_station)'
        })
    }

    // Helper to calculate appropriate window for combined and comparison queries
    const getCombinedWindow = () => {
        if (startTime && stopTime) {
            const diffHours = (new Date(stopTime) - new Date(startTime)) / (1000 * 60 * 60)
            if (diffHours <= 0.2) return '5s'
            if (diffHours <= 1) return '10s'
            if (diffHours <= 6) return '1m'
            if (diffHours <= 24) return '5m'
            if (diffHours <= 168) return '15m'
            return '1h'
        }
        const match = range.match(/-(\d+)([mhd])/)
        if (!match) return '5s'
        const val = parseInt(match[1])
        const unit = match[2]
        if (unit === 'm') return val <= 5 ? '5s' : '10s'
        if (unit === 'h' && val <= 1) return '10s'
        if (unit === 'h' && val <= 6) return '1m'
        if (unit === 'h') return '5m'
        if (unit === 'd' && val <= 1) return '5m'
        if (unit === 'd' && val <= 7) return '15m'
        if (unit === 'd' && val <= 14) return '1h'
        return '2h'
    }

    const timeRangeFilter = startTime && stopTime
        ? `range(start: ${startTime}, stop: ${stopTime})`
        : `range(start: ${range})`

    let query = ''

    if (source === 'Combined-LVSW' || source === 'Combined-IT') {
        const m1 = source === 'Combined-LVSW' ? 'LVSW1' : 'IT1'
        const m2 = source === 'Combined-LVSW' ? 'LVSW2' : 'IT2'
        const window = getCombinedWindow()

        query = `
            m1 = from(bucket: "${config.influxBucket}")
              |> ${timeRangeFilter}
              |> filter(fn: (r) => r._measurement == "${m1}" and r._field == "${fieldParam}")
              |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)

            m2 = from(bucket: "${config.influxBucket}")
              |> ${timeRangeFilter}
              |> filter(fn: (r) => r._measurement == "${m2}" and r._field == "${fieldParam}")
              |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)

            union(tables: [m1, m2])
              |> group(columns: ["_time", "_field"])
              |> sum()
              |> group(columns: ["_field"])
              |> yield(name: "combined")
        `
    } else if (source === 'Compare-LVSW' || source === 'Compare-IT') {
        const m1 = source === 'Compare-LVSW' ? 'LVSW1' : 'IT1'
        const m2 = source === 'Compare-LVSW' ? 'LVSW2' : 'IT2'
        const label1 = source === 'Compare-LVSW' ? 'Feeder 1 (LVSW1)' : 'Feeder 1 (IT1)'
        const label2 = source === 'Compare-LVSW' ? 'Feeder 2 (LVSW2)' : 'Feeder 2 (IT2)'
        const window = getCombinedWindow()

        query = `
            m1 = from(bucket: "${config.influxBucket}")
              |> ${timeRangeFilter}
              |> filter(fn: (r) => r._measurement == "${m1}" and r._field == "${fieldParam}")
              |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)
              |> set(key: "_field", value: "${label1}")

            m2 = from(bucket: "${config.influxBucket}")
              |> ${timeRangeFilter}
              |> filter(fn: (r) => r._measurement == "${m2}" and r._field == "${fieldParam}")
              |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)
              |> set(key: "_field", value: "${label2}")

            union(tables: [m1, m2])
              |> yield(name: "compare")
        `
    } else {
        // Individual measurement (LVSW1, LVSW2, IT1, IT2, weather_station)
        const measurementMap = {
            'it1': 'IT1',
            'it2': 'IT2',
            'lvsw1': 'LVSW1',
            'lvsw2': 'LVSW2',
            'weather': 'weather_station',
            'weather_station': 'weather_station'
        }
        const measurement = measurementMap[source.toLowerCase()] || source

        if (startTime && stopTime) {
            query = fields
                ? buildMultiFieldHistoryQueryAbsolute(config.influxBucket, measurement, fields, startTime, stopTime, isRaw)
                : buildHistoryQueryAbsolute(config.influxBucket, measurement, fieldParam, startTime, stopTime, isRaw)
        } else {
            query = fields
                ? buildMultiFieldHistoryQuery(config.influxBucket, measurement, fields, range, isRaw)
                : buildHistoryQuery(config.influxBucket, measurement, fieldParam, range, isRaw)
        }
    }

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error(`PLTS History API error (${source}):`, error)
        throw createError({
            statusCode: 500,
            message: `Failed to fetch history for ${source}: ${error.message}`
        })
    }
})
