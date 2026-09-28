// API endpoint for BMS Realtime telemetry
import { queryInfluxDB } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const feeder = query.feeder === '2' ? '2' : '1'

    const fluxQuery = `
        from(bucket: "${config.influxBucket}")
          |> range(start: -3m)
          |> filter(fn: (r) => r._measurement == "BMS" and r.feeder == "${feeder}")
          |> last()
    `

    try {
        const rows = await queryInfluxDB(config, fluxQuery)

        // Group rows by IP
        const moduleMap = {}
        let latestTime = null

        for (const row of rows) {
            const ip = row.ip
            if (!ip) continue

            if (!latestTime || new Date(row._time) > new Date(latestTime)) {
                latestTime = row._time
            }

            if (!moduleMap[ip]) {
                moduleMap[ip] = {
                    ip: row.ip,
                    feeder: row.feeder,
                    feeder_bms: row.feeder_bms,
                    module: row.module,
                    time: row._time,
                    cells: Array(16).fill(null)
                }
            }

            const field = row._field
            const val = row._value

            if (field && field.startsWith('v_cell_')) {
                const cellNum = parseInt(field.replace('v_cell_', ''), 10)
                if (cellNum >= 1 && cellNum <= 16) {
                    moduleMap[ip].cells[cellNum - 1] = typeof val === 'number' ? Number(val.toFixed(3)) : val
                }
                moduleMap[ip][field] = val
            } else {
                moduleMap[ip][field] = val
            }
        }

        // Build 88 modules list for the selected feeder
        const modules = []
        const startIdx = feeder === '1' ? 1 : 89
        const endIdx = feeder === '1' ? 88 : 176

        let onlineCount = 0
        let sumSoc = 0
        let sumSoh = 0
        let sumVoltage = 0
        let maxTemp = 0
        let maxCellDelta = 0

        for (let i = startIdx; i <= endIdx; i++) {
            const ip = `192.168.0.${i}`
            const feederBmsNum = feeder === '1' ? i : (i - 88)
            const feederBmsStr = `BMS-${String(feederBmsNum).padStart(2, '0')}`
            const globalModuleStr = `BMS-${String(i).padStart(3, '0')}`

            const modData = moduleMap[ip]
            if (modData) {
                onlineCount++
                if (typeof modData.soc === 'number') sumSoc += modData.soc
                if (typeof modData.soh === 'number') sumSoh += modData.soh
                if (typeof modData.voltage === 'number') sumVoltage += modData.voltage
                if (typeof modData.temp_module === 'number') {
                    maxTemp = Math.max(maxTemp, modData.temp_module)
                }
                if (typeof modData.cell_delta === 'number') {
                    maxCellDelta = Math.max(maxCellDelta, modData.cell_delta)
                }

                modules.push({
                    id: i,
                    feederIndex: feederBmsNum,
                    feederBms: feederBmsStr,
                    moduleName: globalModuleStr,
                    ip: ip,
                    online: true,
                    time: modData.time,
                    soc: modData.soc ?? 0,
                    soh: modData.soh ?? 0,
                    voltage: modData.voltage ?? 0,
                    capacity: modData.capacity ?? 0,
                    cellDelta: modData.cell_delta ?? 0,
                    cellAvg: modData.v_cell_avg ?? 0,
                    cellMin: modData.v_cell_min ?? 0,
                    cellMax: modData.v_cell_max ?? 0,
                    tempModule: modData.temp_module ?? 0,
                    tempLeft: modData.temp_battery_left ?? 0,
                    tempRight: modData.temp_battery_right ?? 0,
                    cells: modData.cells
                })
            } else {
                modules.push({
                    id: i,
                    feederIndex: feederBmsNum,
                    feederBms: feederBmsStr,
                    moduleName: globalModuleStr,
                    ip: ip,
                    online: false,
                    time: null,
                    soc: 0,
                    soh: 0,
                    voltage: 0,
                    capacity: 0,
                    cellDelta: 0,
                    cellAvg: 0,
                    cellMin: 0,
                    cellMax: 0,
                    tempModule: 0,
                    tempLeft: 0,
                    tempRight: 0,
                    cells: Array(16).fill(null)
                })
            }
        }

        const summary = {
            feeder: parseInt(feeder, 10),
            totalModules: 88,
            onlineCount,
            offlineCount: 88 - onlineCount,
            avgSoc: onlineCount > 0 ? Number((sumSoc / onlineCount).toFixed(1)) : 0,
            avgSoh: onlineCount > 0 ? Number((sumSoh / onlineCount).toFixed(1)) : 0,
            avgVoltage: onlineCount > 0 ? Number((sumVoltage / onlineCount).toFixed(2)) : 0,
            maxTemp: onlineCount > 0 ? Number(maxTemp.toFixed(1)) : 0,
            maxCellDelta: onlineCount > 0 ? Number(maxCellDelta.toFixed(3)) : 0,
            latestUpdate: latestTime
        }

        return {
            summary,
            modules
        }
    } catch (err) {
        console.error(`BMS Realtime API error (Feeder ${feeder}):`, err)
        throw createError({
            statusCode: 500,
            message: `Failed to fetch BMS realtime data: ${err.message}`
        })
    }
})
