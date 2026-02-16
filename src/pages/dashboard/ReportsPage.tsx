import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package,
  Calendar,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const salesByProduct = [
  { product: "Cotton Shirt", quantity: 145, amount: 188255 },
  { product: "Denim Jeans", quantity: 132, amount: 250668 },
  { product: "Kurta Set", quantity: 98, amount: 156702 },
  { product: "Polo T-Shirt", quantity: 87, amount: 69513 },
  { product: "Formal Pants", quantity: 76, amount: 114076 },
];

const purchaseByProduct = [
  { product: "Cotton Fabric", quantity: 500, amount: 125000 },
  { product: "Denim Material", quantity: 300, amount: 90000 },
  { product: "Silk Fabric", quantity: 150, amount: 75000 },
  { product: "Nylon", quantity: 200, amount: 40000 },
];

const salesByCustomer = [
  { customer: "Rahul Sharma", orders: 12, paid: 45000, unpaid: 4500 },
  { customer: "Priya Patel", orders: 8, paid: 28000, unpaid: 0 },
  { customer: "Amit Kumar", orders: 5, paid: 31000, unpaid: 6200 },
  { customer: "Neha Singh", orders: 15, paid: 52500, unpaid: 3150 },
];

const purchaseByVendor = [
  { vendor: "Fashion Hub Pvt Ltd", orders: 45, paid: 225000, unpaid: 15000 },
  { vendor: "Textile World", orders: 23, paid: 115000, unpaid: 0 },
  { vendor: "Fabric Plus", orders: 18, paid: 90000, unpaid: 8000 },
];

const chartData = [
  { name: "Jan", sales: 45000, purchases: 32000 },
  { name: "Feb", sales: 52000, purchases: 38000 },
  { name: "Mar", sales: 61000, purchases: 41000 },
  { name: "Apr", sales: 58000, purchases: 35000 },
  { name: "May", sales: 72000, purchases: 48000 },
  { name: "Jun", sales: 68000, purchases: 42000 },
];

const categoryData = [
  { name: "Men", value: 45 },
  { name: "Women", value: 35 },
  { name: "Children", value: 20 },
];

const COLORS = ["hsl(345, 98%, 60%)", "hsl(25, 95%, 55%)", "hsl(199, 89%, 48%)"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Sales and purchase analytics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
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
          <TabsTrigger value="purchases" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Purchases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales vs Purchases Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Sales vs Purchases</CardTitle>
                  <CardDescription>Monthly comparison</CardDescription>
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
                        <Bar dataKey="purchases" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
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
                  <div className="flex justify-center gap-6 mt-4">
                    {categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
                    {salesByProduct.map((item) => (
                      <TableRow key={item.product} className="border-border">
                        <TableCell className="font-medium text-foreground">{item.product}</TableCell>
                        <TableCell className="text-right text-foreground">{item.quantity}</TableCell>
                        <TableCell className="text-right text-foreground">₹{item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="sales-customers" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
                      <TableHead className="text-muted-foreground text-right">Unpaid Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesByCustomer.map((item) => (
                      <TableRow key={item.customer} className="border-border">
                        <TableCell className="font-medium text-foreground">{item.customer}</TableCell>
                        <TableCell className="text-right text-foreground">{item.orders}</TableCell>
                        <TableCell className="text-right text-success">₹{item.paid.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-destructive">₹{item.unpaid.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Purchase by Products</CardTitle>
                  <CardDescription>Product-wise purchase data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Product</TableHead>
                        <TableHead className="text-muted-foreground text-right">Qty</TableHead>
                        <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseByProduct.map((item) => (
                        <TableRow key={item.product} className="border-border">
                          <TableCell className="font-medium text-foreground">{item.product}</TableCell>
                          <TableCell className="text-right text-foreground">{item.quantity}</TableCell>
                          <TableCell className="text-right text-foreground">₹{item.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Purchase by Vendors</CardTitle>
                  <CardDescription>Vendor-wise purchase data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Vendor</TableHead>
                        <TableHead className="text-muted-foreground text-right">Orders</TableHead>
                        <TableHead className="text-muted-foreground text-right">Paid</TableHead>
                        <TableHead className="text-muted-foreground text-right">Unpaid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseByVendor.map((item) => (
                        <TableRow key={item.vendor} className="border-border">
                          <TableCell className="font-medium text-foreground">{item.vendor}</TableCell>
                          <TableCell className="text-right text-foreground">{item.orders}</TableCell>
                          <TableCell className="text-right text-success">₹{item.paid.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-destructive">₹{item.unpaid.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
