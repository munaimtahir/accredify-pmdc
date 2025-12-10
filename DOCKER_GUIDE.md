# Docker Deployment - Quick Reference Guide

## Prerequisites Check

Before deploying, ensure:
- [ ] Docker version 20.10+ installed
- [ ] Docker Compose version 2.0+ installed
- [ ] Port 80 available (not used by other services)
- [ ] Sufficient disk space (minimum 5GB recommended)
- [ ] VPS has internet access for pulling Docker images

## Installation Steps

### 1. Install Docker (if not already installed)

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 2. Clone Repository

```bash
git clone https://github.com/munaimtahir/accredify-pmdc.git
cd accredify-pmdc
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Generate a Django secret key
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Edit .env file and update:
# - DB_PASSWORD (use a strong password)
# - SECRET_KEY (use the generated key above)
nano .env
```

### 4. Deploy

```bash
# Option 1: Use deployment script (recommended)
./deploy.sh

# Option 2: Manual deployment
docker compose up -d --build
```

### 5. Verify Deployment

```bash
# Check all containers are running
docker compose ps

# Check logs
docker compose logs -f

# Test the application
curl http://34.93.19.177
curl http://34.93.19.177/api/
```

## Default Access

- **Frontend**: http://34.93.19.177
- **API**: http://34.93.19.177/api/
- **Admin**: http://34.93.19.177/admin/

**Default Admin Credentials**:
- Username: `admin`
- Password: `admin123`

⚠️ **Change the admin password immediately after first login!**

## Common Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
docker compose logs -f nginx
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Stop Services
```bash
docker compose stop
```

### Start Services
```bash
docker compose start
```

### Remove All (keeps data)
```bash
docker compose down
```

### Remove All (including data)
```bash
docker compose down -v
```

### Update Application
```bash
git pull origin main
docker compose up -d --build
```

## Troubleshooting

### Issue: Containers won't start
```bash
# Check logs
docker compose logs

# Check status
docker compose ps

# Try restarting
docker compose restart
```

### Issue: Port 80 already in use
```bash
# Find what's using port 80
sudo lsof -i :80

# Stop the service or change nginx port in docker-compose.yml
```

### Issue: Database connection errors
```bash
# Check database is running
docker compose exec db pg_isready -U pmdc_user

# Restart database
docker compose restart db

# Check logs
docker compose logs db
```

### Issue: Out of disk space
```bash
# Check Docker disk usage
docker system df

# Clean up
docker system prune -a

# Remove unused volumes (careful!)
docker volume prune
```

## Backup and Restore

### Backup Database
```bash
docker compose exec db pg_dump -U pmdc_user pmdc_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
docker compose exec -T db psql -U pmdc_user pmdc_db < backup_file.sql
```

### Backup Uploaded Files
```bash
docker compose exec backend tar czf /tmp/media_backup.tar.gz /app/media
docker compose cp backend:/tmp/media_backup.tar.gz ./media_backup.tar.gz
```

## Security Checklist

- [ ] Changed default admin password
- [ ] Updated SECRET_KEY in .env
- [ ] Set strong DB_PASSWORD in .env
- [ ] File permissions on .env (chmod 600 .env)
- [ ] Configured firewall (allow only 80, 443, 22)
- [ ] Regular backups scheduled
- [ ] Monitoring logs regularly

## Performance Tips

1. **Monitor Resource Usage**
   ```bash
   docker stats
   ```

2. **Scale Backend Workers** (if needed)
   ```bash
   # Edit docker-compose.yml, change backend workers
   # Then restart
   docker compose up -d --build
   ```

3. **Database Optimization**
   - Regular backups and cleanup
   - Monitor slow queries
   - Index optimization

4. **Log Rotation**
   - Docker handles this automatically
   - Check log sizes: `docker compose logs --tail=100`

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Nginx (Port 80)               │
│  - Reverse Proxy                        │
│  - Static Files                         │
│  - SSL Termination (if configured)      │
└────────┬──────────────┬─────────────────┘
         │              │
    ┌────▼────┐    ┌────▼────┐
    │ Backend │    │Frontend │
    │ (8000)  │    │ (3000)  │
    │ Django  │    │Next.js  │
    └────┬────┘    └─────────┘
         │
    ┌────▼────┐
    │PostgreSQL│
    │ (5432)  │
    │Database │
    └─────────┘
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| DB_NAME | Database name | pmdc_db | No |
| DB_USER | Database user | pmdc_user | No |
| DB_PASSWORD | Database password | - | Yes |
| SECRET_KEY | Django secret key | - | Yes |
| DEBUG | Debug mode | False | No |
| ALLOWED_HOSTS | Allowed hosts | 34.93.19.177,localhost | No |
| CORS_ALLOWED_ORIGINS | CORS origins | http://34.93.19.177 | No |
| NEXT_PUBLIC_API_BASE | API base URL | http://34.93.19.177/api | No |

## Next Steps

1. Test all functionality through the web interface
2. Upload some test data
3. Set up automated backups
4. Configure HTTPS (see DEPLOYMENT.md)
5. Set up monitoring
6. Configure firewall rules

For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md).
