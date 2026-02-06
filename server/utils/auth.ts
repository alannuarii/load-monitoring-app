import { betterAuth } from "better-auth";
import pkg from "pg";
const { Pool } = pkg;

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL || "",
  }),
  secret: process.env.BETTER_AUTH_SECRET || "",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001", // In case port is taken
    "https://loadmonitoring.serveer.biz.id", // Production
  ],
});
