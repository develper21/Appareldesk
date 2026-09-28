import { api } from "./client";
import type {
  AuthResponse,
  Bill,
  Contact,
  CouponPreview,
  DashboardStats,
  DiscountOffer,
  Invoice,
  Order,
  Payment,
  PaymentTerm,
  Product,
  PurchaseOrder,
  AppNotification,
  User,
} from "./types";
import type { Paginated } from "./client";

// ---------- Auth ----------
export const authApi = {
  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    api.post<AuthResponse>("/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),
  me: () => api.get<User>("/auth/me").then((r) => r.data),
  updateMe: (data: { name?: string; phone?: string; avatarUrl?: string }) =>
    api.patch<User>("/auth/me", data).then((r) => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch("/auth/me/password", data).then((r) => r.data),
};

// ---------- Products ----------
export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const productsApi = {
  /** Public storefront listing (published only) */
  listPublic: (params: ProductQuery = {}) =>
    api.get<Paginated<Product>>("/products/public", { params }).then((r) => r.data),
  /** Admin listing (includes unpublished) */
  list: (params: ProductQuery = {}) =>
    api.get<Paginated<Product>>("/products", { params }).then((r) => r.data),
  get: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (data: Partial<Product>) => api.post<Product>("/products", data).then((r) => r.data),
  update: (id: string, data: Partial<Product>) =>
    api.patch<Product>(`/products/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/products/${id}`),
};

// ---------- Contacts ----------
export const contactsApi = {
  list: (params: { search?: string; contactType?: string; limit?: number } = {}) =>
    api.get<Paginated<Contact>>("/contacts", { params }).then((r) => r.data),
  get: (id: string) => api.get<Contact>(`/contacts/${id}`).then((r) => r.data),
  create: (data: Partial<Contact>) => api.post<Contact>("/contacts", data).then((r) => r.data),
  update: (id: string, data: Partial<Contact>) =>
    api.patch<Contact>(`/contacts/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/contacts/${id}`),
};

// ---------- Orders ----------
export interface CheckoutPayload {
  items: Array<{ productId: string; quantity: number }>;
  couponCode?: string;
  shippingAddress?: Record<string, string>;
  notes?: string;
}

export const ordersApi = {
  checkout: (data: CheckoutPayload) => api.post<Order>("/orders/checkout", data).then((r) => r.data),
  mine: (params: { page?: number; limit?: number } = {}) =>
    api.get<Paginated<Order>>("/orders/mine", { params }).then((r) => r.data),
  list: (params: { page?: number; limit?: number; search?: string; status?: string } = {}) =>
    api.get<Paginated<Order>>("/orders", { params }).then((r) => r.data),
  get: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  createForCustomer: (data: { customerId: string; items: Array<{ productId: string; quantity: number }>; taxAmount?: number; notes?: string }) =>
    api.post<Order>("/orders", data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch<Order>(`/orders/${id}`, { status }).then((r) => r.data),
  remove: (id: string) => api.delete(`/orders/${id}`),
};

// ---------- Purchase Orders ----------
export const purchaseOrdersApi = {
  list: (params: { page?: number; limit?: number; search?: string } = {}) =>
    api.get<Paginated<PurchaseOrder>>("/purchase-orders", { params }).then((r) => r.data),
  get: (id: string) => api.get<PurchaseOrder>(`/purchase-orders/${id}`).then((r) => r.data),
  create: (data: { vendorId: string; items: Array<{ productId: string; quantity: number; unitPrice: number }>; notes?: string }) =>
    api.post<PurchaseOrder>("/purchase-orders", data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch<PurchaseOrder>(`/purchase-orders/${id}`, { status }).then((r) => r.data),
  remove: (id: string) => api.delete(`/purchase-orders/${id}`),
};

// ---------- Invoices ----------
export const invoicesApi = {
  mine: (params: { page?: number; limit?: number } = {}) =>
    api.get<Paginated<Invoice>>("/invoices/mine", { params }).then((r) => r.data),
  list: (params: { page?: number; limit?: number } = {}) =>
    api.get<Paginated<Invoice>>("/invoices", { params }).then((r) => r.data),
  get: (id: string) => api.get<Invoice>(`/invoices/${id}`).then((r) => r.data),
  create: (data: { orderId?: string; customerId?: string; subtotal: number; taxAmount?: number; discountAmount?: number; notes?: string }) =>
    api.post<Invoice>("/invoices", data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch<Invoice>(`/invoices/${id}`, { status }).then((r) => r.data),
  remove: (id: string) => api.delete(`/invoices/${id}`),
};

// ---------- Bills ----------
export const billsApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    api.get<Paginated<Bill>>("/bills", { params }).then((r) => r.data),
  get: (id: string) => api.get<Bill>(`/bills/${id}`).then((r) => r.data),
  create: (data: { vendorId: string; subtotal: number; taxAmount?: number; dueDate?: string; notes?: string }) =>
    api.post<Bill>("/bills", data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch<Bill>(`/bills/${id}`, { status }).then((r) => r.data),
  remove: (id: string) => api.delete(`/bills/${id}`),
};

// ---------- Payments ----------
export const paymentsApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    api.get<Paginated<Payment>>("/payments", { params }).then((r) => r.data),
  create: (data: { paymentType: string; amount: number; paymentMethod?: string; contactId?: string; invoiceId?: string; billId?: string; referenceNumber?: string; notes?: string }) =>
    api.post<Payment>("/payments", data).then((r) => r.data),
  remove: (id: string) => api.delete(`/payments/${id}`),
};

// ---------- Payment Terms ----------
export const paymentTermsApi = {
  list: (includeInactive = false) =>
    api.get<PaymentTerm[]>("/payment-terms", { params: { includeInactive } }).then((r) => r.data),
  create: (data: { name: string; days: number; description?: string }) =>
    api.post<PaymentTerm>("/payment-terms", data).then((r) => r.data),
  update: (id: string, data: { isActive?: boolean; name?: string; days?: number; description?: string }) =>
    api.patch<PaymentTerm>(`/payment-terms/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/payment-terms/${id}`),
};

// ---------- Discount Offers ----------
export const discountsApi = {
  preview: (code: string, subtotal: number) =>
    api.post<CouponPreview>("/discount-offers/preview", { code, subtotal }).then((r) => r.data),
  list: (includeInactive = false) =>
    api.get<DiscountOffer[]>("/discount-offers", { params: { includeInactive } }).then((r) => r.data),
  create: (data: Partial<DiscountOffer>) =>
    api.post<DiscountOffer>("/discount-offers", data).then((r) => r.data),
  update: (id: string, data: Partial<DiscountOffer>) =>
    api.patch<DiscountOffer>(`/discount-offers/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/discount-offers/${id}`),
};

// ---------- Notifications ----------
export const notificationsApi = {
  list: (unreadOnly = false) =>
    api.get<AppNotification[]>("/notifications", { params: { unreadOnly } }).then((r) => r.data),
  unreadCount: () =>
    api.get<{ count: number }>("/notifications/unread-count").then((r) => r.data.count),
  markRead: (id: string) => api.patch(`/notifications/${id}`, { read: true }),
  markAllRead: () => api.patch("/notifications/read-all"),
  remove: (id: string) => api.delete(`/notifications/${id}`),
};

// ---------- Settings ----------
export const settingsApi = {
  get: () => api.get("/settings").then((r) => r.data),
  update: (data: Record<string, any>) => api.patch("/settings", data).then((r) => r.data),
};

// ---------- Dashboard ----------
export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  amount: number;
}

export interface MonthlySale {
  year: number;
  month: number;
  sales: number;
  orders: number;
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/dashboard/stats").then((r) => r.data),
  recentOrders: (limit = 5) =>
    api.get<Order[]>(`/dashboard/recent-orders?limit=${limit}`).then((r) => r.data),
  topProducts: (limit = 5) =>
    api.get<TopProduct[]>(`/dashboard/top-products?limit=${limit}`).then((r) => r.data),
  monthlySales: () => api.get<MonthlySale[]>("/dashboard/monthly-sales").then((r) => r.data),
};
