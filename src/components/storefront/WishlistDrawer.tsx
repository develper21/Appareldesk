import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { getProductDisplayImage } from "@/lib/mockData";
import type { Product } from "@/lib/api/types";

export function WishlistDrawer() {
  const { wishlist, wishlistCount, isWishlistOpen, setIsWishlistOpen, removeFromWishlist, clearWishlist } =
    useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (item: Product) => {
    const img = getProductDisplayImage(item.imageUrl, item.category, item.name);
    addToCart({
      id: item._id || item.id,
      name: item.name,
      category: item.category || "Apparel",
      price: item.price,
      originalPrice: item.price * 1.25,
      size: "M",
      image: img,
      quantity: 1,
    });
    removeFromWishlist(item._id || item.id);
  };

  return (
    <Sheet open={isWishlistOpen} onOpenChange={setIsWishlistOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b border-border bg-card">
          <SheetTitle className="flex items-center justify-between text-base font-semibold">
            <span className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              Saved Wishlist ({wishlistCount})
            </span>
            {wishlistCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
                onClick={clearWishlist}
              >
                Clear all
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">Your wishlist is empty</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Tap the heart on any item you love to save it for later or track sales!
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setIsWishlistOpen(false);
                  navigate("/shop");
                }}
              >
                Explore Catalog
              </Button>
            </div>
          ) : (
            wishlist.map((item) => {
              const id = item._id || item.id;
              const img = getProductDisplayImage(item.imageUrl, item.category, item.name);
              return (
                <div
                  key={id}
                  className="flex gap-3 bg-card/60 border border-border/80 rounded-xl p-3 hover:border-border transition-colors"
                >
                  <div className="w-16 h-20 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border/50">
                    <img src={img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-medium text-sm text-foreground truncate max-w-[170px]">
                          {item.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromWishlist(id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.category || "Apparel"}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-foreground">
                        ₹{item.price.toLocaleString()}
                      </span>
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-medium"
                        onClick={() => handleMoveToCart(item)}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Move to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {wishlist.length > 0 && (
          <div className="p-4 border-t border-border bg-card/90">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                setIsWishlistOpen(false);
                navigate("/shop");
              }}
            >
              Continue Browsing
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
