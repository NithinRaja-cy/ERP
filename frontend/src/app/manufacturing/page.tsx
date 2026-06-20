"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Edit2, Trash2 } from "lucide-react";

interface MfgOrder {
  id: string;
  product: string;
  qty: number;
  start: string;
  status: "DRAFT" | "READY" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

const initialOrders: MfgOrder[] = [
  { id: "MO-SO1023-44", product: "Royal Teak Bed Frame", qty: 15, start: "2026-06-19", status: "IN_PROGRESS" },
  { id: "MO-SO1024-12", product: "6-Seater Dining Table Set", qty: 50, start: "2026-06-21", status: "DRAFT" },
  { id: "MO-INTERNAL-01", product: "3-Door Wardrobe (Walnut)", qty: 100, start: "2026-06-18", status: "COMPLETED" },
];

export default function ManufacturingPage() {
  const [orders, setOrders] = useState<MfgOrder[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<MfgOrder | null>(null);

  // Form states
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState(0);
  const [status, setStatus] = useState<MfgOrder["status"]>("DRAFT");

  const openAddModal = () => {
    setEditingOrder(null);
    setProduct("");
    setQty(10);
    setStatus("DRAFT");
    setIsModalOpen(true);
  };

  const openEditModal = (order: MfgOrder) => {
    setEditingOrder(order);
    setProduct(order.product);
    setQty(order.qty);
    setStatus(order.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? {
        ...o, product, qty, status
      } : o));
    } else {
      const nextId = `MO-GEN-${100 + orders.length}`;
      setOrders([...orders, {
        id: nextId, product, qty, start: today, status
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this manufacturing order?")) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Manufacturing Operations</h2>
          <p className="text-slate-400 mt-1">Track assembly schedules, monitor work floor routes, and override Bill of Materials runs.</p>
        </div>
        <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Production Run
        </Button>
      </div>
      
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Active Manufacturing Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Order ID</TableHead>
                <TableHead className="text-slate-400">Product</TableHead>
                <TableHead className="text-slate-400">Quantity</TableHead>
                <TableHead className="text-slate-400">Start Date</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-indigo-400">{order.id}</TableCell>
                  <TableCell className="text-slate-300">{order.product}</TableCell>
                  <TableCell className="text-slate-300">{order.qty} units</TableCell>
                  <TableCell className="text-slate-300">{order.start}</TableCell>
                  <TableCell>
                    <Badge className={
                      order.status === 'IN_PROGRESS' ? 'bg-amber-500 hover:bg-amber-600' : 
                      order.status === 'COMPLETED' ? 'bg-emerald-500 hover:bg-emerald-600' :
                      order.status === 'READY' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-slate-700 text-slate-300'
                    }>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button onClick={() => openEditModal(order)} variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:bg-indigo-500/10">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(order.id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-500/10">
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

      {/* Manufacturing Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">
              {editingOrder ? "Edit Production Schedule" : "Add Production Run"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Product Description</label>
                <input 
                  type="text" 
                  required
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Royal Teak Bed Frame"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Quantity</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Job Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MfgOrder["status"])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="READY">READY</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Schedule Run
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
