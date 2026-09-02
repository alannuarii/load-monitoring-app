// InfluxDB connection helper for real-time monitoring data
import { InfluxDB } from '@influxdata/influxdb-client'

export const queryInfluxDB = async (config, query) => {
    const { influxUrl, influxToken, influxOrg } = config

    try {
        const influxDB = new InfluxDB({ url: influxUrl, token: influxToken })
        const queryApi = influxDB.getQueryApi(influxOrg)
        const result = []

        await new Promise((resolve, reject) => {
            queryApi.queryRows(query, {
                next(row, tableMeta) {
                    const o = tableMeta.toObject(row)
                    result.push(o)
                },
                error(error) {
                    console.error('InfluxDB query failed:', error)
                    reject(error)
                },
                complete() {
                    resolve()
                }
            })
        })

        return result
    } catch (error) {
        console.error('InfluxDB error:', error)
        throw new Error(error.message)
    }
}

// Build query for a specific DG unit
export const buildDGQuery = (bucket, measurement) => {
    return `
        from(bucket: "${bucket}")
          |> range(start: -1m)
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> last()
    `
}

// Build query for Engine parameters
export const buildEngineQuery = (bucket, measurement) => {
    return `
        from(bucket: "${bucket}")
          |> range(start: -1m)
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> last()
    `
}

// Build generic query for any measurement and fields
export const buildGenericQuery = (bucket, measurement, fields) => {
    const fieldFilters = fields.map(f => `r._field == "${f}"`).join(' or ')
    return `
        from(bucket: "${bucket}")
          |> range(start: -1m)
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => ${fieldFilters})
          |> last()
    `
}

// Build query for historical data (for charts and raw exports)
export const buildHistoryQuery = (bucket, measurement, field, range = '-1h', raw = false) => {
    const aggregateWindow = raw ? null : getAggregateWindow(range)
    if (!aggregateWindow) {
        return `
            from(bucket: "${bucket}")
              |> range(start: ${range})
              |> filter(fn: (r) => r._measurement == "${measurement}")
              |> filter(fn: (r) => r._field == "${field}")
              |> yield(name: "raw")
        `
    }
    return `
        from(bucket: "${bucket}")
          |> range(start: ${range})
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => r._field == "${field}")
          |> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)
          |> yield(name: "mean")
    `
}

// Build query for multiple fields (for combined charts and raw exports)
export const buildMultiFieldHistoryQuery = (bucket, measurement, fields, range = '-1h', raw = false) => {
    const fieldFilters = fields.map(f => `r._field == "${f}"`).join(' or ')
    const aggregateWindow = raw ? null : getAggregateWindow(range)
    if (!aggregateWindow) {
        return `
            from(bucket: "${bucket}")
              |> range(start: ${range})
              |> filter(fn: (r) => r._measurement == "${measurement}")
              |> filter(fn: (r) => ${fieldFilters})
              |> yield(name: "raw")
        `
    }
    return `
        from(bucket: "${bucket}")
          |> range(start: ${range})
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => ${fieldFilters})
          |> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)
          |> yield(name: "mean")
    `
}

// Build query with absolute time range (for custom date picker and raw exports)
export const buildHistoryQueryAbsolute = (bucket, measurement, field, start, stop, raw = false) => {
    const aggregateWindow = raw ? null : getAggregateWindowAbsolute(start, stop)
    if (!aggregateWindow) {
        return `
            from(bucket: "${bucket}")
              |> range(start: ${start}, stop: ${stop})
              |> filter(fn: (r) => r._measurement == "${measurement}")
              |> filter(fn: (r) => r._field == "${field}")
              |> yield(name: "raw")
        `
    }
    return `
        from(bucket: "${bucket}")
          |> range(start: ${start}, stop: ${stop})
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => r._field == "${field}")
          |> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)
          |> yield(name: "mean")
    `
}

// Build multi-field query with absolute time range
export const buildMultiFieldHistoryQueryAbsolute = (bucket, measurement, fields, start, stop, raw = false) => {
    const fieldFilters = fields.map(f => `r._field == "${f}"`).join(' or ')
    const aggregateWindow = raw ? null : getAggregateWindowAbsolute(start, stop)
    if (!aggregateWindow) {
        return `
            from(bucket: "${bucket}")
              |> range(start: ${start}, stop: ${stop})
              |> filter(fn: (r) => r._measurement == "${measurement}")
              |> filter(fn: (r) => ${fieldFilters})
              |> yield(name: "raw")
        `
    }
    return `
        from(bucket: "${bucket}")
          |> range(start: ${start}, stop: ${stop})
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => ${fieldFilters})
          |> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)
          |> yield(name: "mean")
    `
}

// Helper: Get aggregate window based on relative range
// Returns null for range <= 1h to fetch raw 3-second data without mean aggregation
const getAggregateWindow = (range) => {
    const match = range.match(/-(\d+)([mhd])/)
    if (!match) return null

    const value = parseInt(match[1])
    const unit = match[2]

    if (unit === 'm') return null
    if (unit === 'h' && value <= 1) return null
    if (unit === 'h' && value <= 6) return '1m'
    if (unit === 'h') return '5m'
    if (unit === 'd' && value <= 1) return '5m'
    if (unit === 'd' && value <= 7) return '15m'
    if (unit === 'd' && value <= 14) return '1h'
    return '2h' // 30 days
}

// Helper: Get aggregate window based on absolute range
// Returns null for duration <= 1h to fetch raw 3-second data without mean aggregation
const getAggregateWindowAbsolute = (start, stop) => {
    const startDate = new Date(start)
    const stopDate = new Date(stop)
    const diffMs = stopDate - startDate
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours <= 1) return null
    if (diffHours <= 6) return '1m'
    if (diffHours <= 24) return '5m'
    if (diffHours <= 168) return '15m'
    return '1h'
}

// Build query for true RAW min, max, avg statistics over any time range
export const buildRawStatsQuery = (bucket, measurement, field, range = '-1h') => {
    return `
        raw = from(bucket: "${bucket}")
          |> range(start: ${range})
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => r._field == "${field}")

        minVal = raw |> min() |> set(key: "stat", value: "min")
        maxVal = raw |> max() |> set(key: "stat", value: "max")
        meanVal = raw |> mean() |> set(key: "stat", value: "avg")

        union(tables: [minVal, maxVal, meanVal])
    `
}

// Build query for true RAW min, max, avg statistics with absolute time range
export const buildRawStatsQueryAbsolute = (bucket, measurement, field, start, stop) => {
    return `
        raw = from(bucket: "${bucket}")
          |> range(start: ${start}, stop: ${stop})
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => r._field == "${field}")

        minVal = raw |> min() |> set(key: "stat", value: "min")
        maxVal = raw |> max() |> set(key: "stat", value: "max")
        meanVal = raw |> mean() |> set(key: "stat", value: "avg")

        union(tables: [minVal, maxVal, meanVal])
    `
}
