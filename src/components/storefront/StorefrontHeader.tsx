import { Link } from "react-router-dom";
import { ShoppingBag, User, Search, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function StorefrontHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">ApparelDesk</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/shop" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Shop
          </Link>
          <Link to="/shop?category=men" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Men
          </Link>
          <Link to="/shop?category=women" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Women
          </Link>
          <Link to="/shop?category=children" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Kids
          </Link>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 w-64 bg-secondary/50 border-border"
            />
          </div>

          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Heart className="w-5 h-5" />
          </Button>

          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                2
              </Badge>
            </Button>
          </Link>

          <Link to="/login" className="hidden md:block">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              Login
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-lg font-medium text-foreground">Home</Link>
                <Link to="/shop" className="text-lg font-medium text-muted-foreground">Shop</Link>
                <Link to="/shop?category=men" className="text-lg font-medium text-muted-foreground">Men</Link>
                <Link to="/shop?category=women" className="text-lg font-medium text-muted-foreground">Women</Link>
                <Link to="/shop?category=children" className="text-lg font-medium text-muted-foreground">Kids</Link>
                <hr className="border-border" />
                <Link to="/login" className="text-lg font-medium text-primary">Login</Link>
                <Link to="/register" className="text-lg font-medium text-muted-foreground">Register</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
