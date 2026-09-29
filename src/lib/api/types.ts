/** Shared API types matching the backend Mongoose schemas */

export type Role = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export type ProductType = "readymade" | "fabric";

export interface Product {
  _id: string;
  id?: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  productType: ProductType;
  price: number;
  costPrice: number | null;
  stockQuantity: number;
  unit: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ContactType = "customer" | "vendor";

export interface Contact {
  _id: string;
  name: string;
  contactType: ContactType;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstNumber: string | null;
  createdAt: string;
}

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: Product | string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: { _id: string; name: string; email: string } | null;
  customerId: { _id: string; name: string } | null;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  couponCode: string | null;
  shippingAddress: Record<string, unknown> | null;
  createdAt: string;
}

export type PoStatus = "draft" | "confirmed" | "received" | "cancelled";

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  vendorId: { _id: string; name: string; company: string | null } | string;
  items: Array<{ productId: string; quantity: number; unitPrice: number; totalPrice: number }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: PoStatus;
  notes: string | null;
  createdAt: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderId: { _id: string; orderNumber: string } | string | null;
  customerId: { _id: string; name: string } | string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

export type BillStatus = "draft" | "received" | "paid" | "overdue" | "cancelled";

export interface Bill {
  _id: string;
  billNumber: string;
  vendorId: { _id: string; name: string; company: string | null } | string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: BillStatus;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

export type PaymentType = "incoming" | "outgoing";
export type PaymentMethod = "cash" | "bank_transfer" | "upi" | "cheque" | "card" | "other";

export interface Payment {
  _id: string;
  paymentNumber: string;
  paymentType: PaymentType;
  amount: number;
  paymentMethod: PaymentMethod;
  contactId: { _id: string; name: string; contactType: ContactType } | null;
  invoiceId: string | null;
  billId: string | null;
  paidAt: string;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PaymentTerm {
  _id: string;
  name: string;
  days: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface DiscountOffer {
  _id: string;
  code: string;
  description: string | null;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
}

export type NotificationType = "order" | "inventory" | "payment" | "customer" | "system" | "marketing";

export interface AppNotification {
  _id: string;
  userId: string | null;
  title: string;
  message: string;
  type: NotificationType;
  priority: "high" | "medium" | "low";
  read: boolean;
  actionUrl: string | null;
  actionText: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  ordersLast30Days: number;
}

export interface CouponPreview {
  discountAmount: number;
  code: string;
  description: string | null;
}

/** Helper to normalize an id from either a populated object or a raw string */
export function refId(ref: unknown): string {
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  const r = ref as { _id?: string; id?: string };
  return r._id ?? r.id ?? "";
}

/** Helper to get a name from a populated ref or fallback */
export function refName(ref: unknown): string {
  if (!ref) return "—";
  if (typeof ref === "string") return ref;
  const r = ref as { name?: string };
  return r.name ?? "—";
}
