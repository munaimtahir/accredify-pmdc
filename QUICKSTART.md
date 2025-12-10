# Quick Start - Docker Deployment on VPS 34.93.19.177

**This is the fastest way to deploy AccrediFy PMDC using Docker.**

## Prerequisites
- VPS with IP 34.93.19.177
- Docker and Docker Compose installed
- SSH access to the VPS

## 5-Minute Setup

### Step 1: Install Docker (if not installed)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo apt-get install docker-compose-plugin -y
```

### Step 2: Clone and Configure
```bash
git clone https://github.com/munaimtahir/accredify-pmdc.git
cd accredify-pmdc
cp .env.example .env
nano .env  # Update DB_PASSWORD and SECRET_KEY
chmod 600 .env
chmod +x *.sh backend/*.sh
```

### Step 3: Deploy
```bash
./deploy.sh
```

Wait 5-10 minutes for containers to build and start.

### Step 4: Access
- **Frontend**: http://34.93.19.177
- **Login**: admin / admin123
- **Change password immediately!**

## That's It!

Your application is now running with:
- ✅ PostgreSQL database
- ✅ Django backend API
- ✅ Next.js frontend
- ✅ Nginx reverse proxy

## Next Steps

1. **Change Admin Password**: http://34.93.19.177/admin/password_change/
2. **Setup Backups**: `make backup`
3. **Monitor Health**: `./health-check.sh`

## Common Commands

```bash
make logs          # View logs
make restart       # Restart services
make health        # Check health
make backup        # Backup database
make update        # Update application
```

## Need Help?

- Run health check: `./health-check.sh`
- Check logs: `docker compose logs -f`
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- See [VPS_SETUP.md](./VPS_SETUP.md) for detailed setup
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for full documentation

## Environment Variables

Generate Django secret key:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Minimal `.env` configuration:
```bash
DB_PASSWORD=your_strong_password
SECRET_KEY=your_generated_secret_key
```

Everything else has sensible defaults for this VPS.

## Architecture

```
Internet → Nginx (Port 80) → Frontend (Next.js) + Backend (Django) → PostgreSQL
```

All running in Docker containers, managed by Docker Compose.
