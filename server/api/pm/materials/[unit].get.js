// Get all materials for a specific unit (all cycles P1-P5)
import { fastMovingMaterials } from '~/server/lib/data/fastMoving'
import { engines } from '~/server/lib/data/engineData'

export default defineEventHandler(async (event) => {
    const unit = parseInt(getRouterParam(event, 'unit'))

    if (isNaN(unit)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid unit parameter'
        })
    }

    // Find engine data
    const engine = engines.find(e => e.unit === unit)
    if (!engine) {
        throw createError({
            statusCode: 404,
            message: `Unit ${unit} not found`
        })
    }

    // Find materials for this unit
    const unitMaterials = fastMovingMaterials.find(m => m.unit === unit)
    if (!unitMaterials) {
        return {
            unit,
            mesin: engine.mesin,
            materials: []
        }
    }

    return {
        unit,
        mesin: engine.mesin,
        materials: unitMaterials.material.map(m => ({
            nama: m.nama,
            jumlah: m.jumlah,
            satuan: m.satuan,
            cycle: m.cycle
        }))
    }
})
