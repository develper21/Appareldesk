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
import { invoicesApi, ordersApi, contactsApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import { refName } from "@/lib/api/types";
import type { Contact, Invoice } from "@/lib/api/types";

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-muted",
  sent: "bg-info/10 text-info border-info/20",
  paid: "bg-success/10 text-success border-success/20",
  overdue: "bg-warning/10 text-warning border-warning/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function CustomerInvoicesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoicesApi.list({ limit: 100 }),
  });

  const { data: ordersData } = useQuery({
    queryKey: ["orders_for_invoice"],
    queryFn: () => ordersApi.list({ limit: 100 }),
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers_list"],
    queryFn: () => contactsApi.list({ contactType: "customer", limit: 200 }),
  });

  const invoices: Invoice[] = invoicesData?.items ?? [];
  const customers: Contact[] = customersData?.items ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      invoicesApi.create({
        orderId: orderId || undefined,
        customerId: customerId || undefined,
        subtotal: Number(subtotal),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setDialogOpen(false);
      setOrderId("");
      setCustomerId("");
      setSubtotal("");
      toast({ title: "Invoice created" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Invoice deleted" });
    },
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => invoicesApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
    onError: (err) => toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customer Invoices</h1>
          <p className="text-muted-foreground">Track invoices for your customers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Create Invoice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Customer (optional)</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} placeholder="5000" />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!subtotal} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Invoice Number</TableHead>
              <TableHead className="text-muted-foreground">Customer</TableHead>
              <TableHead className="text-muted-foreground">Total</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : invoices.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No invoices found</TableCell></TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice._id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-medium text-foreground">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="text-foreground">{refName(invoice.customerId)}</TableCell>
                  <TableCell className="text-foreground font-medium">₹{invoice.totalAmount.toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className={statusStyles[invoice.status]}>{invoice.status}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: invoice._id, status: "sent" })}>Mark Sent</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: invoice._id, status: "paid" })}>Mark Paid</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(invoice._id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
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
