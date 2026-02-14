---
id: '011'
title: Build and run script with process cleanup
status: done
use-cases: []
depends-on: []
---

# Build and run script with process cleanup

## Description

Create a `run.sh` script at the project root that builds the frontend, then starts both the Vite dev server (frontend) and the FastAPI server (backend) concurrently. On exit (Ctrl-C, SIGTERM, or script termination), all child processes must be cleaned up reliably.

## Acceptance Criteria

- [ ] `./run.sh` builds the frontend and starts both servers
- [ ] Frontend dev server is accessible (default Vite port)
- [ ] Backend FastAPI server is accessible (default uvicorn port)
- [ ] Ctrl-C kills both servers and any child processes
- [ ] SIGTERM kills both servers and any child processes
- [ ] Script exits cleanly with no orphaned processes

## Testing

- **Verification**: Run `./run.sh`, confirm both servers respond, Ctrl-C, confirm no orphaned node/python processes remain.
