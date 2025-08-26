# Single environment build for Railway deployment
FROM node:22-alpine AS base

# Single stage build for simplified deployment
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source code
COPY . .

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

ENV PORT 5000

# Single environment - build and start
CMD ["sh", "-c", "npm run build && node dist/index.js"]