import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface RecentOrderRow {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

const statusStyles: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-muted",
  Confirmed: "bg-info/10 text-info border-info/20",
  Processing: "bg-warning/10 text-warning border-warning/20",
  Shipped: "bg-primary/10 text-primary border-primary/20",
  Delivered: "bg-success/10 text-success border-success/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export function RecentOrdersTable({ orders = [] }: { orders?: RecentOrderRow[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card border border-border rounded-xl shadow-card overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
        <p className="text-sm text-muted-foreground">Latest customer orders from your store</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Order ID</TableHead>
            <TableHead className="text-muted-foreground">Customer</TableHead>
            <TableHead className="text-muted-foreground">Amount</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No orders yet
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id} className="border-border hover:bg-secondary/50 cursor-pointer">
                <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                <TableCell className="text-foreground">{order.customer}</TableCell>
                <TableCell className="text-foreground">{order.amount}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[order.status] ?? "bg-muted text-muted-foreground border-muted"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.date}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
}
