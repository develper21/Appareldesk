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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { paymentsApi, contactsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import { refName } from "@/lib/api/types";
import type { Contact, Payment } from "@/lib/api/types";

const typeStyles: Record<string, string> = {
  incoming: "bg-success/10 text-success border-success/20",
  outgoing: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function PaymentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ paymentType: "incoming", amount: "", paymentMethod: "cash", contactId: "", referenceNumber: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentsApi.list({ limit: 100 }),
  });

  const { data: contactsData } = useQuery({
    queryKey: ["contacts_all"],
    queryFn: () => contactsApi.list({ limit: 200 }),
  });

  const payments: Payment[] = paymentsData?.items ?? [];
  const contacts: Contact[] = contactsData?.items ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      paymentsApi.create({
        paymentType: form.paymentType,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        contactId: form.contactId || undefined,
        referenceNumber: form.referenceNumber || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setDialogOpen(false);
      setForm({ paymentType: "incoming", amount: "", paymentMethod: "cash", contactId: "", referenceNumber: "" });
      toast({ title: "Payment recorded" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({ title: "Payment deleted" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Record incoming and outgoing payments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.paymentType} onValueChange={(v) => setForm({ ...form, paymentType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incoming">Incoming (from customer)</SelectItem>
                      <SelectItem value="outgoing">Outgoing (to vendor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Select value={form.contactId} onValueChange={(v) => setForm({ ...form, contactId: v })}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {contacts.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input value={form.referenceNumber} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} placeholder="UPI ref / cheque no." />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.amount} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Payment #</TableHead>
              <TableHead className="text-muted-foreground">Contact</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Method</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : payments.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payments recorded</TableCell></TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment._id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-medium text-foreground">{payment.paymentNumber}</TableCell>
                  <TableCell className="text-foreground">{refName(payment.contactId)}</TableCell>
                  <TableCell><Badge variant="outline" className={typeStyles[payment.paymentType]}>{payment.paymentType}</Badge></TableCell>
                  <TableCell className="text-muted-foreground capitalize">{payment.paymentMethod.replace("_", " ")}</TableCell>
                  <TableCell className="text-foreground font-medium">₹{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(payment._id)}>
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
