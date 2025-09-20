#!/bin/bash

# Deployment script for Azure App Service

# Set environment variables
export NODE_ENV=production
export PORT=8080

# Install dependencies for both frontend and backend
echo "Installing dependencies..."
npm install
cd server
npm install
cd ..

# Build frontend
echo "Building frontend..."
npm run build

# Copy frontend build to server public directory
echo "Copying frontend build to server public directory..."
cp -r dist/* server/public/

# Build backend
echo "Building backend..."
cd server
npm run build

# Start the application
echo "Starting application..."
npm start