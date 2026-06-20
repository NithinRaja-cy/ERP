import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivityTimeline() {
  const activities = [
    { time: '10:45 AM', event: 'Delivery Dispatched', ref: 'DEL-SO1023', user: 'Logistics System' },
    { time: '09:30 AM', event: 'Manufacturing Completed', ref: 'MO-SO1023-44', user: 'Production System' },
    { time: '08:15 AM', event: 'Purchase Order Received', ref: 'PO-SO1023-12', user: 'Warehouse Manager' },
    { time: 'Yesterday', event: 'Sales Order Confirmed', ref: 'SO1023', user: 'Sales Rep' },
  ];

  return (
    <Card className="col-span-1 bg-slate-900 border-slate-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, i) => (
            <div key={i} className="flex relative">
              {i !== activities.length - 1 && (
                <div className="absolute top-6 left-2.5 w-px h-full bg-slate-800" />
              )}
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 border-2 border-indigo-500 z-10 mt-1 mr-4" />
              <div>
                <p className="text-sm font-medium text-slate-200">{activity.event} <span className="text-indigo-400">({activity.ref})</span></p>
                <p className="text-xs text-slate-500 mt-1">{activity.time} · {activity.user}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
