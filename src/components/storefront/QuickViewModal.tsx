import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingBag, Truck, RefreshCw, Shield, Check, Plus, Minus } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { getProductDisplayImage, getProductRating } from "@/lib/mockData";
import type { Product } from "@/lib/api/types";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"];

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!product) return null;

  const id = product._id || product.id || "";
  const img = getProductDisplayImage(product.imageUrl, product.category, product.name);
  const { rating, reviews } = getProductRating(id);
  const isWishlisted = isInWishlist(id);
  const originalPrice = Math.round(product.price * 1.35);
  const discountPercent = Math.round((1 - product.price / originalPrice) * 100);

  const handleAddToCart = () => {
    addToCart({
      id,
      name: product.name,
      category: product.category || "Apparel",
      price: product.price,
      originalPrice,
      size: selectedSize,
      image: img,
      quantity,
    });
    onClose();
  };

  const handleBuyNow = () => {
    addToCart({
      id,
      name: product.name,
      category: product.category || "Apparel",
      price: product.price,
      originalPrice,
      size: selectedSize,
      image: img,
      quantity,
    });
    onClose();
    navigate("/cart");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border sm:rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Column */}
          <div className="relative aspect-[3/4] md:aspect-auto md:h-full bg-secondary/50">
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-semibold px-2.5 py-1">
                {discountPercent}% OFF
              </Badge>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full shadow-md backdrop-blur-md bg-background/80"
              onClick={() => toggleWishlist(product)}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "text-primary fill-primary" : "text-foreground"}`} />
            </Button>
          </div>

          {/* Details Column */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider mb-1">
                <span>{product.category || "Apparel"}</span>
                <span className="text-success font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock ({product.stockQuantity || 45})
                </span>
              </div>

              <h2 className="text-xl font-bold text-foreground leading-snug">{product.name}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-foreground">{rating}</span>
                <span className="text-xs text-muted-foreground">({reviews} customer reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded">
                  Save ₹{(originalPrice - product.price).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                {product.description ||
                  "Crafted with ultra-comfortable premium fabrics tailored for an impeccable fit and elevated everyday luxury. Breathable, pre-shrunk, and durable."}
              </p>

              {/* Size Selector */}
              <div className="mt-4">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-medium text-foreground">Select Size:</span>
                  <span className="text-primary hover:underline cursor-pointer">Size Guide</span>
                </div>
                <div className="flex gap-2">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`h-9 w-10 rounded-lg text-xs font-semibold border transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-border bg-secondary/50 text-foreground hover:border-primary/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg bg-secondary/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-xs font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="gap-2" onClick={handleAddToCart}>
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </Button>
                <Button className="gap-2" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </div>

              {/* Perks */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-[11px] text-muted-foreground text-center">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-primary" />
                  <span>7-Day Return</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>100% Genuine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
