"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, X, Eye, BookOpen, Layers } from "lucide-react";

type BomComponent = { name: string; qty: number; unit: string };
type Bom = { id: string; name: string; sku: string; version: string; category: string; components: BomComponent[] };

const initialBoms: Bom[] = [
  {
    id: "BOM-001", name: "Royal Teak Bed Frame (King)", sku: "FM-101", version: "v2.1", category: "Bedroom",
    components: [
      { name: "Teak Wood Planks",        qty: 8,   unit: "Planks" },
      { name: "Screws & Joint Bolts",    qty: 24,  unit: "Units" },
      { name: "Premium Polish Lacquer",  qty: 2.5, unit: "Liters" },
      { name: "Foam Padding (headrest)", qty: 1,   unit: "Sheet" },
    ]
  },
  {
    id: "BOM-002", name: "6-Seater Dining Table Set", sku: "FM-102", version: "v1.3", category: "Dining",
    components: [
      { name: "Oak Timber Logs",         qty: 4, unit: "Logs" },
      { name: "Cushioned Chair Seats",   qty: 6, unit: "Units" },
      { name: "Joint Fittings Set",      qty: 1, unit: "Set" },
      { name: "Lacquer Finish Coat",     qty: 2, unit: "Liters" },
    ]
  },
  {
    id: "BOM-003", name: "3-Door Wardrobe (Walnut)", sku: "FM-103", version: "v1.0", category: "Bedroom",
    components: [
      { name: "Walnut Wood Sheets",      qty: 12, unit: "Sheets" },
      { name: "Mirror Glass Panel",      qty: 1,  unit: "Panel" },
      { name: "Steel Door Hinges",       qty: 6,  unit: "Pairs" },
      { name: "Drawer Slider Rails",     qty: 4,  unit: "Pairs" },
    ]
  },
  {
    id: "BOM-004", name: "L-Shaped Office Sofa", sku: "FM-104", version: "v1.1", category: "Office",
    components: [
      { name: "High-Density Foam",       qty: 3,  unit: "Blocks" },
      { name: "Premium Fabric Cover",    qty: 5,  unit: "Meters" },
      { name: "Steel Frame Base",        qty: 1,  unit: "Set" },
      { name: "Wooden Arm Rests",        qty: 2,  unit: "Units" },
    ]
  },
];

