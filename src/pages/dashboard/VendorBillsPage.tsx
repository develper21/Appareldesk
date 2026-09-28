import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MoreVertical, Trash2, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input as InputField } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { billsApi, contactsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import { refName } from "@/lib/api/types";
import type { Bill, Contact } from "@/lib/api/types";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-muted",
  received: "bg-info/10 text-info border-info/20",
  paid: "bg-success/10 text-success border-success/20",
  overdue: "bg-warning/10 text-warning border-warning/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function VendorBillsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: billsData, isLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: () => billsApi.list({ limit: 100 }),
  });

  const { data: vendorsData } = useQuery({
    queryKey: ["vendors_list"],
    queryFn: () => contactsApi.list({ contactType: "vendor", limit: 200 }),
  });

  const bills: Bill[] = billsData?.items ?? [];
  const vendors: Contact[] = vendorsData?.items ?? [];

  const filtered = bills.filter((bill) =>
    bill.billNumber?.toLowerCase().includes(search.toLowerCase()) ||
    refName(bill.vendorId).toLowerCase().includes(search.toLowerCase()),
  );

  const createMutation = useMutation({
    mutationFn: () =>
      billsApi.create({
        vendorId,
        subtotal: Number(subtotal),
        dueDate: dueDate || undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      setDialogOpen(false);
      setVendorId("");
      setSubtotal("");
      setDueDate("");
      setNotes("");
      toast({ title: "Bill created" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => billsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast({ title: "Bill deleted" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => billsApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bills"] }),
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Bills</h1>
          <p className="text-muted-foreground">Track bills from your vendors</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Create Bill</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Vendor Bill</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subtotal (₹)</Label>
                  <InputField type="number" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} placeholder="10000" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <InputField type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <InputField value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!vendorId || !subtotal} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search bills..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary/50" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Bill Number</TableHead>
              <TableHead className="text-muted-foreground">Vendor</TableHead>
              <TableHead className="text-muted-foreground">Due Date</TableHead>
              <TableHead className="text-muted-foreground">Total</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No bills found</TableCell></TableRow>
            ) : (
              filtered.map((bill) => (
                <TableRow key={bill._id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-medium text-foreground">{bill.billNumber}</TableCell>
                  <TableCell className="text-foreground">{refName(bill.vendorId)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground font-medium">₹{bill.totalAmount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className={statusStyles[bill.status]}>{bill.status}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: bill._id, status: "received" })}>Mark Received</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: bill._id, status: "paid" })}>Mark Paid</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(bill._id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
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
