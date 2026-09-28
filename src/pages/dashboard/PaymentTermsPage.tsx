import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MoreVertical, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { paymentTermsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import type { PaymentTerm } from "@/lib/api/types";

export default function PaymentTermsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", days: "", description: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: terms = [], isLoading } = useQuery({
    queryKey: ["payment_terms"],
    queryFn: () => paymentTermsApi.list(true),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      paymentTermsApi.create({
        name: form.name,
        days: parseInt(form.days) || 0,
        description: form.description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_terms"] });
      setDialogOpen(false);
      setForm({ name: "", days: "", description: "" });
      toast({ title: "Payment term created" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      paymentTermsApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payment_terms"] }),
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentTermsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_terms"] });
      toast({ title: "Payment term deleted" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Terms</h1>
          <p className="text-muted-foreground">Configure payment due periods</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Add Term</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Payment Term</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Net 30" />
              </div>
              <div className="space-y-2">
                <Label>Days</Label>
                <Input type="number" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} placeholder="30" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.name} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Days</TableHead>
              <TableHead className="text-muted-foreground">Description</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : terms.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No payment terms found</TableCell></TableRow>
            ) : (
              terms.map((term) => (
                <TableRow key={term._id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-medium text-foreground">{term.name}</TableCell>
                  <TableCell className="text-foreground">{term.days}</TableCell>
                  <TableCell className="text-muted-foreground">{term.description ?? "—"}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleActiveMutation.mutate({ id: term._id, isActive: !term.isActive })}>
                      <Badge variant="outline" className={term.isActive ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-muted"}>
                        {term.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(term._id)}>
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
