# Deployment Checklist for VPS 34.93.19.177

Use this checklist to ensure a successful deployment of AccrediFy PMDC.

## Pre-Deployment

### VPS Requirements
- [ ] VPS accessible at 34.93.19.177
- [ ] SSH access configured
- [ ] Minimum 2GB RAM available
- [ ] Minimum 10GB disk space available
- [ ] Port 80 available (not used by other services)
- [ ] Internet connectivity working
- [ ] Root or sudo access available

### Software Requirements
- [ ] Docker 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] Git installed
- [ ] Python 3 installed (for secret key generation)

## Deployment Steps

### 1. System Preparation
- [ ] Connect to VPS: `ssh user@34.93.19.177`
- [ ] Update system: `sudo apt-get update && sudo apt-get upgrade -y`
- [ ] Install Docker: `curl -fsSL https://get.docker.com | sh`
- [ ] Install Docker Compose: `sudo apt-get install docker-compose-plugin -y`
- [ ] Verify Docker: `docker --version`
- [ ] Verify Docker Compose: `docker compose version`

### 2. Repository Setup
- [ ] Clone repository: `git clone https://github.com/munaimtahir/accredify-pmdc.git`
- [ ] Navigate to directory: `cd accredify-pmdc`
- [ ] Check all files present: `ls -la`
- [ ] Verify Docker files exist: `ls -la backend/Dockerfile frontend/Dockerfile docker-compose.yml`

