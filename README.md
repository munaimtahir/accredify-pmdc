# AccrediFy - PMDC Postgraduate Accreditation Module

A minimally functional, end-to-end system for managing PMDC (Pakistan Medical & Dental Council) Postgraduate program accreditation.

> **🚀 Quick Deploy**: For rapid Docker deployment on VPS 34.93.19.177, see [QUICKSTART.md](./QUICKSTART.md)

## Tech Stack

### Backend
- Django 5
- Django REST Framework
- SimpleJWT for authentication
- SQLite database (development)
- CORS headers for frontend integration

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Axios for API calls
- React 18

## Project Structure

```
.
├── backend/
│   ├── accounts/          # User authentication
│   ├── assignments/       # Assignment and ItemStatus models
│   ├── core/             # BaseModel and shared utilities
│   ├── dashboard/        # Dashboard summary API
│   ├── evidence/         # Evidence file uploads
│   ├── modules/          # Accreditation modules
│   ├── organizations/    # Institutions and Programs
│   ├── proformas/        # Templates, Sections, Items
│   └── config/           # Django settings and URLs
├── frontend/
│   ├── app/              # Next.js pages
│   ├── lib/              # API client and types
│   └── components/       # React components
└── docs/                 # Documentation
```

## Quick Start

### Backend Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Seed database with PMDC PG data:
```bash
python manage.py seed_pmdc_pg
```

4. Create a superuser:
```bash
python manage.py createsuperuser
# Username: admin
# Password: admin123
```

5. Start development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set environment variable (optional):
```bash
export NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

3. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Features

### Backend Features
- ✅ JWT authentication with access and refresh tokens
- ✅ Complete CRUD APIs for all models
- ✅ Nested serialization (templates with sections/items, assignments with item statuses)
- ✅ File upload support for evidence
- ✅ Dashboard summary endpoint
- ✅ Database seeding command

### Frontend Features
- ✅ User authentication with JWT
- ✅ Dashboard with summary statistics
- ✅ Module listing and details
- ✅ Template listing with sections and items
- ✅ Assignment management with item statuses
- ✅ Authentication guards on protected routes
- ✅ Responsive design

## API Endpoints

### Authentication
- `POST /api/accounts/login/` - Login and get JWT tokens

### Modules
- `GET /api/modules/` - List modules
- `GET /api/modules/{id}/` - Get module details

### Proformas (Templates)
- `GET /api/proformas/` - List templates
- `GET /api/proformas/{id}/` - Get template with sections/items

### Assignments
- `GET /api/assignments/` - List assignments
- `POST /api/assignments/` - Create assignment
- `GET /api/assignments/{id}/` - Get assignment with item statuses
- `PUT /api/assignments/{id}/` - Update assignment
- `DELETE /api/assignments/{id}/` - Delete assignment

### Organizations
- `GET /api/organizations/institutions/` - List institutions
- `GET /api/organizations/programs/` - List programs

### Evidence
- `GET /api/evidence/` - List evidence
- `POST /api/evidence/` - Upload evidence file

### Dashboard
- `GET /api/dashboard/summary/` - Get summary counts

## Default Data

After running `python manage.py seed_pmdc_pg`, the database will contain:
- 1 Module: PMDC-PG-2023
- 1 Template: PMDC Postgraduate Accreditation (2023)
- 12 Sections covering all aspects of PG accreditation
- 36 Sample requirement items (3 per section)

## Usage Flow

1. **Login** at `/login` with your credentials
2. **Dashboard** shows summary statistics and quick links
3. **Modules** page lists available accreditation modules
4. **Proformas** page shows templates with their sections and items
5. **Assignments** page lists assignments linked to programs
6. **Assignment Details** shows item-by-item compliance status

## Testing

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm run build  # Verify production build
npm run lint   # Run linter (when configured)
```

## Docker Deployment

### Quick Deployment on VPS

The application is fully containerized and ready for production deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

#### Quick Start:

```bash
# Clone the repository
git clone https://github.com/munaimtahir/accredify-pmdc.git
cd accredify-pmdc

# Run deployment script
./deploy.sh
```

#### Manual Deployment:

```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env with your production values

# Build and start all services
docker compose up -d --build

# Access the application
# Frontend: http://your-server-ip
# API: http://your-server-ip/api/
# Admin: http://your-server-ip/admin/
```

The deployment includes:
- PostgreSQL database
- Django backend with Gunicorn
- Next.js frontend
- Nginx reverse proxy

## Documentation

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Detailed implementation notes
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Docker deployment guide

## License

See LICENSE file for details.
