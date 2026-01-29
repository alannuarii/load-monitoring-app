// Get current authenticated user
export default defineEventHandler(async (event) => {
    const sessionCookie = getCookie(event, 'session')

    if (!sessionCookie) {
        throw createError({
            statusCode: 401,
            message: 'Not authenticated'
        })
    }

    try {
        const sessionData = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'))

        // Check if session is expired
        if (sessionData.exp && sessionData.exp < Date.now()) {
            deleteCookie(event, 'session')
            throw createError({
                statusCode: 401,
                message: 'Session expired'
            })
        }

        return {
            id: sessionData.id,
            email: sessionData.email,
            name: sessionData.name,
            picture: sessionData.picture
        }
    } catch (error) {
        if (error.statusCode) throw error

        deleteCookie(event, 'session')
        throw createError({
            statusCode: 401,
            message: 'Invalid session'
        })
    }
})
