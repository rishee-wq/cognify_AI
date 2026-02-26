
import React, { useState, useRef } from 'react';
import { UserProfile, ATSAnalysis } from '../types';
import { geminiService } from '../services/geminiService';
import { platformService } from '../services/platformService';
import { fileService } from '../services/fileService';

interface ResumeOptimizerProps {
  profile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

const ResumeOptimizer: React.FC<ResumeOptimizerProps> = ({ profile, onProfileUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeProfile: UserProfile = profile || {
    name: '',
    designation: '',
    targetRole: '',
    skillLevel: 'Mid-Level',
    domain: 'Software Engineering',
    experienceYears: 0,
    resumeText: '',
    targetCompany: '',
    jobDescription: ''
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    onProfileUpdate({ ...safeProfile, ...updates });
  };

  const runAnalysis = async () => {
    if (!safeProfile.resumeText || !safeProfile.jobDescription) return;
    setIsAnalyzing(true);
    platformService.vibrate(20);
    try {
      const result = await geminiService.analyzeResumeATS(safeProfile.resumeText, safeProfile.jobDescription);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      alert("ATS Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    platformService.vibrate(10);
    try {
      const text = await fileService.extractText(file);
      updateProfile({ resumeText: text });
      setAnalysis(null); // Reset analysis when resume changes
      platformService.vibrate(20);
    } catch (err: any) {
      alert(err.message || 'Failed to extract text from resume.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Resume Optimizer</h1>
          <p className="text-slate-500 font-medium">Precision ATS alignment using Gemini-3 Neural Analysis.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.docx,.doc,.txt" 
            onChange={handleFileUpload} 
          />
          <button 
            disabled={isUploading || isAnalyzing}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
          >
            {isUploading ? <div className="size-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-primary-500">upload_file</span>}
            {isUploading ? 'Extracting...' : 'Upload Resume'}
          </button>
          <button 
            disabled={!safeProfile.resumeText || !safeProfile.jobDescription || isAnalyzing || isUploading}
            onClick={runAnalysis}
            className="px-8 py-3 bg-primary-500 text-white rounded-2xl font-black shadow-xl shadow-primary-500/20 disabled:opacity-50 flex items-center gap-2 text-xs uppercase tracking-widest"
          >
            {isAnalyzing ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined">analytics</span>}
            {isAnalyzing ? 'Analyzing...' : 'Run ATS Check'}
          </button>
        </div>
      </div>

      {!analysis && !isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
              <div className="size-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-3xl">description</span>
              </div>
              <h3 className="font-black text-lg">Your Resume</h3>
              <p className="text-sm text-slate-500 font-medium">The source text evaluated by the AI.</p>
              <textarea 
                className="w-full h-64 bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-[11px] font-medium text-slate-600 dark:text-slate-300 overflow-y-auto custom-scrollbar italic text-left leading-relaxed border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/20 resize-none outline-none"
                value={safeProfile.resumeText || ""}
                onChange={(e) => updateProfile({ resumeText: e.target.value })}
                placeholder="No resume text found. Paste your resume here or use the 'Upload' button above."
              />
           </div>
           <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-4">
              <div className="size-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-500">
                <span className="material-symbols-outlined text-3xl">target</span>
              </div>
              <h3 className="font-black text-lg">Job Description</h3>
              <p className="text-sm text-slate-500 font-medium">Target requirements for the match.</p>
              <textarea 
                className="w-full h-64 bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-[11px] font-medium text-slate-600 dark:text-slate-300 overflow-y-auto custom-scrollbar italic text-left leading-relaxed border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/20 resize-none outline-none"
                value={safeProfile.jobDescription || ""}
                onChange={(e) => updateProfile({ jobDescription: e.target.value })}
                placeholder="No JD found. Paste the target job description here."
              />
           </div>
        </div>
      )}

      {analysis && (
        <div className="space-y-8 animate-slide-up">
          {/* Main Score & Verdict */}
          <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            
            <div className="relative size-56 shrink-0">
               <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path className="stroke-slate-100 dark:stroke-slate-800 fill-none stroke-[2.5]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="stroke-primary-500 fill-none stroke-[2.5] transition-all duration-[1.5s] ease-out" strokeDasharray={`${analysis.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black tracking-tighter">{analysis.score}%</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Match Grade</span>
               </div>
            </div>

            <div className="flex-1 space-y-6 text-center lg:text-left z-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight leading-tight">Professional Alignment</h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed italic">"{analysis.overallVerdict}"</p>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                 {analysis.actionPlan.slice(0, 3).map((item, i) => (
                   <span key={i} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                     {item}
                   </span>
                 ))}
                 <button onClick={() => setAnalysis(null)} className="px-4 py-2 text-primary-500 text-[10px] font-black uppercase tracking-widest hover:underline">Clear Session</button>
              </div>
            </div>
          </section>

          {/* Keyword Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <h3 className="font-black text-sm uppercase tracking-widest">Matched Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.matched.map(kw => (
                  <span key={kw} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-100 dark:border-emerald-800">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-500">error</span>
                <h3 className="font-black text-sm uppercase tracking-widest">Critical Gaps</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.critical.map(kw => (
                  <span key={kw} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase rounded-lg border border-rose-100 dark:border-rose-800">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">info</span>
                <h3 className="font-black text-sm uppercase tracking-widest">Other Missing</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.missing.filter(k => !analysis.keywords.critical.includes(k)).map(kw => (
                  <span key={kw} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase rounded-lg border border-slate-100 dark:border-slate-700">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Gap Analysis */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
             <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-500">psychology</span>
                <h3 className="font-black uppercase tracking-[0.2em] text-xs">Deep Semantic Skill Gaps</h3>
             </div>
             <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {analysis.skillGaps.map((gap, i) => (
                  <div key={i} className="p-8 flex flex-col md:flex-row gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="md:w-64 shrink-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${gap.priority === 'High' ? 'bg-rose-500' : gap.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                        <h4 className="font-black text-sm">{gap.skill}</h4>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${gap.priority === 'High' ? 'bg-rose-100 text-rose-700' : gap.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {gap.priority} Impact
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed italic">"{gap.suggestion}"</p>
                  </div>
                ))}
             </div>
          </section>

          {/* Enhanced Bullet Point Optimizer */}
          <section className="space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-500 bg-primary-500/10 p-2 rounded-xl">auto_fix_high</span>
              Experience Optimization
            </h3>
            <div className="grid grid-cols-1 gap-6">
               {analysis.suggestedBulletPoints.map((bp, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Original Phrasing</p>
                          <p className="text-sm font-medium text-slate-400 line-through leading-relaxed">"{bp.original}"</p>
                       </div>
                       <div className="space-y-4 relative">
                          <div className="absolute -top-4 -right-4 size-16 bg-primary-500/5 rounded-full blur-xl"></div>
                          <p className="text-[10px] font-black uppercase text-primary-500 tracking-widest">Enhanced Recommendation</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed bg-primary-50 dark:bg-primary-900/10 p-6 rounded-2xl border border-primary-100 dark:border-primary-800/50">
                            {bp.improved}
                          </p>
                       </div>
                    </div>
                    <div className="px-8 lg:px-12 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                       <span className="material-symbols-outlined text-primary-500 text-sm">lightbulb</span>
                       <p className="text-[10px] font-bold text-slate-500 italic uppercase">Rationale: {bp.rationale}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* Action Plan */}
          <section className="bg-slate-900 text-white rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
             <h3 className="text-2xl font-black mb-10 flex items-center gap-4">
                <span className="material-symbols-outlined text-primary-500">list_alt</span>
                Strategic Action Plan
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {analysis.actionPlan.map((step, i) => (
                  <div key={i} className="space-y-3 relative">
                     <div className="text-4xl font-black text-primary-500/20">{i + 1}</div>
                     <p className="text-sm font-bold leading-relaxed">{step}</p>
                  </div>
                ))}
             </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ResumeOptimizer;
