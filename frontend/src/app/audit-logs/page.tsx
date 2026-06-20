"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { Shield, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  resource: string;
  status: "SUCCESS" | "FAILED" | "WARNING";
  ip: string;
};

const AUDIT_LOGS: AuditLog[] = [
  { id: "AL-0001", timestamp: "2026-06-20T19:45:12Z", user: "admin@smarterp.com",     role: "admin",         action: "LOGIN",           module: "Auth",          resource: "Session",               status: "SUCCESS", ip: "192.168.1.10" },
  { id: "AL-0002", timestamp: "2026-06-20T19:46:03Z", user: "sales@smarterp.com",     role: "sales",         action: "VIEW_ORDERS",     module: "Sales",         resource: "SO-2026-001",           status: "SUCCESS", ip: "192.168.1.22" },
  { id: "AL-0003", timestamp: "2026-06-20T19:47:30Z", user: "purchase@smarterp.com",  role: "purchasing",    action: "CREATE_PO",       module: "Purchasing",    resource: "PO-2026-003",           status: "SUCCESS", ip: "192.168.1.31" },
  { id: "AL-0004", timestamp: "2026-06-20T19:48:11Z", user: "mfg@smarterp.com",       role: "manufacturing", action: "START_ORDER",     module: "Manufacturing", resource: "MO-2026-001",           status: "SUCCESS", ip: "192.168.1.45" },
  { id: "AL-0005", timestamp: "2026-06-20T19:49:00Z", user: "unknown@hacker.com",     role: "—",             action: "LOGIN_ATTEMPT",   module: "Auth",          resource: "Session",               status: "FAILED",  ip: "45.33.32.156" },
  { id: "AL-0006", timestamp: "2026-06-20T19:50:22Z", user: "inventory@smarterp.com", role: "inventory",     action: "UPDATE_STOCK",    module: "Inventory",     resource: "SKU-WD-001",            status: "SUCCESS", ip: "192.168.1.52" },
  { id: "AL-0007", timestamp: "2026-06-20T19:51:05Z", user: "admin@smarterp.com",     role: "admin",         action: "UPDATE_SETTINGS", module: "Settings",      resource: "company_profile",       status: "SUCCESS", ip: "192.168.1.10" },
  { id: "AL-0008", timestamp: "2026-06-20T19:52:40Z", user: "sales@smarterp.com",     role: "sales",         action: "CREATE_ORDER",    module: "Sales",         resource: "SO-2026-004",           status: "SUCCESS", ip: "192.168.1.22" },
  { id: "AL-0009", timestamp: "2026-06-20T19:53:15Z", user: "mfg@smarterp.com",       role: "manufacturing", action: "VIEW_BOM",        module: "Manufacturing", resource: "BOM-001",               status: "SUCCESS", ip: "192.168.1.45" },
  { id: "AL-0010", timestamp: "2026-06-20T19:54:00Z", user: "customer@smarterp.com",  role: "customer",      action: "PLACE_ORDER",     module: "Customer",      resource: "Customer Portal",       status: "SUCCESS", ip: "103.22.100.5" },
  { id: "AL-0011", timestamp: "2026-06-20T19:55:11Z", user: "purchase@smarterp.com",  role: "purchasing",    action: "APPROVE_PO",      module: "Purchasing",    resource: "PO-2026-002",           status: "WARNING", ip: "192.168.1.31" },
  { id: "AL-0012", timestamp: "2026-06-20T19:56:30Z", user: "admin@smarterp.com",     role: "admin",         action: "DELETE_USER",     module: "Admin",         resource: "user_id:4422",          status: "SUCCESS", ip: "192.168.1.10" },
  { id: "AL-0013", timestamp: "2026-06-20T19:57:00Z", user: "mfg@smarterp.com",       role: "manufacturing", action: "COMPLETE_ORDER",  module: "Manufacturing", resource: "MO-2026-003",           status: "SUCCESS", ip: "192.168.1.45" },
  { id: "AL-0014", timestamp: "2026-06-20T19:58:20Z", user: "inventory@smarterp.com", role: "inventory",     action: "ONLOAD_SHIPMENT", module: "Inventory",     resource: "Shipment #SHP-0012",    status: "SUCCESS", ip: "192.168.1.52" },
  { id: "AL-0015", timestamp: "2026-06-20T19:59:55Z", user: "unknown",                role: "—",             action: "API_BRUTE_FORCE", module: "Auth",          resource: "/api/v1/auth/token",    status: "FAILED",  ip: "89.44.11.200" },
];

const statusStyle: Record<string, string> = {
  SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  FAILED:  "bg-rose-500/10    text-rose-400    border-rose-500/25",
  WARNING: "bg-amber-500/10   text-amber-400   border-amber-500/25",
};

const moduleColor: Record<string, string> = {
  Auth:          "text-violet-400",
  Sales:         "text-emerald-400",
  Purchasing:    "text-amber-400",
  Manufacturing: "text-violet-400",
  Inventory:     "text-cyan-400",
  Settings:      "text-slate-400",
  Admin:         "text-rose-400",
  Customer:      "text-indigo-400",
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filtered = AUDIT_LOGS.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || log.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total:   AUDIT_LOGS.length,
    success: AUDIT_LOGS.filter((l) => l.status === "SUCCESS").length,
    failed:  AUDIT_LOGS.filter((l) => l.status === "FAILED").length,
    warning: AUDIT_LOGS.filter((l) => l.status === "WARNING").length,
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Shield className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Audit Logs</h2>
            <p className="text-slate-400 mt-0.5">Full system event trail — every action, every user, every timestamp.</p>
          </div>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events",    value: counts.total,   color: "text-white",         bg: "bg-slate-800" },
          { label: "Successful",      value: counts.success, color: "text-emerald-400",   bg: "bg-emerald-500/10" },
          { label: "Failed",          value: counts.failed,  color: "text-rose-400",      bg: "bg-rose-500/10" },
          { label: "Warnings",        value: counts.warning, color: "text-amber-400",     bg: "bg-amber-500/10" },
        ].map((s) => (
          <Card key={s.label} className={`${s.bg} border-slate-800`}>
            <CardContent className="p-5">
              <p className="text-slate-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            placeholder="Search by user, action, module, resource…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "SUCCESS", "FAILED", "WARNING"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterStatus === s
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-800 pb-4">
          <CardTitle className="text-white text-base">Event Stream</CardTitle>
          <CardDescription className="text-slate-400">{filtered.length} events matching current filters</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 pl-6">Log ID</TableHead>
                <TableHead className="text-slate-400">Timestamp</TableHead>
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Action</TableHead>
                <TableHead className="text-slate-400">Module</TableHead>
                <TableHead className="text-slate-400">Resource</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/40">
                  <TableCell className="font-mono text-slate-500 text-xs pl-6">{log.id}</TableCell>
                  <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-slate-300 text-sm">{log.user}</TableCell>
                  <TableCell className="text-slate-400 text-xs capitalize">{log.role}</TableCell>
                  <TableCell className="font-mono text-indigo-400 text-xs font-semibold">{log.action}</TableCell>
                  <TableCell className={`text-xs font-semibold ${moduleColor[log.module] ?? "text-slate-400"}`}>
                    {log.module}
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs font-mono">{log.resource}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${statusStyle[log.status]}`}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs font-mono">{log.ip}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-slate-500 py-10">
                    No audit logs match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
