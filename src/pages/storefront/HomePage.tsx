import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Shield, RefreshCw, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { productsApi } from "@/lib/api";
import type { Product } from "@/lib/api/types";
import heroBanner from "@/assets/hero-banner.jpg";

const features = [
  { icon: Truck, title: "Free Shipping", description: "On orders above ₹999" },
  { icon: Shield, title: "Secure Payment", description: "100% secure checkout" },
  { icon: RefreshCw, title: "Easy Returns", description: "7 days return policy" },
  { icon: CreditCard, title: "COD Available", description: "Cash on delivery" },
];

export default function HomePage() {
  const { data: featured = [] } = useQuery({
    queryKey: ["featured_products"],
    queryFn: async () => {
      const res = await productsApi.listPublic({ limit: 8 });
      return res.items as Product[];
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Fashion Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <span className="text-primary font-medium">New Collection 2026</span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mt-2 leading-tight">
              Elevate Your <span className="text-gradient">Style</span>
            </h1>
            <p className="text-muted-foreground text-lg mt-4">
              Discover our premium collection of clothing designed for comfort and elegance.
              Quality fabrics, trendy designs at affordable prices.
            </p>
            <div className="flex gap-4 mt-8">
              <Link to="/shop">
                <Button size="lg" className="gap-2">
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/shop?sale=true">
                <Button variant="outline" size="lg">
                  View Sale
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 border-b border-border bg-card">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products from API */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="text-muted-foreground mt-2">Handpicked picks from our latest collection</p>
          </motion.div>

          {featured.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No products available yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product, index) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  category={product.category ?? ""}
                  price={product.price}
                  image={product.imageUrl ?? undefined}
                  index={index}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/shop">
              <Button variant="outline" size="lg" className="gap-2">
                View All Products
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-card">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground">Shop by Category</h2>
            <p className="text-muted-foreground mt-2">Explore our curated collections</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Men's Collection", emoji: "👔", category: "Men" },
              { name: "Women's Collection", emoji: "👗", category: "Women" },
              { name: "Kids' Collection", emoji: "🧒", category: "Children" },
              { name: "Sale Items", emoji: "🏷️", category: "all" },
            ].map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/shop?category=${category.category}`}>
                  <div className="bg-background border border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                    <div className="text-5xl mb-4">{category.emoji}</div>
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Shop now →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
