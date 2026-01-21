#!/bin/bash
# Meal Planner - Easy Setup Script
# This script helps you quickly rebuild and deploy your meal planner

set -e  # Exit on any error

echo "🍽️  Meal Planner Setup Script"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Ask for admin PIN
echo "🔐 Enter your admin PIN (or press Enter for default '1234'):"
read -s ADMIN_PIN
if [ -z "$ADMIN_PIN" ]; then
    ADMIN_PIN="1234"
    echo "⚠️  Using default PIN: 1234"
else
    echo "✅ Custom PIN set"
fi
echo ""

# Ask for port
echo "🌐 Enter the port to use (or press Enter for default '3000'):"
read PORT
if [ -z "$PORT" ]; then
    PORT="3000"
fi
echo "✅ Using port: $PORT"
echo ""

# Stop and remove existing container if it exists
echo "🛑 Stopping existing container (if any)..."
docker stop meal-planner 2>/dev/null || true
docker rm meal-planner 2>/dev/null || true
echo ""

# Build the image
echo "🔨 Building Docker image..."
docker build -t meal-planner .
echo "✅ Build complete"
echo ""

# Run the container
echo "🚀 Starting container..."
docker run -d \
  -p ${PORT}:3000 \
  -v meal-planner-data:/app/data \
  -e ADMIN_PIN="${ADMIN_PIN}" \
  --name meal-planner \
  --restart unless-stopped \
  meal-planner

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Access your meal planner at:"
echo "   http://localhost:${PORT}"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:    docker logs -f meal-planner"
echo "   Stop:         docker stop meal-planner"
echo "   Start:        docker start meal-planner"
echo "   Restart:      docker restart meal-planner"
echo ""
echo "💾 To backup your data:"
echo "   docker run --rm -v meal-planner-data:/data -v \$(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data ."
echo ""
echo "Happy meal planning! 🍽️"