# ================================
# Production-optimized Build
# Strategy: Use pre-built dist/ (built locally with correct TypeScript 5.2.2)
# ================================
FROM node:20-alpine AS base

# Install dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files and install PRODUCTION dependencies only
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# ================================
# Final Production Stage
# ================================
FROM node:20-alpine AS production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy production dependencies
COPY --from=base /app/node_modules ./node_modules

# Copy Prisma files
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma

# Copy pre-built application (built locally with correct TypeScript)
COPY dist ./dist

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

CMD ["node", "dist/main.js"]

# Start application (migrations will run via docker-compose command)
CMD ["node", "dist/main"]
