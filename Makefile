.PHONY: help build up down restart logs clean backup restore health

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker compose build

up: ## Start all services
	docker compose up -d

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## Show logs from all services
	docker compose logs -f

logs-backend: ## Show backend logs
	docker compose logs -f backend

logs-frontend: ## Show frontend logs
	docker compose logs -f frontend

logs-db: ## Show database logs
	docker compose logs -f db

logs-nginx: ## Show nginx logs
	docker compose logs -f nginx

clean: ## Remove all containers and volumes (WARNING: deletes data)
	docker compose down -v
	docker system prune -a --volumes -f

ps: ## Show status of all containers
	docker compose ps

health: ## Run health check
	./health-check.sh

backup: ## Backup database
	@echo "Creating database backup..."
	@mkdir -p backups
	@docker compose exec -T db pg_dump -U pmdc_user pmdc_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup completed: backups/backup_$$(date +%Y%m%d_%H%M%S).sql"

restore: ## Restore database from backup (usage: make restore BACKUP=backups/backup_20231210_120000.sql)
	@if [ -z "$(BACKUP)" ]; then \
		echo "Error: Please specify BACKUP file. Usage: make restore BACKUP=backups/backup_20231210_120000.sql"; \
		exit 1; \
	fi
	@echo "Restoring database from $(BACKUP)..."
	@docker compose exec -T db psql -U pmdc_user pmdc_db < $(BACKUP)
	@echo "Database restored successfully"

shell-backend: ## Open shell in backend container
	docker compose exec backend bash

shell-frontend: ## Open shell in frontend container
	docker compose exec frontend sh

shell-db: ## Open PostgreSQL shell
	docker compose exec db psql -U pmdc_user pmdc_db

collectstatic: ## Collect Django static files
	docker compose exec backend python manage.py collectstatic --noinput

migrate: ## Run Django migrations
	docker compose exec backend python manage.py migrate

makemigrations: ## Create Django migrations
	docker compose exec backend python manage.py makemigrations

createsuperuser: ## Create Django superuser
	docker compose exec backend python manage.py createsuperuser

seed: ## Seed database with PMDC data
	docker compose exec backend python manage.py seed_pmdc_pg

deploy: ## Deploy application (build and start)
	./deploy.sh

update: ## Update application (pull, rebuild, restart)
	git pull origin main
	docker compose up -d --build
	@echo "Application updated successfully"

stats: ## Show container resource usage
	docker stats

prune: ## Clean up unused Docker resources
	docker system prune -a

volume-ls: ## List Docker volumes
	docker volume ls

network-ls: ## List Docker networks
	docker network ls
