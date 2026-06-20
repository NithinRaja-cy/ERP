"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RawMaterialShops from "@/components/dashboard/RawMaterialShops";
import { ShoppingBag, Users, TrendingUp, DollarSign } from "lucide-react";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import MyOpenOrders from "@/components/dashboard/MyOpenOrders";

export default function PurchasingDashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Purchasing Dashboard</h2>
        <p className="text-slate-400 mt-1">Real-time procurement stats, supplier reliability, and material shops.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Vendors", value: "14", icon: Users, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Purchase Orders Sent", value: "85", icon: ShoppingBag, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Reliability Rate", value: "94.2%", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Monthly Spend", value: "₹4,12,000", icon: DollarSign, color: "text-rose-400", bg: "bg-rose-500/10" },
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

      <RawMaterialShops />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <MyOpenOrders module="purchases" />
        <ActivityTimeline module="Purchases" view="my" />
      </div>
    </div>
  );
}
