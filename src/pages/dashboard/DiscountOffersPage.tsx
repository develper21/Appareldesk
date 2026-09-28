import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MoreVertical, Trash2, Tag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { discountsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import type { DiscountOffer } from "@/lib/api/types";

export default function DiscountOffersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: "", discountType: "percent", discountValue: "", minOrderAmount: "", description: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["discount_offers"],
    queryFn: () => discountsApi.list(true),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      discountsApi.create({
        code: form.code.toUpperCase(),
        discountType: form.discountType as "percent" | "fixed",
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        description: form.description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discount_offers"] });
      setDialogOpen(false);
      setForm({ code: "", discountType: "percent", discountValue: "", minOrderAmount: "", description: "" });
      toast({ title: "Coupon created" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => discountsApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["discount_offers"] }),
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => discountsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discount_offers"] });
      toast({ title: "Coupon deleted" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discount Offers</h1>
          <p className="text-muted-foreground">Create and manage coupon codes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Create Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Discount Offer</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE10" className="font-mono uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Minimum Order Amount (₹)</Label>
                <Input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0 = no minimum" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Shown to customers at checkout" />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.code || !form.discountValue} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Code</TableHead>
              <TableHead className="text-muted-foreground">Discount</TableHead>
              <TableHead className="text-muted-foreground">Min Order</TableHead>
              <TableHead className="text-muted-foreground">Used</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : offers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No coupons found</TableCell></TableRow>
            ) : (
              offers.map((offer) => (
                <TableRow key={offer._id} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="font-mono font-medium text-foreground">{offer.code}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {offer.discountType === "percent" ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {offer.minOrderAmount ? `₹${offer.minOrderAmount.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{offer.usedCount}{offer.maxUses ? ` / ${offer.maxUses}` : ""}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleActiveMutation.mutate({ id: offer._id, isActive: !offer.isActive })}>
                      <Badge variant="outline" className={offer.isActive ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-muted"}>
                        {offer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(offer._id)}>
                          <Trash2 className="w-4 h-4 mr-2" />Delete
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
