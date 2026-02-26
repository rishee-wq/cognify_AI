
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';

const Results: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = useMemo(() => storageService.getSessions().find(s => s.id === id), [id]);

  if (!session) {
    return <div className="p-20 text-center">Session not found</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Completed</span>
            <p className="text-slate-500 text-sm">{new Date(session.date).toLocaleDateString()} • {session.mode} Interview</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight">{session.profile.targetRole} Feedback</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-sm shadow-sm">Download PDF</button>
          <button onClick={() => navigate('/setup')} className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm shadow-md shadow-blue-500/20">New Practice</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ScoreCard label="Overall Score" value={session.results?.overallScore || 0} icon="leaderboard" color="text-blue-500" />
        <ScoreCard label="Communication" value={78} icon="record_voice_over" color="text-amber-500" />
        <ScoreCard label="Confidence" value={92} icon="psychology" color="text-emerald-500" />
      </div>

      <section className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-blue-100 dark:border-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">auto_awesome</span>
          <h3 className="font-bold">AI Improvement Roadmap</h3>
        </div>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-6">{session.results?.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <h4 className="text-sm font-bold text-emerald-600 flex items-center gap-2"><span className="material-symbols-outlined text-sm">check_circle</span> Key Strengths</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="pl-4 border-l-2 border-emerald-500/30">Excellent clarity in technical architectural trade-offs.</li>
                  <li className="pl-4 border-l-2 border-emerald-500/30">Strong demonstration of technical empathy and teamwork.</li>
                </ul>
             </div>
             <div className="space-y-4">
                <h4 className="text-sm font-bold text-amber-600 flex items-center gap-2"><span className="material-symbols-outlined text-sm">trending_up</span> Growth Areas</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="pl-4 border-l-2 border-amber-500/30">Try to use more quantitative metrics when discussing achievements.</li>
                  <li className="pl-4 border-l-2 border-amber-500/30">Focus on the STAR method to avoid rambling in behavioral questions.</li>
                </ul>
             </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold">Question Breakdown</h3>
        <div className="space-y-4">
          {session.answers.map((answer, i) => (
            <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-start">
                  <div className="size-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div>
                  <h4 className="text-sm font-bold leading-relaxed">{answer.questionText}</h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-500 uppercase">Excellent</span>
                </div>
              </div>
              <div className="pl-12 space-y-2">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Your Answer</p>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">"{answer.userAnswer}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const ScoreCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
      <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <p className="text-4xl font-black">{value}%</p>
    </div>
    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
      <div className={`h-full rounded-full ${color.replace('text', 'bg')}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default Results;
