import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  User as UserIcon,
  Search,
  Heart,
  Menu,
  ShieldCheck,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Package,
  X,
  ChevronDown,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { productsApi } from "@/lib/api";
import { getProductDisplayImage } from "@/lib/mockData";
import type { Product } from "@/lib/api/types";

export function StorefrontHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Search debounce and fetch
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productsApi.listPublic({ search: searchTerm.trim(), limit: 5 });
        setSearchResults(res.items);
        setShowSearchDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSearchDropdown(false);
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const initials = (user?.name ?? "AD")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "All Shop", path: "/shop" },
    { label: "Men", path: "/shop?category=Men" },
    { label: "Women", path: "/shop?category=Women" },
    { label: "Kids", path: "/shop?category=Children" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full shadow-sm">
      {/* Top Banner Announcement */}
      <div className="bg-primary px-4 py-1.5 text-center text-xs font-medium text-primary-foreground flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>
          Mega Season Sale: Use coupon <strong className="font-bold underline">APPAREL20</strong> for 20% OFF | Free Express Delivery across India
        </span>
      </div>

      {/* Main Header */}
      <header className="w-full bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-foreground">
                Apparel<span className="text-gradient">Desk</span>
              </span>
              <span className="text-[10px] text-muted-foreground -mt-1 font-medium tracking-wider">
                ONLINE LUXURY
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary relative py-1 ${
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar with live dropdown */}
          <div ref={searchRef} className="hidden md:flex relative flex-1 max-w-xs xl:max-w-sm">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search shirts, sarees, jackets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                className="pl-9 pr-8 h-9 text-xs bg-secondary/60 border-border/80 focus:bg-secondary rounded-full"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Live Search Results Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated overflow-hidden z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">Searching catalog...</div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                      Matching Products
                    </p>
                    {searchResults.map((item) => (
                      <Link
                        key={item._id}
                        to={`/product/${item._id}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-3 p-2 hover:bg-secondary/60 rounded-lg transition-colors group"
                      >
                        <img
                          src={getProductDisplayImage(item.imageUrl, item.category, item.name)}
                          alt={item.name}
                          className="w-10 h-10 rounded-md object-cover border border-border/50 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-primary">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{item.category || "Apparel"}</p>
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          ₹{item.price.toLocaleString()}
                        </span>
                      </Link>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-primary mt-1"
                      onClick={handleSearchSubmit}
                    >
                      View all matching results
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No products found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setIsWishlistOpen(true)}
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center p-0 text-[10px] font-bold bg-primary text-primary-foreground">
                  {wishlistCount}
                </Badge>
              )}
            </Button>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setIsCartOpen(true)}
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center p-0 text-[10px] font-bold bg-primary text-primary-foreground">
                  {totalCount}
                </Badge>
              )}
            </Button>

            {/* User Account / Admin Switcher */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 h-9 rounded-full hover:bg-secondary">
                    <Avatar className="w-7 h-7 border border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold hidden sm:inline max-w-[90px] truncate text-foreground">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-elevated">
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    {isAdmin && (
                      <Badge className="mt-1.5 bg-primary/20 text-primary border-primary/30 text-[10px] uppercase font-bold flex items-center gap-1 w-fit">
                        <Crown className="w-3 h-3 text-primary" /> Admin Access
                      </Badge>
                    )}
                  </div>

                  {isAdmin && (
                    <>
                      <DropdownMenuItem
                        className="text-primary font-semibold cursor-pointer gap-2 py-2 focus:bg-primary/10"
                        onClick={() => navigate("/dashboard")}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem
                    className="cursor-pointer gap-2 py-2"
                    onClick={() => navigate("/my-orders")}
                  >
                    <Package className="w-4 h-4 text-muted-foreground" />
                    My Orders
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer gap-2 py-2"
                    onClick={() => setIsWishlistOpen(true)}
                  >
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    My Wishlist ({wishlistCount})
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-destructive font-medium cursor-pointer gap-2 py-2 focus:bg-destructive/10"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold">
                    <UserIcon className="w-3.5 h-3.5" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="h-9 text-xs font-semibold gradient-primary">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-6 flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg text-foreground">ApparelDesk</span>
                  </div>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} className="my-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search collection..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 text-sm bg-secondary"
                  />
                </form>

                {/* Links */}
                <nav className="flex flex-col gap-3 flex-1 overflow-y-auto">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-secondary text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-secondary text-foreground flex items-center justify-between"
                  >
                    <span>Shopping Cart</span>
                    <Badge variant="secondary">{totalCount}</Badge>
                  </Link>

                  {user && (
                    <Link
                      to="/my-orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-secondary text-foreground"
                    >
                      My Orders
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-semibold py-2 px-3 rounded-lg bg-primary/10 text-primary flex items-center gap-2 mt-2"
                    >
                      <Crown className="w-4 h-4 text-primary" />
                      Admin Dashboard
                    </Link>
                  )}
                </nav>

                {/* Mobile Footer Auth */}
                <div className="pt-4 border-t border-border">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut();
                        }}
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full text-xs">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full text-xs gradient-primary">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  );
}
