# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package descriptors first to maximize layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy application source files
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve production bundle with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Healthcheck for frontend service
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
