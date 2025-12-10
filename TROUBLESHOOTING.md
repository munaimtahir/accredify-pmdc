# Troubleshooting Guide

This guide helps resolve common issues with the Docker deployment.

## Quick Diagnostics

Run the health check script first:
```bash
./health-check.sh
```

## Common Issues and Solutions

### 1. Containers Won't Start

**Symptoms**: Containers exit immediately or don't start

**Diagnosis**:
```bash
docker compose ps
docker compose logs
```

**Solutions**:

a) **Port Already in Use**:
```bash
# Check what's using port 80
sudo lsof -i :80
sudo netstat -tulpn | grep :80

# Stop the conflicting service
sudo systemctl stop apache2  # or nginx, or whatever is using port 80

# Or change the port in docker-compose.yml
```

b) **Permission Issues**:
```bash
# Ensure script is executable
chmod +x backend/docker-entrypoint.sh

# Rebuild
docker compose down
docker compose up -d --build
```

c) **Out of Disk Space**:
```bash
# Check disk usage
df -h
docker system df

# Clean up
docker system prune -a
```

### 2. Database Connection Errors

**Symptoms**: Backend logs show "could not connect to server"

**Diagnosis**:
```bash
docker compose logs db
docker compose exec db pg_isready -U pmdc_user
```

**Solutions**:

a) **Database Not Ready**:
```bash
# Wait for database to fully start
sleep 10
docker compose restart backend
```

b) **Wrong Credentials**:
```bash
# Check environment variables
docker compose exec backend env | grep DB_

# Update .env file
nano .env

# Restart
docker compose down
docker compose up -d
```

c) **Database Corrupted**:
```bash
# Backup if possible
docker compose exec db pg_dump -U pmdc_user pmdc_db > backup.sql

# Remove and recreate
docker compose down -v
docker compose up -d
```

### 3. Frontend Can't Connect to Backend

**Symptoms**: Login fails, API errors in browser console

**Diagnosis**:
```bash
# Check browser console (F12)
# Check frontend logs
docker compose logs frontend

# Test API directly
curl http://34.93.19.177/api/
```

**Solutions**:

a) **Wrong API URL**:
```bash
# Check environment variable
docker compose exec frontend env | grep NEXT_PUBLIC_API_BASE

# Update .env file
NEXT_PUBLIC_API_BASE=http://34.93.19.177/api

# Rebuild frontend
docker compose up -d --build frontend
```

b) **CORS Issues**:
```bash
# Check backend settings
docker compose exec backend python manage.py shell
# In shell:
from django.conf import settings
print(settings.CORS_ALLOWED_ORIGINS)

# Update .env file
CORS_ALLOWED_ORIGINS=http://34.93.19.177,http://localhost

# Restart backend
docker compose restart backend
```

### 4. Static Files Not Loading

**Symptoms**: Admin panel has no styling, 404 errors for static files

**Diagnosis**:
```bash
docker compose logs nginx
docker compose exec backend ls -la /app/staticfiles/
```

**Solutions**:

a) **Static Files Not Collected**:
```bash
docker compose exec backend python manage.py collectstatic --noinput
docker compose restart nginx
```

b) **Volume Mount Issues**:
```bash
# Check volumes
docker volume ls
docker volume inspect accredify-pmdc_static_volume

# Recreate volumes
docker compose down
docker compose up -d --build
```

### 5. Permission Denied Errors

**Symptoms**: Can't write files, permission errors in logs

**Solutions**:

a) **Container User Issues**:
```bash
# Check file ownership
docker compose exec backend ls -la /app/media/

# Fix ownership (if needed)
docker compose exec backend chown -R root:root /app/media/
docker compose exec backend chown -R root:root /app/staticfiles/
```

b) **Volume Permissions**:
```bash
# Remove and recreate volumes
docker compose down -v
docker compose up -d --build
```

### 6. Out of Memory

**Symptoms**: Containers crash, slow performance

**Diagnosis**:
```bash
docker stats
free -m
```

**Solutions**:

a) **Limit Container Memory**:
```yaml
# In docker-compose.yml, add to each service:
services:
  backend:
    mem_limit: 512m
```

