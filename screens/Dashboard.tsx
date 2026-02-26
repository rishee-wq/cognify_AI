
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, InterviewSession, JobRecommendation } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { INTERVIEW_MODES } from '../constants';

interface DashboardProps {
  profile: UserProfile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  
  const sessions = useMemo(() => storageService.getSessions(), []);
  
  const stats = useMemo(() => {
    if (sessions.length === 0) return { avgScore: 0, count: 0, growth: 0 };
    const scores = sessions.map(s => s.results?.overallScore || 0).filter(s => s > 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      avgScore,
      count: sessions.length,
      growth: 5.2
    };
  }, [sessions]);

  useEffect(() => {
    const loadJobs = async () => {
      if (!profile) return;
      setLoadingJobs(true);
      try {
        const recommended = await geminiService.recommendJobs(profile);
        setJobs(recommended);
      } catch (e) {
        console.error("Error loading jobs", e);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadJobs();
  }, [profile]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white min-h-[340px] flex items-center shadow-2xl">
        <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-primary-600 via-indigo-800 to-primary-900"></div>
        <div className="absolute inset-0 z-0 bg-cover bg-center mix-blend-overlay opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070')" }}></div>
        <div className="relative z-10 p-12 max-w-2xl space-y-8">
          <div className="space-y-3">
            <span className="inline-flex px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-[10px] font-black uppercase tracking-[0.25em] border border-primary-500/30">AI Studio Edition v2.6</span>
            <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tighter">Your Career <br/> Accelerated.</h1>
            <p className="text-slate-300 text-lg font-medium leading-relaxed opacity-90">Realistic simulations and hyper-contextual job matching to secure your next high-impact role.</p>
          </div>
          <button 
            onClick={() => navigate('/setup')}
            className="px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-[1.25rem] font-black shadow-2xl shadow-primary-500/40 transition-all flex items-center gap-3 transform active:scale-95 group"
          >
            Start Practice
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Readiness Score" value={`${stats.avgScore}%`} trend={stats.growth} icon="trending_up" color="text-primary-500" />
        <StatCard title="Mock Log" value={`${stats.count} Sessions`} icon="assignment_turned_in" color="text-emerald-500" />
        <StatCard title="Workspace Domain" value={profile?.domain?.split(' ')[0] || 'Unset'} icon="hub" color="text-amber-500" />
      </div>

      {/* Recommended Jobs System */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black flex items-center gap-3 tracking-tight">
            <span className="material-symbols-outlined text-primary-500 bg-primary-500/10 p-2 rounded-xl">work</span>
            Opportunities For You
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matched via Gemini Pro</p>
        </div>
        
        {loadingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-64 bg-slate-100 dark:bg-slate-900 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobs.map(job => (
              <div key={job.id} className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all cursor-default group">
                <div className="flex justify-between items-start mb-4">
                  <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary-500 font-black text-xs">
                    {job.company.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                    {job.matchScore}% Match
                  </div>
                </div>
                <h4 className="font-black text-base leading-tight mb-1 group-hover:text-primary-500 transition-colors">{job.role}</h4>
                <p className="text-xs font-bold text-slate-500 mb-4">{job.company} • {job.location}</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4">
                   <p className="text-[10px] text-slate-500 leading-tight italic">"{job.reason}"</p>
                </div>
                <button 
                  onClick={() => navigate('/optimize')}
                  className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 dark:hover:bg-primary-400 dark:hover:text-white transition-all"
                >
                  Optimize Resume
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modes Grid */}
      <section className="space-y-6">
        <h3 className="text-xl font-black flex items-center gap-3 tracking-tight">
          <span className="material-symbols-outlined text-primary-500 bg-primary-500/10 p-2 rounded-xl">bolt</span>
          Quick Start Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INTERVIEW_MODES.slice(0, 3).map(mode => (
            <div 
              key={mode.id}
              onClick={() => navigate('/setup', { state: { mode: mode.id } })}
              className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-primary-500 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary-500 mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">{mode.icon}</span>
              </div>
              <h4 className="font-black text-xl mb-2">{mode.label}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{mode.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-black text-lg tracking-tight">Session Intelligence Log</h3>
          <button onClick={() => navigate('/history')} className="text-xs font-black text-primary-500 uppercase tracking-widest hover:underline">View All Records</button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sessions.slice(0, 3).map(session => (
            <div key={session.id} className="px-8 py-6 flex items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all" onClick={() => navigate(`/results/${session.id}`)}>
              <div className="size-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate text-slate-900 dark:text-slate-100">{session.mode} Interview: {session.profile.targetRole}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(session.date).toLocaleDateString()} • {session.answers.length} Responses</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-emerald-500">{session.results?.overallScore || '--'}%</p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Readiness</p>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="p-16 text-center space-y-4">
              <span className="material-symbols-outlined text-5xl text-slate-200">history_edu</span>
              <p className="text-slate-500 font-medium italic">Your professional journey is just beginning. Launch your first simulation.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-black tracking-tighter">{value}</p>
        {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">+{trend}%</span>}
      </div>
    </div>
    <div className={`size-14 rounded-[1.25rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
  </div>
);

export default Dashboard;
