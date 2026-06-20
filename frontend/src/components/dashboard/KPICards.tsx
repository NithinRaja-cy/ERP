import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Package, Truck } from "lucide-react";

export default function KPICards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Business Health</CardTitle>
          <Activity className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">92.4%</div>
          <p className="text-xs text-emerald-400 mt-1">+2.1% from last month</p>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Monthly Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">$45,231</div>
          <p className="text-xs text-emerald-400 mt-1">+12% from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Active MOs</CardTitle>
          <Package className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">24</div>
          <p className="text-xs text-slate-500 mt-1">4 delayed</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Pending Deliveries</CardTitle>
          <Truck className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">12</div>
          <p className="text-xs text-blue-400 mt-1">8 dispatching today</p>
        </CardContent>
      </Card>
    </div>
  );
}
