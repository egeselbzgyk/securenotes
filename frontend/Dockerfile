# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install --prefer-offline --no-audit

RUN npm install @rollup/rollup-linux-x64-musl --no-save --no-audit

COPY . .
RUN npm run build

# Stage 2: Serve (using Nginx)
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from builder stage to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
