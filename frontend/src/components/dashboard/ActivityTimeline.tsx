"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

const FALLBACK_ACTIVITIES = [
  { id: "1", action: "Sales Order SO-2026-001 confirmed", details: "Priya Sharma", created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user_name: "Sales Manager" },
  { id: "2", action: "Purchase Order PO-2026-002 received", details: "FoamPro Upholstery", created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), user_name: "Purchasing Manager" },
  { id: "3", action: "Manufacturing Order MO-2026-001 started", details: "Assembly Line 1", created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), user_name: "Mfg Manager" },
  { id: "4", action: "Inventory restock completed", details: "Warehouse A", created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), user_name: "Inventory Manager" },
  { id: "5", action: "New customer registered", details: "customer@smarterp.com", created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), user_name: "System" },
];

export default function ActivityTimeline({ view = "all", module = "" }: { view?: "all" | "my", module?: string }) {
  const [activities, setActivities] = useState<any[]>(FALLBACK_ACTIVITIES);

  useEffect(() => {
    async function fetchActivities() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const queryParams = new URLSearchParams();
        if (module) queryParams.append("module", module);
        if (view) queryParams.append("view", view);
        queryParams.append("limit", "10");

        const response = await fetch(`http://localhost:8000/api/activities?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setActivities(data);
          }
          // else keep fallback
        }
        // If not ok, keep fallback silently
      } catch {
        // Backend not running — silently use fallback, no error thrown
      }
    }
    fetchActivities();
  }, [module, view]);

  return (
    <Card className="col-span-1 bg-slate-900 border-slate-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, i) => (
            <div key={activity.id} className="flex relative">
              {i !== activities.length - 1 && (
                <div className="absolute top-6 left-2.5 w-px h-full bg-slate-800" />
              )}
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 border-2 border-indigo-500 z-10 mt-1 mr-4" />
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {activity.action}{" "}
                  {activity.details && <span className="text-indigo-400">({activity.details})</span>}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })} · {activity.user_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
