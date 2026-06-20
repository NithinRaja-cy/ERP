"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Search, Edit2, Trash2, UserPlus, CreditCard, Landmark, Users } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  creditLimit: number;
  outstandingBalance: number;
  notes: string;
  status: "ACTIVE" | "INACTIVE";
  permission?: string;
  isPortalUser?: boolean;
}

const initialCustomers: Customer[] = [
  { id: "CUST-001", name: "Priya Sharma", email: "priya@gmail.com", phone: "+91 98450 12345", company: "Royal Furniture Mart", city: "Bangalore", creditLimit: 200000, outstandingBalance: 45000, notes: "Reliable dealer, prefers premium teak items.", status: "ACTIVE", permission: "CUSTOMER_PORTAL" },
  { id: "CUST-002", name: "Arun Menon", email: "arun.m@gmail.com", phone: "+91 97420 54321", company: "Menon Designs", city: "Kochi", creditLimit: 150000, outstandingBalance: 72000, notes: "Order cycle every 2 weeks.", status: "ACTIVE", permission: "CUSTOMER_PORTAL" },
  { id: "CUST-003", name: "Deepa Nair", email: "deepa.nair@outlook.com", phone: "+91 94470 98765", company: "Malabar Homes", city: "Calicut", creditLimit: 300000, outstandingBalance: 55000, notes: "Bulk buyer for residential furniture setups.", status: "ACTIVE", permission: "CUSTOMER_PORTAL" },
  { id: "CUST-004", name: "Kunal Gupta", email: "kunal@guptatraders.in", phone: "+91 81234 56789", company: "Gupta Traders", city: "Chennai", creditLimit: 100000, outstandingBalance: 0, notes: "Always pays early, eligible for discount.", status: "ACTIVE", permission: "CUSTOMER_PORTAL" },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [creditLimit, setCreditLimit] = useState(0);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [permission, setPermission] = useState("CUSTOMER_PORTAL");

  useEffect(() => {
    const saved = localStorage.getItem("erp_registered_customers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const merged = [...initialCustomers];
          parsed.forEach((c: Customer) => {
            if (!merged.some(m => m.email.toLowerCase() === c.email.toLowerCase())) {
              merged.push({
                ...c,
                permission: c.permission || "CUSTOMER_PORTAL",
                isPortalUser: true
              });
            }
          });
          setCustomers(merged);
        }
      } catch (err) {
        console.error("Error parsing registered customers:", err);
      }
    }
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setCity("");
    setCreditLimit(150000);
    setOutstandingBalance(0);
    setNotes("");
    setStatus("ACTIVE");
    setPermission("CUSTOMER_PORTAL");
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setPhone(cust.phone);
    setCompany(cust.company);
    setCity(cust.city);
    setCreditLimit(cust.creditLimit);
    setOutstandingBalance(cust.outstandingBalance);
    setNotes(cust.notes);
    setStatus(cust.status);
    setPermission(cust.permission || "CUSTOMER_PORTAL");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList: Customer[];
    if (editingCustomer) {
      // Edit
      updatedList = customers.map(c => c.id === editingCustomer.id ? {
        ...c, name, email, phone, company, city, creditLimit, outstandingBalance, notes, status, permission
      } : c);
    } else {
      // Add
      const newId = `CUST-00${customers.length + 1}`;
      updatedList = [...customers, {
        id: newId, name, email, phone, company, city, creditLimit, outstandingBalance, notes, status, permission
      }];
    }
    setCustomers(updatedList);

    // Save back to local storage if edited/added user was self-registered (or to keep storage in sync)
    const portalUsers = updatedList.filter(c => c.isPortalUser || c.company === "Self-Registered");
    if (portalUsers.length > 0) {
      localStorage.setItem("erp_registered_customers", JSON.stringify(portalUsers));
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this customer record?")) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) || 
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const avgCredit = customers.length ? Math.round(customers.reduce((sum, c) => sum + c.creditLimit, 0) / customers.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Customer Relationship Management</h2>
          <p className="text-slate-400 mt-1">Admin dashboard to manage, track, and edit customer credit lines and accounts.</p>
        </div>
        <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <UserPlus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Customers</p>
              <h3 className="text-2xl font-bold text-white">{customers.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-rose-500/10 rounded-lg">
              <Landmark className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Active Receivable Balance</p>
              <h3 className="text-2xl font-bold text-rose-400">₹{totalOutstanding.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Avg Credit Limit</p>
              <h3 className="text-2xl font-bold text-emerald-400">₹{avgCredit.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 w-full max-w-md">
        <Search className="h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-white focus:outline-none w-full placeholder-slate-500 text-sm"
        />
      </div>

      {/* Customers Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Customer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">ID</TableHead>
                <TableHead className="text-slate-400">Customer Info</TableHead>
                <TableHead className="text-slate-400">Company & Location</TableHead>
                <TableHead className="text-slate-400">Outstanding Receivable</TableHead>
                <TableHead className="text-slate-400">Credit Limit</TableHead>
                <TableHead className="text-slate-400">Permission</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-indigo-400">{item.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-white font-medium flex items-center gap-1.5 flex-wrap">
                        {item.name}
                        {item.isPortalUser && (
                          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 py-0 text-[10px] uppercase font-bold tracking-wide">
                            Portal User
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{item.email}</div>
                      {item.phone && <div className="text-xs text-slate-500">{item.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-slate-300">{item.company || "—"}</div>
                      {item.city && <div className="text-xs text-slate-500">{item.city}</div>}
                    </div>
                  </TableCell>
                  <TableCell className={item.outstandingBalance > 0 ? "text-rose-400 font-medium" : "text-slate-400"}>
                    ₹{item.outstandingBalance.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-slate-300">₹{item.creditLimit.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/25">
                      {item.permission || "CUSTOMER_PORTAL"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className={item.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-400'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button onClick={() => openEditModal(item)} variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:bg-indigo-500/10 hover:text-white">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(item.id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-6">
                    No customer accounts found matching your query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">
              {editingCustomer ? "Edit Customer Profile" : "Create New Customer Account"}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="+91 99999 88888"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Company Name</label>
                  <input 
                    type="text" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Acme Furnitures"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">City / Region</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Bangalore"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Permission</label>
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="CUSTOMER_PORTAL">CUSTOMER_PORTAL</option>
                    <option value="ADMIN_FULL">ADMIN_FULL</option>
                    <option value="SALES_AGENT">SALES_AGENT</option>
                    <option value="MFG_OPERATOR">MFG_OPERATOR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Credit Limit (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Outstanding Balance (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={outstandingBalance}
                    onChange={(e) => setOutstandingBalance(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Internal Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Additional context on credit history, preferred goods..."
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
