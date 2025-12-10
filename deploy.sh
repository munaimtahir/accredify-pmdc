#!/bin/bash

# Deployment script for AccrediFy PMDC on VPS
set -e

echo "================================================"
echo "AccrediFy PMDC - Docker Deployment Script"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    echo "Run: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    echo "Run: sudo apt-get install docker-compose-plugin -y"
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and update the following:"
    echo "   - DB_PASSWORD (set a strong password)"
    echo "   - SECRET_KEY (generate using: python3 -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\")"
    echo ""
    echo "After updating .env, run this script again."
    exit 0
fi

echo "✓ Environment file (.env) found"
echo ""

# Check if SECRET_KEY is still default
if grep -q "your-secret-key-change-me" .env; then
    echo "⚠️  WARNING: SECRET_KEY in .env is still set to default value!"
    echo "Please generate a new secret key and update .env file."
    echo "Generate key: python3 -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Building and starting containers..."
echo ""

# Stop existing containers if any
docker compose down 2>/dev/null || true

# Build and start containers
docker compose up -d --build

echo ""
echo "Waiting for services to start..."
sleep 10

# Check container status
echo ""
echo "Container Status:"
docker compose ps

echo ""
echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo ""
echo "Application URLs:"
echo "  Frontend:     http://34.93.19.177"
echo "  Backend API:  http://34.93.19.177/api/"
echo "  Django Admin: http://34.93.19.177/admin/"
echo ""
echo "Default Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change the admin password immediately!"
echo ""
echo "Useful Commands:"
echo "  View logs:        docker compose logs -f"
echo "  Stop containers:  docker compose stop"
echo "  Restart:          docker compose restart"
echo "  Remove all:       docker compose down"
echo ""
echo "For more information, see DEPLOYMENT.md"
