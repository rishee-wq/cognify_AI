
import React, { useMemo } from 'react';
import { storageService } from '../services/storageService';

const Analytics: React.FC = () => {
  const sessions = useMemo(() => storageService.getSessions(), []);
  
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Performance Analytics</h1>
        <p className="text-slate-500">Real-time interview readiness insights based on your previous mock sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Progress Chart Placeholder */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Readiness Trend</h3>
          <div className="h-48 flex items-end gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            {[30, 45, 40, 60, 55, 75, 84].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm relative group" style={{ height: `${h}%` }}>
                <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Aug 01</span>
            <span>Today</span>
          </div>
        </div>

        {/* Competency Radar Alternative */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Topic Mastery Breakdown</h3>
          <div className="space-y-5">
            <SkillProgress label="Data Structures" value={94} color="bg-emerald-500" />
            <SkillProgress label="System Design" value={62} color="bg-amber-500" />
            <SkillProgress label="Behavioral" value={88} color="bg-blue-500" />
            <SkillProgress label="Product Sense" value={45} color="bg-rose-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold">Next Action Steps</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:border-slate-800">
           <ActionItem 
            title="Improve Product Sense articulation" 
            desc="Your recent sessions showed a 40% drop in structured reasoning during the product discovery phase." 
            action="Start Practice" 
            urgent
           />
           <ActionItem 
            title="Maintain Technical Accuracy" 
            desc="Excellent performance in Binary Trees and Graphs. Keep it up for mid-level technical screenings." 
            action="Practice Advanced" 
           />
        </div>
      </div>
    </div>
  );
};

const SkillProgress = ({ label, value, color }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const ActionItem = ({ title, desc, action, urgent }: any) => (
  <div className="p-6 flex items-start gap-4">
    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${urgent ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
      <span className="material-symbols-outlined">{urgent ? 'warning' : 'check_circle'}</span>
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold">{title}</h4>
      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
    </div>
    <button className="px-4 py-2 text-xs font-bold text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500 hover:text-white transition-all whitespace-nowrap">
      {action}
    </button>
  </div>
);

export default Analytics;
