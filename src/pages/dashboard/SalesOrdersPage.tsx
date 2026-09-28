import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical, Eye, Trash2, Calendar } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ordersApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import { refName } from "@/lib/api/types";
import type { Order } from "@/lib/api/types";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-muted",
  confirmed: "bg-info/10 text-info border-info/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  shipped: "bg-primary/10 text-primary border-primary/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function SalesOrdersPage() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", search],
    queryFn: () => ordersApi.list({ search: search || undefined, limit: 100 }),
  });

  const orders: Order[] = ordersData?.items ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Order status updated" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ordersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Order deleted" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sale Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search order numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl shadow-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Order ID</TableHead>
              <TableHead className="text-muted-foreground">Customer</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No orders found</TableCell></TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-medium text-foreground">{order.orderNumber}</TableCell>
                  <TableCell className="text-foreground">
                    {refName(order.customerId) !== "—" ? refName(order.customerId) : refName(order.userId)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground font-medium">₹{order.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: order._id, status: "confirmed" })}>
                          <Eye className="w-4 h-4 mr-2" />
                          Confirm
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: order._id, status: "shipped" })}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Mark Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: order._id, status: "delivered" })}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Mark Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(order._id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
