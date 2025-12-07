# AccrediFy — PMDC Postgraduate Accreditation Module

Hybrid scaffold for a Django + Next.js application
focused on PMDC Postgraduate Accreditation (2023).

## Quick start (development)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_pmdc_pg

cd ../frontend
npm install
npm run dev
```
