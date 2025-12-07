# Architecture Overview

## Backend

- Django 5 + DRF + SimpleJWT
- Apps:
  - core: BaseModel
  - accounts: auth
  - modules: module registry
  - proformas: templates, sections, items
  - assignments: (stub)
  - evidence: (stub)
  - organizations: (stub)
  - pg: (stub)
  - dashboard: summary endpoint

## Frontend

- Next.js 14 App Router, TypeScript
- Pages:
  - / (home)
  - /login
  - /dashboard
  - /modules/[id]
  - /proformas/[id]
  - /assignments
