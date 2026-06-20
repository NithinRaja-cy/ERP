import RawMaterialShops from "@/components/dashboard/RawMaterialShops";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";

export default function Dashboard() {
  return (
    <div className="space-y-6 pb-10">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RawMaterialShops />
        </div>
        <div className="lg:col-span-1">
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
