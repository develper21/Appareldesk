import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye,
  FileText,
  Calendar
} from "lucide-react";
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

const orders = [
  { id: "SO-001", customer: "Rahul Sharma", date: "2026-01-03", amount: 4500, status: "Confirmed", invoiced: true },
  { id: "SO-002", customer: "Priya Patel", date: "2026-01-03", amount: 2800, status: "Processing", invoiced: false },
  { id: "SO-003", customer: "Amit Kumar", date: "2026-01-02", amount: 6200, status: "Draft", invoiced: false },
  { id: "SO-004", customer: "Neha Singh", date: "2026-01-02", amount: 3150, status: "Confirmed", invoiced: true },
  { id: "SO-005", customer: "Vikram Joshi", date: "2026-01-01", amount: 8900, status: "Shipped", invoiced: true },
  { id: "SO-006", customer: "Meera Gupta", date: "2026-01-01", amount: 1650, status: "Delivered", invoiced: true },
];

const statusStyles: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-muted",
  Confirmed: "bg-info/10 text-info border-info/20",
  Processing: "bg-warning/10 text-warning border-warning/20",
  Shipped: "bg-primary/10 text-primary border-primary/20",
  Delivered: "bg-success/10 text-success border-success/20",
};

export default function SalesOrdersPage() {
  const [search, setSearch] = useState("");

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.customer.toLowerCase().includes(search.toLowerCase())
  );

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
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Order
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
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
              <TableHead className="text-muted-foreground">Invoice</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="border-border hover:bg-secondary/50">
                <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                <TableCell className="text-foreground">{order.customer}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {order.date}
                  </div>
                </TableCell>
                <TableCell className="text-foreground font-medium">₹{order.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[order.status]}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.invoiced ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Invoiced
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="w-4 h-4 mr-2" />
                        Create Invoice
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