### 3. Configuration
- [ ] Copy environment file: `cp .env.example .env`
- [ ] Generate Django secret key: `python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- [ ] Edit .env file: `nano .env`
- [ ] Set DB_PASSWORD to strong password
- [ ] Set SECRET_KEY to generated key
- [ ] Verify ALLOWED_HOSTS includes 34.93.19.177
- [ ] Verify CORS_ALLOWED_ORIGINS includes http://34.93.19.177
- [ ] Verify NEXT_PUBLIC_API_BASE is http://34.93.19.177/api
- [ ] Save and close .env file
- [ ] Set file permissions: `chmod 600 .env`
- [ ] Make scripts executable: `chmod +x *.sh backend/*.sh`

### 4. Deployment
- [ ] Run deployment script: `./deploy.sh`
- [ ] Wait for containers to build (this may take 5-10 minutes)
- [ ] Check container status: `docker compose ps`
- [ ] Verify all 4 containers are running (db, backend, frontend, nginx)
- [ ] Run health check: `./health-check.sh`

### 5. Verification
- [ ] Access frontend: http://34.93.19.177
- [ ] Frontend loads successfully
- [ ] Access API: http://34.93.19.177/api/
- [ ] API responds with JSON
- [ ] Access admin: http://34.93.19.177/admin/
- [ ] Admin interface loads with styling
- [ ] Login with admin/admin123
- [ ] Login successful and redirects to dashboard
- [ ] Dashboard displays summary statistics
- [ ] Navigate to Modules page
- [ ] Navigate to Proformas page
- [ ] Navigate to Assignments page
- [ ] All pages load without errors

### 6. Security Configuration
- [ ] Change admin password: http://34.93.19.177/admin/password_change/
- [ ] Or use CLI: `docker compose exec backend python manage.py changepassword admin`
- [ ] Verify new password works
- [ ] Review .env file for any default values
- [ ] Ensure .env has correct permissions (600)
- [ ] Configure firewall if available: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable`

### 7. Backup Configuration
- [ ] Test manual backup: `make backup` or `./maintenance.sh`
- [ ] Verify backup created in backups/ directory
- [ ] Setup automated backups (see VPS_SETUP.md)
- [ ] Test backup restoration process
- [ ] Document backup location and schedule

### 8. Post-Deployment
- [ ] Review all logs: `docker compose logs`
- [ ] Check for any errors or warnings
- [ ] Monitor resource usage: `docker stats`
- [ ] Test file upload functionality
- [ ] Create additional admin users if needed
- [ ] Document custom configuration changes
- [ ] Share access URLs with team
- [ ] Provide credentials to authorized users

## Troubleshooting

If any step fails, refer to:
- [ ] Check TROUBLESHOOTING.md
- [ ] Run health-check.sh
- [ ] Review docker compose logs
- [ ] Check VPS_SETUP.md for detailed steps
- [ ] Verify Docker service is running: `docker info`

## Common Issues Quick Fixes

### Containers won't start
```bash
docker compose down
docker compose up -d --build
docker compose ps
docker compose logs
```

### Port 80 in use
```bash
sudo lsof -i :80
# Stop the conflicting service
sudo systemctl stop apache2  # or nginx
docker compose up -d
```

### Database connection errors
```bash
docker compose restart db
sleep 10
docker compose restart backend
docker compose logs backend
```

### Permission errors
```bash
chmod +x deploy.sh health-check.sh maintenance.sh backend/docker-entrypoint.sh
chmod 600 .env
docker compose down
docker compose up -d --build
```

## Validation Commands

Run these to validate the deployment:

```bash
# Check all containers running
docker compose ps | grep -v Exit

# Test database
docker compose exec db pg_isready -U pmdc_user

# Test backend API
curl -s http://localhost/api/ | head -10

# Test frontend
curl -s http://localhost/ | head -10

# Check logs for errors
docker compose logs | grep -i error | tail -20

# Check resource usage
docker stats --no-stream

# Check disk space
df -h
docker system df
```

## Sign-Off

### Deployed By
- Name: ________________
- Date: ________________
- Time: ________________

### Verified By
- Name: ________________
- Date: ________________
- Time: ________________

### Notes
```
____________________________________________________
____________________________________________________
____________________________________________________
____________________________________________________
```

## Post-Deployment Monitoring

### Daily
- [ ] Check application is accessible
- [ ] Review logs for errors
- [ ] Monitor resource usage

### Weekly
- [ ] Verify backups are running
- [ ] Check disk space
- [ ] Review security logs
- [ ] Test restore procedure

### Monthly
- [ ] Update system packages
- [ ] Update Docker images
- [ ] Clean old backups
- [ ] Review and optimize

## Emergency Contacts

Document your emergency contacts and escalation procedures:

```
Primary Contact: ____________________
Phone: _____________________________
Email: _____________________________

Secondary Contact: __________________
Phone: _____________________________
Email: _____________________________

VPS Provider Support: _______________
Phone: _____________________________
Email: _____________________________
```

## Success Criteria

All of the following should be true:
- [x] All 4 Docker containers running (db, backend, frontend, nginx)
- [x] Frontend accessible at http://34.93.19.177
- [x] Backend API accessible at http://34.93.19.177/api/
- [x] Django admin accessible at http://34.93.19.177/admin/
- [x] Can login with new admin password
- [x] Dashboard displays data correctly
- [x] All pages load without errors
- [x] Database is healthy and accepting connections
- [x] Backups configured and tested
- [x] Health check script passes
- [x] Documentation reviewed and available

## Reference Documentation

- [VPS_SETUP.md](./VPS_SETUP.md) - Complete VPS setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment documentation
- [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) - Docker quick reference
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Problem resolution guide
- [README.md](./README.md) - Application overview

## Useful Commands Reference

```bash
# Deployment
./deploy.sh                    # Deploy application
make deploy                    # Deploy with make

# Management
make up                        # Start services
make down                      # Stop services
make restart                   # Restart services
make logs                      # View logs
make health                    # Run health check
make backup                    # Create backup

# Troubleshooting
./health-check.sh              # Check system health
./maintenance.sh               # Run maintenance tasks
docker compose ps              # Check status
docker compose logs -f         # Follow logs
docker stats                   # Resource usage

# Database
make shell-db                  # Database shell
make backup                    # Backup database
make migrate                   # Run migrations

# Updates
make update                    # Update application
git pull && docker compose up -d --build
```
