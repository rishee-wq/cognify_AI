
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';

const History: React.FC = () => {
  const navigate = useNavigate();
  const sessions = storageService.getSessions();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Attempt History</h1>
          <p className="text-slate-500">A detailed log of all your AI mock sessions and performance growth.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400">
            <span className="material-symbols-outlined text-xl">filter_list</span>
          </button>
          <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400">
            <span className="material-symbols-outlined text-xl">download</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role / Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Questions</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Score</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sessions.map(session => (
              <tr 
                key={session.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/results/${session.id}`)}
              >
                <td className="px-6 py-5">
                  <p className="text-sm font-medium">{new Date(session.date).toLocaleDateString()}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                      <span className="material-symbols-outlined text-lg">code</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">{session.profile.targetRole}</p>
                      <p className="text-xs text-slate-500">{session.mode} Session</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center text-sm text-slate-500">{session.answers.length}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${(session.results?.overallScore || 0) > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                        style={{ width: `${session.results?.overallScore || 0}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-bold ${(session.results?.overallScore || 0) > 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {session.results?.overallScore || '--'}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="text-blue-500 font-bold text-xs uppercase tracking-widest">Review</span>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">No history found yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
