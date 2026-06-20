"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default function ActivityTimeline({ view = "all", module = "" }: { view?: "all" | "my", module?: string }) {
  const [activities, setActivities] = useState<any[]>([]);

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
          setActivities(data);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
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
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No recent activities.</p>
          ) : (
            activities.map((activity, i) => (
              <div key={activity.id} className="flex relative">
                {i !== activities.length - 1 && (
                  <div className="absolute top-6 left-2.5 w-px h-full bg-slate-800" />
                )}
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 border-2 border-indigo-500 z-10 mt-1 mr-4" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {activity.action} {activity.details && <span className="text-indigo-400">({activity.details})</span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })} · {activity.user_name}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
