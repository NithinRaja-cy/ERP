"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X, Check } from "lucide-react";
import WorkflowTimeline from "@/components/dashboard/WorkflowTimeline";

type PurchaseOrder = { id: string; vendor: string; material: string; date: string; amount: string; status: string };

const initialOrders: PurchaseOrder[] = [
  { id: "PO-2026-001", vendor: "TimberKing Lumber Co.", material: "Teak Wood Planks", date: "2026-06-19", amount: "₹85,000", status: "PENDING_APPROVAL" },
  { id: "PO-2026-002", vendor: "FoamPro Upholstery", material: "Premium Foam Padding", date: "2026-06-18", amount: "₹42,000", status: "RECEIVED" },
  { id: "PO-2026-003", vendor: "SteelCraft Hardware Hub", material: "Steel Chair Legs", date: "2026-06-20", amount: "₹18,500", status: "DRAFT" },
];

function PurchasingOrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [formData, setFormData] = useState({ vendor: "", material: "", amount: "", status: "draft" });
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') || 'all';

  useEffect(() => {
    fetchOrders();
  }, [view]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:8000/api/v1/purchases/orders?view=${view}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.items || []);
    }
  };

  const handleOpenAdd = () => {
    setEditingOrder(null);
    setFormData({ vendor: "", material: "", amount: "", status: "DRAFT" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setFormData({ vendor: order.vendor, material: order.material, amount: order.amount, status: order.status });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      setOrders(orders.map((o) => o.id === editingOrder.id ? { ...o, ...formData } : o));
    } else {
      const newPO: PurchaseOrder = {
        id: `PO-2026-${String(orders.length + 1).padStart(3, "0")}`,
        vendor: formData.vendor,
        material: formData.material,
        date: new Date().toISOString().split("T")[0],
        amount: formData.amount.startsWith("₹") ? formData.amount : `₹${formData.amount}`,
        status: formData.status,
      };
      setOrders([...orders, newPO]);
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
          <h2 className="text-3xl font-bold tracking-tight text-white">Purchase Orders</h2>
          <p className="text-slate-400 mt-1">Manage vendor POs, tracking details, and status updates.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <Button size="sm" variant={view === 'all' ? 'secondary' : 'ghost'} className={view === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'} onClick={() => router.push('/purchasing-dashboard/orders')}>
              All Orders
            </Button>
            <Button size="sm" variant={view === 'my' ? 'secondary' : 'ghost'} className={view === 'my' ? 'bg-slate-800 text-white' : 'text-slate-400'} onClick={() => router.push('/purchasing-dashboard/orders?view=my')}>
              My Orders
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">PO Registry</CardTitle>
          <CardDescription className="text-slate-400">Total active procurement entries managed by your office.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">PO Number</TableHead>
                <TableHead className="text-slate-400">Vendor</TableHead>
                <TableHead className="text-slate-400">Material Requested</TableHead>
                <TableHead className="text-slate-400">Order Date</TableHead>
                <TableHead className="text-slate-400">Total Value</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-mono text-amber-400">{order.order_number}</TableCell>
                  <TableCell className="text-white font-medium">{order.vendor_name || 'N/A'}</TableCell>
                  <TableCell className="text-slate-300">{order.items?.map((i: any) => i.product_name).join(", ")}</TableCell>
                  <TableCell className="text-slate-400">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-slate-300 font-semibold">₹{order.total_amount}</TableCell>
                  <TableCell>
                    <WorkflowTimeline currentStatus={order.status} steps={['draft', 'ordered', 'partially_received', 'received', 'cancelled']} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {order.status === 'draft' && (
                        <Button size="sm" variant="outline" className="text-amber-400 border-amber-500/20 hover:bg-amber-500/10" onClick={async () => {
                          const res = await fetch(`http://localhost:8000/api/v1/purchases/orders/${order.id}/confirm`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                          });
                          if(res.ok) fetchOrders();
                        }}>
                          Confirm
                        </Button>
                      )}
                      {(order.status === 'ordered' || order.status === 'partially_received') && (
                        <Button size="sm" variant="outline" className="text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10" onClick={async () => {
                          // Normally we'd send items, for demo we just send an empty list or fake one to avoid error
                          const res = await fetch(`http://localhost:8000/api/v1/purchases/orders/${order.id}/receive`, {
                            method: 'POST',
                            headers: { 
                              Authorization: `Bearer ${localStorage.getItem('token')}`,
                              "Content-Type": "application/json"
                            },
                            body: JSON.stringify(order.items.map((i: any) => ({ product_id: i.product_id, quantity_received: i.quantity_ordered })))
                          });
                          if(res.ok) fetchOrders();
                        }}>
                          Receive
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
              <CardTitle className="text-white">{editingOrder ? "Edit Purchase Order" : "Create Purchase Order"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Vendor</label>
                <input
                  required
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="e.g. TimberKing Lumber Co."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Material Requested</label>
                <input
                  required
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="e.g. Oak Timber Logs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Amount (₹)</label>
                <input
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                  <option value="RECEIVED">RECEIVED</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white py-5 rounded-lg text-sm mt-4">
                Save Purchase Order
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function PurchasingOrdersPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 p-6">Loading orders...</div>}>
      <PurchasingOrdersContent />
    </Suspense>
  );
}
