import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Package,
  Edit,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
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
  DropdownMenuSeparator,
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
import { productsApi } from "@/lib/api";
import { getProductDisplayImage } from "@/lib/mockData";
import { getApiErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { Product } from "@/lib/api/types";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Men",
    price: "",
    costPrice: "",
    stockQuantity: "",
    imageUrl: "",
    description: "",
    sku: "",
  });

  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => productsApi.list({ search: search || undefined, limit: 100 }),
  });

  const products: Product[] = productsData?.items ?? [];

  const filteredProducts = products.filter((p) => {
    return categoryFilter === "all" || p.category === categoryFilter;
  });

  const createMutation = useMutation({
    mutationFn: () =>
      productsApi.create({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        costPrice: form.costPrice ? Number(form.costPrice) : undefined,
        stockQuantity: Number(form.stockQuantity) || 0,
        imageUrl: form.imageUrl.trim() || undefined,
        description: form.description || undefined,
        sku: form.sku.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setAddDialogOpen(false);
      setForm({
        name: "",
        category: "Men",
        price: "",
        costPrice: "",
        stockQuantity: "",
        imageUrl: "",
        description: "",
        sku: "",
      });
      toast.success("Product created successfully!");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...patch }: Partial<Product> & { id: string }) =>
      productsApi.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditProduct(null);
      toast.success("Product updated successfully!");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      productsApi.update(id, { isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Visibility updated");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const openEditModal = (p: Product) => {
    setEditProduct(p);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catalog & Inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your store's apparel products, pricing, and stock levels
          </p>
        </div>

        {/* Add Product Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Product to Store</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Product Title</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Royal Oxford Slim Fit Shirt"
                  className="bg-secondary/40 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="bg-secondary/40 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Men">Men</SelectItem>
                      <SelectItem value="Women">Women</SelectItem>
                      <SelectItem value="Children">Children</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Selling Price (₹)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="1299"
                    className="bg-secondary/40 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Initial Stock</Label>
                  <Input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    placeholder="50"
                    className="bg-secondary/40 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">SKU Code</Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="e.g. SHIRT-OXF-01"
                    className="bg-secondary/40 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Product Image URL</Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-secondary/40 text-xs"
                />
                {form.imageUrl && (
                  <div className="mt-2 w-16 h-20 rounded-md overflow-hidden border border-border">
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Product Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed specifications, fabric composition..."
                  className="bg-secondary/40 text-xs h-20"
                />
              </div>

              <Button
                className="w-full gradient-primary mt-2"
                disabled={!form.name || !form.price || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? "Creating..." : "Save Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filter & Search Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-secondary/50 rounded-xl"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs bg-secondary/50 rounded-xl">
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
        className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs">Product</TableHead>
              <TableHead className="text-muted-foreground text-xs">Category</TableHead>
              <TableHead className="text-muted-foreground text-xs">SKU</TableHead>
              <TableHead className="text-muted-foreground text-xs">Stock</TableHead>
              <TableHead className="text-muted-foreground text-xs">Price</TableHead>
              <TableHead className="text-muted-foreground text-xs">Status</TableHead>
              <TableHead className="text-muted-foreground text-xs w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12 text-xs">
                  Loading catalog inventory...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12 text-xs">
                  No products found. Add your first product above!
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const img = getProductDisplayImage(product.imageUrl, product.category, product.name);
                const isOutOfStock = product.stockQuantity === 0;
                const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 15;

                return (
                  <TableRow key={product._id} className="border-border hover:bg-secondary/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={img}
                          alt={product.name}
                          className="w-10 h-12 rounded-lg object-cover border border-border/60 shrink-0"
                        />
                        <div>
                          <span className="font-semibold text-xs text-foreground block line-clamp-1">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">ID: {product._id.slice(-6)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-foreground">{product.category ?? "—"}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {product.sku ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold ${
                            isOutOfStock
                              ? "text-destructive"
                              : isLowStock
                              ? "text-warning"
                              : "text-foreground"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                        {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">
                      ₹{product.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          togglePublishMutation.mutate({
                            id: product._id,
                            isPublished: !product.isPublished,
                          })
                        }
                      >
                        <Badge
                          variant={product.isPublished ? "default" : "secondary"}
                          className={`text-[10px] cursor-pointer ${
                            product.isPublished
                              ? "bg-success/15 text-success border-success/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
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
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => openEditModal(product)}>
                            <Edit className="w-3.5 h-3.5 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/product/${product._id}`} target="_blank">
                              <ExternalLink className="w-3.5 h-3.5 mr-2" />
                              View in Storefront
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10"
                            onClick={() => deleteMutation.mutate(product._id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Edit Product Modal */}
      {editProduct && (
        <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
          <DialogContent className="max-w-lg bg-card border-border">
            <DialogHeader>
              <DialogTitle>Edit Product: {editProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Product Title</Label>
                <Input
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="bg-secondary/40 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={editProduct.category || "Men"}
                    onValueChange={(v) => setEditProduct({ ...editProduct, category: v })}
                  >
                    <SelectTrigger className="bg-secondary/40 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Men">Men</SelectItem>
                      <SelectItem value="Women">Women</SelectItem>
                      <SelectItem value="Children">Children</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Price (₹)</Label>
                  <Input
                    type="number"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                    className="bg-secondary/40 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Stock Quantity</Label>
                  <Input
                    type="number"
                    value={editProduct.stockQuantity}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, stockQuantity: Number(e.target.value) })
                    }
                    className="bg-secondary/40 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">SKU</Label>
                  <Input
                    value={editProduct.sku || ""}
                    onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                    className="bg-secondary/40 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Image URL</Label>
                <Input
                  value={editProduct.imageUrl || ""}
                  onChange={(e) => setEditProduct({ ...editProduct, imageUrl: e.target.value })}
                  className="bg-secondary/40 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={editProduct.description || ""}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  className="bg-secondary/40 text-xs h-20"
                />
              </div>

              <Button
                className="w-full gradient-primary mt-2"
                onClick={() =>
                  updateMutation.mutate({
                    id: editProduct._id,
                    name: editProduct.name,
                    category: editProduct.category || undefined,
                    price: editProduct.price,
                    stockQuantity: editProduct.stockQuantity,
                    imageUrl: editProduct.imageUrl || undefined,
                    description: editProduct.description || undefined,
                    sku: editProduct.sku || undefined,
                  })
                }
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
