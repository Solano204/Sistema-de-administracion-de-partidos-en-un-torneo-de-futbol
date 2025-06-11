#!/bin/bash

echo "Creating .npmrc with legacy-peer-deps..."
echo "legacy-peer-deps=true" > .npmrc

echo "Updating package.json to use React 19..."
# This is a placeholder - you'll need to manually update your package.json
# or use the updated-package-json provided

echo "Cleaning node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

echo "Installing dependencies with legacy-peer-deps..."
npm install --legacy-peer-deps

echo "Making sure GSAP dependencies are installed..."
npm install --legacy-peer-deps gsap@3.12.5 @gsap/react@2.1.0

echo "Cleaning Docker environment..."
docker-compose down
docker builder prune -f

echo "Rebuilding Docker images with no cache..."
docker-compose build --no-cache

echo "Starting Docker containers..."
docker-compose up