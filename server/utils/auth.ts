import { betterAuth } from "better-auth";
import pkg from "pg";
const { Pool } = pkg;
import { useRuntimeConfig } from "#imports";

const config = useRuntimeConfig();

export const auth = betterAuth({
  database: new Pool({
    connectionString: config.databaseUrl,
  }),
  secret: config.betterAuthSecret,
  baseURL: config.betterAuthUrl,
  socialProviders: {
    google: {
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
    },
  },
  trustedOrigins: [
    config.betterAuthUrl,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001", // In case port is taken
  ],
});
