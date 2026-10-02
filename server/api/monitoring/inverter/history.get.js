// API endpoint for Inverter Historical telemetry
import { queryInfluxDB } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const queryParams = getQuery(event)

    const inverter = queryParams.inverter
    const fieldParam = queryParams.field || 'p_ac'
    const fields = fieldParam.includes(',') ? fieldParam.split(',').map(f => f.trim()) : null
    const range = queryParams.range || '-30m'
    const isRaw = queryParams.raw === 'true' || queryParams.raw === true
    const startTime = queryParams.start
    const stopTime = queryParams.stop

    if (!inverter) {
        throw createError({
            statusCode: 400,
            message: 'inverter parameter is required (e.g. INV-01)'
        })
    }

    const targetFilter = `r.inverter == "${inverter}"`

    const timeRangeFilter = startTime && stopTime
        ? `range(start: ${startTime}, stop: ${stopTime})`
        : `range(start: ${range})`

    const fieldFilter = fields
        ? fields.map(f => `r._field == "${f}"`).join(' or ')
        : `r._field == "${fieldParam}"`

    // Determine aggregation window (Inverter is polled every 1s)
    const getAggregateWindow = () => {
        if (isRaw) return null
        if (startTime && stopTime) {
            const diffHours = (new Date(stopTime) - new Date(startTime)) / (1000 * 60 * 60)
            if (diffHours <= 0.25) return null
            if (diffHours <= 1) return '10s'
            if (diffHours <= 6) return '30s'
            if (diffHours <= 24) return '2m'
            if (diffHours <= 168) return '15m'
            return '1h'
        }
        const match = range.match(/-(\d+)([mhd])/)
        if (!match) return null
        const val = parseInt(match[1], 10)
        const unit = match[2]
        if (unit === 'm') {
            if (val <= 15) return null
            return '10s'
        }
        if (unit === 'h') {
            if (val <= 1) return '20s'
            if (val <= 6) return '1m'
            return '2m'
        }
        if (unit === 'd') {
            if (val <= 1) return '5m'
            if (val <= 7) return '15m'
            return '1h'
        }
        return '1h'
    }

    const window = getAggregateWindow()

    let query = ''
    if (!window) {
        query = `
            from(bucket: "${config.influxBucket}")
              |> ${timeRangeFilter}
              |> filter(fn: (r) => r._measurement == "INVERTER" and ${targetFilter})
              |> filter(fn: (r) => ${fieldFilter})
              |> yield(name: "raw")
        `
    } else {
        query = `
            from(bucket: "${config.influxBucket}")
              |> ${timeRangeFilter}
              |> filter(fn: (r) => r._measurement == "INVERTER" and ${targetFilter})
              |> filter(fn: (r) => ${fieldFilter})
              |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)
              |> yield(name: "mean")
        `
    }

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error(`Inverter History API error (${inverter}):`, error)
        throw createError({
            statusCode: 500,
            message: `Failed to fetch Inverter history: ${error.message}`
        })
    }
})
