import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  X,
  ArrowUpDown,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/storefront/ProductCard";
import { productsApi } from "@/lib/api";
import { getProductRating } from "@/lib/mockData";
import type { Product } from "@/lib/api/types";

const CATEGORIES = ["Men", "Women", "Children"];
const TYPES = ["Shirt", "Pants", "T-Shirt", "Kurta", "Saree", "Blazer", "Jacket", "Lehenga"];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get("category");
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory && initialCategory !== "all" ? [initialCategory] : []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 15000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [gridView, setGridView] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync search/category query params -> local filter state
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearch(q);
    }
    const cat = searchParams.get("category");
    if (cat && cat !== "all") {
      setSelectedCategories([cat]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when the URL params change
  }, [searchParams]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop_products"],
    queryFn: async () => {
      const res = await productsApi.listPublic({ limit: 100 });
      return res.items as Product[];
    },
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleType = (t: string) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setPriceRange([0, 15000]);
    setInStockOnly(false);
    setSearch("");
    setSearchParams({});
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedTypes.length +
    (priceRange[0] > 0 || priceRange[1] < 15000 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        search.trim() === "" ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        selectedCategories.length === 0 ||
        (product.category && selectedCategories.includes(product.category));

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((t) => product.name.toLowerCase().includes(t.toLowerCase()));

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      const matchesStock = !inStockOnly || product.stockQuantity > 0;

      return matchesSearch && matchesCategory && matchesType && matchesPrice && matchesStock;
    });

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => {
          const rA = getProductRating(a._id || a.id || "").rating;
          const rB = getProductRating(b._id || b.id || "").rating;
          return rB - rA;
        });
        break;
      case "newest":
        result = [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        // featured / default
        break;
    }

    return result;
  }, [products, search, selectedCategories, selectedTypes, priceRange, inStockOnly, sortBy]);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wider text-[11px] text-muted-foreground">
          Categories
        </h4>
        <div className="space-y-2.5">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center space-x-2.5">
              <Checkbox
                id={`cat-${cat}`}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <Label
                htmlFor={`cat-${cat}`}
                className="text-xs font-medium text-foreground cursor-pointer"
              >
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clothing Type Filter */}
      <div className="pt-4 border-t border-border">
        <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wider text-[11px] text-muted-foreground">
          Apparel Types
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => {
            const isSelected = selectedTypes.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "bg-secondary/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Slider */}
      <div className="pt-4 border-t border-border">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
            Price Range
          </h4>
          <span className="text-xs font-semibold text-primary">
            ₹{priceRange[0]} - ₹{priceRange[1]}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={15000}
          step={200}
          className="w-full my-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹0</span>
          <span>₹15,000+</span>
        </div>
      </div>

      {/* In Stock Only Switch */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div>
          <Label htmlFor="stock-switch" className="text-xs font-medium text-foreground cursor-pointer">
            In Stock Only
          </Label>
          <p className="text-[11px] text-muted-foreground">Hide out-of-stock items</p>
        </div>
        <Switch
          id="stock-switch"
          checked={inStockOnly}
          onCheckedChange={setInStockOnly}
        />
      </div>

      {/* Clear Filters CTA */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs gap-2 border-dashed"
          onClick={clearFilters}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="container py-8 max-w-7xl">
      {/* Header & Results Count */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Explore All Apparel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading
              ? "Loading collection..."
              : `Showing ${filteredAndSortedProducts.length} of ${products.length} products`}
          </p>
        </div>

        {/* Search, Sort & View Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search in shop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-secondary/50 rounded-xl"
            />
          </div>

          {/* Sort Select */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[170px] h-9 text-xs bg-secondary/50 rounded-xl">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured Picks</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Customer Rating</SelectItem>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Filter Sheet Button */}
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden h-9 gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="h-4 w-4 p-0 flex items-center justify-center text-[10px] ml-1 bg-primary text-primary-foreground">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-6 overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-base font-semibold">Filter Products</SheetTitle>
              </SheetHeader>
              <FilterPanel />
            </SheetContent>
          </Sheet>

          {/* Grid / List view toggle */}
          <div className="hidden sm:flex border border-border rounded-xl overflow-hidden bg-card">
            <Button
              variant={gridView ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={() => setGridView(true)}
              title="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={!gridView ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={() => setGridView(false)}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-card border border-border rounded-xl">
          <span className="text-xs text-muted-foreground mr-1">Active Filters:</span>
          {selectedCategories.map((c) => (
            <Badge
              key={c}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20 hover:text-destructive text-xs"
              onClick={() => toggleCategory(c)}
            >
              {c} <X className="w-3 h-3" />
            </Badge>
          ))}
          {selectedTypes.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20 hover:text-destructive text-xs"
              onClick={() => toggleType(t)}
            >
              {t} <X className="w-3 h-3" />
            </Badge>
          ))}
          {(priceRange[0] > 0 || priceRange[1] < 15000) && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20 hover:text-destructive text-xs"
              onClick={() => setPriceRange([0, 15000])}
            >
              ₹{priceRange[0]} - ₹{priceRange[1]} <X className="w-3 h-3" />
            </Badge>
          )}
          {inStockOnly && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20 hover:text-destructive text-xs"
              onClick={() => setInStockOnly(false)}
            >
              In Stock Only <X className="w-3 h-3" />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary h-6 px-2 ml-auto"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Refine Selection
              </h3>
              {activeFiltersCount > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  ({activeFiltersCount} applied)
                </span>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Product Cards Container */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-muted-foreground text-sm">Loading fashion products...</p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-2xl p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center mx-auto text-muted-foreground">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No matching products found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                We couldn't find any products matching your specific filters or search keywords. Try adjusting your filters.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div
              className={`grid gap-5 ${
                gridView
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredAndSortedProducts.map((product, index) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  category={product.category ?? ""}
                  price={product.price}
                  image={product.imageUrl ?? undefined}
                  index={index}
                  product={product}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
