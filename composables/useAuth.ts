import { createAuthClient } from "better-auth/vue";
import { useState, computed, navigateTo, useRuntimeConfig } from "#imports";

// Create auth client - will be initialized with proper URL
let authClient: ReturnType<typeof createAuthClient> | null = null;

const getAuthClient = () => {
    if (!authClient && typeof window !== 'undefined') {
        const config = useRuntimeConfig();
        // Use the configured URL if available, otherwise default to current origin
        const baseURL = config.public.betterAuthUrl || window.location.origin;
        authClient = createAuthClient({
            baseURL: baseURL
        });
    }
    return authClient;
};

export const useAuth = () => {
    // Use useState to ensure SSR compatibility
    const user = useState<any>('auth-user', () => null);
    const isLoading = useState('auth-loading', () => false);
    const isAuthenticated = computed(() => !!user.value);

    // Initialize session on client side only
    const initAuth = async () => {
        if (typeof window === 'undefined') return;
        
        const client = getAuthClient();
        if (!client) return;

        isLoading.value = true;
        try {
            const session = await client.getSession();
            if (session?.data?.user) {
                user.value = session.data.user;
            }
        } catch (error) {
            console.error('Auth init error:', error);
            user.value = null;
        } finally {
            isLoading.value = false;
        }
    };

    const loginWithGoogle = async () => {
        const client = getAuthClient();
        if (!client) return;
        
        await client.signIn.social({
            provider: "google",
            callbackURL: "/"
        });
    };

    const logout = async () => {
        const client = getAuthClient();
        if (client) {
            await client.signOut();
        }
        user.value = null;
        await navigateTo('/auth/login');
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        initAuth,
        loginWithGoogle,
        logout
    };
};
