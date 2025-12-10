# VPS Setup Guide for 34.93.19.177

This guide is specifically tailored for deploying AccrediFy PMDC on VPS 34.93.19.177.

## Initial VPS Setup

### 1. Connect to VPS
```bash
ssh root@34.93.19.177
# or
ssh your_user@34.93.19.177
```

### 2. Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y curl git
```

### 3. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group (optional)
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 4. Configure Firewall (if using UFW)
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for future)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Application Deployment

### 1. Clone Repository
```bash
cd /opt
sudo git clone https://github.com/munaimtahir/accredify-pmdc.git
cd accredify-pmdc
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Generate Django secret key
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Edit environment file
nano .env
```

Update these critical values in `.env`:
```bash
# Database - use strong password
DB_PASSWORD=your_strong_password_here

# Django - use generated secret key
SECRET_KEY=your_generated_secret_key_here

# Keep these as is for the VPS IP
ALLOWED_HOSTS=34.93.19.177,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://34.93.19.177,http://localhost
NEXT_PUBLIC_API_BASE=http://34.93.19.177/api
```

### 3. Deploy Application
```bash
# Make scripts executable
chmod +x deploy.sh health-check.sh maintenance.sh

# Deploy
./deploy.sh

# Or use make
make deploy
```

### 4. Verify Deployment
```bash
# Check container status
docker compose ps

# Run health check
./health-check.sh

# Check logs
docker compose logs -f
```

### 5. Access Application
Open browser and navigate to:
- **Frontend**: http://34.93.19.177
- **API**: http://34.93.19.177/api/
- **Admin**: http://34.93.19.177/admin/

Login with default credentials:
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT: Change the admin password immediately!**

## Post-Deployment Tasks

### 1. Change Admin Password
```bash
# Access admin interface at http://34.93.19.177/admin/
# Or use command line:
docker compose exec backend python manage.py changepassword admin
```

### 2. Create Additional Users (optional)
```bash
docker compose exec backend python manage.py createsuperuser
```

### 3. Test All Features
- [ ] Login with admin credentials
- [ ] View dashboard
- [ ] Browse modules
- [ ] View proformas
- [ ] Check assignments
- [ ] Upload test evidence file
- [ ] Verify all pages load correctly

### 4. Setup Automated Backups
```bash
# Create backup script
cat > /opt/accredify-pmdc/backup-cron.sh << 'EOF'
#!/bin/bash
cd /opt/accredify-pmdc
make backup
# Optional: copy to remote location
# scp backups/backup_*.sql user@backup-server:/backups/
EOF

chmod +x /opt/accredify-pmdc/backup-cron.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /opt/accredify-pmdc/backup-cron.sh >> /var/log/pmdc-backup.log 2>&1
```

### 5. Setup Log Rotation
```bash
# Create logrotate config
sudo tee /etc/logrotate.d/docker-compose << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
EOF
```

## Maintenance

### Daily Checks
```bash
# Quick health check
./health-check.sh

# View recent logs
docker compose logs --tail=50
```

### Weekly Tasks
```bash
# Run maintenance script
./maintenance.sh

# Check disk usage
df -h
docker system df

# Review logs for errors
docker compose logs | grep -i error
```

### Monthly Tasks
```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Update Docker images
docker compose pull
docker compose up -d --build

# Clean old backups (keep last 30 days)
find /opt/accredify-pmdc/backups -name "*.sql" -mtime +30 -delete
```

## Useful Commands

### Application Management
```bash
# Start
make up

# Stop
make down

# Restart
make restart

# View logs
make logs

# Update
make update

# Backup
make backup
```

### Troubleshooting
```bash
# Check container status
docker compose ps

# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend

# Restart specific service
docker compose restart backend

# Check resource usage
docker stats

# Access backend shell
make shell-backend

# Access database shell
make shell-db
```

## Performance Optimization

### For Single VPS Deployment

1. **Optimize Database**:
```bash
# Run periodic vacuum
docker compose exec -T db psql -U pmdc_user pmdc_db -c "VACUUM ANALYZE;"
```

2. **Monitor Resources**:
```bash
# Install monitoring tools
sudo apt-get install -y htop iotop

# Check system resources
htop
docker stats
```

3. **Adjust Workers** (if needed):
Edit `backend/docker-entrypoint.sh`:
```bash
# For low-resource VPS, reduce workers
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120
```

## Security Hardening

### 1. Change SSH Port (optional)
```bash
sudo nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
sudo systemctl restart sshd
```

### 2. Setup Fail2ban
```bash
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Updates
```bash
# Enable automatic security updates
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. Monitor Logs
```bash
# Check authentication logs
sudo tail -f /var/log/auth.log

# Check system logs
sudo journalctl -f
```

## Upgrading to HTTPS (Recommended)

### If Using Domain Name
```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Stop nginx container
docker compose stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx configuration to use SSL
# Update docker-compose.yml to mount certificates
# Restart
docker compose up -d
```

### For IP Address (Self-Signed)
```bash
# Generate self-signed certificate
sudo mkdir -p /opt/accredify-pmdc/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /opt/accredify-pmdc/ssl/nginx.key \
  -out /opt/accredify-pmdc/ssl/nginx.crt

# Update nginx configuration and docker-compose.yml
# Restart nginx
docker compose restart nginx
```

## Disaster Recovery

### Full Backup
```bash
# Backup database
docker compose exec -T db pg_dump -U pmdc_user pmdc_db > full_backup_$(date +%Y%m%d).sql

# Backup media files
docker compose cp backend:/app/media ./media_backup_$(date +%Y%m%d)

# Backup environment file (sanitize first!)
cp .env .env.backup
```

### Full Restore
```bash
# Restore database
docker compose exec -T db psql -U pmdc_user pmdc_db < full_backup_20231210.sql

# Restore media files
docker compose cp media_backup_20231210 backend:/app/media/
```

## Monitoring and Alerts

### Basic Monitoring
```bash
# Install basic monitoring
sudo apt-get install -y sysstat

# Enable statistics collection
sudo systemctl enable sysstat
sudo systemctl start sysstat

# View statistics
sar -u 1 3  # CPU usage
sar -r 1 3  # Memory usage
```

## Contact and Support

For issues specific to this VPS deployment:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Run `./health-check.sh`
3. Review logs: `docker compose logs`
4. Check system resources: `docker stats`

## Checklist

### Initial Setup
- [ ] VPS accessible via SSH
- [ ] System updated
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Firewall configured
- [ ] Repository cloned
- [ ] Environment configured
- [ ] Application deployed
- [ ] Health check passed
- [ ] Admin password changed

### Security
- [ ] Strong database password set
- [ ] Django secret key changed
- [ ] Firewall enabled
- [ ] SSH secured
- [ ] Regular backups scheduled
- [ ] SSL/HTTPS configured (optional)

### Maintenance
- [ ] Backup script configured
- [ ] Cron jobs setup
- [ ] Monitoring in place
- [ ] Documentation reviewed
- [ ] Team trained on basic operations
