import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MoreVertical, Trash2, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { productsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Product } from "@/lib/api/types";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Men", price: "", stockQuantity: "", description: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => productsApi.list({ search: search || undefined, limit: 100 }),
  });

  const products: Product[] = productsData?.items ?? [];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesCategory;
  });

  const createMutation = useMutation({
    mutationFn: () =>
      productsApi.create({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity) || 0,
        description: form.description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
      setForm({ name: "", category: "Men", price: "", stockQuantity: "", description: "" });
      toast({ title: "Product created" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      productsApi.update(id, { isPublished }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Premium Cotton Shirt" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Men">Men</SelectItem>
                      <SelectItem value="Women">Women</SelectItem>
                      <SelectItem value="Children">Children</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1299" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} placeholder="50" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." />
              </div>
              <Button
                className="w-full"
                disabled={!form.name || !form.price || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4">
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
              <TableHead className="text-muted-foreground">SKU</TableHead>
              <TableHead className="text-muted-foreground">Stock</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading products...</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No products found</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{product.category ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku ?? "—"}</TableCell>
                  <TableCell>
                    <span className={product.stockQuantity === 0 ? "text-destructive" : product.stockQuantity < 20 ? "text-warning" : "text-foreground"}>
                      {product.stockQuantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground">₹{product.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        togglePublishMutation.mutate({ id: product._id, isPublished: !product.isPublished })
                      }
                    >
                      <Badge variant={product.isPublished ? "default" : "secondary"} className={product.isPublished ? "bg-success/10 text-success border-success/20" : ""}>
                        {product.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(product._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
