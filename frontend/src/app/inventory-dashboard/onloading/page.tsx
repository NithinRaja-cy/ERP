"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X } from "lucide-react";

type OnloadingShipment = { id: string; item: string; qty: number; supplier: string; eta: string; status: string };

const initialShipments: OnloadingShipment[] = [
  { id: "SHIP-901", item: "Premium Teak Planks", qty: 250, supplier: "TimberKing Lumber Co.", eta: "2026-06-23", status: "IN_TRANSIT" },
  { id: "SHIP-902", item: "Velvet Upholstery fabric (Rolls)", qty: 45, supplier: "FoamPro Upholstery", eta: "2026-06-22", status: "DISPATCHED" },
  { id: "SHIP-903", item: "Screws & Joint Bolts (Boxes)", qty: 80, supplier: "SteelCraft Hardware Hub", eta: "2026-06-25", status: "PENDING" },
];

export default function InventoryOnloadingPage() {
  const [shipments, setShipments] = useState<OnloadingShipment[]>(initialShipments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<OnloadingShipment | null>(null);
  const [formData, setFormData] = useState({ item: "", qty: 0, supplier: "", eta: "", status: "PENDING" });

  const handleOpenAdd = () => {
    setEditingShipment(null);
    setFormData({ item: "", qty: 0, supplier: "", eta: "", status: "PENDING" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shipment: OnloadingShipment) => {
    setEditingShipment(shipment);
    setFormData({ item: shipment.item, qty: shipment.qty, supplier: shipment.supplier, eta: shipment.eta, status: shipment.status });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShipment) {
      setShipments(shipments.map((s) => s.id === editingShipment.id ? { ...s, ...formData } : s));
    } else {
      const newShipment: OnloadingShipment = {
        id: `SHIP-${String(900 + shipments.length + 1)}`,
        item: formData.item,
        qty: formData.qty,
        supplier: formData.supplier,
        eta: formData.eta,
        status: formData.status,
      };
      setShipments([...shipments, newShipment]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setShipments(shipments.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Products Onloading</h2>
          <p className="text-slate-400 mt-1">Track upcoming raw material shipments, inspect freight items, and update ETA dates.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Log Incoming Freight
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Active Incoming Shipments</CardTitle>
          <CardDescription className="text-slate-400">Inventory shipments that have been ordered and are onloading or in transit.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Shipment ID</TableHead>
                <TableHead className="text-slate-400">Item Name</TableHead>
                <TableHead className="text-slate-400">Quantity</TableHead>
                <TableHead className="text-slate-400">Supplier</TableHead>
                <TableHead className="text-slate-400">Expected ETA</TableHead>
                <TableHead className="text-slate-400">Shipment Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-mono text-cyan-400">{shipment.id}</TableCell>
                  <TableCell className="text-white font-medium">{shipment.item}</TableCell>
                  <TableCell className="text-slate-300">{shipment.qty} units</TableCell>
                  <TableCell className="text-slate-400">{shipment.supplier}</TableCell>
                  <TableCell className="text-slate-300 font-semibold">{shipment.eta}</TableCell>
                  <TableCell>
                    <Badge className={
                      shipment.status === 'IN_TRANSIT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      shipment.status === 'DISPATCHED' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-slate-700/10 text-slate-400 border-slate-800'
                    } variant="outline">
                      {shipment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(shipment)} className="text-slate-400 hover:text-white">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(shipment.id)} className="text-slate-400 hover:text-rose-400">
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
              <CardTitle className="text-white">{editingShipment ? "Edit Freight Log" : "Log Incoming Freight"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Item Name</label>
                <input
                  required
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  placeholder="e.g. Oak Timber Logs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Quantity</label>
                <input
                  required
                  type="number"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Supplier</label>
                <input
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="e.g. TimberKing Lumber Co."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Expected ETA</label>
                <input
                  required
                  type="date"
                  value={formData.eta}
                  onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Shipment Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-5 rounded-lg text-sm mt-4">
                Save Incoming Shipment details
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
