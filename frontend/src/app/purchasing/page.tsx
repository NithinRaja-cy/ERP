import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orders = [
  { id: "PO-SO1024-01", vendor: "Global Metals Inc.", date: "2026-06-19", amount: "$3,400", status: "PENDING_APPROVAL" },
  { id: "PO-SO1023-12", vendor: "Tech Components Ltd.", date: "2026-06-18", amount: "$1,200", status: "RECEIVED" },
  { id: "PO-MAN-09", vendor: "Fasteners Direct", date: "2026-06-20", amount: "$450", status: "DRAFT" },
];

export default function PurchasingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Purchasing</h2>
          <p className="text-slate-400 mt-1">Manage vendor relations and procurement workflows.</p>
        </div>
      </div>
      
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">PO Number</TableHead>
                <TableHead className="text-slate-400">Vendor</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-indigo-400">{order.id}</TableCell>
                  <TableCell className="text-slate-300">{order.vendor}</TableCell>
                  <TableCell className="text-slate-300">{order.date}</TableCell>
                  <TableCell className="text-slate-300">{order.amount}</TableCell>
                  <TableCell>
                    <Badge className={
                      order.status === 'RECEIVED' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                      order.status === 'PENDING_APPROVAL' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-700 text-slate-300'
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
