import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image?: string;
  isNew?: boolean;
  isSale?: boolean;
  index?: number;
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
  index = 0 
}: ProductCardProps) {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-card border border-border rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <span className="text-4xl">👕</span>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-info text-info-foreground">New</Badge>
          )}
          {isSale && discount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">-{discount}%</Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full shadow-lg">
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Add to Cart */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
          <Button className="w-full gap-2" size="sm">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{category}</p>
        <h3 className="font-medium text-foreground mt-1 line-clamp-2">{name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-lg text-foreground">₹{price.toLocaleString()}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
