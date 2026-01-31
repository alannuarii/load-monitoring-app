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
          |> filter(fn: (r) => r._field == "Current L1" or r._field == "Current L2" or r._field == "Current L3" or r._field == "Voltage L1 L2" or r._field == "Voltage L2 L3" or r._field == "Voltage L3 L1" or r._field == "Frequency" or r._field == "Power Factor" or r._field == "Active Power" or r._field == "Reactive Power")
          |> last()
    `
}

// Build query for historical data (for charts)
export const buildHistoryQuery = (bucket, measurement, field, range = '-30m') => {
    const aggregateWindow = getAggregateWindow(range)
    return `
        from(bucket: "${bucket}")
          |> range(start: ${range})
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => r._field == "${field}")
          |> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)
          |> yield(name: "mean")
    `
}

// Build query for multiple fields (for combined charts)
export const buildMultiFieldHistoryQuery = (bucket, measurement, fields, range = '-30m') => {
    const fieldFilters = fields.map(f => `r._field == "${f}"`).join(' or ')
    const aggregateWindow = getAggregateWindow(range)
    return `
        from(bucket: "${bucket}")
          |> range(start: ${range})
          |> filter(fn: (r) => r._measurement == "${measurement}")
          |> filter(fn: (r) => ${fieldFilters})
          |> aggregateWindow(every: ${aggregateWindow}, fn: mean, createEmpty: false)
          |> yield(name: "mean")
    `
}

// Build query with absolute time range (for custom date picker)
export const buildHistoryQueryAbsolute = (bucket, measurement, field, start, stop) => {
    const aggregateWindow = getAggregateWindowAbsolute(start, stop)
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
export const buildMultiFieldHistoryQueryAbsolute = (bucket, measurement, fields, start, stop) => {
    const fieldFilters = fields.map(f => `r._field == "${f}"`).join(' or ')
    const aggregateWindow = getAggregateWindowAbsolute(start, stop)
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
const getAggregateWindow = (range) => {
    // Extract numeric value and unit from range string (e.g. "-30m", "-7d")
    const match = range.match(/-(\d+)([mhd])/)
    if (!match) return '1m'

    const value = parseInt(match[1])
    const unit = match[2]

    if (unit === 'm') return '1m'
    if (unit === 'h' && value <= 6) return '5m'
    if (unit === 'h') return '15m'
    if (unit === 'd' && value <= 1) return '15m'
    if (unit === 'd' && value <= 7) return '1h'
    if (unit === 'd' && value <= 14) return '2h'
    return '4h' // 30 days
}

// Helper: Get aggregate window based on absolute range
const getAggregateWindowAbsolute = (start, stop) => {
    const startDate = new Date(start)
    const stopDate = new Date(stop)
    const diffMs = stopDate - startDate
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (diffDays <= 1) return '5m'
    if (diffDays <= 7) return '1h'
    if (diffDays <= 14) return '2h'
    return '4h'
}

