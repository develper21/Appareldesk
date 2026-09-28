import { ShoppingCart, Package, Users, IndianRupee, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { dashboardApi } from "@/lib/api";
import { refName } from "@/lib/api/types";
import type { Order } from "@/lib/api/types";
import type { TopProduct } from "@/lib/api";

const fmt = (n: number) => `₹${n.toLocaleString()}`;

export default function DashboardHome() {
  const { data: stats } = useQuery({ queryKey: ["dashboard_stats"], queryFn: dashboardApi.stats });
  const { data: recentOrders = [] } = useQuery({ queryKey: ["dashboard_recent"], queryFn: () => dashboardApi.recentOrders(5) });
  const { data: topProducts = [] } = useQuery({ queryKey: ["dashboard_top"], queryFn: () => dashboardApi.topProducts(5) });

  const orders: Order[] = recentOrders;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            Download Report
          </Button>
          <Button variant="default" className="gap-2">
            <ArrowUpRight className="w-4 h-4" />
            Quick Actions
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={stats ? fmt(stats.totalRevenue) : "—"}
          change={stats ? `${stats.ordersLast30Days} orders in last 30 days` : "Loading..."}
          changeType="neutral"
          icon={IndianRupee}
          index={0}
        />
        <StatsCard
          title="Total Orders"
          value={stats ? stats.totalOrders.toLocaleString() : "—"}
          change="All time"
          changeType="neutral"
          icon={ShoppingCart}
          index={1}
        />
        <StatsCard
          title="Total Products"
          value={stats ? stats.totalProducts.toLocaleString() : "—"}
          change="In catalog"
          changeType="neutral"
          icon={Package}
          index={2}
        />
        <StatsCard
          title="Active Customers"
          value={stats ? stats.totalCustomers.toLocaleString() : "—"}
          change="Registered contacts"
          changeType="neutral"
          icon={Users}
          index={3}
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable
          orders={orders.map((o) => ({
            id: o.orderNumber,
            customer:
              (typeof o.customerId === "object" && o.customerId?.name) ||
              (typeof o.userId === "object" && o.userId?.name) ||
              "—",
            amount: `₹${o.totalAmount.toLocaleString()}`,
            status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
            date: new Date(o.createdAt).toLocaleDateString(),
          }))}
        />
        <TopProductsChart
          data={topProducts.map((p) => ({ name: p.name, quantity: p.quantity, amount: p.amount }))}
        />
      </div>
    </div>
  );
}
