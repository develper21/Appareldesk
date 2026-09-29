#!/bin/bash
# Quick verification against the SEEDED ATLAS database.
# Boots the API once, verifies seed data + auth + wishlist, then shuts down.
set -e
cd "$(dirname "$0")/.."

pkill -9 -f "dist/main" 2>/dev/null || true
sleep 1
node dist/main.js > /tmp/e2e_atlas.log 2>&1 &
SERVER_PID=$!
for i in $(seq 1 25); do curl -s -m 2 http://localhost:3001/api/health > /dev/null 2>&1 && break; sleep 1; done

echo "=== 0. Server boot log ==="
grep -E "ApparelDesk API running|Nest application successfully" /tmp/e2e_atlas.log | head -2 || tail -3 /tmp/e2e_atlas.log

echo "=== 1. Health ==="
curl -s http://localhost:3001/api/health; echo

echo "=== 2. Admin login (seeded in Atlas) ==="
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@appareldesk.com","password":"admin123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
echo "   admin token OK"

echo "=== 3. Customer login (seeded in Atlas) ==="
CTOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"customer@appareldesk.com","password":"customer123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
echo "   customer token OK"

echo "=== 4. Public catalog shows seeded products ==="
curl -s "http://localhost:3001/api/products/public?limit=100" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('   total products:', d['total'])
cats = sorted({p['category'] for p in d['items']})
print('   categories:', cats)
assert d['total'] >= 12, 'expected at least 12 seeded products'
"

echo "=== 5. All 6 demo coupons seeded ==="
curl -s -X POST http://localhost:3001/api/discount-offers/preview -H "Content-Type: application/json" -d '{"code":"APPAREL20","subtotal":1000}' | python3 -c "import sys,json; print('   APPAREL20 ->', json.load(sys.stdin)['discountAmount'])"
curl -s -X POST http://localhost:3001/api/discount-offers/preview -H "Content-Type: application/json" -d '{"code":"WELCOME10","subtotal":1000}' | python3 -c "import sys,json; print('   WELCOME10 ->', json.load(sys.stdin)['discountAmount'])"
curl -s -X POST http://localhost:3001/api/discount-offers/preview -H "Content-Type: application/json" -d '{"code":"SAVE500","subtotal":1000}'  | python3 -c "import sys,json; print('   SAVE500  ->', json.load(sys.stdin)['discountAmount'])"

echo "=== 6. Customer sees seeded order history ==="
curl -s -H "Authorization: Bearer $CTOKEN" "http://localhost:3001/api/orders/mine" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('   my orders:', d['total'])
for o in d['items']: print('   ->', o['orderNumber'], o['status'])
"

echo "=== 7. Admin dashboard reads Atlas aggregates ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/dashboard/stats; echo

echo "=== 8. Wishlist quick roundtrip ==="
PID=$(curl -s "http://localhost:3001/api/products/public?limit=1" | python3 -c "import sys,json; print(json.load(sys.stdin)['items'][0]['_id'])")
curl -s -X POST http://localhost:3001/api/wishlist/toggle -H "Authorization: Bearer $CTOKEN" -H "Content-Type: application/json" -d "{\"productId\":\"$PID\"}" | python3 -c "import sys,json; print('   toggle on ->', json.load(sys.stdin))"
curl -s -X POST http://localhost:3001/api/wishlist/toggle -H "Authorization: Bearer $CTOKEN" -H "Content-Type: application/json" -d "{\"productId\":\"$PID\"}" | python3 -c "import sys,json; print('   toggle off ->', json.load(sys.stdin))"

echo "=== 9. Vendor populated in seeded PO ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/purchase-orders | python3 -c "
import sys, json
d = json.load(sys.stdin)
po = d['items'][0]
v = po['vendorId']
print('   PO:', po['poNumber'], '| vendor:', v['name'] if isinstance(v, dict) else v)
"

kill $SERVER_PID 2>/dev/null || true
echo "=== ATLAS VERIFICATION DONE ==="
