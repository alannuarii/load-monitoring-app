// Get a single PM realization with materials
import { query } from '~/server/lib/db/postgres'

export default defineEventHandler(async (event) => {
    const id = parseInt(getRouterParam(event, 'id'))

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid id parameter'
        })
    }

    try {
        // Get realization
        const realizations = await query(
            `SELECT * FROM pm_realizations WHERE id = $1`,
            [id]
        )

        if (realizations.length === 0) {
            throw createError({
                statusCode: 404,
                message: 'Realization not found'
            })
        }

        const realization = realizations[0]

        // Get materials
        const materials = await query(
            `SELECT * FROM pm_realization_materials WHERE realization_id = $1 ORDER BY id`,
            [id]
        )

        return {
            ...realization,
            materials
        }
    } catch (error) {
        if (error.statusCode) throw error

        console.error('Error fetching realization:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch realization'
        })
    }
})
