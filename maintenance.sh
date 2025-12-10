#!/bin/bash

# Maintenance Script for AccrediFy PMDC
# Performs routine maintenance tasks

set -e

echo "================================================"
echo "AccrediFy PMDC - Maintenance Script"
echo "================================================"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo "[$1]"
    echo "----------------------------------------"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running"
    exit 1
fi

print_section "1. Container Status"
docker compose ps

print_section "2. Resource Usage"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

print_section "3. Disk Usage"
echo "Docker Disk Usage:"
docker system df

echo ""
echo "Volume Sizes:"
docker volume ls --format "{{.Name}}" | grep accredify | while read volume; do
    size=$(docker system df -v | grep "$volume" | awk '{print $3}')
    echo "  $volume: $size"
done

print_section "4. Log Sizes"
echo "Container Log Sizes:"
docker compose ps -q | while read container; do
    name=$(docker inspect --format='{{.Name}}' $container | sed 's/\///')
    log_file=$(docker inspect --format='{{.LogPath}}' $container)
    if [ -f "$log_file" ]; then
        size=$(du -h "$log_file" 2>/dev/null | cut -f1)
        echo "  $name: $size"
    fi
done

print_section "5. Database Status"
if docker compose exec -T db pg_isready -U pmdc_user > /dev/null 2>&1; then
    echo "✓ Database is healthy"
    
    echo ""
    echo "Database Size:"
    docker compose exec -T db psql -U pmdc_user pmdc_db -c "SELECT pg_size_pretty(pg_database_size('pmdc_db')) as size;"
    
    echo ""
    echo "Table Sizes:"
    docker compose exec -T db psql -U pmdc_user pmdc_db -c "
        SELECT 
            schemaname || '.' || tablename AS table,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
        LIMIT 10;
    "
else
    echo "✗ Database is not responding"
fi

print_section "6. Backup Recommendations"
LAST_BACKUP=$(ls -t backups/*.sql 2>/dev/null | head -1)
if [ -n "$LAST_BACKUP" ]; then
    BACKUP_DATE=$(stat -c %y "$LAST_BACKUP" | cut -d' ' -f1)
    echo "Last backup: $LAST_BACKUP ($BACKUP_DATE)"
    
    DAYS_OLD=$(( ($(date +%s) - $(stat -c %Y "$LAST_BACKUP")) / 86400 ))
    if [ $DAYS_OLD -gt 7 ]; then
        echo "⚠️  WARNING: Last backup is $DAYS_OLD days old. Consider creating a new backup."
        echo "   Run: make backup"
    else
        echo "✓ Recent backup exists ($DAYS_OLD days old)"
    fi
else
    echo "⚠️  No backups found. Create a backup with: make backup"
fi

print_section "7. Maintenance Tasks"
echo "Select a maintenance task:"
echo "  1) Create database backup"
echo "  2) Clean Docker resources"
echo "  3) Restart all services"
echo "  4) Update application"
echo "  5) Optimize database"
echo "  6) View recent errors"
echo "  0) Exit"
echo ""
read -p "Enter choice [0-6]: " choice

case $choice in
    1)
        echo ""
        echo "Creating database backup..."
        mkdir -p backups
        docker compose exec -T db pg_dump -U pmdc_user pmdc_db > "backups/backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "✓ Backup completed"
        ;;
    2)
        echo ""
        read -p "This will remove unused Docker resources. Continue? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            echo "Cleaning up..."
            docker system prune -a -f
            echo "✓ Cleanup completed"
        fi
        ;;
    3)
        echo ""
        echo "Restarting all services..."
        docker compose restart
        sleep 5
        docker compose ps
        echo "✓ Services restarted"
        ;;
    4)
        echo ""
        read -p "This will pull latest code and rebuild. Continue? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            echo "Updating application..."
            git pull origin main
            docker compose up -d --build
            echo "✓ Update completed"
        fi
        ;;
    5)
        echo ""
        echo "Optimizing database..."
        docker compose exec -T db psql -U pmdc_user pmdc_db -c "VACUUM ANALYZE;"
        echo "✓ Database optimized"
        ;;
    6)
        echo ""
        echo "Recent errors in logs:"
        docker compose logs --tail=100 | grep -i "error\|exception\|failed" | tail -20
        ;;
    0)
        echo "Exiting..."
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

echo ""
echo "================================================"
echo "Maintenance Complete"
echo "================================================"
