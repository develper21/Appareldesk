import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  MapPin,
  Users
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const contacts = [
  { id: 1, name: "Rahul Sharma", type: "Customer", email: "rahul@email.com", mobile: "+91 98765 43210", city: "Mumbai", orders: 12 },
  { id: 2, name: "Priya Patel", type: "Customer", email: "priya@email.com", mobile: "+91 98765 43211", city: "Delhi", orders: 8 },
  { id: 3, name: "Fashion Hub Pvt Ltd", type: "Vendor", email: "contact@fashionhub.com", mobile: "+91 98765 43212", city: "Surat", orders: 45 },
  { id: 4, name: "Amit Kumar", type: "Customer", email: "amit@email.com", mobile: "+91 98765 43213", city: "Bangalore", orders: 5 },
  { id: 5, name: "Textile World", type: "Vendor", email: "info@textileworld.com", mobile: "+91 98765 43214", city: "Ahmedabad", orders: 23 },
  { id: 6, name: "Neha Singh", type: "Both", email: "neha@email.com", mobile: "+91 98765 43215", city: "Pune", orders: 15 },
];

const typeStyles: Record<string, string> = {
  Customer: "bg-info/10 text-info border-info/20",
  Vendor: "bg-warning/10 text-warning border-warning/20",
  Both: "bg-primary/10 text-primary border-primary/20",
};

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(search.toLowerCase()) ||
                         contact.email.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || contact.type.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
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
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">Manage customers and vendors</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </motion.div>

      {/* Tabs and Search */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="customer">Customers</TabsTrigger>
              <TabsTrigger value="vendor">Vendors</TabsTrigger>
            </TabsList>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary/50"
              />
            </div>
          </div>
        </Tabs>
      </motion.div>

      {/* Contacts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl shadow-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Contact</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Mobile</TableHead>
              <TableHead className="text-muted-foreground">City</TableHead>
              <TableHead className="text-muted-foreground">Orders</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id} className="border-border hover:bg-secondary/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{contact.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={typeStyles[contact.type]}>
                    {contact.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {contact.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {contact.mobile}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {contact.city}
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{contact.orders}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
