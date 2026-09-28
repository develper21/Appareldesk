import { motion } from "framer-motion";
import { Package, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { invoicesApi, ordersApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { Invoice, Order } from "@/lib/api/types";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-muted",
  confirmed: "bg-info/10 text-info border-info/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  shipped: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MyOrdersPage() {
  const { user } = useAuth();

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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view your orders</h1>
        <p className="text-muted-foreground mb-6">Track your orders and download invoices</p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
        <p className="text-muted-foreground mb-8">Track your orders and download invoices</p>
      </motion.div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-16">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
            <Link to="/shop">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => {
            const invoice = invoices.find(
              (inv) =>
                (typeof inv.orderId === "object" && inv.orderId !== null ? inv.orderId._id : inv.orderId) ===
                order._id,
            );
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                        <Badge variant="outline" className={statusStyles[order.status]}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        {order.items?.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length > 1 ? "s" : ""} •{" "}
                            {order.items
                              .map((item) =>
                                typeof item.productId === "object" ? item.productId.name : "Product",
                              )
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        <p className="text-lg font-semibold text-foreground mt-1">
                          ₹{Number(order.totalAmount).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {invoice && (
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
