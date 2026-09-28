import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid3X3, LayoutList, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { productsApi } from "@/lib/api";
import type { Product } from "@/lib/api/types";

const categories = ["Men", "Women", "Children"];
const types = ["Shirt", "Pants", "T-Shirt", "Kurta", "Saree", "Blazer", "Lehenga", "Jacket", "Sherwani"];

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [gridView, setGridView] = useState(true);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop_products"],
    queryFn: async () => {
      const res = await productsApi.listPublic({ limit: 100 });
      return res.items as Product[];
    },
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(product.category ?? "");
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setPriceRange([0, 15000]);
    setSearch("");
  };

  const activeFiltersCount =
    selectedCategories.length + selectedTypes.length + (priceRange[0] > 0 || priceRange[1] < 15000 ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label htmlFor={category} className="text-sm text-foreground cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={15000}
          step={100}
          className="w-full"
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container py-8">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Shop All Products</h1>
        <p className="text-muted-foreground mt-2">
          {isLoading
            ? "Loading products..."
            : `Showing ${filteredProducts.length} of ${products.length} products`}
        </p>
      </motion.div>

      {/* Search & Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>

        <div className="flex gap-2">
          {/* Mobile Filter */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* View Toggle */}
          <div className="hidden md:flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={gridView ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setGridView(true)}
              className="rounded-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={!gridView ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setGridView(false)}
              className="rounded-none"
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Active Filters */}
      {selectedCategories.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 mb-6">
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="gap-1 cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              {category}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </motion.div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </h3>
            <FilterContent />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading products...</div>
          ) : filteredProducts.length > 0 ? (
            <div className={`grid gap-6 ${gridView ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  category={product.category ?? ""}
                  price={product.price}
                  image={product.imageUrl ?? undefined}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
