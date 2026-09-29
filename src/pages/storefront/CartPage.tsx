import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Check,
  CreditCard,
  QrCode,
  Truck,
  Building,
  Sparkles,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { discountsApi, ordersApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Address states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    line1: "42 Park View Avenue",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Discount calculation
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const discountAmount = Math.min(couponDiscount, subtotal);
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    setIsApplyingCoupon(true);
    try {
      // First try backend API
      const preview = await discountsApi.preview(code, subtotal || 1);
      setAppliedCoupon(preview.code);
      setCouponDiscount(preview.discountAmount);
      toast.success(`Coupon "${preview.code}" applied! You saved ₹${preview.discountAmount}`);
    } catch {
      // Local fallback for demo coupons
      if (code === "APPAREL20") {
        const discount = Math.round(subtotal * 0.2);
        setAppliedCoupon("APPAREL20");
        setCouponDiscount(discount);
        toast.success(`Coupon "APPAREL20" applied! You saved ₹${discount}`);
      } else if (code === "WELCOME10") {
        const discount = Math.round(subtotal * 0.1);
        setAppliedCoupon("WELCOME10");
        setCouponDiscount(discount);
        toast.success(`Coupon "WELCOME10" applied! You saved ₹${discount}`);
      } else if (code === "SAVE500") {
        const discount = Math.min(500, subtotal);
        setAppliedCoupon("SAVE500");
        setCouponDiscount(discount);
        toast.success(`Coupon "SAVE500" applied! You saved ₹${discount}`);
      } else {
        toast.error("Invalid coupon code or expired");
      }
    } finally {
      setIsApplyingCoupon(false);
      setCouponCode("");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    toast.info("Coupon removed");
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.info("Please sign in or create an account to place your order.");
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.line1) {
      toast.error("Please fill in your delivery contact name, phone, and address.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const order = await ordersApi.checkout({
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        couponCode: appliedCoupon ?? undefined,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          line1: shippingAddress.line1,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          paymentMethod,
        },
      });

      toast.success(`Order Placed! Order #${order.orderNumber} confirmed.`);
      clearCart();
      navigate("/my-orders");
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "Failed to process order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="w-20 h-20 rounded-full bg-secondary/80 flex items-center justify-center mx-auto text-muted-foreground">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Looks like you haven't added any luxury clothing pieces to your cart yet. Discover our fresh arrivals!
          </p>
          <Link to="/shop" className="inline-block pt-2">
            <Button size="lg" className="gap-2 gradient-primary">
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Shopping Bag & Checkout</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review your items, apply vouchers, and confirm your delivery details
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Columns: Items & Address & Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cart Items List */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Items in Cart ({items.length})
              </h3>
              <span className="text-xs text-muted-foreground">Free returns within 7 days</span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="flex gap-4 p-3 rounded-xl bg-secondary/20 border border-border/60 hover:border-border transition-colors"
                >
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80"}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg border border-border/50 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Category: {item.category} • Size: <span className="font-semibold text-foreground">{item.size}</span>
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeFromCart(item.id, item.size)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
                      <div className="flex items-center border border-border rounded-lg bg-card">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-none"
                          onClick={() => updateQuantity(item.id, -1, item.size)}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-none"
                          onClick={() => updateQuantity(item.id, 1, item.size)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <span className="font-bold text-sm text-foreground">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Shipping Address */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 pb-3 border-b border-border">
              <MapPin className="w-4 h-4 text-primary" /> Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="bg-secondary/40 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone Number</Label>
                <Input
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="bg-secondary/40 text-xs"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs">Street Address / House No.</Label>
                <Input
                  value={shippingAddress.line1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                  placeholder="e.g. 102, Blossom Apartments, Linking Road"
                  className="bg-secondary/40 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">City</Label>
                <Input
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="bg-secondary/40 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Postal Pincode</Label>
                <Input
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                  className="bg-secondary/40 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 pb-3 border-b border-border">
              <CreditCard className="w-4 h-4 text-primary" /> Select Payment Method
            </h3>

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="upi" id="pay-upi" />
                  <div>
                    <span className="font-semibold text-xs text-foreground block">UPI / QR Payment</span>
                    <span className="text-[11px] text-muted-foreground">Google Pay, PhonePe, Paytm, BHIM</span>
                  </div>
                </div>
                <QrCode className="w-5 h-5 text-primary" />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="card" id="pay-card" />
                  <div>
                    <span className="font-semibold text-xs text-foreground block">Credit / Debit Card</span>
                    <span className="text-[11px] text-muted-foreground">Visa, Mastercard, RuPay, Amex</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-primary" />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="netbanking" id="pay-nb" />
                  <div>
                    <span className="font-semibold text-xs text-foreground block">Net Banking</span>
                    <span className="text-[11px] text-muted-foreground">All major Indian banks supported</span>
                  </div>
                </div>
                <Building className="w-5 h-5 text-primary" />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="cod" id="pay-cod" />
                  <div>
                    <span className="font-semibold text-xs text-foreground block">Cash On Delivery (COD)</span>
                    <span className="text-[11px] text-muted-foreground">Pay with cash or UPI at your doorstep</span>
                  </div>
                </div>
                <Truck className="w-5 h-5 text-primary" />
              </label>
            </RadioGroup>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon & Checkout CTA */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card sticky top-24 space-y-5">
            <h3 className="font-bold text-base text-foreground">Order Summary</h3>

            {/* Coupons Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" /> Discount Coupon
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-success/10 border border-success/30">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span className="font-mono text-xs font-bold text-success">{appliedCoupon}</span>
                    <span className="text-[11px] text-success">(-₹{discountAmount})</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive px-2" onClick={removeCoupon}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="h-9 text-xs bg-secondary/40 font-mono uppercase"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => handleApplyCoupon()}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
              )}

              {/* Quick Preset Coupons */}
              {!appliedCoupon && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:border-primary text-[10px] py-0.5"
                    onClick={() => handleApplyCoupon("APPAREL20")}
                  >
                    APPAREL20 (20% OFF)
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:border-primary text-[10px] py-0.5"
                    onClick={() => handleApplyCoupon("WELCOME10")}
                  >
                    WELCOME10 (10% OFF)
                  </Badge>
                </div>
              )}
            </div>

            <Separator className="my-2" />

            {/* Price Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-semibold text-foreground">₹{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-success font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fee</span>
                <span className={shipping === 0 ? "text-success font-semibold" : "text-foreground"}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>

              {shipping === 0 && (
                <p className="text-[11px] text-success">✓ You qualified for Free Express Shipping</p>
              )}
            </div>

            <Separator className="my-2" />

            {/* Grand Total */}
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="font-bold text-base text-foreground block">Total Amount</span>
                <span className="text-[10px] text-muted-foreground">Inclusive of all taxes</span>
              </div>
              <span className="font-extrabold text-2xl text-foreground">
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Place Order CTA */}
            <Button
              size="lg"
              className="w-full h-12 text-sm font-semibold gap-2 gradient-primary shadow-lg"
              onClick={handleCheckout}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? "Confirming Order..." : "Confirm & Place Order"}
              {!isPlacingOrder && <ArrowRight className="w-4 h-4" />}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center pt-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
