// Delete a PM realization
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
        // Delete realization (materials will be cascade deleted)
        const result = await query(
            `DELETE FROM pm_realizations WHERE id = $1 RETURNING id`,
            [id]
        )

        if (result.length === 0) {
            throw createError({
                statusCode: 404,
                message: 'Realization not found'
            })
        }

        return {
            success: true,
            message: 'Realization deleted successfully'
        }
    } catch (error) {
        if (error.statusCode) throw error

        console.error('Error deleting realization:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to delete realization'
        })
    }
})
