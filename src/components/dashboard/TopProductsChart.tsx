import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Cotton Shirt", sales: 145 },
  { name: "Denim Jeans", sales: 132 },
  { name: "Kurta Set", sales: 98 },
  { name: "Polo T-Shirt", sales: 87 },
  { name: "Formal Pants", sales: 76 },
];

export function TopProductsChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card border border-border rounded-xl p-6 shadow-card"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Top Selling Products</h3>
        <p className="text-sm text-muted-foreground">This month's best performers</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Bar 
              dataKey="sales" 
              fill="url(#colorGradient)" 
              radius={[0, 4, 4, 0]} 
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(345, 98%, 60%)" />
                <stop offset="100%" stopColor="hsl(25, 95%, 55%)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
