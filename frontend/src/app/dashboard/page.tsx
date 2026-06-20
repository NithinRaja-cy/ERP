import KPICards from "@/components/dashboard/KPICards";
import AIRecommendations from "@/components/dashboard/AIRecommendations";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Command Center</h2>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-400">System Online</span>
        </div>
      </div>
      
      <AIRecommendations />
      <KPICards />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RevenueChart />
        <ActivityTimeline />
      </div>
    </div>
  );
}
