"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, X, Eye } from "lucide-react";

type BomComponent = { name: string; qty: number; unit: string };
type Bom = { id: string; name: string; sku: string; components: BomComponent[] };

const initialBoms: Bom[] = [
  {
    id: "BOM-001",
    name: "Royal Teak Bed Frame (King)",
    sku: "FM-101",
    components: [
      { name: "Teak Wood Planks", qty: 8, unit: "Planks" },
      { name: "Screws & Joint Bolts", qty: 24, unit: "Units" },
      { name: "Premium Polish Lacquer", qty: 2.5, unit: "Liters" },
    ]
  },
  {
    id: "BOM-002",
    name: "6-Seater Dining Table Set",
    sku: "FM-102",
    components: [
      { name: "Oak Timber Logs", qty: 4, unit: "Logs" },
      { name: "Cushioned Chair seats", qty: 6, unit: "Units" },
      { name: "Joint Fittings Set", qty: 1, unit: "Set" },
    ]
  }
];

export default function MfgBomPage() {
  const [boms, setBoms] = useState<Bom[]>(initialBoms);
  const [selectedBom, setSelectedBom] = useState<Bom | null>(initialBoms[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBomName, setNewBomName] = useState("");
  const [newBomSku, setNewBomSku] = useState("");
  const [compList, setCompList] = useState<BomComponent[]>([{ name: "", qty: 1, unit: "Units" }]);

  const handleAddCompRow = () => {
    setCompList([...compList, { name: "", qty: 1, unit: "Units" }]);
  };

  const handleCompChange = (idx: number, field: keyof BomComponent, val: string | number) => {
    const updated = [...compList];
    updated[idx] = { ...updated[idx], [field]: val };
    setCompList(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newBom: Bom = {
      id: `BOM-${String(boms.length + 1).padStart(3, "0")}`,
      name: newBomName,
      sku: newBomSku,
      components: compList.filter((c) => c.name.trim() !== ""),
    };
    setBoms([...boms, newBom]);
    setSelectedBom(newBom);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Bill of Materials (BOM)</h2>
          <p className="text-slate-400 mt-1">Configure ingredient recipes, assembly component sets, and resource guides.</p>
        </div>
        <Button onClick={() => { setIsModalOpen(true); setNewBomName(""); setNewBomSku(""); setCompList([{ name: "", qty: 1, unit: "Units" }]); }} className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Create Bill of Materials
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: BOM Registry */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white text-base">BOM Catalog</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Select a recipes config sheet below.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {boms.map((bom) => (
              <button
                key={bom.id}
                onClick={() => setSelectedBom(bom)}
                className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors ${
                  selectedBom?.id === bom.id ? "bg-violet-600/20 text-white border border-violet-500/40" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold truncate max-w-[180px]">{bom.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{bom.sku}</p>
                </div>
                <Eye className="h-4 w-4 text-slate-500" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Right Column: Recipe Spec details sheet */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
          {selectedBom ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">{selectedBom.name}</CardTitle>
                    <p className="text-slate-400 text-sm mt-0.5">BOM Sheet: <span className="font-mono text-violet-400">{selectedBom.id}</span> | SKU: <span className="font-mono text-slate-300">{selectedBom.sku}</span></p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-slate-800/50">
                      <TableHead className="text-slate-400">Required Ingredient Component</TableHead>
                      <TableHead className="text-slate-400">Qty Needed</TableHead>
                      <TableHead className="text-slate-400">Measurement Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBom.components.map((comp, idx) => (
                      <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell className="text-white font-medium">{comp.name}</TableCell>
                        <TableCell className="text-slate-300 font-semibold">{comp.qty}</TableCell>
                        <TableCell className="text-slate-400">{comp.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500">No BOM sheet loaded.</div>
          )}
        </Card>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="bg-slate-900 border-slate-800 w-full max-w-lg p-6 relative max-h-[85vh] overflow-y-auto">
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
                  <input
                    required
                    value={newBomName}
                    onChange={(e) => setNewBomName(e.target.value)}
                    placeholder="e.g. Royal Teak Bed Frame"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 block">SKU Code</label>
                  <input
                    required
                    value={newBomSku}
                    onChange={(e) => setNewBomSku(e.target.value)}
                    placeholder="e.g. FM-101"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-semibold flex justify-between items-center">
                  <span>Components List</span>
                  <Button type="button" size="sm" variant="ghost" onClick={handleAddCompRow} className="text-violet-400 hover:text-white h-auto p-0">
                    + Add Component Row
                  </Button>
                </p>

                {compList.map((comp, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      required
                      value={comp.name}
                      onChange={(e) => handleCompChange(idx, "name", e.target.value)}
                      placeholder="e.g. Teak Wood Planks"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    />
                    <input
                      required
                      type="number"
                      value={comp.qty}
                      onChange={(e) => handleCompChange(idx, "qty", parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                      className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    />
                    <input
                      required
                      value={comp.unit}
                      onChange={(e) => handleCompChange(idx, "unit", e.target.value)}
                      placeholder="Unit"
                      className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                    />
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-5 rounded-lg text-sm mt-4">
                Save BOM configuration
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
