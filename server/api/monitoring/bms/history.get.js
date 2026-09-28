// API endpoint for BMS Historical telemetry
import { queryInfluxDB } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const queryParams = getQuery(event)

    const ip = queryParams.ip
    const moduleName = queryParams.module
    const fieldParam = queryParams.field || 'soc'
    const fields = fieldParam.includes(',') ? fieldParam.split(',').map(f => f.trim()) : null
    const range = queryParams.range || '-30m'
    const isRaw = queryParams.raw === 'true' || queryParams.raw === true
    const startTime = queryParams.start
    const stopTime = queryParams.stop

    if (!ip && !moduleName) {
        throw createError({
            statusCode: 400,
            message: 'ip or module parameter is required'
        })
    }

    const targetFilter = ip ? `r.ip == "${ip}"` : `r.module == "${moduleName}"`

    const timeRangeFilter = startTime && stopTime
        ? `range(start: ${startTime}, stop: ${stopTime})`
        : `range(start: ${range})`

    const fieldFilter = fields
        ? fields.map(f => `r._field == "${f}"`).join(' or ')
        : `r._field == "${fieldParam}"`

    // Determine aggregation window (BMS raw is already 1-minute interval)
    const getAggregateWindow = () => {
        if (isRaw) return null
        if (startTime && stopTime) {
            const diffHours = (new Date(stopTime) - new Date(startTime)) / (1000 * 60 * 60)
            if (diffHours <= 24) return null
            if (diffHours <= 168) return '15m'
            return '1h'
        }
        const match = range.match(/-(\d+)([mhd])/)
        if (!match) return null
        const val = parseInt(match[1], 10)
        const unit = match[2]
        if (unit === 'm' || unit === 'h') return null
        if (unit === 'd' && val <= 1) return null
        if (unit === 'd' && val <= 7) return '15m'
        return '1h'
    }

    const window = getAggregateWindow()

    let query = ''
    if (!window) {
        query = `
            from(bucket: "${config.influxBucket}")
              |> ${timeRangeFilter}
              |> filter(fn: (r) => r._measurement == "BMS" and ${targetFilter})
              |> filter(fn: (r) => ${fieldFilter})
              |> yield(name: "raw")
        `
    } else {
        query = `
            from(bucket: "${config.influxBucket}")
              |> ${timeRangeFilter}
              |> filter(fn: (r) => r._measurement == "BMS" and ${targetFilter})
              |> filter(fn: (r) => ${fieldFilter})
              |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)
              |> yield(name: "mean")
        `
    }

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error(`BMS History API error (${ip || moduleName}):`, error)
        throw createError({
            statusCode: 500,
            message: `Failed to fetch BMS history: ${error.message}`
        })
    }
})
