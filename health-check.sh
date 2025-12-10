#!/bin/bash

# Health Check Script for AccrediFy PMDC Deployment
# This script verifies that all services are running correctly

set -e

echo "================================================"
echo "AccrediFy PMDC - Health Check"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Check if Docker is running
echo "Checking Docker..."
if docker info > /dev/null 2>&1; then
    print_status 0 "Docker is running"
else
    print_status 1 "Docker is not running"
    exit 1
fi
echo ""

# Check if containers are running
echo "Checking Containers..."
CONTAINERS=(db backend frontend nginx)
ALL_RUNNING=true

for container in "${CONTAINERS[@]}"; do
    if docker compose ps | grep -q "${container}.*running"; then
        print_status 0 "Container '${container}' is running"
    else
        print_status 1 "Container '${container}' is not running"
        ALL_RUNNING=false
    fi
done
echo ""

if [ "$ALL_RUNNING" = false ]; then
    echo -e "${RED}Some containers are not running. Check logs with: docker compose logs${NC}"
    exit 1
fi

# Check database connectivity
echo "Checking Database..."
if docker compose exec -T db pg_isready -U pmdc_user > /dev/null 2>&1; then
    print_status 0 "Database is accepting connections"
else
    print_status 1 "Database is not accepting connections"
    exit 1
fi
echo ""

# Check backend API
echo "Checking Backend API..."
sleep 2  # Give backend time to respond
if curl -s -f http://localhost/api/ > /dev/null 2>&1; then
    print_status 0 "Backend API is responding"
else
    print_status 1 "Backend API is not responding"
    echo -e "${YELLOW}Note: This might be normal if backend is still starting up${NC}"
fi
echo ""

# Check frontend
echo "Checking Frontend..."
if curl -s -f http://localhost/ > /dev/null 2>&1; then
    print_status 0 "Frontend is responding"
else
    print_status 1 "Frontend is not responding"
    echo -e "${YELLOW}Note: This might be normal if frontend is still starting up${NC}"
fi
echo ""

# Check disk usage
echo "Checking Disk Usage..."
DISK_USAGE=$(docker system df | grep -v TYPE | awk '{sum+=$3} END {print sum}')
echo "Docker is using approximately ${DISK_USAGE} of disk space"
echo ""

# Check container resource usage
echo "Container Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep -E "NAME|accredify"
echo ""

# Check volumes
echo "Checking Volumes..."
VOLUMES=(postgres_data static_volume media_volume)
for volume in "${VOLUMES[@]}"; do
    if docker volume inspect accredify-pmdc_${volume} > /dev/null 2>&1; then
        print_status 0 "Volume '${volume}' exists"
    else
        print_status 1 "Volume '${volume}' does not exist"
    fi
done
echo ""

# Summary
echo "================================================"
echo "Health Check Summary"
echo "================================================"
echo ""
echo "Application URLs:"
echo "  Frontend:     http://34.93.19.177"
echo "  Backend API:  http://34.93.19.177/api/"
echo "  Django Admin: http://34.93.19.177/admin/"
echo ""
echo "To view logs: docker compose logs -f"
echo "To restart:   docker compose restart"
echo ""
