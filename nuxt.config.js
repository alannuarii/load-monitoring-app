export default defineNuxtConfig({
    devtools: { enabled: true },

    css: ['~/assets/css/app.css'],

    app: {
        head: {
            title: 'Load Monitoring App',
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Aplikasi Monitoring Beban Pembangkit Listrik PLTD Tahuna' }
            ],
            link: [
                {
                    rel: 'preconnect',
                    href: 'https://fonts.googleapis.com'
                },
                {
                    rel: 'preconnect',
                    href: 'https://fonts.gstatic.com',
                    crossorigin: 'anonymous'
                },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
                }
            ]
        }
    },

    runtimeConfig: {
        // Server-only environment variables
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // InfluxDB
        influxUrl: process.env.INFLUX_URL,
        influxToken: process.env.INFLUX_TOKEN,
        influxOrg: process.env.INFLUX_ORG,
        influxBucket: process.env.INFLUX_BUCKET,
        // BetterAuth
        databaseUrl: process.env.DATABASE_URL,
        betterAuthSecret: process.env.BETTER_AUTH_SECRET,
        betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

        // Public environment variables (exposed to client)
        public: {
            googleClientId: process.env.GOOGLE_CLIENT_ID,
            betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000'
        }
    },

    modules: ['@vite-pwa/nuxt'],

    pwa: {
        registerType: 'autoUpdate',
        manifest: {
            name: 'Load Monitoring App',
            short_name: 'Load Monitor',
            description: 'Aplikasi Monitoring Beban Pembangkit Listrik PLTD Tahuna',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            icons: [
                {
                    src: 'pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png'
                },
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable'
                }
            ]
        },
        workbox: {
            navigateFallback: '/',
            globPatterns: ['**/*.{js,css,html,png,svg,ico}']
        },
        client: {
            installPrompt: true,
            periodicSyncForUpdates: 3600
        },
        devOptions: {
            enabled: true,
            suppressWarnings: true,
            navigateFallbackAllowlist: [/^\/$/],
            type: 'module'
        }
    },

    compatibilityDate: '2024-11-01'
})
