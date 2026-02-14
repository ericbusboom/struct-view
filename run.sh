#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS=()

cleanup() {
  echo ""
  echo "Shutting down..."
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -TERM "$pid" 2>/dev/null || true
    fi
  done
  sleep 1
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
  echo "All processes stopped."
}

trap cleanup EXIT INT TERM

# --- Build frontend ---
echo "Building frontend..."
(cd "$ROOT_DIR/frontend" && npm run build)
echo "Frontend build complete."

# --- Start Vite dev server ---
echo "Starting frontend dev server..."
(cd "$ROOT_DIR/frontend" && npm run dev) &
PIDS+=($!)

# --- Start FastAPI backend ---
echo "Starting backend server..."
(cd "$ROOT_DIR/backend" && uv run uvicorn structview.main:app --reload --port 8000) &
PIDS+=($!)

echo ""
echo "Both servers running. Press Ctrl-C to stop."
echo ""

# Wait for all background processes (compatible with bash 3.x)
wait
