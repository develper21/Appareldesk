import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { dashboardApi, productsApi, ordersApi, contactsApi } from "@/lib/api";
import type { MonthlySale } from "@/lib/api";

const COLORS = ["hsl(345, 98%, 60%)", "hsl(25, 95%, 55%)", "hsl(199, 89%, 48%)", "hsl(150, 60%, 45%)"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: salesByProduct = [] } = useQuery({
    queryKey: ["report_top_products"],
    queryFn: () => dashboardApi.topProducts(10),
  });

  const { data: monthlySales = [] } = useQuery({
    queryKey: ["report_monthly"],
    queryFn: dashboardApi.monthlySales,
  });

  const { data: productsData } = useQuery({
    queryKey: ["report_products"],
    queryFn: () => productsApi.list({ limit: 100 }),
  });

  const { data: ordersData } = useQuery({
    queryKey: ["report_orders"],
    queryFn: () => ordersApi.list({ limit: 200 }),
  });

  const { data: contactsData } = useQuery({
    queryKey: ["report_contacts"],
    queryFn: () => contactsApi.list({ limit: 200 }),
  });

  const products = productsData?.items ?? [];
  const orders = ordersData?.items ?? [];
  const contacts = contactsData?.items ?? [];

  // Sales by category (from products' category field)
  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    const cat = p.category ?? "Other";
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});
  const totalProducts = products.length || 1;
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    value: Math.round((count / totalProducts) * 100),
  }));

  // Sales by customer (from orders)
  const customerMap = orders.reduce<Record<string, { orders: number; paid: number }>>((acc, order) => {
    if (order.status === "cancelled") return acc;
    const name =
      (typeof order.customerId === "object" && order.customerId?.name) ||
      (typeof order.userId === "object" && order.userId?.name) ||
      "Guest";
    if (!acc[name]) acc[name] = { orders: 0, paid: 0 };
    acc[name].orders += 1;
    acc[name].paid += order.totalAmount;
    return acc;
  }, {});
  const salesByCustomer = Object.entries(customerMap)
    .map(([customer, data]) => ({ customer, ...data, unpaid: 0 }))
    .sort((a, b) => b.paid - a.paid)
    .slice(0, 10);

  const chartData = monthlySales.map((m: MonthlySale) => ({
    name: MONTHS[(m.month - 1) as number] ?? `M${m.month}`,
    sales: m.sales,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Sales and purchase analytics</p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sales-products" className="gap-2">
            <Package className="w-4 h-4" />
            Sales by Products
          </TabsTrigger>
          <TabsTrigger value="sales-customers" className="gap-2">
            <Users className="w-4 h-4" />
            Sales by Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Monthly Sales</CardTitle>
                  <CardDescription>Revenue by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Bar dataKey="sales" fill="hsl(345, 98%, 60%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Sales by Category</CardTitle>
                  <CardDescription>Product category distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6 mt-4">
                    {categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="sales-products" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Sales Report by Products</CardTitle>
                <CardDescription>Product-wise sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Product Name</TableHead>
                      <TableHead className="text-muted-foreground text-right">Sold Quantity</TableHead>
                      <TableHead className="text-muted-foreground text-right">Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByProduct.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No sales data yet</TableCell></TableRow>
                    ) : (
                      salesByProduct.map((item) => (
                        <TableRow key={item.productId} className="border-border">
                          <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                          <TableCell className="text-right text-foreground">{item.quantity}</TableCell>
                          <TableCell className="text-right text-foreground">₹{item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="sales-customers" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Sales Report by Customers</CardTitle>
                <CardDescription>Customer-wise sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Customer Name</TableHead>
                      <TableHead className="text-muted-foreground text-right">Total Orders</TableHead>
                      <TableHead className="text-muted-foreground text-right">Paid Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByCustomer.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No sales data yet</TableCell></TableRow>
                    ) : (
                      salesByCustomer.map((item) => (
                        <TableRow key={item.customer} className="border-border">
                          <TableCell className="font-medium text-foreground">{item.customer}</TableCell>
                          <TableCell className="text-right text-foreground">{item.orders}</TableCell>
                          <TableCell className="text-right text-success">₹{item.paid.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
