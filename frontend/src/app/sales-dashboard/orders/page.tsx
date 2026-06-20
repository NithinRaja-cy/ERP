"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X } from "lucide-react";

type SalesOrder = { id: string; customer: string; date: string; amount: string; status: string };

const initialOrders: SalesOrder[] = [
  { id: "SO-2026-001", customer: "Priya Sharma", date: "2026-06-19", amount: "₹45,000", status: "CONFIRMED" },
  { id: "SO-2026-002", customer: "Arun Menon", date: "2026-06-18", amount: "₹72,000", status: "PROCESSING" },
  { id: "SO-2026-003", customer: "Deepa Nair", date: "2026-06-20", amount: "₹55,000", status: "DRAFT" },
];

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [formData, setFormData] = useState({ customer: "", amount: "", status: "DRAFT" });

  const handleOpenAdd = () => {
    setEditingOrder(null);
    setFormData({ customer: "", amount: "", status: "DRAFT" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: SalesOrder) => {
    setEditingOrder(order);
    setFormData({ customer: order.customer, amount: order.amount.replace(/[₹,]/g, ""), status: order.status });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amountStr = formData.amount.startsWith("₹") ? formData.amount : `₹${Number(formData.amount).toLocaleString("en-IN")}`;

    if (editingOrder) {
      setOrders(orders.map((o) => o.id === editingOrder.id ? { ...o, ...formData, amount: amountStr } : o));
    } else {
      const newSO: SalesOrder = {
        id: `SO-2026-${String(orders.length + 1).padStart(3, "0")}`,
        customer: formData.customer,
        date: new Date().toISOString().split("T")[0],
        amount: amountStr,
        status: formData.status,
      };
      setOrders([...orders, newSO]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setOrders(orders.filter((o) => o.id !== id));
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Sales Orders Management</h2>
          <p className="text-slate-400 mt-1">View sales workflows, edit booking statuses, and record offline transactions.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Create Sales Order
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Active Bookings Registry</CardTitle>
          <CardDescription className="text-slate-400">Total consumer bookings recorded via portal logins.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Order ID</TableHead>
                <TableHead className="text-slate-400">Customer</TableHead>
                <TableHead className="text-slate-400">Order Date</TableHead>
                <TableHead className="text-slate-400">Total Value</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-mono text-emerald-400">{order.id}</TableCell>
                  <TableCell className="text-white font-medium">{order.customer}</TableCell>
                  <TableCell className="text-slate-400">{order.date}</TableCell>
                  <TableCell className="text-slate-300 font-semibold">{order.amount}</TableCell>
                  <TableCell>
                    <Badge className={
                      order.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      order.status === 'PROCESSING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-700/10 text-slate-400 border-slate-800'
                    } variant="outline">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(order)} className="text-slate-400 hover:text-white">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(order.id)} className="text-slate-400 hover:text-rose-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="bg-slate-900 border-slate-800 w-full max-w-md p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-white">{editingOrder ? "Edit Sales Order" : "Create Sales Order"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Customer Name</label>
                <input
                  required
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Total Value (₹)</label>
                <input
                  required
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 45000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-lg text-sm mt-4">
                Save Order Record
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
