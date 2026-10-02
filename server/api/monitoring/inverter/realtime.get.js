// API endpoint for Inverter Realtime telemetry
import { queryInfluxDB } from '~/server/lib/db/influxdb'

const FEEDER_INVERTERS = {
    '1': [
        { id: 1, name: 'INV-01', string: 1, gateway: '192.168.0.216', unit_id: 1, port: 502 },
        { id: 2, name: 'INV-02', string: 1, gateway: '192.168.0.216', unit_id: 2, port: 502 },
        { id: 3, name: 'INV-03', string: 2, gateway: '192.168.0.216', unit_id: 3, port: 502 },
        { id: 4, name: 'INV-04', string: 2, gateway: '192.168.0.216', unit_id: 4, port: 502 },
        { id: 5, name: 'INV-05', string: 2, gateway: '192.168.0.216', unit_id: 5, port: 502 }
    ],
    '2': [
        { id: 6, name: 'INV-06', string: 3, gateway: '192.168.0.217', unit_id: 6, port: 502 },
        { id: 7, name: 'INV-07', string: 3, gateway: '192.168.0.217', unit_id: 7, port: 502 },
        { id: 8, name: 'INV-08', string: 3, gateway: '192.168.0.217', unit_id: 8, port: 502 },
        { id: 9, name: 'INV-09', string: 4, gateway: '192.168.0.217', unit_id: 9, port: 502 },
        { id: 10, name: 'INV-10', string: 4, gateway: '192.168.0.217', unit_id: 10, port: 502 },
        { id: 11, name: 'INV-11', string: 4, gateway: '192.168.0.217', unit_id: 11, port: 502 }
    ]
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const feeder = query.feeder === '2' ? '2' : '1'

    const targetInverters = FEEDER_INVERTERS[feeder]

    const fluxQuery = `
        from(bucket: "${config.influxBucket}")
          |> range(start: -30s)
          |> filter(fn: (r) => r._measurement == "INVERTER")
          |> last()
    `

    try {
        const rows = await queryInfluxDB(config, fluxQuery)

        // Group rows by inverter name (e.g. INV-01, INV-06, etc.)
        const invDataMap = {}
        let latestTime = null

        for (const row of rows) {
            const invName = row.inverter
            if (!invName) continue

            if (!latestTime || new Date(row._time) > new Date(latestTime)) {
                latestTime = row._time
            }

            if (!invDataMap[invName]) {
                invDataMap[invName] = {
                    name: invName,
                    gateway: row.gateway,
                    unit_id: row.unit_id ? parseInt(row.unit_id, 10) : null,
                    string: row.string ? parseInt(row.string, 10) : null,
                    time: row._time
                }
            }

            const field = row._field
            const val = row._value
            invDataMap[invName][field] = val
        }

        let onlineCount = 0
        let runningCount = 0
        let faultCount = 0
        let totalActivePower = 0
        let totalDcPower = 0
        let totalReactivePower = 0
        let sumEfficiency = 0
        let countEfficiency = 0
        let sumPowerFactor = 0
        let countPowerFactor = 0
        let maxTemp = 0

        const inverters = targetInverters.map(invDef => {
            const data = invDataMap[invDef.name]
            const isOnline = !!data

            if (isOnline) {
                onlineCount++
                const pAc = typeof data.p_ac === 'number' ? data.p_ac : 0
                const pDc = typeof data.p_dc === 'number' ? data.p_dc : 0
                const qAc = typeof data.q_ac === 'number' ? data.q_ac : 0
                const pf = typeof data.power_factor === 'number' ? data.power_factor : 0
                const eff = typeof data.efficiency === 'number' ? data.efficiency : 0
                const freq = typeof data.frequency === 'number' ? data.frequency : 0

                const vAb = typeof data.v_ab === 'number' ? data.v_ab : 0
                const vBc = typeof data.v_bc === 'number' ? data.v_bc : 0
                const vCa = typeof data.v_ca === 'number' ? data.v_ca : 0
                const vAvg = Number(((vAb + vBc + vCa) / 3).toFixed(1))

                const iA = typeof data.i_a === 'number' ? data.i_a : 0
                const iB = typeof data.i_b === 'number' ? data.i_b : 0
                const iC = typeof data.i_c === 'number' ? data.i_c : 0
                const iAvg = Number(((iA + iB + iC) / 3).toFixed(1))

                const tempHeatsink = typeof data.temp_heatsink === 'number' ? data.temp_heatsink : 0
                const tempAmbient = typeof data.temp_ambient === 'number' ? data.temp_ambient : 0
                const tempModule = typeof data.temp_module === 'number' ? data.temp_module : 0
                const tempInternal = typeof data.temp_internal === 'number' ? data.temp_internal : 0

                const isRunning = data.is_running === 1
                const isReady = data.is_ready === 1
                const isFault = data.is_fault === 1

                if (isRunning) runningCount++
                if (isFault) faultCount++

                totalActivePower += pAc
                totalDcPower += pDc
                totalReactivePower += qAc

                if (eff > 0) {
                    sumEfficiency += eff
                    countEfficiency++
                }

                if (pf > 0) {
                    sumPowerFactor += pf
                    countPowerFactor++
                }

                const localMaxTemp = Math.max(tempHeatsink, tempAmbient, tempModule, tempInternal)
                if (localMaxTemp > maxTemp) {
                    maxTemp = localMaxTemp
                }

                // Determine overall status text
                let status = 'STANDBY'
                let badgeClass = 'bg-warning text-gray-800'
                if (isFault) {
                    status = 'FAULT'
                    badgeClass = 'bg-danger text-white'
                } else if (isRunning) {
                    status = 'RUNNING'
                    badgeClass = 'bg-success text-white'
                } else if (isReady) {
                    status = 'READY'
                    badgeClass = 'bg-info text-white'
                }

                return {
                    id: invDef.id,
                    name: invDef.name,
                    feeder: parseInt(feeder, 10),
                    string: invDef.string,
                    gateway: invDef.gateway,
                    unit_id: invDef.unit_id,
                    port: invDef.port,
                    online: true,
                    status,
                    badgeClass,
                    time: data.time,
                    // Power & Energy
                    p_ac: Number(pAc.toFixed(2)),
                    p_dc: Number(pDc.toFixed(2)),
                    q_ac: Number(qAc.toFixed(2)),
                    efficiency: Number(eff.toFixed(1)),
                    power_factor: Number(pf.toFixed(3)),
                    frequency: Number(freq.toFixed(2)),
                    // Voltages
                    v_ab: Number(vAb.toFixed(1)),
                    v_bc: Number(vBc.toFixed(1)),
                    v_ca: Number(vCa.toFixed(1)),
                    v_avg: vAvg,
                    // Currents
                    i_a: Number(iA.toFixed(1)),
                    i_b: Number(iB.toFixed(1)),
                    i_c: Number(iC.toFixed(1)),
                    i_avg: iAvg,
                    // Temperatures
                    temp_heatsink: Number(tempHeatsink.toFixed(1)),
                    temp_ambient: Number(tempAmbient.toFixed(1)),
                    temp_module: Number(tempModule.toFixed(1)),
                    temp_internal: Number(tempInternal.toFixed(1)),
                    // Raw Flags & Status Code
                    status_code: data.status_code ?? 0,
                    is_running: isRunning,
                    is_ready: isReady,
                    is_fault: isFault
                }
            } else {
                return {
                    id: invDef.id,
                    name: invDef.name,
                    feeder: parseInt(feeder, 10),
                    string: invDef.string,
                    gateway: invDef.gateway,
                    unit_id: invDef.unit_id,
                    port: invDef.port,
                    online: false,
                    status: 'OFFLINE',
                    badgeClass: 'bg-muted text-gray-500',
                    time: null,
                    p_ac: 0,
                    p_dc: 0,
                    q_ac: 0,
                    efficiency: 0,
                    power_factor: 0,
                    frequency: 0,
                    v_ab: 0,
                    v_bc: 0,
                    v_ca: 0,
                    v_avg: 0,
                    i_a: 0,
                    i_b: 0,
                    i_c: 0,
                    i_avg: 0,
                    temp_heatsink: 0,
                    temp_ambient: 0,
                    temp_module: 0,
                    temp_internal: 0,
                    status_code: 0,
                    is_running: false,
                    is_ready: false,
                    is_fault: false
                }
            }
        })

        const summary = {
            feeder: parseInt(feeder, 10),
            totalInverters: targetInverters.length,
            onlineCount,
            offlineCount: targetInverters.length - onlineCount,
            runningCount,
            faultCount,
            totalActivePower: Number(totalActivePower.toFixed(2)),
            totalDcPower: Number(totalDcPower.toFixed(2)),
            totalReactivePower: Number(totalReactivePower.toFixed(2)),
            avgEfficiency: countEfficiency > 0 ? Number((sumEfficiency / countEfficiency).toFixed(1)) : 0,
            avgPowerFactor: countPowerFactor > 0 ? Number((sumPowerFactor / countPowerFactor).toFixed(3)) : 0,
            maxTemp: Number(maxTemp.toFixed(1)),
            latestUpdate: latestTime
        }

        return {
            summary,
            inverters
        }
    } catch (err) {
        console.error(`Inverter Realtime API error (Feeder ${feeder}):`, err)
        throw createError({
            statusCode: 500,
            message: `Failed to fetch Inverter realtime data: ${err.message}`
        })
    }
})
