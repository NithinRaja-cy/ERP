"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Edit2, Trash2 } from "lucide-react";

interface SalesOrder {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: "DRAFT" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

const initialOrders: SalesOrder[] = [
  { id: "SO-1023", customer: "Acme Corp", date: "2026-06-18", amount: "₹12,450", status: "CONFIRMED" },
  { id: "SO-1024", customer: "Globex Inc", date: "2026-06-19", amount: "₹8,900", status: "PROCESSING" },
  { id: "SO-1025", customer: "Initech", date: "2026-06-20", amount: "₹21,000", status: "DRAFT" },
];

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

  // Form states
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<SalesOrder["status"]>("DRAFT");

  const openAddModal = () => {
    setEditingOrder(null);
    setCustomer("");
    setAmount("");
    setStatus("DRAFT");
    setIsModalOpen(true);
  };

  const openEditModal = (order: SalesOrder) => {
    setEditingOrder(order);
    setCustomer(order.customer);
    setAmount(order.amount);
    setStatus(order.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const formattedAmount = amount.startsWith('₹') ? amount : `₹${amount}`;

    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? {
        ...o, customer, amount: formattedAmount, status
      } : o));
    } else {
      const nextId = `SO-${1023 + orders.length}`;
      setOrders([...orders, {
        id: nextId, customer, date: today, amount: formattedAmount, status
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this sales order?")) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Sales Orders</h2>
          <p className="text-slate-400 mt-1">Manage customer demand, update sales parameters, and configure status overrides.</p>
        </div>
        <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Sales Order
        </Button>
      </div>
      
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Order ID</TableHead>
                <TableHead className="text-slate-400">Customer</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-indigo-400">{order.id}</TableCell>
                  <TableCell className="text-slate-300">{order.customer}</TableCell>
                  <TableCell className="text-slate-300">{order.date}</TableCell>
                  <TableCell className="text-slate-300">{order.amount}</TableCell>
                  <TableCell>
                    <Badge className={
                      order.status === 'CONFIRMED' ? 'bg-indigo-500 hover:bg-indigo-600' :
                      order.status === 'PROCESSING' ? 'bg-amber-500 hover:bg-amber-600' :
                      order.status === 'SHIPPED' ? 'bg-blue-500 hover:bg-blue-600' :
                      order.status === 'DELIVERED' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-700 text-slate-300'
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

      {/* Sales Order Modal */}
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
              {editingOrder ? "Edit Sales Order" : "Create New Sales Order"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Customer Name</label>
                <input 
                  type="text" 
                  required
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Order Amount</label>
                <input 
                  type="text" 
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 15,000"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SalesOrder["status"])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
