import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { getProductDisplayImage, getProductRating } from "@/lib/mockData";
import { QuickViewModal } from "./QuickViewModal";
import type { Product } from "@/lib/api/types";

interface ProductCardProps {
  id: string | number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image?: string;
  isNew?: boolean;
  isSale?: boolean;
  index?: number;
  product?: Product;
}

export function ProductCard({
  id,
  name,
  category,
  price,
  originalPrice,
  image,
  isNew,
  isSale,
  index = 0,
  product,
}: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const strId = String(id);
  const isWishlisted = isInWishlist(strId);
  const displayImage = getProductDisplayImage(image, category, name);
  const { rating, reviews } = getProductRating(strId);

  const calculatedOriginalPrice = originalPrice || Math.round(price * 1.3);
  const discount = Math.round((1 - price / calculatedOriginalPrice) * 100);

  const productObject: Product = product || {
    _id: strId,
    name,
    category,
    price,
    productType: "readymade",
    stockQuantity: 50,
    costPrice: null,
    sku: `SKU-${strId.slice(-4)}`,
    description: null,
    unit: "pcs",
    imageUrl: displayImage,
    isPublished: true,
    tags: [category],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: strId,
      name,
      category,
      price,
      originalPrice: calculatedOriginalPrice,
      size: "M",
      image: displayImage,
      quantity: 1,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productObject);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
        className="group relative bg-card border border-border/70 hover:border-primary/50 rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col"
      >
        {/* Image & Quick Action Overlay */}
        <div className="relative aspect-[3/4] bg-secondary/30 overflow-hidden">
          <Link to={`/product/${strId}`} className="block w-full h-full">
            <img
              src={displayImage}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            {discount > 0 && (
              <Badge className="bg-primary text-primary-foreground font-semibold px-2 py-0.5 text-xs shadow-md">
                -{discount}%
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-info text-info-foreground font-semibold px-2 py-0.5 text-xs shadow-md">
                NEW
              </Badge>
            )}
          </div>

          {/* Floating Actions on Top Right */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              className={`h-8 w-8 rounded-full shadow-md backdrop-blur-md transition-transform duration-200 ${
                isWishlisted
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/85 hover:bg-background text-foreground"
              }`}
              onClick={handleToggleWishlist}
              title="Save to Wishlist"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isWishlisted ? "fill-current text-primary-foreground" : "text-foreground"
                }`}
              />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-md backdrop-blur-md bg-background/85 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200"
              onClick={handleQuickView}
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Add To Cart Hover Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background/90 via-background/60 to-transparent">
            <Button
              className="w-full gap-2 shadow-lg h-9 font-medium text-xs"
              size="sm"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Details Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wide">
              <span>{category || "Apparel"}</span>
              <div className="flex items-center gap-1 text-amber-400 font-medium">
                <Star className="w-3 h-3 fill-amber-400" />
                <span className="text-[11px] text-foreground font-semibold">{rating}</span>
                <span className="text-[10px] text-muted-foreground">({reviews})</span>
              </div>
            </div>

            <Link to={`/product/${strId}`}>
              <h3 className="font-semibold text-foreground mt-1.5 text-sm line-clamp-1 hover:text-primary transition-colors">
                {name}
              </h3>
            </Link>
          </div>

          <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-border/40">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base text-foreground">
                ₹{price.toLocaleString()}
              </span>
              {calculatedOriginalPrice > price && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{calculatedOriginalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[11px] text-primary font-medium hover:underline cursor-pointer" onClick={handleQuickView}>
              Quick View
            </span>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal instance */}
      <QuickViewModal
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        product={productObject}
      />
    </>
  );
}
