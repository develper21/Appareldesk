import { ShoppingCart, Package, Users, IndianRupee, TrendingUp, ArrowUpRight } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function DashboardHome() {
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
          value="₹2,45,890"
          change="+12.5% from last month"
          changeType="positive"
          icon={IndianRupee}
          index={0}
        />
        <StatsCard
          title="Total Orders"
          value="1,247"
          change="+8.2% from last month"
          changeType="positive"
          icon={ShoppingCart}
          index={1}
        />
        <StatsCard
          title="Total Products"
          value="386"
          change="24 published this week"
          changeType="neutral"
          icon={Package}
          index={2}
        />
        <StatsCard
          title="Active Customers"
          value="892"
          change="+15.3% from last month"
          changeType="positive"
          icon={Users}
          index={3}
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable />
        <TopProductsChart />
      </div>
    </div>
  );
}
