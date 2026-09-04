#!/usr/bin/env bash
set -u
TASK_ROOT="$(cd "$(dirname "$0")" && pwd)"
APP="$TASK_ROOT/environment/app"
LOG="${BOOT_LOG:-/tmp/launch.log}"; : > "$LOG"
BACKEND_PORT="${BACKEND_PORT:-5000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
cleanup(){ [ -n "${FE_PID:-}" ] && kill "$FE_PID" 2>/dev/null || true; [ -n "${BE_PID:-}" ] && kill "$BE_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
( cd "$APP/backend" && PORT="$BACKEND_PORT" node server.js ) >>"$LOG" 2>&1 & BE_PID=$!
( cd "$APP/frontend" && PORT="$FRONTEND_PORT" npm start ) >>"$LOG" 2>&1 & FE_PID=$!
for i in $(seq 1 120); do curl -sf "http://localhost:$BACKEND_PORT/api/health" >/dev/null 2>&1 && break; sleep 1; done
for i in $(seq 1 120); do curl -sf "http://localhost:$FRONTEND_PORT/" >/dev/null 2>&1 && { echo "APP_URL=http://127.0.0.1:$FRONTEND_PORT"; wait; exit 0; }; sleep 1; done
echo "ERROR: app did not start" >&2; tail -50 "$LOG" >&2; exit 1
