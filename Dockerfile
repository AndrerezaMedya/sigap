FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_GCP_API_KEY
# This key is intentionally embedded in the client bundle (Maps JavaScript API only).
# It is restricted by: API = Maps JS API only, HTTP Referrers = *.a.run.app + localhost.
# The server-side key (GCP_API_KEY) is kept separately in Secret Manager.
ENV NEXT_PUBLIC_GCP_API_KEY=${NEXT_PUBLIC_GCP_API_KEY:-AIzaSyAzevOFdDHHCBMxY1JIP_BA_Au8OkF8dIA}
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080

CMD ["node", "server.js"]
