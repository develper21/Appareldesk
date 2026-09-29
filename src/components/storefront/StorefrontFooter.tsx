import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  ShieldCheck,
  Truck,
  RefreshCw,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function StorefrontFooter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Subscribed successfully! Check your inbox for exclusive offers.");
    setEmail("");
  };

  return (
    <footer className="bg-card border-t border-border mt-20">
      {/* Guarantees Strip */}
      <div className="border-b border-border/60 py-6 bg-secondary/20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Truck className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">Free Delivery</p>
                <p className="text-[11px] text-muted-foreground">Orders above ₹999</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <RefreshCw className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">7 Days Easy Return</p>
                <p className="text-[11px] text-muted-foreground">Instant refund & pickup</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">100% Genuine</p>
                <p className="text-[11px] text-muted-foreground">Direct from verified makers</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Lock className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">Secure Payments</p>
                <p className="text-[11px] text-muted-foreground">256-bit SSL encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">
                Apparel<span className="text-gradient">Desk</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
              Discover timeless elegance and contemporary aesthetics. From everyday essential cottons to handcrafted festive ensembles, ApparelDesk delivers high fashion directly to your doorstep.
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Categories</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/shop" className="hover:text-primary transition-colors">All Clothing</Link>
              </li>
              <li>
                <Link to="/shop?category=Men" className="hover:text-primary transition-colors">Men's Apparel</Link>
              </li>
              <li>
                <Link to="/shop?category=Women" className="hover:text-primary transition-colors">Women's Collection</Link>
              </li>
              <li>
                <Link to="/shop?category=Children" className="hover:text-primary transition-colors">Kids & Teens</Link>
              </li>
              <li>
                <Link to="/shop?category=sale" className="hover:text-primary transition-colors text-primary font-medium">Sale & Offers</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Customer Care</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/cart" className="hover:text-primary transition-colors">View Cart</Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-primary transition-colors">Track Orders</Link>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Shipping Policy</span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Returns & Exchanges</span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">Privacy & Terms</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-4">Stay Connected</h4>
            <p className="text-muted-foreground text-xs mb-3">
              Subscribe to unlock flash sales & VIP invitations.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 bg-secondary/50 text-xs"
              />
              <Button type="submit" size="sm" className="w-full text-xs font-semibold gradient-primary">
                Join VIP Club
              </Button>
            </form>
          </div>
        </div>

        {/* Payment Methods and Copyright */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 ApparelDesk Fashion Technologies Pvt. Ltd. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <span className="text-[11px]">Accepted Payments:</span>
            <div className="flex items-center gap-1.5 font-semibold text-[10px] text-foreground/80">
              <span className="px-2 py-0.5 rounded bg-secondary border border-border">UPI</span>
              <span className="px-2 py-0.5 rounded bg-secondary border border-border">VISA</span>
              <span className="px-2 py-0.5 rounded bg-secondary border border-border">Mastercard</span>
              <span className="px-2 py-0.5 rounded bg-secondary border border-border">RuPay</span>
              <span className="px-2 py-0.5 rounded bg-secondary border border-border">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
