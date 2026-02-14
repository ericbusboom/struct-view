.PHONY: dev-frontend dev-backend dev build test lint clean

# Frontend
dev-frontend:
	cd frontend && npm run dev

build-frontend:
	cd frontend && npm run build

test-frontend:
	cd frontend && npm test

lint-frontend:
	cd frontend && npm run lint

# Backend
dev-backend:
	cd backend && uv run uvicorn structview.main:app --reload --port 8000

test-backend:
	cd backend && uv run pytest

# Combined
dev:
	@echo "Run 'make dev-frontend' and 'make dev-backend' in separate terminals"

build: build-frontend

test: test-frontend test-backend

lint: lint-frontend

clean:
	rm -rf frontend/dist
	find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
