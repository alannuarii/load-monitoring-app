export default defineNuxtConfig({
    devtools: { enabled: true },

    css: ['~/assets/css/app.css'],

    app: {
        head: {
            title: 'PLTD Tahuna Maintenance App',
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Aplikasi manajemen pemeliharaan pembangkit listrik PLTD Tahuna' }
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
        dbHost: process.env.DB_HOST,
        dbPort: process.env.DB_PORT,
        dbUser: process.env.DB_USER,
        dbPassword: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
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

    compatibilityDate: '2024-11-01'
})
