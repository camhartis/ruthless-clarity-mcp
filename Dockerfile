# Multi-stage build for Ruthless Clarity MCP (stdio transport)
#
# MCPRush notes:
# - Node.js path or published-image path: platform can add HTTP adapter for stdio.
# - Custom Dockerfile path on MCPRush requires YOUR image to expose Streamable HTTP.
#   This stock Dockerfile is stdio-only — prefer Node path or publish this image
#   and select "container image" + command `node dist/index.js`.

# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ---- Production stage ----
FROM node:22-alpine AS runtime

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN addgroup -S mcp && adduser -S mcp -G mcp
USER mcp

ENTRYPOINT ["node", "dist/index.js"]
