"use client";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

interface WorkflowTimelineProps {
  currentStatus: string;
  steps: string[];
}

export default function WorkflowTimeline({ currentStatus, steps }: WorkflowTimelineProps) {
  const currentIndex = steps.findIndex(s => s.toLowerCase() === currentStatus.toLowerCase());

  return (
    <div className="flex items-center space-x-2 overflow-x-auto py-4">
      {steps.map((step, idx) => {
        const isCompleted = currentIndex >= idx;
        const isCurrent = currentIndex === idx;
        
        return (
          <div key={step} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              isCompleted 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-800/50 border-slate-700 text-slate-500'
            } ${isCurrent ? 'ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-slate-900' : ''}`}>
              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              {step.replace('_', ' ').toUpperCase()}
            </div>
            
            {idx < steps.length - 1 && (
              <div className="mx-2 flex-shrink-0">
                <ArrowRight className={`w-4 h-4 ${isCompleted ? 'text-emerald-500/50' : 'text-slate-700'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
