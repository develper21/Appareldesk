#!/bin/bash
# Customer checkout flow test
set -e
cd "$(dirname "$0")/.."

pkill -9 -f "dist/main" 2>/dev/null || true
sleep 1
node dist/main.js > /tmp/e2e_checkout.log 2>&1 &
SERVER_PID=$!
for i in $(seq 1 20); do curl -s -m 2 http://localhost:3001/api/health > /dev/null 2>&1 && break; sleep 1; done

echo "=== 1. Register new customer ==="
curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Test Buyer","email":"buyer@test.com","password":"secret123","phone":"+91 99999 99999"}' | head -c 120; echo

echo "=== 2. Login as customer ==="
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"buyer@test.com","password":"secret123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
echo "   token OK"

echo "=== 3. Pick a product from storefront ==="
PRODUCT=$(curl -s "http://localhost:3001/api/products/public?limit=1" | python3 -c "import sys,json; d=json.load(sys.stdin); p=d['items'][0]; print(p['_id'] + ' ' + str(p['price']) + ' ' + p['name'])")
PID=$(echo $PRODUCT | cut -d' ' -f1)
echo "   product: $PRODUCT"

echo "=== 4. Checkout with coupon SAVE10 ==="
ORDER=$(curl -s -X POST http://localhost:3001/api/orders/checkout -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"items\":[{\"productId\":\"$PID\",\"quantity\":2}],\"couponCode\":\"SAVE10\",\"shippingAddress\":{\"fullName\":\"Test Buyer\",\"city\":\"Mumbai\",\"line1\":\"MG Road\",\"pincode\":\"400001\"}}")
echo $ORDER | python3 -c "import sys,json; o=json.load(sys.stdin); print('   order:', o['orderNumber'], '| subtotal:', o['subtotal'], '| discount:', o['discountAmount'], '| total:', o['totalAmount'], '| status:', o['status'])"

echo "=== 5. My orders shows it ==="
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/orders/mine" | python3 -c "import sys,json; d=json.load(sys.stdin); print('   my orders:', d['total'])"

echo "=== 6. Stock decremented ==="
curl -s "http://localhost:3001/api/products/public?limit=100" | python3 -c "
import sys, json
d = json.load(sys.stdin)
p = [x for x in d['items'] if x['_id'] == '$PID'][0]
print('   remaining stock:', p['stockQuantity'])"

echo "=== 7. Customer blocked from admin route (expect 403) ==="
curl -s -o /dev/null -w "   HTTP %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/products

kill $SERVER_PID 2>/dev/null || true
echo "=== CHECKOUT FLOW DONE ==="
