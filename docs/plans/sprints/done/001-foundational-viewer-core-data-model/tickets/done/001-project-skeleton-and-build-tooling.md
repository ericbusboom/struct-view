---
id: '001'
title: Project skeleton and build tooling
status: done
use-cases:
- SUC-001
- SUC-002
- SUC-003
depends-on: []
---

# Project skeleton and build tooling

## Description

Set up the monorepo project structure with a React frontend (Vite + TypeScript), a Python backend (FastAPI), and shared TypeScript type definitions. Configure build tooling, dev servers, and package management so all subsequent tickets have a working foundation.

## Implementation Notes

- Frontend: `npx create-vite frontend --template react-ts`, add Three.js and @react-three/fiber as dependencies
- Backend: Python project with `pyproject.toml`, FastAPI, uvicorn
- Shared types: TypeScript interfaces in a `shared/` or `packages/model/` directory
- Dev workflow: `npm run dev` starts frontend dev server; `uvicorn` or equivalent starts backend
- Root-level scripts or Makefile for common commands (dev, build, test, lint)
- .gitignore for node_modules, __pycache__, dist, .venv, etc.

## Acceptance Criteria

- [ ] Frontend dev server starts and renders a "Hello StructView" page
- [ ] Backend server starts and responds to a health check endpoint (`GET /health`)
- [ ] TypeScript compiles without errors
- [ ] Python linting/type checking passes
- [ ] Project structure is documented in README or AGENTS.md

## Testing

- **Existing tests to run**: None (greenfield)
- **New tests to write**: Frontend builds without errors; backend health endpoint returns 200
- **Verification command**: `npm run build && cd backend && python -m pytest`
