import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";

// Storefront
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import HomePage from "@/pages/storefront/HomePage";
import ShopPage from "@/pages/storefront/ShopPage";
import CartPage from "@/pages/storefront/CartPage";
import MyOrdersPage from "@/pages/storefront/MyOrdersPage";
import ProductDetailPage from "@/pages/storefront/ProductDetailPage";

// Auth
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// Dashboard
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import ProductsPage from "@/pages/dashboard/ProductsPage";
import ContactsPage from "@/pages/dashboard/ContactsPage";
import SalesOrdersPage from "@/pages/dashboard/SalesOrdersPage";
import PurchaseOrdersPage from "@/pages/dashboard/PurchaseOrdersPage";
import CustomerInvoicesPage from "@/pages/dashboard/CustomerInvoicesPage";
import VendorBillsPage from "@/pages/dashboard/VendorBillsPage";
import PaymentsPage from "@/pages/dashboard/PaymentsPage";
import PaymentTermsPage from "@/pages/dashboard/PaymentTermsPage";
import DiscountOffersPage from "@/pages/dashboard/DiscountOffersPage";
import ReportsPage from "@/pages/dashboard/ReportsPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import NotificationsPage from "@/pages/dashboard/NotificationsPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner richColors position="top-right" />
            <BrowserRouter>
              <Routes>
                {/* Storefront Routes */}
                <Route element={<StorefrontLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardHome />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="contacts" element={<ContactsPage />} />
                  <Route path="sales" element={<SalesOrdersPage />} />
                  <Route path="purchases" element={<PurchaseOrdersPage />} />
                  <Route path="invoices" element={<CustomerInvoicesPage />} />
                  <Route path="bills" element={<VendorBillsPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="payment-terms" element={<PaymentTermsPage />} />
                  <Route path="discounts" element={<DiscountOffersPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
