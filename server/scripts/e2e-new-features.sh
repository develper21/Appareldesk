#!/bin/bash
# E2E test for the NEW storefront features:
#   wishlist CRUD + checkout with paymentMethod + new demo coupons
set -e
cd "$(dirname "$0")/.."

pkill -9 -f "dist/main" 2>/dev/null || true
sleep 1
node dist/main.js > /tmp/e2e_wishlist.log 2>&1 &
SERVER_PID=$!
for i in $(seq 1 20); do curl -s -m 2 http://localhost:3001/api/health > /dev/null 2>&1 && break; sleep 1; done

echo "=== 0. Health check ==="
curl -s http://localhost:3001/api/health | head -c 120; echo

echo "=== 1. Login as demo customer ==="
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"customer@appareldesk.com","password":"customer123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
echo "   token OK"

echo "=== 2. Pick two products ==="
read PID1 PID2 <<< $(curl -s "http://localhost:3001/api/products/public?limit=2" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['items'][0]['_id'], d['items'][1]['_id'])")
echo "   pid1=$PID1 pid2=$PID2"

echo "=== 3. Wishlist starts empty ==="
COUNT=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/wishlist | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "   items: $COUNT"

echo "=== 4. Toggle product1 ON, product2 ON, product1 OFF ==="
curl -s -X POST http://localhost:3001/api/wishlist/toggle -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PID1\"}" | python3 -c "import sys,json; print('   toggle1 ->', json.load(sys.stdin))"
curl -s -X POST http://localhost:3001/api/wishlist/toggle -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PID2\"}" | python3 -c "import sys,json; print('   toggle2 ->', json.load(sys.stdin))"
curl -s -X POST http://localhost:3001/api/wishlist/toggle -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PID1\"}" | python3 -c "import sys,json; print('   toggle1 ->', json.load(sys.stdin))"

echo "=== 5. Wishlist now has exactly 1 populated product ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/wishlist | python3 -c "
import sys, json
items = json.load(sys.stdin)
print('   items:', len(items))
for i in items: print('   ->', i['name'], '| price:', i['price'])
assert len(items) == 1, 'expected exactly 1 wishlist item'
assert 'name' in items[0] and 'price' in items[0], 'product not populated'
"

echo "=== 6. Wishlist requires auth (expect 401) ==="
curl -s -o /dev/null -w "   HTTP %{http_code}\n" http://localhost:3001/api/wishlist

echo "=== 7. New demo coupon previews ==="
curl -s -X POST http://localhost:3001/api/discount-offers/preview -H "Content-Type: application/json" \
  -d '{"code":"APPAREL20","subtotal":2000}' | python3 -c "import sys,json; d=json.load(sys.stdin); print('   APPAREL20 on 2000 -> save', d['discountAmount'])"
curl -s -X POST http://localhost:3001/api/discount-offers/preview -H "Content-Type: application/json" \
  -d '{"code":"WELCOME10","subtotal":2000}' | python3 -c "import sys,json; d=json.load(sys.stdin); print('   WELCOME10 on 2000 -> save', d['discountAmount'])"
curl -s -X POST http://localhost:3001/api/discount-offers/preview -H "Content-Type: application/json" \
  -d '{"code":"SAVE500","subtotal":2000}' | python3 -c "import sys,json; d=json.load(sys.stdin); print('   SAVE500  on 2000 -> save', d['discountAmount'])"

echo "=== 8. Checkout with paymentMethod=cod + full address ==="
ORDER=$(curl -s -X POST http://localhost:3001/api/orders/checkout -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"items\":[{\"productId\":\"$PID2\",\"quantity\":1}],\"couponCode\":\"WELCOME10\",\"shippingAddress\":{\"fullName\":\"Rahul Sharma\",\"phone\":\"+91 90000 00001\",\"line1\":\"42 Park View Avenue\",\"city\":\"Mumbai\",\"state\":\"Maharashtra\",\"pincode\":\"400001\",\"paymentMethod\":\"cod\"}}")
echo $ORDER | python3 -c "
import sys, json
o = json.load(sys.stdin)
print('   order:', o['orderNumber'], '| total:', o['totalAmount'], '| status:', o['status'])
addr = o.get('shippingAddress') or {}
print('   paymentMethod saved:', addr.get('paymentMethod'))
print('   address:', addr.get('fullName'), '/', addr.get('city'), '/', addr.get('pincode'))
"

echo "=== 9. Seeded customer has 3 orders now (2 seeded + 1 new) ==="
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/orders/mine" | python3 -c "import sys,json; d=json.load(sys.stdin); print('   my orders:', d['total'])"

echo "=== 10. Clear wishlist ==="
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/wishlist -o /dev/null -w "   HTTP %{http_code}\n"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/wishlist | python3 -c "import sys,json; print('   items after clear:', len(json.load(sys.stdin)))"

kill $SERVER_PID 2>/dev/null || true
echo "=== WISHLIST/FEATURES E2E DONE ==="
