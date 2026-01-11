FROM node:24-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json .

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

ARG VITE_BACKEND_URL

# Set environment variable
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build the project
RUN npm run build

# Install Nginx
FROM nginx:alpine

# Copy built files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html