"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, AlertTriangle, Building2 } from "lucide-react";

const warehouseStatus = [
  { name: "Warehouse A (Wood Section)", capacity: "85% Occupied", manager: "Rajesh V.", status: "OPTIMAL" },
  { name: "Warehouse B (Finished Goods)", capacity: "92% Occupied", manager: "Karthik M.", status: "NEAR_CAPACITY" },
  { name: "Upholstery & Fabrics Store", capacity: "40% Occupied", manager: "Sajid K.", status: "OPTIMAL" },
];

export default function InventoryDashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Inventory Dashboard</h2>
        <p className="text-slate-400 mt-1">Real-time stock valuation, low stock warnings, and warehouse loading tracks.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total SKUs Cataloged", value: "142 Active", icon: Package, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Onloading Freight", value: "3 Shipments", icon: Truck, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Low Stock Warnings", value: "4 Items", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Active Warehouses", value: "3 Hubs", icon: Building2, color: "text-rose-400", bg: "bg-rose-500/10" },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-slate-900 border-slate-800">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">{kpi.label}</p>
                <p className="text-white font-bold text-xl">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warehouses Status */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Warehouse Registry & Status</CardTitle>
          <CardDescription className="text-slate-400">Total volume usage across your primary storage facilities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Location Name</TableHead>
                <TableHead className="text-slate-400">Capacity Occupancy</TableHead>
                <TableHead className="text-slate-400">Floor Manager</TableHead>
                <TableHead className="text-slate-400">Operational status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouseStatus.map((w, idx) => (
                <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-semibold text-white">{w.name}</TableCell>
                  <TableCell className="text-slate-300">{w.capacity}</TableCell>
                  <TableCell className="text-slate-400">{w.manager}</TableCell>
                  <TableCell>
                    <Badge className={
                      w.status === 'OPTIMAL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    } variant="outline">
                      {w.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
