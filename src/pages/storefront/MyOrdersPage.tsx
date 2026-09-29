import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  Download,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { invoicesApi, ordersApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getProductDisplayImage } from "@/lib/mockData";
import { toast } from "sonner";
import type { Invoice, Order } from "@/lib/api/types";

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted" },
  confirmed: { bg: "bg-info/15", text: "text-info", border: "border-info/30" },
  processing: { bg: "bg-warning/15", text: "text-warning", border: "border-warning/30" },
  shipped: { bg: "bg-primary/15", text: "text-primary", border: "border-primary/30" },
  delivered: { bg: "bg-success/15", text: "text-success", border: "border-success/30" },
  cancelled: { bg: "bg-destructive/15", text: "text-destructive", border: "border-destructive/30" },
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["my_orders", user?.id],
    queryFn: () => ordersApi.mine(),
    enabled: !!user,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["my_invoices", user?.id],
    queryFn: () => invoicesApi.mine(),
    enabled: !!user,
  });

  const orders: Order[] = ordersData?.items ?? [];
  const invoices: Invoice[] = invoicesData?.items ?? [];

  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view your orders</h1>
        <p className="text-xs text-muted-foreground mb-6">
          Track active shipments, view order history, and download tax invoices
        </p>
        <Link to="/login">
          <Button size="lg" className="gradient-primary">
            Sign In Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">My Orders</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Track packages, view delivery timeline, and download invoices
        </p>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-muted-foreground text-xs">Fetching your order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center mx-auto text-muted-foreground">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">No orders placed yet</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Your fashion journey starts here! Browse our new arrivals and place your first order today.
            </p>
            <Link to="/shop" className="inline-block pt-2">
              <Button className="gradient-primary">Explore Catalog</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => {
            const st = statusStyles[order.status] || statusStyles.confirmed;

            // Tracking progress
            const steps = ["confirmed", "processing", "shipped", "delivered"];
            const currentStepIdx = Math.max(0, steps.indexOf(order.status));

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-card border-border/80 hover:border-primary/40 transition-colors shadow-card overflow-hidden">
                  <CardHeader className="bg-secondary/20 pb-4 border-b border-border/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-bold">{order.orderNumber}</CardTitle>
                            <Badge className={`${st.bg} ${st.text} ${st.border} border text-[10px] uppercase font-semibold`}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => setSelectedInvoiceOrder(order)}
                        >
                          <Download className="w-3.5 h-3.5" />
                          View Invoice
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-5">
                    {/* Status Stepper */}
                    {order.status !== "cancelled" && (
                      <div className="py-2 px-3 rounded-xl bg-secondary/30 border border-border/60">
                        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mb-2">
                          <span className={currentStepIdx >= 0 ? "text-primary font-bold" : ""}>Order Confirmed</span>
                          <span className={currentStepIdx >= 1 ? "text-primary font-bold" : ""}>Packed</span>
                          <span className={currentStepIdx >= 2 ? "text-primary font-bold" : ""}>Shipped</span>
                          <span className={currentStepIdx >= 3 ? "text-success font-bold" : ""}>Delivered</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Ordered Items Preview */}
                    <div className="space-y-3">
                      {order.items?.map((item, i) => {
                        const productObj = typeof item.productId === "object" ? item.productId : null;
                        const name = productObj?.name || "Premium Garment";
                        const category = productObj?.category || "Apparel";
                        const img = getProductDisplayImage(productObj?.imageUrl, category, name);

                        return (
                          <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0">
                            <div className="flex items-center gap-3">
                              <img
                                src={img}
                                alt={name}
                                className="w-12 h-14 object-cover rounded-md border border-border shrink-0"
                              />
                              <div>
                                <p className="text-xs font-semibold text-foreground">{name}</p>
                                <p className="text-[11px] text-muted-foreground">Qty: {item.quantity} • Unit: ₹{item.unitPrice}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-foreground">
                              ₹{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Total */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        {order.couponCode && (
                          <Badge variant="secondary" className="text-[10px]">
                            Coupon: {order.couponCode}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground mr-2">Order Total:</span>
                        <span className="text-lg font-extrabold text-foreground">
                          ₹{Number(order.totalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Invoice Viewer Modal */}
      <Dialog open={!!selectedInvoiceOrder} onOpenChange={(open) => !open && setSelectedInvoiceOrder(null)}>
        <DialogContent className="max-w-2xl bg-card border-border p-6">
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <DialogTitle className="text-lg font-bold">Tax Invoice</DialogTitle>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 text-xs">
              <Printer className="w-3.5 h-3.5" /> Print Invoice
            </Button>
          </DialogHeader>

          {selectedInvoiceOrder && (
            <div className="space-y-6 pt-4 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-extrabold text-primary">ApparelDesk Retail Ltd.</h3>
                  <p className="text-muted-foreground mt-0.5">123 Fashion Street, Mumbai, Maharashtra 400001</p>
                  <p className="text-muted-foreground">GSTIN: 27AABCA1234F1Z5</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">Invoice #{selectedInvoiceOrder.orderNumber}</p>
                  <p className="text-muted-foreground">
                    Date: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-secondary/30 rounded-xl">
                <p className="font-semibold text-foreground mb-1">Billed To:</p>
                <p className="text-muted-foreground font-medium">{user.name}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoiceOrder.items?.map((item, i) => (
                    <tr key={i} className="border-b border-border/40">
                      <td className="py-2 font-medium text-foreground">
                        {typeof item.productId === "object" ? item.productId?.name : "Item"}
                      </td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">₹{item.unitPrice}</td>
                      <td className="py-2 text-right font-semibold">
                        ₹{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-2">
                <div className="w-52 space-y-1.5 text-right">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoiceOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  {selectedInvoiceOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount:</span>
                      <span>-₹{selectedInvoiceOrder.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border">
                    <span>Grand Total:</span>
                    <span>₹{selectedInvoiceOrder.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
