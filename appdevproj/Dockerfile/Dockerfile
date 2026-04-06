# Use Node.js LTS version as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY BACKEND/package*.json ./

# Install dependencies
RUN npm install

# Copy backend files
COPY BACKEND/ ./

# Copy frontend files to a public directory
COPY FRONTEND/ ./public/

# Create uploads directory
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 5000

# Environment variables (will be overridden by .env or at runtime)
ENV PORT=5000
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"] 