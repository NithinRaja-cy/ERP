import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orders = [
  { id: "SO-1023", customer: "Acme Corp", date: "2026-06-18", amount: "$12,450", status: "CONFIRMED" },
  { id: "SO-1024", customer: "Globex Inc", date: "2026-06-19", amount: "$8,900", status: "PROCESSING" },
  { id: "SO-1025", customer: "Initech", date: "2026-06-20", amount: "$21,000", status: "DRAFT" },
];

export default function SalesOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Sales Orders</h2>
          <p className="text-slate-400 mt-1">Manage customer demand and order lifecycle.</p>
        </div>
      </div>
      
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Order ID</TableHead>
                <TableHead className="text-slate-400">Customer</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-indigo-400">{order.id}</TableCell>
                  <TableCell className="text-slate-300">{order.customer}</TableCell>
                  <TableCell className="text-slate-300">{order.date}</TableCell>
                  <TableCell className="text-slate-300">{order.amount}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'CONFIRMED' ? 'default' : 'secondary'} 
                           className={order.status === 'CONFIRMED' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-slate-700 text-slate-300'}>
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
