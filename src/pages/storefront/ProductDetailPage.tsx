import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  RefreshCw,
  Shield,
  CheckCircle2,
  ChevronRight,
  Share2,
  Plus,
  Minus,
  Sparkles,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { productsApi } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { getProductDisplayImage, getProductRating } from "@/lib/mockData";
import { ProductCard } from "@/components/storefront/ProductCard";
import { toast } from "sonner";
import type { Product } from "@/lib/api/types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        return await productsApi.get(id);
      } catch {
        // Fallback for public demo
        const list = await productsApi.listPublic({ limit: 50 });
        return list.items.find((p) => p._id === id || p.id === id) || null;
      }
    },
    enabled: !!id,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related_products", product?.category],
    queryFn: async () => {
      const res = await productsApi.listPublic({ limit: 4 });
      return (res.items as Product[]).filter((p) => p._id !== id);
    },
    enabled: !!product,
  });

  if (isLoading) {
    return (
      <div className="container py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Product Not Found</h2>
        <p className="text-muted-foreground">The product you are looking for is not available or has been removed.</p>
        <Link to="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const productId = product._id || product.id || "";
  const displayImage = getProductDisplayImage(product.imageUrl, product.category, product.name);
  const { rating, reviews } = getProductRating(productId);
  const isWishlisted = isInWishlist(productId);

  const originalPrice = Math.round(product.price * 1.35);
  const discountPercent = Math.round((1 - product.price / originalPrice) * 100);

  const handleAddToCart = () => {
    addToCart({
      id: productId,
      name: product.name,
      category: product.category || "Apparel",
      price: product.price,
      originalPrice,
      size: selectedSize,
      image: displayImage,
      quantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const checkDelivery = () => {
    if (pincode.trim().length === 6) {
      setPincodeStatus("Delivery available! Expected delivery in 2-3 business days.");
    } else {
      setPincodeStatus("Please enter a valid 6-digit postal code.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <div className="container py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-1">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${product.category}`} className="hover:text-primary transition-colors">
          {product.category || "Apparel"}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="relative aspect-[3/4] bg-secondary/30 rounded-2xl overflow-hidden border border-border/80 shadow-card">
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-semibold px-3 py-1 text-sm shadow-md">
                SAVE {discountPercent}%
              </Badge>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full shadow-md backdrop-blur-md bg-background/80 hover:bg-background"
                onClick={handleShare}
                title="Share"
              >
                <Share2 className="w-4 h-4 text-foreground" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className={`h-10 w-10 rounded-full shadow-md backdrop-blur-md transition-colors ${
                  isWishlisted ? "bg-primary text-primary-foreground" : "bg-background/80 hover:bg-background text-foreground"
                }`}
                onClick={() => toggleWishlist(product)}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Product Details & Purchase Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-primary border-primary/30 uppercase text-[11px] tracking-wider font-semibold">
                {product.category || "Premium Apparel"}
              </Badge>
              <span className="text-xs text-muted-foreground">SKU: {product.sku || `AD-${productId.slice(-6)}`}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-snug">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">{rating}</span>
              <span className="text-sm text-muted-foreground">({reviews} customer reviews)</span>
              <span className="text-xs text-success font-medium flex items-center gap-1 ml-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Store
              </span>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-4 mt-5 p-4 rounded-xl bg-card border border-border">
              <span className="text-3xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
              <span className="text-base text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
              <Badge className="bg-success/15 text-success border border-success/30 font-semibold">
                Save ₹{(originalPrice - product.price).toLocaleString()} ({discountPercent}% OFF)
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description ||
              "Engineered from high-grade luxury combed cotton with breathable weave technology. Designed for enduring elegance, unmatched all-day comfort, and tailored fit."}
          </p>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-foreground">Select Size:</span>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Size Guide
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Standard Size Guide (Inches)</DialogTitle>
                  </DialogHeader>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-xs text-left border border-border">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="p-2 border-b border-border">Size</th>
                          <th className="p-2 border-b border-border">Chest</th>
                          <th className="p-2 border-b border-border">Waist</th>
                          <th className="p-2 border-b border-border">Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-2 font-semibold">S</td><td className="p-2">38</td><td className="p-2">30</td><td className="p-2">27</td></tr>
                        <tr><td className="p-2 font-semibold">M</td><td className="p-2">40</td><td className="p-2">32</td><td className="p-2">28</td></tr>
                        <tr><td className="p-2 font-semibold">L</td><td className="p-2">42</td><td className="p-2">34</td><td className="p-2">29</td></tr>
                        <tr><td className="p-2 font-semibold">XL</td><td className="p-2">44</td><td className="p-2">36</td><td className="p-2">30</td></tr>
                        <tr><td className="p-2 font-semibold">XXL</td><td className="p-2">46</td><td className="p-2">38</td><td className="p-2">31</td></tr>
                      </tbody>
                    </table>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`h-11 w-12 rounded-xl text-sm font-semibold border transition-all ${
                    selectedSize === size
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary"
                      : "border-border bg-secondary/40 text-foreground hover:border-primary/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-foreground">Quantity:</span>
            <div className="flex items-center border border-border rounded-xl bg-secondary/40">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              {product.stockQuantity > 0 ? `(${product.stockQuantity} items in stock)` : "Low Stock"}
            </span>
          </div>

          {/* Action CTA Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 h-12 text-sm font-semibold shadow-sm"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              className="h-12 text-sm font-semibold shadow-lg gradient-primary text-primary-foreground hover:opacity-95"
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
          </div>

          {/* Pincode checker */}
          <div className="p-4 bg-secondary/30 border border-border/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <MapPin className="w-4 h-4 text-primary" /> Check Delivery & COD Availability
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="bg-background text-sm max-w-xs"
              />
              <Button variant="secondary" onClick={checkDelivery} size="sm">
                Check
              </Button>
            </div>
            {pincodeStatus && (
              <p className="text-xs font-medium text-primary mt-1">{pincodeStatus}</p>
            )}
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 py-4 border-y border-border text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Free Delivery</span>
              <span className="text-[11px]">Orders over ₹999</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RefreshCw className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">7 Days Return</span>
              <span className="text-[11px]">No questions asked</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">100% Genuine</span>
              <span className="text-[11px]">Direct from maker</span>
            </div>
          </div>

          {/* Accordion Specs */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm font-semibold">Material & Fabric Specs</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-2">
                <p>• 100% Ultra-combed breathable cotton</p>
                <p>• 220 GSM heavyweight durable weave</p>
                <p>• Bio-washed for extra softness and zero shrinkage</p>
                <p>• Reinforced double-needle stitching</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm font-semibold">Wash & Care Instructions</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-2">
                <p>• Machine wash cold inside out with similar colors</p>
                <p>• Do not bleach or use heavy detergents</p>
                <p>• Tumble dry low or line dry in shade</p>
                <p>• Warm iron if needed, do not iron on prints</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">You May Also Like</h2>
              <p className="text-xs text-muted-foreground mt-1">Handpicked matching items from this collection</p>
            </div>
            <Link to="/shop">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p, idx) => (
              <ProductCard
                key={p._id}
                id={p._id}
                name={p.name}
                category={p.category ?? ""}
                price={p.price}
                image={p.imageUrl ?? undefined}
                index={idx}
                product={p}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