b) **Reduce Workers**:
```bash
# Edit backend/docker-entrypoint.sh
# Change: --workers 3
# To: --workers 2
docker compose up -d --build
```

### 7. SSL/HTTPS Issues

**Symptoms**: HTTPS not working, certificate errors

**Solutions**:

a) **Install SSL Certificate**:
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Update nginx configuration
# Update .env with https URLs
```

b) **Self-Signed Certificate** (for testing):
```bash
# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt

# Update nginx.conf
# Add SSL configuration
```

### 8. Slow Performance

**Symptoms**: Slow page loads, timeouts

**Diagnosis**:
```bash
docker stats
docker compose logs backend | grep -i "slow\|timeout"
```

**Solutions**:

a) **Increase Timeouts**:
```bash
# Edit nginx/nginx.conf
# Increase proxy timeouts to 120s or more

# Restart nginx
docker compose restart nginx
```

b) **Database Optimization**:
```bash
# Check database performance
docker compose exec db psql -U pmdc_user pmdc_db
# Run: VACUUM ANALYZE;

# Add indexes if needed
docker compose exec backend python manage.py dbshell
```

c) **Scale Backend**:
```yaml
# In docker-compose.yml
backend:
  deploy:
    replicas: 3
```

### 9. Migrations Fail

**Symptoms**: "relation does not exist" errors

**Solutions**:

a) **Reset Migrations**:
```bash
# Connect to database
docker compose exec db psql -U pmdc_user pmdc_db

# Drop all tables (careful!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Exit and run migrations
docker compose exec backend python manage.py migrate
```

b) **Force Migrations**:
```bash
docker compose exec backend python manage.py migrate --run-syncdb
```

### 10. Container Logs Full

**Symptoms**: Disk space issues, slow Docker

**Solutions**:

a) **Clear Logs**:
```bash
# Clear logs for specific container
docker compose logs backend --tail=0 > /dev/null

# Or truncate Docker logs
sudo sh -c "truncate -s 0 /var/lib/docker/containers/*/*-json.log"
```

b) **Configure Log Rotation**:
```yaml
# In docker-compose.yml, add to each service:
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Emergency Procedures

### Complete Reset (Nuclear Option)

⚠️ **WARNING**: This will delete ALL data including database, uploaded files, etc.

```bash
# Stop everything
docker compose down -v

# Remove all Docker resources
docker system prune -a --volumes

# Restart from scratch
docker compose up -d --build
```

### Backup Before Reset

```bash
# Backup database
docker compose exec db pg_dump -U pmdc_user pmdc_db > emergency_backup.sql

# Backup media files
docker compose cp backend:/app/media ./media_backup

# Now you can safely reset
docker compose down -v
docker compose up -d --build

# Restore data
docker compose exec -T db psql -U pmdc_user pmdc_db < emergency_backup.sql
docker compose cp media_backup/. backend:/app/media/
```

## Getting Help

### Collect Diagnostic Information

When asking for help, provide:

```bash
# System info
uname -a
docker --version
docker compose version

# Container status
docker compose ps

# Recent logs
docker compose logs --tail=100

# Resource usage
docker stats --no-stream

# Disk usage
df -h
docker system df

# Environment (sanitize passwords!)
cat .env
```

### Useful Commands for Debugging

```bash
# Enter container shell
docker compose exec backend bash
docker compose exec frontend sh
docker compose exec db bash

# Run Django shell
docker compose exec backend python manage.py shell

# Check network connectivity
docker compose exec backend ping db
docker compose exec backend curl http://frontend:3000

# View environment variables
docker compose exec backend env

# Check running processes
docker compose exec backend ps aux

# Test database connection
docker compose exec backend python manage.py dbshell
```

## Prevention Tips

1. **Regular Backups**: Schedule daily database backups
2. **Monitor Logs**: Check logs regularly for warnings
3. **Update Regularly**: Keep Docker and images updated
4. **Resource Monitoring**: Set up monitoring tools
5. **Test Updates**: Test updates in development first
6. **Documentation**: Keep notes of customizations
7. **Firewall**: Configure proper firewall rules
8. **SSL/HTTPS**: Use HTTPS in production

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
