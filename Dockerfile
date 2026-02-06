# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Build args for public config (must be set at build time)
ARG BETTER_AUTH_URL=http://localhost:3000
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}

COPY package*.json ./
RUN npm ci  # Changed back to ci for reproducible builds

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache tzdata

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

COPY --from=builder /app/.output /app/.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]