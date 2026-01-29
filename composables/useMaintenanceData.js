// Maintenance data composable using Nuxt best practices
export const useMaintenanceData = () => {
    // Fetch service hours data
    const { data: serviceHours, pending: isLoading, refresh: refreshServiceHours } = useFetch('/api/servicehour', {
        key: 'service-hours',
        default: () => []
    })

    // Oil change cycles per unit
    const gantiOliCycles = [500, 250, 250, 500, 500, 250, 250]
    const overhaulCycles = [6000, 6000, 6000, 5000, 5000, 6000, 6000]

    // Engines mapping
    const engines = [
        { unit: 1, mesin: "SWD 6FHD 240" },
        { unit: 4, mesin: "Deutz MWM 212 V12" },
        { unit: 5, mesin: "Deutz MWM 212 V12" },
        { unit: 6, mesin: "Mitsubishi S16R PTA-S" },
        { unit: 7, mesin: "Mitsubishi S16R PTA-S" },
        { unit: 8, mesin: "Cummins KTA50-G8" },
        { unit: 9, mesin: "Cummins KTA50-G8" },
    ]

    // Get engine name by unit
    const getEngineName = (unit) => {
        const engine = engines.find(e => e.unit === unit)
        return engine ? `${engine.mesin} Unit ${engine.unit}` : `Unit ${unit}`
    }

    // Fetch PM schedule
    const fetchPMSchedule = async (startDate = null, endDate = null) => {
        const params = new URLSearchParams()
        if (startDate) params.append('start', startDate)
        if (endDate) params.append('end', endDate)

        const url = `/api/pm/schedule${params.toString() ? '?' + params.toString() : ''}`
        return await $fetch(url)
    }

    return {
        serviceHours,
        isLoading,
        refreshServiceHours,
        gantiOliCycles,
        overhaulCycles,
        engines,
        getEngineName,
        fetchPMSchedule
    }
}
