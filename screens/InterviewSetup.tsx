
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Domain, SkillLevel, InterviewMode } from '../types';
import { DOMAINS, SKILL_LEVELS, INTERVIEW_MODES } from '../constants';
import { platformService } from '../services/platformService';
import { fileService } from '../services/fileService';

interface InterviewSetupProps {
  profile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ profile, onSaveProfile }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile || {
    name: '',
    designation: '',
    targetRole: '',
    skillLevel: 'Mid-Level',
    domain: 'Software Engineering',
    experienceYears: 0,
    resumeText: '',
    targetCompany: '',
    jobDescription: ''
  });
  const [selectedMode, setSelectedMode] = useState<InterviewMode>('Quick');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  // Expanded validation
  const isStep1Valid = formData.name && formData.designation && formData.collegeName && formData.courseDegree;
  const isStep2Valid = formData.resumeText && formData.targetCompany && formData.jobDescription;

  const handleNext = () => {
    platformService.vibrate(10);
    if (step === 1 && isStep1Valid) setStep(2);
    else if (step === 2 && isStep2Valid) setStep(3);
    else if (step === 3) {
      onSaveProfile(formData);
      navigate('/session', { state: { profile: formData, mode: selectedMode, isVoiceMode } });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await fileService.extractText(file);
      setFormData(prev => ({ ...prev, resumeText: text }));
      platformService.vibrate(20);
    } catch (err: any) {
      alert(err.message || 'Failed to extract text from file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-full flex flex-col animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black mb-2 tracking-tight">Practice Command</h1>
        <p className="text-slate-500 text-sm font-medium">Fine-tune your simulation environment for peak performance.</p>
        
        <div className="mt-8 flex items-center justify-center gap-3">
          {[1, 2, 3].map(i => (
            <React.Fragment key={i}>
              <div className={`size-10 rounded-full flex items-center justify-center font-black text-xs transition-all ${step >= i ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30 scale-110' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                {step > i ? <span className="material-symbols-outlined text-sm">check</span> : i}
              </div>
              {i < 3 && <div className={`h-1.5 w-12 rounded-full transition-all ${step > i ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-3xl overflow-hidden flex flex-col">
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <header className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">Professional Foundation</h2>
                <p className="text-sm text-slate-500 font-medium">Core profile data required for contextual interviewing.</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Your Name" />
                <InputGroup label="Current Designation" value={formData.designation} onChange={v => setFormData({...formData, designation: v})} placeholder="e.g. Frontend Engineer" />
                <InputGroup label="College / University" value={formData.collegeName} onChange={v => setFormData({...formData, collegeName: v})} placeholder="Institution Name" />
                <InputGroup label="Degree / Course" value={formData.courseDegree} onChange={v => setFormData({...formData, courseDegree: v})} placeholder="e.g. B.Tech Computer Science" />
                <SelectGroup label="Career Domain" value={formData.domain} options={DOMAINS} onChange={v => setFormData({...formData, domain: v as Domain})} />
                <SelectGroup label="Skill Level" value={formData.skillLevel} options={SKILL_LEVELS} onChange={v => setFormData({...formData, skillLevel: v as SkillLevel})} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 h-full flex flex-col animate-fade-in">
              <header className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">The Target Mission</h2>
                <p className="text-sm text-slate-500 font-medium">Specific details about the job and your accomplishments.</p>
              </header>
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Target Company" value={formData.targetCompany} onChange={v => setFormData({...formData, targetCompany: v})} placeholder="e.g. Google, Meta, Stripe" />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Resume (PDF/DOCX)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full px-6 py-4 rounded-2xl border-2 border-dashed transition-all flex items-center gap-3 ${isUploading ? 'bg-primary-50 border-primary-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-primary-400'}`}>
                        <span className={`material-symbols-outlined ${isUploading ? 'animate-bounce text-primary-500' : 'text-slate-400'}`}>
                          {isUploading ? 'upload' : 'cloud_upload'}
                        </span>
                        <span className="text-xs font-bold text-slate-500 truncate">
                          {isUploading ? 'Processing...' : (formData.resumeText ? 'Resume Uploaded (Click to Change)' : 'Select Resume File')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resume Content (Extracted)</label>
                    <textarea 
                      className="flex-1 w-full p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-primary-500/10 text-sm font-medium resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      placeholder="Resume text will appear here after upload or manual paste..."
                      value={formData.resumeText}
                      onChange={e => setFormData({...formData, resumeText: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Description</label>
                    <textarea 
                      className="flex-1 w-full p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-primary-500/10 text-sm font-medium resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      placeholder="Paste the requirements you want to practice against..."
                      value={formData.jobDescription}
                      onChange={e => setFormData({...formData, jobDescription: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <header className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">Session Configuration</h2>
                <p className="text-sm text-slate-500 font-medium">Choose your challenge level and delivery method.</p>
              </header>
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {INTERVIEW_MODES.map(mode => (
                    <div 
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4 ${
                        selectedMode === mode.id 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-xl' 
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className={`size-12 rounded-2xl flex items-center justify-center ${selectedMode === mode.id ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-3xl">{mode.icon}</span>
                      </div>
                      <div>
                        <p className="font-black text-base">{mode.label}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{mode.count} High-Impact Questions</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div 
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between ${isVoiceMode ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-2xl shadow-primary-500/10' : 'border-slate-100 dark:border-slate-800'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`size-16 rounded-[1.5rem] flex items-center justify-center transition-all ${isVoiceMode ? 'bg-primary-500 text-white shadow-2xl shadow-primary-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <span className="material-symbols-outlined text-4xl">{isVoiceMode ? 'record_voice_over' : 'keyboard'}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-xl">Real-Time Voice Interface</h4>
                      <p className="text-sm text-slate-500 font-medium">Speak naturally with Gemini's low-latency native audio engine.</p>
                    </div>
                  </div>
                  <div className={`w-16 h-8 rounded-full transition-all relative ${isVoiceMode ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 size-6 rounded-full bg-white shadow-md transition-all ${isVoiceMode ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center px-12">
          <button 
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-6 py-3 text-sm font-black text-slate-400 disabled:opacity-0 hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Prev
          </button>
          <button 
            onClick={handleNext}
            className={`px-12 py-4 rounded-2xl font-black shadow-2xl transition-all flex items-center gap-3 transform active:scale-95 text-sm uppercase tracking-widest ${
              (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-primary-500 text-white shadow-primary-500/30 hover:bg-primary-600'
            }`}
          >
            {step < 3 ? 'Proceed' : 'Launch Simulation'}
            <span className="material-symbols-outlined text-lg">{step < 3 ? 'arrow_forward' : 'rocket_launch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, placeholder }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      className="w-full px-6 py-4 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const SelectGroup = ({ label, value, onChange, options }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <select 
      className="w-full px-6 py-4 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-bold appearance-none cursor-pointer"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default InterviewSetup;
