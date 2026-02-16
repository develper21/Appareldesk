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

const recentOrders = [
  { id: "ORD-001", customer: "Rahul Sharma", amount: "₹4,500", status: "Completed", date: "Today" },
  { id: "ORD-002", customer: "Priya Patel", amount: "₹2,800", status: "Processing", date: "Today" },
  { id: "ORD-003", customer: "Amit Kumar", amount: "₹6,200", status: "Pending", date: "Yesterday" },
  { id: "ORD-004", customer: "Neha Singh", amount: "₹3,150", status: "Completed", date: "Yesterday" },
  { id: "ORD-005", customer: "Vikram Joshi", amount: "₹8,900", status: "Shipped", date: "2 days ago" },
];

const statusStyles: Record<string, string> = {
  Completed: "bg-success/10 text-success border-success/20",
  Processing: "bg-info/10 text-info border-info/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Shipped: "bg-primary/10 text-primary border-primary/20",
};

export function RecentOrdersTable() {
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
          {recentOrders.map((order) => (
            <TableRow key={order.id} className="border-border hover:bg-secondary/50 cursor-pointer">
              <TableCell className="font-medium text-foreground">{order.id}</TableCell>
              <TableCell className="text-foreground">{order.customer}</TableCell>
              <TableCell className="text-foreground">{order.amount}</TableCell>
              <TableCell>
                <Badge variant="outline" className={statusStyles[order.status]}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{order.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
