#!/bin/bash

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Copy built frontend files to server public directory
echo "Copying frontend build to server..."
cp -r dist/* server/public/

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install

# Build server
echo "Building server..."
npm run build

# Start the application
echo "Starting application..."
node dist/index.js