// Authentication middleware - protects non-auth routes
export default defineEventHandler(async (event) => {
    const url = getRequestURL(event)
    const pathname = url.pathname

    // Skip middleware for auth pages and API routes
    if (pathname.startsWith('/auth') || pathname.startsWith('/api')) {
        return
    }

    // Skip for static assets
    if (pathname.includes('.') && !pathname.endsWith('.html')) {
        return
    }

    const sessionCookie = getCookie(event, 'session')

    if (!sessionCookie) {
        return sendRedirect(event, '/auth/login')
    }

    try {
        const sessionData = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'))

        // Check expiration
        if (sessionData.exp && sessionData.exp < Date.now()) {
            deleteCookie(event, 'session')
            return sendRedirect(event, '/auth/login')
        }

        // Attach user to event context
        event.context.user = sessionData
    } catch (error) {
        deleteCookie(event, 'session')
        return sendRedirect(event, '/auth/login')
    }
})
