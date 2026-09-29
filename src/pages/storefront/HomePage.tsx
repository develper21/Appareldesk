import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  Sparkles,
  Flame,
  Star,
  Quote,
  CheckCircle,
  Tag,
  ArrowUpRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/storefront/ProductCard";
import { productsApi } from "@/lib/api";
import { CATEGORY_IMAGES } from "@/lib/mockData";
import { toast } from "sonner";
import type { Product } from "@/lib/api/types";
import heroBanner from "@/assets/hero-banner.jpg";

const features = [
  { icon: Truck, title: "Free Express Shipping", description: "On all prepaid & COD orders above ₹999" },
  { icon: ShieldCheck, title: "100% Secure Checkout", description: "Bank-grade encrypted payments & UPI" },
  { icon: RefreshCw, title: "Hassle-Free 7-Day Returns", description: "Doorstep pickup & immediate refunds" },
  { icon: CreditCard, title: "Flexible Payment Modes", description: "UPI, Cards, NetBanking & COD available" },
];

const testimonials = [
  {
    name: "Vikram Malhotra",
    city: "Bangalore",
    rating: 5,
    comment:
      "The fabric quality on the luxury shirts exceeded all expectations. Stitching and fit are comparable to bespoke designer wear!",
    item: "Slim Fit Oxford Shirt",
  },
  {
    name: "Ananya Sharma",
    city: "Mumbai",
    rating: 5,
    comment:
      "Fast 2-day delivery to Mumbai. The color and drape of the silk blend dress is simply gorgeous. Already ordered 2 more!",
    item: "Floral Festive Dress",
  },
  {
    name: "Rajesh Kulkarni",
    city: "Pune",
    rating: 5,
    comment:
      "Smooth checkout, great customer support, and easy returns. ApparelDesk is now my go-to fashion store.",
    item: "Tailored Linen Blazer",
  },
];

