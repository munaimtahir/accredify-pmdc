# Docker Deployment Guide for VPS (34.93.19.177)

This guide provides instructions for deploying the AccrediFy PMDC Postgraduate Accreditation Module on a VPS using Docker.

## Prerequisites

The VPS (34.93.19.177) should have the following installed:
- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git

## Architecture

The deployment consists of 4 Docker containers:
1. **PostgreSQL Database** - Persistent data storage
2. **Django Backend** - REST API server with Gunicorn
3. **Next.js Frontend** - React application
4. **Nginx** - Reverse proxy and static file server

## Quick Start

### 1. Install Docker and Docker Compose on VPS

```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin -y

# Add current user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### 2. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/munaimtahir/accredify-pmdc.git
cd accredify-pmdc
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your production values
nano .env
```

**Important**: Update the following in `.env`:
- `DB_PASSWORD` - Set a strong database password
- `SECRET_KEY` - Generate a secure Django secret key
- `ALLOWED_HOSTS` - Add your domain if using one
- `CORS_ALLOWED_ORIGINS` - Add your domain if using one

To generate a secure Django secret key:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. Build and Start the Application

```bash
# Build and start all containers
docker compose up -d --build

# Check if all containers are running
docker compose ps

# View logs
docker compose logs -f
```

### 5. Verify Deployment

Once all containers are running, access the application:
- **Frontend**: http://34.93.19.177
- **Backend API**: http://34.93.19.177/api/
- **Django Admin**: http://34.93.19.177/admin/

Default admin credentials:
- Username: `admin`
- Password: `admin123`

**Important**: Change the admin password immediately after first login!

## Container Management

### View Container Status
```bash
docker compose ps
```

### View Logs
```bash
# All containers
docker compose logs -f

# Specific container
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f db
```

### Restart Containers
```bash
# Restart all
docker compose restart

# Restart specific container
docker compose restart backend
```

### Stop and Remove Containers
```bash
# Stop containers
docker compose stop

# Stop and remove containers (data persists in volumes)
docker compose down

# Remove containers and volumes (WARNING: deletes all data)
docker compose down -v
```

## Database Management

### Backup Database
```bash
# Create backup
docker compose exec db pg_dump -U pmdc_user pmdc_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
# Restore from backup
docker compose exec -T db psql -U pmdc_user pmdc_db < backup_file.sql
```

### Access Database Console
```bash
docker compose exec db psql -U pmdc_user pmdc_db
```

## Application Updates

### Update Application Code
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker compose up -d --build

# View logs to ensure successful restart
docker compose logs -f
```

### Run Django Migrations
```bash
docker compose exec backend python manage.py migrate
```

### Collect Static Files
```bash
docker compose exec backend python manage.py collectstatic --noinput
```

### Create Additional Superuser
```bash
docker compose exec backend python manage.py createsuperuser
```

## Monitoring

### Check Container Resource Usage
```bash
docker stats
```

### Check Disk Usage
```bash
# Check Docker disk usage
docker system df

# Check volume sizes
docker volume ls
docker volume inspect accredify-pmdc_postgres_data
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs for errors
docker compose logs <container_name>

# Check container status
docker compose ps

# Restart specific container
docker compose restart <container_name>
```

### Database Connection Issues
```bash
# Check if database is ready
docker compose exec db pg_isready -U pmdc_user

# Check database logs
docker compose logs db

# Verify environment variables
docker compose exec backend env | grep DB_
```

### Nginx Issues
```bash
# Test nginx configuration
docker compose exec nginx nginx -t

# Reload nginx
docker compose exec nginx nginx -s reload
```

### Reset Everything (WARNING: Deletes all data)
```bash
# Stop and remove all containers and volumes
docker compose down -v

# Remove images
docker compose down --rmi all

# Start fresh
docker compose up -d --build
```

## Security Considerations

1. **Change Default Credentials**: Update the admin password immediately after deployment
2. **Secure Environment Variables**: Ensure `.env` file has restricted permissions (600)
3. **Database Password**: Use a strong, unique password for the database
4. **Secret Key**: Generate and use a strong Django secret key
5. **HTTPS**: Consider setting up SSL/TLS certificates (Let's Encrypt) for production
6. **Firewall**: Configure firewall to only allow necessary ports (80, 443, 22)
7. **Regular Updates**: Keep Docker images and dependencies updated
8. **Backups**: Set up automated database backups

## Setting up HTTPS (Optional but Recommended)

### Using Let's Encrypt with Certbot

1. Install Certbot:
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. Obtain SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

3. Update nginx configuration to use HTTPS

4. Update `.env` file:
```bash
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

5. Rebuild containers:
```bash
docker compose up -d --build
```

## Performance Optimization

### PostgreSQL Tuning
Edit `docker-compose.yml` to add PostgreSQL configuration:
```yaml
db:
  command: postgres -c shared_buffers=256MB -c max_connections=200
```

### Nginx Caching
The nginx configuration already includes gzip compression and static file caching.

### Backend Scaling
Scale backend workers in `docker-compose.yml`:
```yaml
backend:
  deploy:
    replicas: 3
```

## Maintenance

### Log Rotation
Docker handles log rotation automatically, but you can configure it in `docker-compose.yml`:
```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Cleanup Old Docker Resources
```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove unused volumes (careful!)
docker volume prune
```

## Support

For issues or questions:
- Check logs: `docker compose logs -f`
- Review this documentation
- Check Docker and Docker Compose documentation
- Consult the main README.md for application details

## File Permissions

Ensure proper permissions:
```bash
chmod 600 .env
chmod +x backend/docker-entrypoint.sh
```

## Network Configuration

The application uses Docker's bridge network. All containers communicate internally, and only Nginx exposes port 80 to the host.

## Volume Management

Persistent data is stored in Docker volumes:
- `postgres_data` - Database data
- `static_volume` - Django static files
- `media_volume` - User uploaded files

These volumes persist even when containers are removed.
