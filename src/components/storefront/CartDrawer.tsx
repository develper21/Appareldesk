import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart";

const FREE_SHIPPING_THRESHOLD = 999;

export function CartDrawer() {
  const { items, totalCount, subtotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } =
    useCart();
  const navigate = useNavigate();

  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate("/cart");
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b border-border bg-card">
          <SheetTitle className="flex items-center justify-between text-base font-semibold">
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Your Cart ({totalCount})
            </span>
          </SheetTitle>

          {/* Free Shipping Meter */}
          <div className="pt-2 text-xs">
            {remainingForFree > 0 ? (
              <p className="text-muted-foreground mb-1.5">
                Add <span className="font-semibold text-primary">₹{remainingForFree.toLocaleString()}</span> more for <span className="text-success font-medium">FREE Express Delivery</span>!
              </p>
            ) : (
              <p className="text-success font-medium flex items-center gap-1 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Congratulations! You unlocked Free Shipping!
              </p>
            )}
            <Progress value={progress} className="h-1.5" />
          </div>
        </SheetHeader>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Looks like you haven't added anything to your cart yet. Explore our latest fashion drops!
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate("/shop");
                }}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="flex gap-3 bg-card/60 border border-border/80 rounded-xl p-3 hover:border-border transition-colors"
              >
                <div className="w-18 h-20 w-16 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border/50">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-medium text-sm text-foreground truncate max-w-[170px]">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Size: <span className="font-semibold text-foreground">{item.size}</span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id, item.size)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-md bg-secondary/30">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-none p-0"
                        onClick={() => updateQuantity(item.id, -1, item.size)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-none p-0"
                        onClick={() => updateQuantity(item.id, 1, item.size)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border bg-card/90 backdrop-blur space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Estimated Shipping</span>
                <span className={remainingForFree === 0 ? "text-success font-medium" : "text-foreground"}>
                  {remainingForFree === 0 ? "FREE" : "₹99"}
                </span>
              </div>
            </div>

            <Button
              className="w-full gap-2 shadow-lg"
              size="lg"
              onClick={handleCheckoutClick}
            >
              Checkout • ₹{(subtotal + (remainingForFree === 0 ? 0 : 99)).toLocaleString()}
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => setIsCartOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
