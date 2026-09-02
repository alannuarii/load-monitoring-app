import { queryInfluxDB, buildDGQuery, buildEngineQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const id = event.context.params.id

    // Map unit ID to measurement name
    // Units 4 and 5 do not have sensors
    const unitMap = {
        '1': 'PM-DG1',
        '6': 'ENGINE-DG6',
        '7': 'ENGINE-DG7',
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
        let pmResult = await queryInfluxDB(config, pmQuery)
        
        // Use Grid/System Frequency from DSE 8610 MKII (PM-DG) for Units 6 and 7
        if (id === '6' || id === '7') {
            try {
                const syncMeasurement = `PM-DG${id}`
                const syncQuery = buildDGQuery(config.influxBucket, syncMeasurement)
                const syncResult = await queryInfluxDB(config, syncQuery)
                
                const syncFreq = syncResult.find(item => item._field === 'Frequency')
                if (syncFreq) {
                    const freqIndex = pmResult.findIndex(item => item._field === 'Frequency')
                    if (freqIndex !== -1) {
                        pmResult[freqIndex]._value = syncFreq._value
                    } else {
                        pmResult.push(syncFreq)
                    }
                }
            } catch (syncErr) {
                console.error(`Failed to fetch sync frequency for Unit ${id}:`, syncErr)
            }
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
