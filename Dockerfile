# Dependency Installation
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN \
    if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; \
    fi

# Build the Next.js Application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production Image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
# Next.js collects completely anonymous telemetry data about usage.
# Learn more: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port 3000 where the Next.js app will run
EXPOSE 3000

# Command to run the Next.js application
CMD ["npm", "start"]
