"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Edit2, Trash2 } from "lucide-react";

interface StockItem {
  sku: string;
  name: string;
  onHand: number;
  reserved: number;
  available: number;
  location: string;
}

const initialStock: StockItem[] = [
  { sku: "WD-001", name: "Teak Wood Planks (Premium)", onHand: 320, reserved: 80, available: 240, location: "Warehouse A - Wood Section" },
  { sku: "WD-002", name: "Oak Timber Logs", onHand: 150, reserved: 40, available: 110, location: "Warehouse A - Wood Section" },
  { sku: "FM-101", name: "Queen Size Bed Frame (Teak)", onHand: 28, reserved: 12, available: 16, location: "Finished Goods B1" },
  { sku: "FM-102", name: "6-Seater Dining Table Set", onHand: 15, reserved: 8, available: 7, location: "Finished Goods B2" },
  { sku: "FM-103", name: "3-Door Wardrobe (Walnut)", onHand: 22, reserved: 5, available: 17, location: "Finished Goods B3" },
  { sku: "UP-201", name: "Premium Foam Padding (m²)", onHand: 500, reserved: 120, available: 380, location: "Upholstery Store C1" },
  { sku: "MT-301", name: "Steel Chair Legs (Set of 4)", onHand: 400, reserved: 50, available: 350, location: "Metal Store D1" },
];

export default function InventoryPage() {
  const [stock, setStock] = useState<StockItem[]>(initialStock);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Form states
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [onHand, setOnHand] = useState(0);
  const [reserved, setReserved] = useState(0);
  const [location, setLocation] = useState("");

  const openAddModal = () => {
    setEditingItem(null);
    setSku("");
    setName("");
    setOnHand(0);
    setReserved(0);
    setLocation("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: StockItem) => {
    setEditingItem(item);
    setSku(item.sku);
    setName(item.name);
    setOnHand(item.onHand);
    setReserved(item.reserved);
    setLocation(item.location);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const available = onHand - reserved;

    if (editingItem) {
      setStock(stock.map(item => item.sku === editingItem.sku ? {
        sku, name, onHand, reserved, available, location
      } : item));
    } else {
      setStock([...stock, { sku, name, onHand, reserved, available, location }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (skuToDelete: string) => {
    if (confirm("Are you sure you want to delete this stock item?")) {
      setStock(stock.filter(item => item.sku !== skuToDelete));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Inventory Management</h2>
          <p className="text-slate-400 mt-1">Real-time stock ledger, reservations, and locations.</p>
        </div>
        <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Stock
        </Button>
      </div>
      
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Current Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">SKU</TableHead>
                <TableHead className="text-slate-400">Product Name</TableHead>
                <TableHead className="text-slate-400">On Hand</TableHead>
                <TableHead className="text-slate-400">Reserved</TableHead>
                <TableHead className="text-slate-400">Available</TableHead>
                <TableHead className="text-slate-400">Location</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stock.map((item) => (
                <TableRow key={item.sku} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-indigo-400">{item.sku}</TableCell>
                  <TableCell className="text-slate-300">{item.name}</TableCell>
                  <TableCell className="text-slate-300">{item.onHand}</TableCell>
                  <TableCell className="text-rose-400">{item.reserved}</TableCell>
                  <TableCell className="text-emerald-400 font-bold">{item.available}</TableCell>
                  <TableCell className="text-slate-300">{item.location}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button onClick={() => openEditModal(item)} variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:bg-indigo-500/10">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(item.sku)} variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-500/10">
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

      {/* Add / Edit Stock Modal */}
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
              {editingItem ? "Edit Stock Item" : "Add New Stock"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">SKU</label>
                <input 
                  type="text" 
                  required
                  disabled={editingItem !== null}
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  placeholder="e.g. RM-003"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Steel Beams"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">On Hand</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={onHand}
                    onChange={(e) => setOnHand(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Reserved</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={reserved}
                    onChange={(e) => setReserved(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Location</label>
                <input 
                  type="text" 
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Warehouse C"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