export default function BomPage() {
  const [boms, setBoms] = useState<Bom[]>(initialBoms);
  const [selectedBom, setSelectedBom] = useState<Bom>(initialBoms[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBomName, setNewBomName] = useState("");
  const [newBomSku, setNewBomSku] = useState("");
  const [newBomCategory, setNewBomCategory] = useState("Bedroom");
  const [compList, setCompList] = useState<BomComponent[]>([{ name: "", qty: 1, unit: "Units" }]);

  const handleAddCompRow = () => setCompList([...compList, { name: "", qty: 1, unit: "Units" }]);

  const handleCompChange = (idx: number, field: keyof BomComponent, val: string | number) => {
    const updated = [...compList];
    updated[idx] = { ...updated[idx], [field]: val };
    setCompList(updated);
  };

  const handleRemoveComp = (idx: number) => setCompList(compList.filter((_, i) => i !== idx));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newBom: Bom = {
      id: `BOM-${String(boms.length + 1).padStart(3, "0")}`,
      name: newBomName,
      sku: newBomSku,
      version: "v1.0",
      category: newBomCategory,
      components: compList.filter((c) => c.name.trim() !== ""),
    };
    setBoms([...boms, newBom]);
    setSelectedBom(newBom);
    setIsModalOpen(false);
  };

  const categoryColor: Record<string, string> = {
    Bedroom: "bg-violet-500/10 text-violet-400 border-violet-500/25",
    Dining:  "bg-amber-500/10  text-amber-400  border-amber-500/25",
    Office:  "bg-blue-500/10   text-blue-400   border-blue-500/25",
    Living:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <BookOpen className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Bill of Materials (BOM)</h2>
            <p className="text-slate-400 mt-0.5">Configure ingredient recipes, component sets, and resource guides for each product.</p>
          </div>
        </div>
        <Button
          onClick={() => { setIsModalOpen(true); setNewBomName(""); setNewBomSku(""); setNewBomCategory("Bedroom"); setCompList([{ name: "", qty: 1, unit: "Units" }]); }}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2"
        >
          <Plus className="h-4 w-4" /> Create BOM
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total BOMs",         value: boms.length,                                                       color: "text-white",       bg: "bg-slate-800" },
          { label: "Total Components",   value: boms.reduce((a, b) => a + b.components.length, 0),                 color: "text-violet-400",  bg: "bg-violet-500/10" },
          { label: "Product Categories", value: [...new Set(boms.map((b) => b.category))].length,                  color: "text-amber-400",   bg: "bg-amber-500/10" },
          { label: "Avg Components/BOM", value: Math.round(boms.reduce((a, b) => a + b.components.length, 0) / boms.length), color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((s) => (
          <Card key={s.label} className={`${s.bg} border-slate-800`}>
            <CardContent className="p-5">
              <p className="text-slate-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BOM Catalog List */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-400" /> BOM Catalog
            </CardTitle>
            <CardDescription className="text-slate-400">Select a recipe sheet to view details.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {boms.map((bom) => (
              <button
                key={bom.id}
                onClick={() => setSelectedBom(bom)}
                className={`w-full text-left p-3 rounded-xl flex justify-between items-center transition-all ${
                  selectedBom?.id === bom.id
                    ? "bg-violet-600/20 text-white border border-violet-500/40"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold truncate max-w-[180px]">{bom.name}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-slate-500 font-mono">{bom.sku}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-violet-500">{bom.version}</span>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-slate-500 flex-shrink-0" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* BOM Detail Sheet */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
          {selectedBom ? (
            <>
              <CardHeader className="border-b border-slate-800">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-white text-lg">{selectedBom.name}</CardTitle>
                    <p className="text-slate-400 text-sm mt-1">
                      BOM Sheet: <span className="font-mono text-violet-400">{selectedBom.id}</span>
                      {" "}| SKU: <span className="font-mono text-slate-300">{selectedBom.sku}</span>
                      {" "}| Version: <span className="text-emerald-400 font-semibold">{selectedBom.version}</span>
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${categoryColor[selectedBom.category] ?? "bg-slate-700 text-slate-300 border-slate-600"}`}>
                    {selectedBom.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-slate-800/50">
                      <TableHead className="text-slate-400">#</TableHead>
                      <TableHead className="text-slate-400">Required Ingredient / Component</TableHead>
                      <TableHead className="text-slate-400">Qty Needed</TableHead>
                      <TableHead className="text-slate-400">Measurement Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBom.components.map((comp, idx) => (
                      <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell className="text-slate-600 font-mono text-xs">{String(idx + 1).padStart(2, "0")}</TableCell>
                        <TableCell className="text-white font-medium">{comp.name}</TableCell>
                        <TableCell className="text-violet-400 font-bold">{comp.qty}</TableCell>
                        <TableCell className="text-slate-400">{comp.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500">
                  <span>{selectedBom.components.length} components required</span>
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500">Select a BOM to view details.</div>
          )}
        </Card>
      </div>

      {/* Create BOM Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="bg-slate-900 border-slate-800 w-full max-w-lg p-6 relative max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-white">Create Bill of Materials</CardTitle>
            </CardHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 block">Product Name</label>
                  <input required value={newBomName} onChange={(e) => setNewBomName(e.target.value)}
                    placeholder="e.g. Royal Teak Bed Frame"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 block">SKU Code</label>
                  <input required value={newBomSku} onChange={(e) => setNewBomSku(e.target.value)}
                    placeholder="e.g. FM-101"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Category</label>
                <select value={newBomCategory} onChange={(e) => setNewBomCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                  {["Bedroom", "Dining", "Office", "Living"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-semibold flex justify-between items-center">
                  <span>Components List</span>
                  <button type="button" onClick={handleAddCompRow} className="text-violet-400 hover:text-violet-300 text-xs font-semibold">
                    + Add Row
                  </button>
                </p>
                {compList.map((comp, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input required value={comp.name} onChange={(e) => handleCompChange(idx, "name", e.target.value)}
                      placeholder="Component name"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                    <input required type="number" value={comp.qty} onChange={(e) => handleCompChange(idx, "qty", parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                      className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                    <input required value={comp.unit} onChange={(e) => handleCompChange(idx, "unit", e.target.value)}
                      placeholder="Unit"
                      className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                    {compList.length > 1 && (
                      <button type="button" onClick={() => handleRemoveComp(idx)} className="text-rose-400 hover:text-rose-300">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-5 rounded-xl text-sm mt-2">
                Save BOM Configuration
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