export default function HomePage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: featured = [], isLoading } = useQuery({
    queryKey: ["featured_products"],
    queryFn: async () => {
      const res = await productsApi.listPublic({ limit: 8 });
      return res.items as Product[];
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Welcome aboard! Use coupon APPAREL20 to get 20% off your first order.");
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[640px] lg:h-[82vh] overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="ApparelDesk Fashion"
            className="w-full h-full object-cover object-center filter brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>

        <div className="container relative py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Festive Collection 2026 Live
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1]">
              Elevate Your <span className="text-gradient">Style & Elegance</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
              Explore meticulously crafted clothing designed for comfort, luxury, and durability.
              Handcrafted fabrics tailored to perfection at honest prices.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/shop">
                <Button size="lg" className="gap-2 h-12 px-6 font-semibold shadow-glow gradient-primary">
                  Explore Collection
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/shop?category=sale">
                <Button variant="outline" size="lg" className="h-12 px-6 font-semibold border-border hover:bg-secondary">
                  <Flame className="w-4 h-4 text-primary mr-2" />
                  View Sale Offers
                </Button>
              </Link>
            </div>

            {/* Quick stats on hero */}
            <div className="pt-6 border-t border-border/60 flex items-center gap-8 text-xs text-muted-foreground">
              <div>
                <p className="text-xl font-bold text-foreground">10k+</p>
                <p>Happy Shoppers</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-xl font-bold text-foreground">500+</p>
                <p>Curated Styles</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-xl font-bold text-foreground">4.9/5</p>
                <p>Customer Rating</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Guarantees Bar */}
      <section className="py-6 border-y border-border bg-card/60">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-secondary/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deal of the Day Flash Sale Banner */}
      <section className="py-12 bg-gradient-to-r from-card via-secondary/20 to-card border-b border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl border border-primary/20 bg-primary/5">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                <Flame className="w-4 h-4 text-primary fill-primary animate-bounce" /> Flash Deal of the Day
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Flat 20% OFF Everything + Free Delivery
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Apply discount voucher code <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">APPAREL20</span> at checkout.
              </p>
            </div>

            {/* Timer countdown boxes */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-xl font-bold text-foreground">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="text-[10px] text-muted-foreground uppercase">Hours</span>
              </div>
              <span className="text-xl font-bold text-muted-foreground">:</span>
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-xl font-bold text-foreground">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="text-[10px] text-muted-foreground uppercase">Mins</span>
              </div>
              <span className="text-xl font-bold text-muted-foreground">:</span>
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-card border border-border shadow-sm">
                <span className="text-xl font-bold text-primary">{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className="text-[10px] text-muted-foreground uppercase">Secs</span>
              </div>

              <Link to="/shop" className="ml-2">
                <Button className="h-14 px-6 text-sm font-semibold gradient-primary">
                  Claim Deal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real High-End Shop by Category (NO EMOJIS) */}
      <section className="py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Curated Collections
              </div>
              <h2 className="text-3xl font-bold text-foreground">Shop by Category</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Explore handpicked styles engineered for daily luxury and festive flair
              </p>
            </div>
            <Link to="/shop">
              <Button variant="outline" size="sm" className="gap-2">
                View All Categories <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Men's Collection",
                subtitle: "Shirts, Trousers & Casuals",
                image: CATEGORY_IMAGES.Men,
                category: "Men",
                tag: "Trending",
              },
              {
                name: "Women's Collection",
                subtitle: "Dresses, Tops & Festive",
                image: CATEGORY_IMAGES.Women,
                category: "Women",
                tag: "Bestseller",
              },
              {
                name: "Kids' Collection",
                subtitle: "Soft, Breathable & Trendy",
                image: CATEGORY_IMAGES.Children,
                category: "Children",
                tag: "New Arrivals",
              },
              {
                name: "Special Sale & Ethnic",
                subtitle: "Up to 50% Off Designer Picks",
                image: CATEGORY_IMAGES.Sale,
                category: "all",
                tag: "Hot Deal",
              },
            ].map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-card hover:shadow-elevated border border-border"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />

                <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-foreground font-semibold border border-border text-xs">
                  {cat.tag}
                </Badge>

                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">{cat.subtitle}</p>
                  <Link to={`/shop?category=${cat.category}`}>
                    <Button size="sm" variant="secondary" className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products from API */}
      <section className="py-16 bg-card/40 border-y border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Handpicked Picks
              </div>
              <h2 className="text-3xl font-bold text-foreground">Trending Products</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Top requested designs curated for the modern wardrobe
              </p>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="gap-2">
                Shop Full Catalog <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-muted-foreground text-sm">Loading catalog items...</p>
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
              <p className="text-muted-foreground">No products available at the moment. Please check back shortly!</p>
              <Link to="/shop">
                <Button className="mt-4">Browse All</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((product, index) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  category={product.category ?? ""}
                  price={product.price}
                  image={product.imageUrl ?? undefined}
                  index={index}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customer Testimonials & Reviews */}
      <section className="py-16">
        <div className="container">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Real Reviews From Verified Buyers
            </span>
            <h2 className="text-3xl font-bold text-foreground">Loved by Over 10,000+ Shoppers</h2>
            <p className="text-sm text-muted-foreground">
              See what our community has to say about their ApparelDesk experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-card hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-foreground/90 italic leading-relaxed">
                    "{item.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 mt-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.city}, India</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-success border-success/30 font-medium">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified Buyer
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup with Instant Coupon */}
      <section className="py-16 bg-gradient-to-b from-card to-background border-t border-border">
        <div className="container max-w-4xl">
          <div className="bg-card border border-primary/20 rounded-3xl p-8 sm:p-12 text-center shadow-elevated relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative space-y-4 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary">
                <Tag className="w-3.5 h-3.5" /> First Order Discount
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                Get 20% Off Your First Purchase
              </h2>

              <p className="text-sm text-muted-foreground">
                Subscribe to our insider club for exclusive flash sales, seasonal lookbooks, and VIP discount vouchers.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="h-12 bg-secondary/80 border-border text-sm flex-1 rounded-xl"
                  required
                />
                <Button type="submit" size="lg" className="h-12 px-8 font-semibold gradient-primary rounded-xl">
                  Unlock 20% Off
                </Button>
              </form>

              <p className="text-[11px] text-muted-foreground pt-1">
                Zero spam. You can unsubscribe at any time with 1-click.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
