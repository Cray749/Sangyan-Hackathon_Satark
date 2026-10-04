# Three small stages: install, build, run.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# run as a normal user, not root
RUN addgroup -S satark && adduser -S satark -G satark
COPY --from=build --chown=satark:satark /app/.next/standalone ./
COPY --from=build --chown=satark:satark /app/.next/static ./.next/static
COPY --from=build --chown=satark:satark /app/public ./public

# the folder where the anonymous counts database will live later
RUN mkdir -p /app/data && chown satark:satark /app/data
VOLUME ["/app/data"]

USER satark
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["node", "server.js"]
