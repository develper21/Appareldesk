import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MoreVertical, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function DiscountOffersPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["discount_offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("discount_offers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("discount_offers").insert({
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue) || 0,
        min_order_amount: parseFloat(minOrder) || 0,
        max_uses: maxUses ? parseInt(maxUses) : null,
        description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discount_offers"] });
      setDialogOpen(false);
      setCode(""); setDiscountValue(""); setMinOrder(""); setMaxUses(""); setDescription("");
      toast({ title: "Discount offer created" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("discount_offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discount_offers"] });
      toast({ title: "Discount deleted" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("discount_offers").update({ is_active: !is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["discount_offers"] }),
  });

  const filtered = offers.filter((o: any) =>
    o.code?.toLowerCase().includes(search.toLowerCase()) ||
    o.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discount Offers</h1>
          <p className="text-muted-foreground">Manage coupon codes and discounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Create Offer</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Discount Offer</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Coupon Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SAVE20" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="20% off on first order" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Value</Label><Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="20" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Min Order (₹)</Label><Input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="500" /></div>
                <div className="space-y-2"><Label>Max Uses</Label><Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" /></div>
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!code || !discountValue} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search offers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary/50" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Code</TableHead>
              <TableHead className="text-muted-foreground">Description</TableHead>
              <TableHead className="text-muted-foreground">Discount</TableHead>
              <TableHead className="text-muted-foreground">Min Order</TableHead>
              <TableHead className="text-muted-foreground">Usage</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No discount offers found</TableCell></TableRow>
            ) : filtered.map((offer: any) => (
              <TableRow key={offer.id} className="border-border hover:bg-secondary/50">
                <TableCell><div className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /><span className="font-mono font-medium text-foreground">{offer.code}</span></div></TableCell>
                <TableCell className="text-muted-foreground">{offer.description || "—"}</TableCell>
                <TableCell className="text-foreground font-medium">{offer.discount_type === "percentage" ? `${offer.discount_value}%` : `₹${offer.discount_value}`}</TableCell>
                <TableCell className="text-muted-foreground">₹{Number(offer.min_order_amount).toLocaleString()}</TableCell>
                <TableCell className="text-foreground">{offer.used_count}/{offer.max_uses || "∞"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={offer.is_active ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                    {offer.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleActiveMutation.mutate({ id: offer.id, is_active: offer.is_active })}><Edit className="w-4 h-4 mr-2" />{offer.is_active ? "Deactivate" : "Activate"}</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(offer.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
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
