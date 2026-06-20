import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const stock = [
  { sku: "RM-001", name: "Aluminium Sheets", onHand: 45, reserved: 20, available: 25, location: "Raw Materials A1" },
  { sku: "RM-002", name: "Copper Wire", onHand: 1500, reserved: 0, available: 1500, location: "Raw Materials A2" },
  { sku: "FG-101", name: "Server Rack Alpha", onHand: 12, reserved: 10, available: 2, location: "Finished Goods B1" },
];

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Inventory Management</h2>
          <p className="text-slate-400 mt-1">Real-time stock ledger, reservations, and locations.</p>
        </div>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
