/**
 * Seed script — creates demo data for the ApparelDesk API.
 * Run with: npm run seed (from the server/ directory)
 */
import 'reflect-metadata';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appareldesk';

const productSeeds = [
  { name: 'Premium Cotton Shirt', sku: 'PCS-001', category: 'Men', productType: 'readymade', price: 1299, costPrice: 700, stockQuantity: 145, description: 'Breathable premium cotton formal shirt' },
  { name: 'Slim Fit Denim Jeans', sku: 'SDJ-002', category: 'Men', productType: 'readymade', price: 1899, costPrice: 1100, stockQuantity: 89, description: 'Stretchable slim fit denim' },
  { name: 'Floral Print Kurta', sku: 'FPK-003', category: 'Women', productType: 'readymade', price: 1599, costPrice: 900, stockQuantity: 56, description: 'Hand block printed cotton kurta' },
  { name: 'Kids Casual T-Shirt', sku: 'KCT-004', category: 'Children', productType: 'readymade', price: 499, costPrice: 250, stockQuantity: 234, description: 'Soft cotton t-shirt for kids' },
  { name: 'Formal Blazer', sku: 'FB-005', category: 'Men', productType: 'readymade', price: 3999, costPrice: 2600, stockQuantity: 23, description: 'Tailored formal blazer' },
  { name: 'Embroidered Saree', sku: 'ES-006', category: 'Women', productType: 'fabric', price: 5999, costPrice: 4200, stockQuantity: 12, description: 'Silk saree with zari embroidery' },
  { name: 'Sports Track Pants', sku: 'STP-007', category: 'Men', productType: 'readymade', price: 899, costPrice: 500, stockQuantity: 0, description: 'Quick-dry polyester track pants' },
  { name: 'Designer Lehenga', sku: 'DL-008', category: 'Women', productType: 'readymade', price: 12999, costPrice: 9500, stockQuantity: 8, description: 'Bridal lehenga with heavy work' },
  { name: 'Polo T-Shirt', sku: 'PTS-009', category: 'Men', productType: 'readymade', price: 799, costPrice: 420, stockQuantity: 120, description: 'Classic cotton polo' },
  { name: 'Cotton Palazzo', sku: 'CP-010', category: 'Women', productType: 'readymade', price: 999, costPrice: 550, stockQuantity: 75, description: 'Free-flow cotton palazzo pants' },
  { name: 'Kids Denim Jacket', sku: 'KDJ-011', category: 'Children', productType: 'readymade', price: 1599, costPrice: 950, stockQuantity: 40, description: 'Warm denim jacket for kids' },
  { name: 'Ethnic Sherwani', sku: 'SHW-012', category: 'Men', productType: 'readymade', price: 8999, costPrice: 6500, stockQuantity: 15, description: 'Traditional sherwani with embroidery' },
];

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected:', MONGODB_URI);

  const db = mongoose.connection.db!;
  const now = new Date();

  // ----- Users -----
  const usersCol = db.collection('users');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@appareldesk.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = await usersCol.findOne({ email: adminEmail });
  let adminId: mongoose.Types.ObjectId;
  if (existingAdmin) {
    adminId = existingAdmin._id as mongoose.Types.ObjectId;
    console.log('Admin already exists:', adminEmail);
  } else {
    const hashed = await bcrypt.hash(adminPassword, 10);
    const res = await usersCol.insertOne({
      name: 'Store Admin',
      email: adminEmail,
      password: hashed,
      phone: '+91 98765 43210',
      role: 'admin',
      addresses: [],
      createdAt: now,
      updatedAt: now,
    } as any);
    adminId = res.insertedId;
    console.log('Admin created:', adminEmail, '/', adminPassword);
  }

  // Demo customer account
  const customerEmail = 'customer@appareldesk.com';
  let customerId: mongoose.Types.ObjectId;
  const existingCustomer = await usersCol.findOne({ email: customerEmail });
  if (existingCustomer) {
    customerId = existingCustomer._id as mongoose.Types.ObjectId;
  } else {
    const hashed = await bcrypt.hash('customer123', 10);
    const res = await usersCol.insertOne({
      name: 'Rahul Sharma',
      email: customerEmail,
      password: hashed,
      phone: '+91 90000 00001',
      role: 'user',
      addresses: [],
      createdAt: now,
      updatedAt: now,
    } as any);
    customerId = res.insertedId;
    console.log('Customer created:', customerEmail, '/ customer123');
  }

  // ----- Products -----
  const productsCol = db.collection('products');
  await productsCol.deleteMany({});
  const productDocs = productSeeds.map((p) => ({
    ...p,
    isPublished: true,
    tags: [],
    unit: 'piece',
    imageUrl: null,
    createdAt: now,
    updatedAt: now,
  }));
  const insertedProducts = await productsCol.insertMany(productDocs);
  const productIds = Object.values(insertedProducts.insertedIds) as mongoose.Types.ObjectId[];
  console.log(`Inserted ${productIds.length} products`);

  // ----- Contacts -----
  const contactsCol = db.collection('contacts');
  await contactsCol.deleteMany({});
  const insertedContacts = await contactsCol.insertMany([
    { name: 'Fashion Hub Pvt Ltd', contactType: 'vendor', email: 'contact@fashionhub.com', phone: '+91 98220 11223', city: 'Surat', state: 'Gujarat', gstNumber: '24ABCDE1234F1Z5', createdAt: now, updatedAt: now },
    { name: 'Textile World', contactType: 'vendor', email: 'info@textileworld.com', phone: '+91 98220 44556', city: 'Ahmedabad', state: 'Gujarat', gstNumber: '24PQRSX6789Y2Z1', createdAt: now, updatedAt: now },
    { name: 'Priya Patel', contactType: 'customer', email: 'priya@email.com', phone: '+91 98765 43211', city: 'Delhi', state: 'Delhi', createdAt: now, updatedAt: now },
    { name: 'Amit Kumar', contactType: 'customer', email: 'amit@email.com', phone: '+91 98765 43213', city: 'Bangalore', state: 'Karnataka', createdAt: now, updatedAt: now },
  ]);
  const contactIds = Object.values(insertedContacts.insertedIds) as mongoose.Types.ObjectId[];
  const vendor1 = contactIds[0];
  const cust1 = contactIds[2];

  // ----- Payment Terms -----
  const termsCol = db.collection('payment_terms');
  await termsCol.deleteMany({});
  await termsCol.insertMany([
    { name: 'Cash on Delivery', days: 0, description: 'Pay when the order arrives', isActive: true, createdAt: now, updatedAt: now },
    { name: 'Net 7', days: 7, description: 'Payment due within 7 days', isActive: true, createdAt: now, updatedAt: now },
    { name: 'Net 15', days: 15, description: 'Payment due within 15 days', isActive: true, createdAt: now, updatedAt: now },
    { name: 'Net 30', days: 30, description: 'Payment due within 30 days', isActive: true, createdAt: now, updatedAt: now },
  ]);
  console.log('Inserted payment terms');

  // ----- Discount Offers -----
  const offersCol = db.collection('discount_offers');
  await offersCol.deleteMany({});
  await offersCol.insertMany([
    { code: 'FIRST20', discountType: 'percent', discountValue: 20, description: '20% off for first order', minOrderAmount: 999, isActive: true, usedCount: 0, createdAt: now, updatedAt: now },
    { code: 'SAVE10', discountType: 'percent', discountValue: 10, description: 'Flat 10% off on all orders', minOrderAmount: 0, isActive: true, usedCount: 0, createdAt: now, updatedAt: now },
    { code: 'FLAT500', discountType: 'fixed', discountValue: 500, description: '₹500 off above ₹4,999', minOrderAmount: 4999, isActive: true, usedCount: 0, createdAt: now, updatedAt: now },
  ]);
  console.log('Inserted discount offers');

  // ----- Sample Order -----
  const ordersCol = db.collection('orders');
  await ordersCol.deleteMany({});
  const shirt = productSeeds[0];
  const jeans = productSeeds[1];
  const orderItems = [
    { productId: productIds[0], quantity: 2, unitPrice: shirt.price, totalPrice: shirt.price * 2 },
    { productId: productIds[1], quantity: 1, unitPrice: jeans.price, totalPrice: jeans.price },
  ];
  const subtotal = orderItems.reduce((s, i) => s + i.totalPrice, 0);
  await ordersCol.insertOne({
    orderNumber: 'ORD-2026-00001',
    userId: customerId,
    items: orderItems,
    subtotal,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: subtotal,
    status: 'confirmed',
    createdAt: now,
    updatedAt: now,
  } as any);
  console.log('Inserted 1 sample order');

  // ----- Sample Purchase Order -----
  const poCol = db.collection('purchase_orders');
  await poCol.deleteMany({});
  await poCol.insertOne({
    poNumber: 'PO-2026-00001',
    vendorId: vendor1,
    items: [{ productId: productIds[0], quantity: 50, unitPrice: 700, totalPrice: 35000 }],
    subtotal: 35000,
    taxAmount: 0,
    totalAmount: 35000,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  } as any);
  console.log('Inserted 1 sample purchase order');

  // ----- Welcome notification for admin -----
  const notificationsCol = db.collection('notifications');
  await notificationsCol.deleteMany({});
  await notificationsCol.insertOne({
    userId: null,
    title: 'Welcome to ApparelDesk',
    message: 'Your store backend is ready. Start by adding products or reviewing orders.',
    type: 'system',
    priority: 'low',
    read: false,
    createdAt: now,
    updatedAt: now,
  } as any);
  console.log('Inserted welcome notification');

  void adminId;
  void cust1;

  await mongoose.disconnect();
  console.log('✅ Seed complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
