import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle } from "lucide-react";

export default function AIRecommendations() {
  const recommendations = [
    { type: 'insight', msg: 'Business is operating efficiently. Manufacturing is on track.', icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { type: 'alert', msg: 'Low stock alert: Aluminium Sheets. Expedite PO-1024.', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { type: 'alert', msg: 'Delivery Success Rate dropped below 90% this week.', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' }
  ];

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center text-white">
          <Sparkles className="w-5 h-5 mr-2 text-indigo-400" />
          AI Command Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, i) => (
          <div key={i} className={`flex items-start p-3 rounded-lg border border-slate-800 ${rec.bg}`}>
            <rec.icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${rec.color}`} />
            <p className="text-sm text-slate-300 leading-relaxed">{rec.msg}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
