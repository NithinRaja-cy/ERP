import RawMaterialShops from "@/components/dashboard/RawMaterialShops";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import MyOpenOrders from "@/components/dashboard/MyOpenOrders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Factory, Layers, Cpu, Award,
  ShoppingBag, Users, TrendingUp, DollarSign,
  ShoppingCart, Target, Heart,
  Package, Truck, AlertTriangle, Building2
} from "lucide-react";

// ── Manufacturing data ──────────────────────────────────────────
const mfgRuns = [
  { id: "MO-2026-001", item: "Royal Teak Bed Frame", progress: "45%", line: "Assembly Line 1", status: "RUNNING" },
  { id: "MO-2026-002", item: "6-Seater Dining Table Set", progress: "70%", line: "Sanding & Polish 2", status: "RUNNING" },
  { id: "MO-2026-003", item: "3-Door Wardrobe (Walnut)", progress: "0%", line: "Assembly Line 3", status: "QUEUED" },
];

// ── Sales data ──────────────────────────────────────────────────
const salesOrders = [
  { id: "SO-2026-001", customer: "Priya Sharma", date: "2026-06-19", amount: "₹45,000", status: "CONFIRMED" },
  { id: "SO-2026-002", customer: "Arun Menon", date: "2026-06-18", amount: "₹72,000", status: "PROCESSING" },
  { id: "SO-2026-003", customer: "Deepa Nair", date: "2026-06-20", amount: "₹55,000", status: "DRAFT" },
];

// ── Inventory data ──────────────────────────────────────────────
const warehouseStatus = [
  { name: "Warehouse A (Wood Section)", capacity: "85% Occupied", manager: "Rajesh V.", status: "OPTIMAL" },
  { name: "Warehouse B (Finished Goods)", capacity: "92% Occupied", manager: "Karthik M.", status: "NEAR_CAPACITY" },
  { name: "Upholstery & Fabrics Store", capacity: "40% Occupied", manager: "Sajid K.", status: "OPTIMAL" },
];

// ── Reusable KPI card ───────────────────────────────────────────
function KPICard({ label, value, icon: Icon, color, bg }: { label: string; value: string; icon: any; color: string; bg: string }) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className="text-white font-bold text-xl">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Section divider ─────────────────────────────────────────────
function SectionHeader({ title, subtitle, accentColor }: { title: string; subtitle: string; accentColor: string }) {
  return (
    <div className={`flex items-center gap-3 border-l-4 pl-3 ${accentColor}`}>
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-10 pb-10">

      {/* ── Admin Header ── */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-400">System Online</span>
        </div>
      </div>

      {/* ── Admin Core: Raw Material Shops + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RawMaterialShops />
        </div>
        <div className="lg:col-span-1">
          <ActivityTimeline />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MANUFACTURING MODULE
      ══════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <SectionHeader
          title="Manufacturing"
          subtitle="Factory production runs, assembly schedules, and Bill of Materials."
          accentColor="border-violet-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard label="Active Work Centers" value="3 Assembly Lines" icon={Factory} color="text-violet-400" bg="bg-violet-500/10" />
          <KPICard label="Production Load" value="72% Capacity" icon={Layers} color="text-indigo-400" bg="bg-indigo-500/10" />
          <KPICard label="Active Job Runs" value="3 In Progress" icon={Cpu} color="text-emerald-400" bg="bg-emerald-500/10" />
          <KPICard label="Quality Pass Rate" value="99.1%" icon={Award} color="text-rose-400" bg="bg-rose-500/10" />
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Active Manufacturing Runs</CardTitle>
            <CardDescription className="text-slate-400">Current active furniture assembly and processing schedules.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">Run ID</TableHead>
                  <TableHead className="text-slate-400">Furniture Item</TableHead>
                  <TableHead className="text-slate-400">Completion</TableHead>
                  <TableHead className="text-slate-400">Workstation Line</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mfgRuns.map((run) => (
                  <TableRow key={run.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-mono text-violet-400">{run.id}</TableCell>
                    <TableCell className="text-white font-medium">{run.item}</TableCell>
                    <TableCell className="text-slate-300 font-semibold">{run.progress}</TableCell>
                    <TableCell className="text-slate-400">{run.line}</TableCell>
                    <TableCell>
                      <Badge className={run.status === "RUNNING" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700/10 text-slate-400 border-slate-800"} variant="outline">
                        {run.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MyOpenOrders module="manufacturing" />
          <ActivityTimeline module="Manufacturing" view="my" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PURCHASING MODULE
      ══════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <SectionHeader
          title="Purchasing"
          subtitle="Real-time procurement stats, supplier reliability, and material shops."
          accentColor="border-amber-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard label="Active Vendors" value="14" icon={Users} color="text-amber-400" bg="bg-amber-500/10" />
          <KPICard label="Purchase Orders Sent" value="85" icon={ShoppingBag} color="text-indigo-400" bg="bg-indigo-500/10" />
          <KPICard label="Reliability Rate" value="94.2%" icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-500/10" />
          <KPICard label="Monthly Spend" value="₹4,12,000" icon={DollarSign} color="text-rose-400" bg="bg-rose-500/10" />
        </div>

        <RawMaterialShops />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MyOpenOrders module="purchases" />
          <ActivityTimeline module="Purchases" view="my" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SALES MODULE
      ══════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <SectionHeader
          title="Sales"
          subtitle="Corporate pipelines, customer transactions, and product metrics."
          accentColor="border-emerald-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard label="Total Bookings" value="₹2,10,500" icon={DollarSign} color="text-emerald-400" bg="bg-emerald-500/10" />
          <KPICard label="Active Orders" value="18 Pending" icon={ShoppingCart} color="text-indigo-400" bg="bg-indigo-500/10" />
          <KPICard label="Quarterly Target" value="85%" icon={Target} color="text-amber-400" bg="bg-amber-500/10" />
          <KPICard label="Customer Satisfaction" value="4.8 / 5.0" icon={Heart} color="text-rose-400" bg="bg-rose-500/10" />
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Sales Orders</CardTitle>
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
                {salesOrders.map((order) => (
                  <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium text-emerald-400">{order.id}</TableCell>
                    <TableCell className="text-slate-300">{order.customer}</TableCell>
                    <TableCell className="text-slate-400">{order.date}</TableCell>
                    <TableCell className="text-slate-300 font-semibold">{order.amount}</TableCell>
                    <TableCell>
                      <Badge className={
                        order.status === "CONFIRMED" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                        order.status === "PROCESSING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-slate-700/10 text-slate-400 border-slate-800"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MyOpenOrders module="sales" />
          <ActivityTimeline module="Sales" view="my" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          INVENTORY MODULE
      ══════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <SectionHeader
          title="Inventory"
          subtitle="Real-time stock valuation, low stock warnings, and warehouse loading tracks."
          accentColor="border-cyan-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard label="Total SKUs Cataloged" value="142 Active" icon={Package} color="text-cyan-400" bg="bg-cyan-500/10" />
          <KPICard label="Onloading Freight" value="3 Shipments" icon={Truck} color="text-indigo-400" bg="bg-indigo-500/10" />
          <KPICard label="Low Stock Warnings" value="4 Items" icon={AlertTriangle} color="text-amber-400" bg="bg-amber-500/10" />
          <KPICard label="Active Warehouses" value="3 Hubs" icon={Building2} color="text-rose-400" bg="bg-rose-500/10" />
        </div>

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
                  <TableHead className="text-slate-400">Operational Status</TableHead>
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
                        w.status === "OPTIMAL" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
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

    </div>
  );
}
