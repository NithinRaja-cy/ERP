"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X } from "lucide-react";

type SalesProduct = { id: string; name: string; category: string; price: string; stock: number; status: string };

const initialProducts: SalesProduct[] = [
  { id: "PROD-F001", name: "Royal Teak Bed Frame", category: "Bedroom", price: "₹45,000", stock: 16, status: "IN_STOCK" },
  { id: "PROD-F002", name: "6-Seater Dining Table Set", category: "Dining", price: "₹72,000", stock: 7, status: "IN_STOCK" },
  { id: "PROD-F003", name: "3-Door Wardrobe (Walnut)", category: "Bedroom", price: "₹38,500", stock: 17, status: "IN_STOCK" },
  { id: "PROD-F004", name: "L-Shape Sofa Set", category: "Living Room", price: "₹55,000", stock: 3, status: "LOW_STOCK" },
];

export default function SalesProductsPage() {
  const [products, setProducts] = useState<SalesProduct[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SalesProduct | null>(null);
  const [formData, setFormData] = useState({ name: "", category: "Bedroom", price: "", stock: 0 });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ name: "", category: "Bedroom", price: "", stock: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: SalesProduct) => {
    setEditingProduct(product);
    setFormData({ name: product.name, category: product.category, price: product.price.replace(/[₹,]/g, ""), stock: product.stock });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const priceStr = formData.price.startsWith("₹") ? formData.price : `₹${Number(formData.price).toLocaleString("en-IN")}`;
    const status = formData.stock === 0 ? "OUT_OF_STOCK" : formData.stock <= 5 ? "LOW_STOCK" : "IN_STOCK";

    if (editingProduct) {
      setProducts(products.map((p) => p.id === editingProduct.id ? { ...p, ...formData, price: priceStr, status } : p));
    } else {
      const newProd: SalesProduct = {
        id: `PROD-F${String(products.length + 1).padStart(3, "0")}`,
        name: formData.name,
        category: formData.category,
        price: priceStr,
        stock: formData.stock,
        status,
      };
      setProducts([...products, newProd]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Products Catalog</h2>
          <p className="text-slate-400 mt-1">View availability, adjust catalog details, and configure price lists.</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Active Product Listings</CardTitle>
          <CardDescription className="text-slate-400">Complete items index viewable by portal customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Product ID</TableHead>
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Price</TableHead>
                <TableHead className="text-slate-400">Available Stock</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-mono text-emerald-400">{product.id}</TableCell>
                  <TableCell className="text-white font-medium">{product.name}</TableCell>
                  <TableCell className="text-slate-300">{product.category}</TableCell>
                  <TableCell className="text-slate-300 font-semibold">{product.price}</TableCell>
                  <TableCell className="text-slate-400">{product.stock} units</TableCell>
                  <TableCell>
                    <Badge className={
                      product.status === 'IN_STOCK' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      product.status === 'LOW_STOCK' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    } variant="outline">
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(product)} className="text-slate-400 hover:text-white">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-rose-400">
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
              <CardTitle className="text-white">{editingProduct ? "Edit Catalog Item" : "Add Catalog Item"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Product Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Solid Wood Dressing Table"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="Bedroom">Bedroom</option>
                  <option value="Living Room">Living Room</option>
                  <option value="Dining">Dining</option>
                  <option value="Office">Office</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Price (₹)</label>
                <input
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 28000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Available Stock Qty</label>
                <input
                  required
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 15"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-lg text-sm mt-4">
                Save Listing details
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
