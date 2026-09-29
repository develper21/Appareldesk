import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Calendar,
  Package,
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ordersApi } from "@/lib/api";
import { getProductDisplayImage } from "@/lib/mockData";
import { getApiErrorMessage } from "@/lib/api/client";
import { refName } from "@/lib/api/types";
import { toast } from "sonner";
import type { Order } from "@/lib/api/types";

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted" },
  confirmed: { bg: "bg-info/15", text: "text-info", border: "border-info/30" },
  processing: { bg: "bg-warning/15", text: "text-warning", border: "border-warning/30" },
  shipped: { bg: "bg-primary/15", text: "text-primary", border: "border-primary/30" },
  delivered: { bg: "bg-success/15", text: "text-success", border: "border-success/30" },
  cancelled: { bg: "bg-destructive/15", text: "text-destructive", border: "border-destructive/30" },
};

export default function SalesOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", search],
    queryFn: () => ordersApi.list({ search: search || undefined, limit: 100 }),
  });

  const orders: Order[] = ordersData?.items ?? [];

  const filteredOrders = orders.filter((o) => {
    return statusFilter === "all" || o.status === statusFilter;
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated!");
      if (selectedOrder) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: prev.status } : null));
      }
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ordersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted");
      setSelectedOrder(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Sales Orders</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track online customer orders, delivery fulfillment, and payment statuses
          </p>
        </div>
      </motion.div>

      {/* Filter and Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-secondary/50 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs bg-secondary/50 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs">Order ID</TableHead>
              <TableHead className="text-muted-foreground text-xs">Customer</TableHead>
              <TableHead className="text-muted-foreground text-xs">Placed Date</TableHead>
              <TableHead className="text-muted-foreground text-xs">Total Amount</TableHead>
              <TableHead className="text-muted-foreground text-xs">Fulfillment Status</TableHead>
              <TableHead className="text-muted-foreground text-xs w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-xs">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-xs">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const customerName =
                  refName(order.customerId) !== "—"
                    ? refName(order.customerId)
                    : refName(order.userId);
                const st = statusStyles[order.status] || statusStyles.confirmed;

                return (
                  <TableRow
                    key={order._id}
                    className="border-border hover:bg-secondary/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-semibold text-xs text-foreground">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium">
                      {customerName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      ₹{order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${st.bg} ${st.text} ${st.border} border text-[10px] uppercase font-semibold`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                            <Eye className="w-3.5 h-3.5 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatusMutation.mutate({ id: order._id, status: "confirmed" })
                            }
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-2 text-info" />
                            Mark Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatusMutation.mutate({ id: order._id, status: "shipped" })
                            }
                          >
                            <Truck className="w-3.5 h-3.5 mr-2 text-primary" />
                            Mark Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatusMutation.mutate({ id: order._id, status: "delivered" })
                            }
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-2 text-success" />
                            Mark Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateStatusMutation.mutate({ id: order._id, status: "cancelled" })
                            }
                          >
                            <XCircle className="w-3.5 h-3.5 mr-2 text-destructive" />
                            Cancel Order
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10"
                            onClick={() => deleteMutation.mutate(order._id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-xl bg-card border-border p-6">
            <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <div>
                <DialogTitle className="text-base font-bold">
                  Order Details • {selectedOrder.orderNumber}
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge
                className={`${statusStyles[selectedOrder.status]?.bg || "bg-muted"} ${
                  statusStyles[selectedOrder.status]?.text || ""
                } uppercase text-[10px] font-bold`}
              >
                {selectedOrder.status}
              </Badge>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              {/* Customer & Address */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/30 rounded-xl">
                <div>
                  <p className="text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-primary" /> Customer Info
                  </p>
                  <p className="font-semibold text-foreground">
                    {refName(selectedOrder.customerId) !== "—"
                      ? refName(selectedOrder.customerId)
                      : refName(selectedOrder.userId)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {String(selectedOrder.shippingAddress?.phone || "No phone recorded")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Shipping Address
                  </p>
                  <p className="font-medium text-foreground">
                    {String(selectedOrder.shippingAddress?.line1 || "Store Pickup")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {String(selectedOrder.shippingAddress?.city ?? "")}{" "}
                    {String(selectedOrder.shippingAddress?.pincode ?? "")}
                  </p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <p className="font-bold text-foreground">Ordered Items ({selectedOrder.items?.length || 0})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items?.map((item, i) => {
                    const productObj = typeof item.productId === "object" ? item.productId : null;
                    const name = productObj?.name || "Apparel Item";
                    const img = getProductDisplayImage(productObj?.imageUrl, productObj?.category, name);

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={img}
                            alt={name}
                            className="w-9 h-11 object-cover rounded border border-border shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-foreground">{name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.unitPrice}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-foreground">
                          ₹{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                <span className="font-medium text-foreground">Update Status:</span>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() =>
                      updateStatusMutation.mutate({ id: selectedOrder._id, status: "confirmed" })
                    }
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() =>
                      updateStatusMutation.mutate({ id: selectedOrder._id, status: "shipped" })
                    }
                  >
                    Ship
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() =>
                      updateStatusMutation.mutate({ id: selectedOrder._id, status: "delivered" })
                    }
                  >
                    Deliver
                  </Button>
                </div>
              </div>

              {/* Order Totals */}
              <div className="pt-3 border-t border-border flex justify-between items-baseline font-bold text-sm">
                <span>Total Amount:</span>
                <span className="text-lg text-primary">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
