import { Link } from "react-router-dom";
import { ShoppingBag, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function StorefrontFooter() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">ApparelDesk</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Premium clothing for everyone. Quality fabrics, trendy designs, and affordable prices.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-muted-foreground hover:text-primary text-sm">Shop All</Link></li>
              <li><Link to="/shop?category=men" className="text-muted-foreground hover:text-primary text-sm">Men's Collection</Link></li>
              <li><Link to="/shop?category=women" className="text-muted-foreground hover:text-primary text-sm">Women's Collection</Link></li>
              <li><Link to="/shop?category=children" className="text-muted-foreground hover:text-primary text-sm">Kids' Collection</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                support@appareldesk.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                123 Fashion Street, Mumbai, India
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Newsletter</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to get updates on new arrivals and offers.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Your email" className="bg-secondary/50" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2026 ApparelDesk. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
