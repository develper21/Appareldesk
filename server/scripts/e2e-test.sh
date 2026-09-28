#!/bin/bash
# End-to-end smoke test for the ApparelDesk API.
# Usage: bash server/scripts/e2e-test.sh
set -e
cd "$(dirname "$0")/.."

pkill -9 -f "dist/main" 2>/dev/null || true
sleep 1
node dist/main.js > /tmp/e2e_server.log 2>&1 &
SERVER_PID=$!

# Wait for the API to come up
for i in $(seq 1 20); do
  curl -s -m 2 http://localhost:3001/api/health > /dev/null 2>&1 && break
  sleep 1
done

echo "=== 1. health ==="
curl -s http://localhost:3001/api/health; echo

TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@appareldesk.com","password":"admin123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
echo "=== 2. login OK (${TOKEN:0:22}...) ==="

echo "=== 3. public products ==="
curl -s "http://localhost:3001/api/products/public?limit=2" | python3 -c "import sys,json; d=json.load(sys.stdin); print('   total:', d['total'], '| first:', d['items'][0]['name'])"

echo "=== 4. admin orders ==="
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/orders?limit=3" | python3 -c "import sys,json; d=json.load(sys.stdin); print('   total:', d['total'], '| no:', d['items'][0]['orderNumber'], '| items:', len(d['items'][0]['items']))"

echo "=== 5. dashboard stats ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/dashboard/stats; echo

echo "=== 6. protected route without token (expect 401) ==="
curl -s -o /dev/null -w "   HTTP %{http_code}\n" http://localhost:3001/api/products || true

echo "=== 7. coupon preview ==="
curl -s -X POST http://localhost:3001/api/discount-offers/preview -H "Content-Type: application/json" -d '{"code":"SAVE10","subtotal":2000}'; echo

echo "=== 8. notifications unread count ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/notifications/unread-count; echo

echo "=== 9. purchase orders ==="
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/purchase-orders?limit=2" | python3 -c "import sys,json; d=json.load(sys.stdin); i=d['items'][0]; print('   total:', d['total'], '| po:', i['poNumber'], '| vendor:', i['vendorId'].get('name') if isinstance(i['vendorId'],dict) else i['vendorId'])"

echo "=== 10. payment terms ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/payment-terms | python3 -c "import sys,json; d=json.load(sys.stdin); print('   terms:', len(d), '| first:', d[0]['name'])"

kill $SERVER_PID 2>/dev/null || true
echo "=== ALL E2E CHECKS DONE ==="
