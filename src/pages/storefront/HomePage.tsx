import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Shield, RefreshCw, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import heroBanner from "@/assets/hero-banner.jpg";

const featuredProducts = [
  { id: 1, name: "Premium Cotton Shirt", category: "Men", price: 1299, originalPrice: 1599, isNew: true },
  { id: 2, name: "Slim Fit Denim Jeans", category: "Men", price: 1899, isSale: true, originalPrice: 2499 },
  { id: 3, name: "Floral Print Kurta", category: "Women", price: 1599, isNew: true },
  { id: 4, name: "Kids Casual T-Shirt", category: "Children", price: 499, originalPrice: 699, isSale: true },
  { id: 5, name: "Formal Blazer", category: "Men", price: 3999 },
  { id: 6, name: "Embroidered Saree", category: "Women", price: 5999, isNew: true },
  { id: 7, name: "Sports Track Pants", category: "Men", price: 899, originalPrice: 1199, isSale: true },
  { id: 8, name: "Designer Lehenga", category: "Women", price: 12999 },
];

const categories = [
  { name: "Men's Collection", count: 156, emoji: "👔" },
  { name: "Women's Collection", count: 189, emoji: "👗" },
  { name: "Kids' Collection", count: 87, emoji: "🧒" },
  { name: "Accessories", count: 45, emoji: "👜" },
];

const features = [
  { icon: Truck, title: "Free Shipping", description: "On orders above ₹999" },
  { icon: Shield, title: "Secure Payment", description: "100% secure checkout" },
  { icon: RefreshCw, title: "Easy Returns", description: "7 days return policy" },
  { icon: CreditCard, title: "COD Available", description: "Cash on delivery" },
];

export default function HomePage() {
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

      {/* Categories */}
      <section className="py-16">
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
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={`/shop?category=${category.name.split("'")[0].toLowerCase()}`}
                  className="block bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 hover:shadow-glow transition-all duration-300 group"
                >
                  <span className="text-5xl">{category.emoji}</span>
                  <h3 className="font-semibold text-foreground mt-4">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} items</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
              <p className="text-muted-foreground mt-2">Handpicked styles just for you</p>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} {...product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden gradient-hero p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Get 20% Off Your First Order
              </h2>
              <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
                Sign up for our newsletter and receive an exclusive discount code for your first purchase.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
