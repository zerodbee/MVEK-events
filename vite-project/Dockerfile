FROM node:24-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json .

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

ARG VITE_BACKEND_URL=http://localhost:5000

# Set environment variable
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build the project
RUN npm run build

# Install Nginx
FROM nginx:alpine

# Copy built files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1