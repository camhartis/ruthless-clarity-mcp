# Multi-stage build for Ruthless Clarity MCP (stdio transport)
# MCPRush supports container images and will add HTTP adapter for stdio servers.

# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching (lockfile = reproducible)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ---- Production stage ----
FROM node:22-alpine AS runtime

WORKDIR /app

# Production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN addgroup -S mcp && adduser -S mcp -G mcp
USER mcp

# Stdio transport — no EXPOSE needed
# MCPRush will wrap this with their HTTP adapter when deploying from image

ENTRYPOINT ["node", "dist/index.js"]
