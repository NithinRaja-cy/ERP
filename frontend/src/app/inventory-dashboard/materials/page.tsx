"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X } from "lucide-react";

type MaterialItem = { id: string; name: string; sku: string; onHand: number; reserved: number; available: number; location: string; status: string };

const initialMaterials: MaterialItem[] = [
  { id: "MAT-001", name: "Premium Teak Planks", sku: "WD-001", onHand: 320, reserved: 80, available: 240, location: "Warehouse A - Wood Section", status: "IN_STOCK" },
  { id: "MAT-002", name: "Oak Timber Logs", sku: "WD-002", onHand: 150, reserved: 40, available: 110, location: "Warehouse A - Wood Section", status: "IN_STOCK" },
  { id: "MAT-003", name: "Premium Foam Padding", sku: "UP-201", onHand: 500, reserved: 120, available: 380, location: "Upholstery Store C1", status: "IN_STOCK" },
  { id: "MAT-004", name: "Steel Chair Legs (Sets)", sku: "MT-301", onHand: 400, reserved: 380, available: 20, location: "Metal Store D1", status: "LOW_STOCK" },
];

export default function InventoryMaterialsPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);
  const [formData, setFormData] = useState({ name: "", sku: "", onHand: 0, reserved: 0, location: "" });

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData({ name: "", sku: "", onHand: 0, reserved: 0, location: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: MaterialItem) => {
    setEditingMaterial(material);
    setFormData({ name: material.name, sku: material.sku, onHand: material.onHand, reserved: material.reserved, location: material.location });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const available = formData.onHand - formData.reserved;
    const status = available <= 30 ? "LOW_STOCK" : "IN_STOCK";

    if (editingMaterial) {
      setMaterials(materials.map((m) => m.id === editingMaterial.id ? { ...m, ...formData, available, status } : m));
    } else {
      const newMaterial: MaterialItem = {
        id: `MAT-${String(materials.length + 1).padStart(3, "0")}`,
        name: formData.name,
        sku: formData.sku,
        onHand: formData.onHand,
        reserved: formData.reserved,
        available,
        location: formData.location,
        status,
      };
      setMaterials([...materials, newMaterial]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Raw Materials Ledger</h2>
          <p className="text-slate-400 mt-1">Audit raw stock levels, relocate material containers, and set low stock warnings.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Material Item
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Active Materials Ledger</CardTitle>
          <CardDescription className="text-slate-400">Total raw materials stock levels currently sitting in warehouses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">SKU Code</TableHead>
                <TableHead className="text-slate-400">Material Name</TableHead>
                <TableHead className="text-slate-400">On Hand</TableHead>
                <TableHead className="text-slate-400">Reserved</TableHead>
                <TableHead className="text-slate-400">Available</TableHead>
                <TableHead className="text-slate-400">Warehouse Location</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-mono text-cyan-400">{material.sku}</TableCell>
                  <TableCell className="text-white font-medium">{material.name}</TableCell>
                  <TableCell className="text-slate-300">{material.onHand} units</TableCell>
                  <TableCell className="text-slate-400">{material.reserved} units</TableCell>
                  <TableCell className="text-slate-200 font-semibold">{material.available} units</TableCell>
                  <TableCell className="text-slate-400 text-xs">{material.location}</TableCell>
                  <TableCell>
                    <Badge className={
                      material.status === 'IN_STOCK' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    } variant="outline">
                      {material.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(material)} className="text-slate-400 hover:text-white">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(material.id)} className="text-slate-400 hover:text-rose-400">
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
              <CardTitle className="text-white">{editingMaterial ? "Edit Material Details" : "Add Material Item"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Material Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Oak Timber Logs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">SKU Code</label>
                <input
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. WD-003"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">On Hand Quantity</label>
                <input
                  required
                  type="number"
                  value={formData.onHand}
                  onChange={(e) => setFormData({ ...formData, onHand: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Reserved Quantity</label>
                <input
                  required
                  type="number"
                  value={formData.reserved}
                  onChange={(e) => setFormData({ ...formData, reserved: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 10"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Warehouse Location</label>
                <input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Warehouse A - Wood Section"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-5 rounded-lg text-sm mt-4">
                Save Material details
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
