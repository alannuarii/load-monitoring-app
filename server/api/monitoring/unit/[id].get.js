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
        
        // Use Grid/System Frequency for Units 6 and 7
        if (id === '6' || id === '7') {
            try {
                // Query multiple PMs to get the most precise system frequency (like index.vue does)
                const syncQuery = `
                    from(bucket: "${config.influxBucket}")
                      |> range(start: -1m)
                      |> filter(fn: (r) => r._measurement == "PM-DG9" or r._measurement == "PM-DG8" or r._measurement == "PM-DG7" or r._measurement == "PM-DG6" or r._measurement == "PM-DG1")
                      |> filter(fn: (r) => r._field == "Frequency")
                      |> last()
                `
                const syncResult = await queryInfluxDB(config, syncQuery)
                
                // Prioritize PM-DG9 and PM-DG8 as they have higher precision (PM 5350)
                const measurements = ['PM-DG9', 'PM-DG8', 'PM-DG7', 'PM-DG6', 'PM-DG1']
                let bestFreq = null
                for (const meas of measurements) {
                    const found = syncResult.find(item => item._measurement === meas && item._value > 0)
                    if (found) {
                        bestFreq = found
                        break
                    }
                }

                if (bestFreq) {
                    const freqIndex = pmResult.findIndex(item => item._field === 'Frequency')
                    if (freqIndex !== -1) {
                        pmResult[freqIndex]._value = bestFreq._value
                    } else {
                        pmResult.push({
                            ...bestFreq,
                            _field: 'Frequency',
                            _measurement: measurement
                        })
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
