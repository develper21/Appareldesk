import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const products = [
  { id: 1, name: "Premium Cotton Shirt", category: "Men", type: "Shirt", material: "Cotton", stock: 145, price: 1299, published: true },
  { id: 2, name: "Slim Fit Denim Jeans", category: "Men", type: "Pants", material: "Denim", stock: 89, price: 1899, published: true },
  { id: 3, name: "Floral Print Kurta", category: "Women", type: "Kurta", material: "Cotton", stock: 56, price: 1599, published: true },
  { id: 4, name: "Kids Casual T-Shirt", category: "Children", type: "T-Shirt", material: "Cotton", stock: 234, price: 499, published: true },
  { id: 5, name: "Formal Blazer", category: "Men", type: "Blazer", material: "Polyester", stock: 23, price: 3999, published: false },
  { id: 6, name: "Embroidered Saree", category: "Women", type: "Saree", material: "Silk", stock: 12, price: 5999, published: true },
  { id: 7, name: "Sports Track Pants", category: "Men", type: "Pants", material: "Nylon", stock: 0, price: 899, published: false },
  { id: 8, name: "Designer Lehenga", category: "Women", type: "Lehenga", material: "Silk", stock: 8, price: 12999, published: true },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your clothing inventory</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-secondary/50">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Men">Men</SelectItem>
            <SelectItem value="Women">Women</SelectItem>
            <SelectItem value="Children">Children</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl shadow-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Product</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Material</TableHead>
              <TableHead className="text-muted-foreground">Stock</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="border-border hover:bg-secondary/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{product.category}</TableCell>
                <TableCell className="text-foreground">{product.type}</TableCell>
                <TableCell className="text-muted-foreground">{product.material}</TableCell>
                <TableCell>
                  <span className={product.stock === 0 ? "text-destructive" : product.stock < 20 ? "text-warning" : "text-foreground"}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="text-foreground">₹{product.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={product.published ? "default" : "secondary"} className={product.published ? "bg-success/10 text-success border-success/20" : ""}>
                    {product.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
