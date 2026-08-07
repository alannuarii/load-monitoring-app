import {
    queryInfluxDB,
    buildHistoryQuery,
    buildMultiFieldHistoryQuery,
    buildHistoryQueryAbsolute,
    buildMultiFieldHistoryQueryAbsolute
} from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const id = event.context.params.id
    const queryParams = getQuery(event)

    // Support single field or multiple fields (comma-separated)
    const fieldParam = queryParams.field || 'Active Power'
    const fields = fieldParam.includes(',') ? fieldParam.split(',') : null
    const range = queryParams.range || '-30m'
    const isRaw = queryParams.raw === 'true' || queryParams.raw === true

    // Support absolute time range (for custom date picker)
    const startTime = queryParams.start
    const stopTime = queryParams.stop

    const unitMap = {
        '1': 'PM-DG1',
        '6': 'PM-DG6',
        '7': 'PM-DG7',
        '8': 'PM-DG8',
        '9': 'PM-DG9'
    }

    const engineFields = ['Oil Pressure', 'Coolant Temp', 'Charge Alt', 'Battery Voltage', 'Engine RPM']
    const isEngineField = fields ? engineFields.includes(fields[0]) : engineFields.includes(fieldParam)

    const measurement = isEngineField ? `ENGINE-DG${id}` : unitMap[id]

    if (!measurement) {
        if (id === '4' || id === '5') {
            return []
        }
        throw createError({
            statusCode: 400,
            message: 'Invalid Unit ID'
        })
    }

    let query

    // Use absolute time if start and stop provided, otherwise use relative range
    if (startTime && stopTime) {
        query = fields
            ? buildMultiFieldHistoryQueryAbsolute(config.influxBucket, measurement, fields, startTime, stopTime, isRaw)
            : buildHistoryQueryAbsolute(config.influxBucket, measurement, fieldParam, startTime, stopTime, isRaw)
    } else {
        query = fields
            ? buildMultiFieldHistoryQuery(config.influxBucket, measurement, fields, range, isRaw)
            : buildHistoryQuery(config.influxBucket, measurement, fieldParam, range, isRaw)
    }

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error(`History Unit ${id} API error:`, error)
        throw createError({
            statusCode: 500,
            message: `Failed to fetch history for Unit ${id}`
        })
    }
})
