import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  size: string;
}

const initialCartItems: CartItem[] = [
  { id: 1, name: "Premium Cotton Shirt", category: "Men", price: 1299, quantity: 2, size: "L" },
  { id: 2, name: "Slim Fit Denim Jeans", category: "Men", price: 1899, quantity: 1, size: "32" },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "FIRST20") {
      setAppliedCoupon("FIRST20");
      setCouponDiscount(20);
    } else if (couponCode.toUpperCase() === "SAVE10") {
      setAppliedCoupon("SAVE10");
      setCouponDiscount(10);
    } else {
      alert("Invalid coupon code");
    }
    setCouponCode("");
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * couponDiscount) / 100;
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal - discountAmount + shipping;

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
        <p className="text-muted-foreground mt-2">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
        </p>
      </motion.div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-4 flex gap-4"
              >
                <div className="w-24 h-24 bg-secondary rounded-lg flex items-center justify-center text-3xl shrink-0">
                  👕
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.category} • Size: {item.size}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-10 text-center text-foreground">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="font-semibold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24"
          >
            <h3 className="font-semibold text-lg text-foreground mb-4">Order Summary</h3>

            {/* Coupon Input */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-success/10 border border-success/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">{appliedCoupon}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-destructive" onClick={removeCoupon}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-secondary/50"
                  />
                  <Button variant="outline" onClick={applyCoupon}>Apply</Button>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Price Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-success">Discount ({couponDiscount}%)</span>
                  <span className="text-success">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-success">✓ Free shipping on orders above ₹999</p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-semibold text-lg mb-6">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">₹{total.toLocaleString()}</span>
            </div>

            <Link to="/checkout">
              <Button className="w-full gap-2" size="lg">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/shop">
              <Button variant="outline" className="w-full mt-3">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground mt-2">Looks like you haven't added any items yet.</p>
          <Link to="/shop">
            <Button className="mt-6 gap-2">
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
