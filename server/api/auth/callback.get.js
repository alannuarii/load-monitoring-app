// Google OAuth callback handler
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const code = query.code

    if (!code) {
        return sendRedirect(event, '/auth/login?error=no_code')
    }

    const config = useRuntimeConfig()
    const redirectUri = `${getRequestURL(event).origin}/api/auth/callback`

    try {
        // Exchange code for tokens
        const tokenResponse = await $fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            body: {
                code,
                client_id: config.googleClientId,
                client_secret: config.googleClientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            }
        })

        const { access_token, id_token } = tokenResponse

        // Get user info from Google
        const userInfo = await $fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })

        // Create session token (simple JWT-like approach)
        const sessionData = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        }

        // Encode session as base64 (in production, use proper JWT)
        const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64')

        // Set cookie
        setCookie(event, 'session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
        })

        return sendRedirect(event, '/')
    } catch (error) {
        console.error('OAuth callback error:', error)
        return sendRedirect(event, '/auth/login?error=oauth_failed')
    }
})
