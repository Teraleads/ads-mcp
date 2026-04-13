# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Only production deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Coolify reads this to know which port to expose
EXPOSE 3003

# Health check endpoint — Coolify polls this
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3003/health || exit 1

ENV NODE_ENV=production
ENV TRANSPORT=http
ENV PORT=3003

CMD ["node", "dist/index.js"]
