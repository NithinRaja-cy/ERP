import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orders = [
  { id: "MO-SO1023-44", product: "Server Rack Alpha", qty: 15, start: "2026-06-19", status: "IN_PROGRESS" },
  { id: "MO-SO1024-12", product: "Cooling Unit Beta", qty: 50, start: "2026-06-21", status: "DRAFT" },
  { id: "MO-INTERNAL-01", product: "Aluminium Frame", qty: 100, start: "2026-06-18", status: "COMPLETED" },
];

export default function ManufacturingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Manufacturing Operations</h2>
          <p className="text-slate-400 mt-1">Track production, work orders, and multi-level BOMs.</p>
        </div>
      </div>
      
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Active Manufacturing Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Order ID</TableHead>
                <TableHead className="text-slate-400">Product</TableHead>
                <TableHead className="text-slate-400">Quantity</TableHead>
                <TableHead className="text-slate-400">Start Date</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-indigo-400">{order.id}</TableCell>
                  <TableCell className="text-slate-300">{order.product}</TableCell>
                  <TableCell className="text-slate-300">{order.qty}</TableCell>
                  <TableCell className="text-slate-300">{order.start}</TableCell>
                  <TableCell>
                    <Badge className={
                      order.status === 'IN_PROGRESS' ? 'bg-amber-500 hover:bg-amber-600' : 
                      order.status === 'COMPLETED' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-700 text-slate-300'
                    }>
                      {order.status}
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
