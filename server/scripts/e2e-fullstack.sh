#!/bin/bash
# Full-stack smoke test: Vite frontend + NestJS API working together.
# Run from project root: bash server/scripts/e2e-fullstack.sh
cd "$(dirname "$0")/../.." || exit 1
ROOT=$(pwd)

# API
pkill -9 -f "dist/main" 2>/dev/null
sleep 1
node "$ROOT/server/dist/main.js" > /tmp/fullstack_api.log 2>&1 &
API_PID=$!

# Frontend dev server
(npm run dev > /tmp/fullstack_vite.log 2>&1 &
VITE_PID=$!)

# Wait for both
for i in $(seq 1 25); do curl -s -m 2 http://localhost:3001/api/health > /dev/null 2>&1 && break; sleep 1; done
for i in $(seq 1 25); do curl -s -m 2 http://localhost:8080 > /dev/null 2>&1 && break; sleep 1; done

echo "=== API health ==="; curl -s http://localhost:3001/api/health; echo
echo "=== Vite serving ==="; curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8080/
echo "=== Vite proxy → API (same-origin /api call, exactly what the browser would do) ==="
curl -s "http://localhost:8080/api/products/public?limit=2" | head -c 120; echo
echo "=== Login through the proxy ==="
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@appareldesk.com","password":"admin123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
echo "   token: ${TOKEN:0:20}..."
echo "=== Authed call through proxy: dashboard stats ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/dashboard/stats; echo

kill $API_PID $VITE_PID 2>/dev/null
echo "=== FULLSTACK TEST DONE ==="
