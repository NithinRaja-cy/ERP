"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X } from "lucide-react";

type FinishedGood = { id: string; name: string; sku: string; targetQty: number; doneQty: number; cost: string; status: string };

const initialGoods: FinishedGood[] = [
  { id: "FG-901", name: "Royal Teak Bed Frame (King)", sku: "FM-101", targetQty: 50, doneQty: 48, cost: "₹28,500", status: "COMPLETED" },
  { id: "FG-902", name: "6-Seater Dining Table Set", sku: "FM-102", targetQty: 30, doneQty: 25, cost: "₹42,000", status: "IN_PROGRESS" },
  { id: "FG-903", name: "3-Door Wardrobe (Walnut)", sku: "FM-103", targetQty: 20, doneQty: 18, cost: "₹22,000", status: "COMPLETED" },
];

export default function MfgProductsPage() {
  const [goods, setGoods] = useState<FinishedGood[]>(initialGoods);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGood, setEditingGood] = useState<FinishedGood | null>(null);
  const [formData, setFormData] = useState({ name: "", sku: "", targetQty: 0, doneQty: 0, cost: "" });

  const handleOpenAdd = () => {
    setEditingGood(null);
    setFormData({ name: "", sku: "", targetQty: 0, doneQty: 0, cost: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (good: FinishedGood) => {
    setEditingGood(good);
    setFormData({ name: good.name, sku: good.sku, targetQty: good.targetQty, doneQty: good.doneQty, cost: good.cost.replace(/[₹,]/g, "") });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const costStr = formData.cost.startsWith("₹") ? formData.cost : `₹${Number(formData.cost).toLocaleString("en-IN")}`;
    const status = formData.doneQty >= formData.targetQty ? "COMPLETED" : "IN_PROGRESS";

    if (editingGood) {
      setGoods(goods.map((g) => g.id === editingGood.id ? { ...g, ...formData, cost: costStr, status } : g));
    } else {
      const newGood: FinishedGood = {
        id: `FG-90${goods.length + 1}`,
        name: formData.name,
        sku: formData.sku,
        targetQty: formData.targetQty,
        doneQty: formData.doneQty,
        cost: costStr,
        status,
      };
      setGoods([...goods, newGood]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setGoods(goods.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Finished Goods Index</h2>
          <p className="text-slate-400 mt-1">Audit final assembled goods quality logs, manufacturing unit costs, and output lists.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Finished Good
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Active Finished Goods Catalog</CardTitle>
          <CardDescription className="text-slate-400">Total units built and tracked by this workshop floor.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">SKU Code</TableHead>
                <TableHead className="text-slate-400">Good Name</TableHead>
                <TableHead className="text-slate-400">Target Output</TableHead>
                <TableHead className="text-slate-400">Done Output</TableHead>
                <TableHead className="text-slate-400">Unit Cost</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goods.map((good) => (
                <TableRow key={good.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-mono text-violet-400">{good.sku}</TableCell>
                  <TableCell className="text-white font-medium">{good.name}</TableCell>
                  <TableCell className="text-slate-300">{good.targetQty} units</TableCell>
                  <TableCell className="text-slate-400">{good.doneQty} units</TableCell>
                  <TableCell className="text-slate-300 font-semibold">{good.cost}</TableCell>
                  <TableCell>
                    <Badge className={
                      good.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    } variant="outline">
                      {good.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(good)} className="text-slate-400 hover:text-white">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(good.id)} className="text-slate-400 hover:text-rose-400">
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
              <CardTitle className="text-white">{editingGood ? "Edit Good Record" : "Add Finished Good"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Good Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Teak Bed Frame"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">SKU Code</label>
                <input
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. FM-101"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Target Qty</label>
                <input
                  required
                  type="number"
                  value={formData.targetQty}
                  onChange={(e) => setFormData({ ...formData, targetQty: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 50"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Done Qty</label>
                <input
                  required
                  type="number"
                  value={formData.doneQty}
                  onChange={(e) => setFormData({ ...formData, doneQty: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 48"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Unit Assembly Cost (₹)</label>
                <input
                  required
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="e.g. 28500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                />
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-5 rounded-lg text-sm mt-4">
                Save Finished Good details
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
