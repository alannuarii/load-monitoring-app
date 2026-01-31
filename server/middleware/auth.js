// Authentication middleware - protects non-auth routes
// Updated for BetterAuth
import { auth } from "~/server/utils/auth";

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

    // Skip for Nuxt internal routes
    if (pathname.startsWith('/_nuxt') || pathname.startsWith('/__nuxt')) {
        return
    }

    try {
        // Use BetterAuth to get session
        const session = await auth.api.getSession({
            headers: event.node.req.headers
        });

        if (!session || !session.user) {
            return sendRedirect(event, '/auth/login')
        }

        // Attach user to event context
        event.context.user = session.user
        event.context.session = session.session
    } catch (error) {
        console.error('Auth middleware error:', error)
        return sendRedirect(event, '/auth/login')
    }
})
