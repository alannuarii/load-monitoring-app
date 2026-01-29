// Authentication composable for Google OAuth
export const useAuth = () => {
    const user = useState('user', () => null)
    const isAuthenticated = computed(() => !!user.value)
    const isLoading = useState('auth-loading', () => false)

    // Check authentication status
    const checkAuth = async () => {
        if (import.meta.server) return

        isLoading.value = true
        try {
            const response = await $fetch('/api/auth/me', {
                credentials: 'include'
            })
            if (response) {
                user.value = response
            }
        } catch (error) {
            // Not authenticated or error
            user.value = null
        } finally {
            isLoading.value = false
        }
    }

    // Redirect to Google OAuth
    const loginWithGoogle = () => {
        const config = useRuntimeConfig()
        const redirectUri = `${window.location.origin}/api/auth/callback`
        const scope = 'openid email profile'

        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
        googleAuthUrl.searchParams.set('client_id', config.public.googleClientId)
        googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
        googleAuthUrl.searchParams.set('response_type', 'code')
        googleAuthUrl.searchParams.set('scope', scope)
        googleAuthUrl.searchParams.set('access_type', 'offline')
        googleAuthUrl.searchParams.set('prompt', 'consent')

        window.location.href = googleAuthUrl.toString()
    }

    // Logout - clear session and redirect to login
    const logout = async () => {
        isLoading.value = true
        try {
            await $fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Always clear user state and redirect
            user.value = null
            isLoading.value = false
            await navigateTo('/auth/login')
        }
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        checkAuth,
        loginWithGoogle,
        logout
    }
}
