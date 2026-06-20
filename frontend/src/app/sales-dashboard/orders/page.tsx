"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X, Filter } from "lucide-react";
import WorkflowTimeline from "@/components/dashboard/WorkflowTimeline";

type SalesOrder = { id: string; customer: string; date: string; amount: string; status: string };

const initialOrders: SalesOrder[] = [
  { id: "SO-2026-001", customer: "Priya Sharma", date: "2026-06-19", amount: "₹45,000", status: "CONFIRMED" },
  { id: "SO-2026-002", customer: "Arun Menon", date: "2026-06-18", amount: "₹72,000", status: "PROCESSING" },
  { id: "SO-2026-003", customer: "Deepa Nair", date: "2026-06-20", amount: "₹55,000", status: "DRAFT" },
];

function SalesOrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [formData, setFormData] = useState({ customer: "", amount: "", status: "draft" });
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') || 'all';

  useEffect(() => {
    fetchOrders();
  }, [view]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:8000/api/v1/sales/orders?view=${view}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.items || []);
    }
  };

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
        <div className="flex gap-3">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <Button size="sm" variant={view === 'all' ? 'secondary' : 'ghost'} className={view === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'} onClick={() => router.push('/sales-dashboard/orders')}>
              All Orders
            </Button>
            <Button size="sm" variant={view === 'my' ? 'secondary' : 'ghost'} className={view === 'my' ? 'bg-slate-800 text-white' : 'text-slate-400'} onClick={() => router.push('/sales-dashboard/orders?view=my')}>
              My Orders
            </Button>
          </div>
        </div>
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
                  <TableCell className="font-mono text-emerald-400">{order.order_number}</TableCell>
                  <TableCell className="text-white font-medium">{order.customer_name || 'N/A'}</TableCell>
                  <TableCell className="text-slate-400">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-slate-300 font-semibold">₹{order.total_amount}</TableCell>
                  <TableCell>
                    <WorkflowTimeline currentStatus={order.status} steps={['draft', 'confirmed', 'partially_delivered', 'delivered', 'cancelled']} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {order.status === 'draft' && (
                        <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10" onClick={async () => {
                          const res = await fetch(`http://localhost:8000/api/v1/sales/orders/${order.id}/confirm`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                          });
                          if(res.ok) fetchOrders();
                        }}>
                          Confirm
                        </Button>
                      )}
                      {(order.status === 'confirmed' || order.status === 'partially_delivered') && (
                        <Button size="sm" variant="outline" className="text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10" onClick={async () => {
                          const res = await fetch(`http://localhost:8000/api/v1/sales/orders/${order.id}/deliver`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                          });
                          if(res.ok) fetchOrders();
                        }}>
                          Deliver
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

export default function SalesOrdersPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 p-6">Loading orders...</div>}>
      <SalesOrdersContent />
    </Suspense>
  );
}
