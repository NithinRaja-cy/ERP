"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X, Check } from "lucide-react";

type PurchaseOrder = { id: string; vendor: string; material: string; date: string; amount: string; status: string };

const initialOrders: PurchaseOrder[] = [
  { id: "PO-2026-001", vendor: "TimberKing Lumber Co.", material: "Teak Wood Planks", date: "2026-06-19", amount: "₹85,000", status: "PENDING_APPROVAL" },
  { id: "PO-2026-002", vendor: "FoamPro Upholstery", material: "Premium Foam Padding", date: "2026-06-18", amount: "₹42,000", status: "RECEIVED" },
  { id: "PO-2026-003", vendor: "SteelCraft Hardware Hub", material: "Steel Chair Legs", date: "2026-06-20", amount: "₹18,500", status: "DRAFT" },
];

export default function PurchasingOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState({ vendor: "", material: "", amount: "", status: "DRAFT" });

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
        <Button onClick={handleOpenAdd} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Create Purchase Order
        </Button>
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
                  <TableCell className="font-mono text-amber-400">{order.id}</TableCell>
                  <TableCell className="text-white font-medium">{order.vendor}</TableCell>
                  <TableCell className="text-slate-300">{order.material}</TableCell>
                  <TableCell className="text-slate-400">{order.date}</TableCell>
                  <TableCell className="text-slate-300 font-semibold">{order.amount}</TableCell>
                  <TableCell>
                    <Badge className={
                      order.status === 'RECEIVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      order.status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-700/10 text-slate-400 border-slate-800'
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
