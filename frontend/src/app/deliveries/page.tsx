import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orders = [
  { id: "DEL-SO1023", salesOrder: "SO-1023", dispatchLoc: "Dispatch Bay 1", scheduled: "2026-06-20", status: "DISPATCHED" },
  { id: "DEL-SO1021", salesOrder: "SO-1021", dispatchLoc: "Dispatch Bay 2", scheduled: "2026-06-19", status: "DELIVERED" },
  { id: "DEL-SO1024", salesOrder: "SO-1024", dispatchLoc: "Pending", scheduled: "2026-06-22", status: "PENDING" },
];

export default function DeliveriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Deliveries & Dispatch</h2>
          <p className="text-slate-400 mt-1">Track outgoing shipments and fulfillments.</p>
        </div>
      </div>
      
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Delivery Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Delivery ID</TableHead>
                <TableHead className="text-slate-400">Sales Order</TableHead>
                <TableHead className="text-slate-400">Dispatch Location</TableHead>
                <TableHead className="text-slate-400">Scheduled Date</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-indigo-400">{order.id}</TableCell>
                  <TableCell className="text-slate-300">{order.salesOrder}</TableCell>
                  <TableCell className="text-slate-300">{order.dispatchLoc}</TableCell>
                  <TableCell className="text-slate-300">{order.scheduled}</TableCell>
                  <TableCell>
                    <Badge className={
                      order.status === 'DELIVERED' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                      order.status === 'DISPATCHED' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-slate-700 text-slate-300'
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
