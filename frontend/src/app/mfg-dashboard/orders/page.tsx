"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X } from "lucide-react";
import WorkflowTimeline from "@/components/dashboard/WorkflowTimeline";

type MfgOrder = { id: string; product: string; qty: number; start: string; status: string };

const initialOrders: MfgOrder[] = [
  { id: "MO-2026-001", product: "Royal Teak Bed Frame (King)", qty: 15, start: "2026-06-19", status: "IN_PROGRESS" },
  { id: "MO-2026-002", product: "6-Seater Dining Table Set", qty: 30, start: "2026-06-20", status: "QUEUED" },
  { id: "MO-2026-003", product: "3-Door Wardrobe (Walnut)", qty: 10, start: "2026-06-18", status: "COMPLETED" },
];

function MfgOrdersContent() {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [formData, setFormData] = useState({ product: "", qty: 0, status: "draft" });
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') || 'all';

  useEffect(() => {
    fetchOrders();
  }, [view]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`http://localhost:8000/api/v1/manufacturing/orders?view=${view}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.items || []);
      }
    } catch (err) {
      console.warn('Could not fetch manufacturing orders from backend, using local data.', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingOrder(null);
    setFormData({ product: "", qty: 0, status: "QUEUED" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: MfgOrder) => {
    setEditingOrder(order);
    setFormData({ product: order.product, qty: order.qty, status: order.status });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      setOrders(orders.map((o) => o.id === editingOrder.id ? { ...o, ...formData } : o));
    } else {
      const newOrder: MfgOrder = {
        id: `MO-2026-${String(orders.length + 1).padStart(3, "0")}`,
        product: formData.product,
        qty: formData.qty,
        start: new Date().toISOString().split("T")[0],
        status: formData.status,
      };
      setOrders([...orders, newOrder]);
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
          <h2 className="text-3xl font-bold tracking-tight text-white">Manufacturing Orders</h2>
          <p className="text-slate-400 mt-1">Schedule furniture builds, configure lines, and dispatch works orders.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <Button size="sm" variant={view === 'all' ? 'secondary' : 'ghost'} className={view === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'} onClick={() => router.push('/mfg-dashboard/orders')}>
              All Orders
            </Button>
            <Button size="sm" variant={view === 'my' ? 'secondary' : 'ghost'} className={view === 'my' ? 'bg-slate-800 text-white' : 'text-slate-400'} onClick={() => router.push('/mfg-dashboard/orders?view=my')}>
              My Orders
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Active Production Runs</CardTitle>
          <CardDescription className="text-slate-400">Total job orders currently dispatching across workshops.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Order ID</TableHead>
                <TableHead className="text-slate-400">Product</TableHead>
                <TableHead className="text-slate-400">Target Output Qty</TableHead>
                <TableHead className="text-slate-400">Scheduled Date</TableHead>
                <TableHead className="text-slate-400">Operational Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-mono text-violet-400">{order.mo_number}</TableCell>
                  <TableCell className="text-white font-medium">{order.product_name || 'N/A'}</TableCell>
                  <TableCell className="text-slate-300">{order.planned_qty} units</TableCell>
                  <TableCell className="text-slate-400">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <WorkflowTimeline currentStatus={order.status} steps={['draft', 'ready', 'in_progress', 'completed', 'cancelled']} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {order.status === 'ready' && (
                        <Button size="sm" variant="outline" className="text-violet-400 border-violet-500/20 hover:bg-violet-500/10" onClick={async () => {
                          const res = await fetch(`http://localhost:8000/api/v1/manufacturing/orders/${order.id}/start`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                          });
                          if(res.ok) fetchOrders();
                        }}>
                          Start
                        </Button>
                      )}
                      {order.status === 'in_progress' && (
                        <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10" onClick={async () => {
                          const res = await fetch(`http://localhost:8000/api/v1/manufacturing/orders/${order.id}/complete`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                          });
                          if(res.ok) fetchOrders();
                        }}>
                          Complete
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
              <CardTitle className="text-white">{editingOrder ? "Edit Work Order" : "Create Work Order"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Product Name</label>
                <input
                  required
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  placeholder="e.g. Royal Teak Bed Frame"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Quantity</label>
                <input
                  required
                  type="number"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 15"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                >
                  <option value="QUEUED">QUEUED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-5 rounded-lg text-sm mt-4">
                Save Work Order details
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function MfgOrdersPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 p-6">Loading orders...</div>}>
      <MfgOrdersContent />
    </Suspense>
  );
}
