"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, Target, Heart } from "lucide-react";

const recentOrders = [
  { id: "SO-2026-001", customer: "Priya Sharma", date: "2026-06-19", amount: "₹45,000", status: "CONFIRMED" },
  { id: "SO-2026-002", customer: "Arun Menon", date: "2026-06-18", amount: "₹72,000", status: "PROCESSING" },
  { id: "SO-2026-003", customer: "Deepa Nair", date: "2026-06-20", amount: "₹55,000", status: "DRAFT" },
];

export default function SalesDashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Sales Dashboard</h2>
        <p className="text-slate-400 mt-1">Track corporate pipelines, customer transactions, and product metrics.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: "₹2,10,500", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Active Orders", value: "18 Pending", icon: ShoppingCart, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Quarterly Target", value: "85%", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Customer Satisfaction", value: "4.8 / 5.0", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10" },
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

      {/* Recent Orders */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
          <CardDescription className="text-slate-400">Latest client purchases made through the Smart Furniture portal.</CardDescription>
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
              {recentOrders.map((order) => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-indigo-400">{order.id}</TableCell>
                  <TableCell className="text-slate-300">{order.customer}</TableCell>
                  <TableCell className="text-slate-400">{order.date}</TableCell>
                  <TableCell className="text-slate-300 font-semibold">{order.amount}</TableCell>
                  <TableCell>
                    <Badge className={
                      order.status === 'CONFIRMED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                      order.status === 'PROCESSING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-700/10 text-slate-400 border-slate-800'
                    } variant="outline">
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
