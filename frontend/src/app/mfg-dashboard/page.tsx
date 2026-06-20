"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Factory, Layers, Cpu, Award } from "lucide-react";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import MyOpenOrders from "@/components/dashboard/MyOpenOrders";

const runs = [
  { id: "MO-2026-001", item: "Royal Teak Bed Frame", progress: "45%", line: "Assembly Line 1", status: "RUNNING" },
  { id: "MO-2026-002", item: "6-Seater Dining Table Set", progress: "70%", line: "Sanding & Polish 2", status: "RUNNING" },
  { id: "MO-2026-003", item: "3-Door Wardrobe (Walnut)", progress: "0%", line: "Assembly Line 3", status: "QUEUED" },
];

export default function MfgDashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Manufacturing Dashboard</h2>
        <p className="text-slate-400 mt-1">Track factory production runs, assembly schedules, and Bill of Materials configurations.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Work Centers", value: "3 Assembly Lines", icon: Factory, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Production Load", value: "72% Capacity", icon: Layers, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Active Job Runs", value: "3 In Progress", icon: Cpu, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Quality Pass Rate", value: "99.1%", icon: Award, color: "text-rose-400", bg: "bg-rose-500/10" },
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

      {/* Active Runs */}
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
              {runs.map((run) => (
                <TableRow key={run.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-mono text-violet-400">{run.id}</TableCell>
                  <TableCell className="text-white font-medium">{run.item}</TableCell>
                  <TableCell className="text-slate-300 font-semibold">{run.progress}</TableCell>
                  <TableCell className="text-slate-400">{run.line}</TableCell>
                  <TableCell>
                    <Badge className={
                      run.status === 'RUNNING' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/10 text-slate-400 border-slate-800'
                    } variant="outline">
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
  );
}
