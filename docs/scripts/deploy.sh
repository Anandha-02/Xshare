#!/bin/bash

echo "Starting Xshare deployment..."

# Navigate to project root
cd "$(dirname "$0")/.." || exit

# Pull latest code from Git
echo "Pulling latest code..."
git pull origin main

# Backend setup
echo "Setting up Backend..."
cd backend || exit
npm install
# Build or prepare backend if needed
echo "Backend setup complete."

# Frontend setup
echo "Setting up Frontend..."
cd ../frontend || exit
npm install
npm run build
echo "Frontend build complete."

# Copy frontend build to backend public folder (optional)
# cp -r dist/* ../backend/public/

# Restart backend server using PM2 (or any process manager)
# pm2 restart xshare-backend || pm2 start server.js --name xshare-backend

echo "Deployment completed successfully!"
