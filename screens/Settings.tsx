
import React, { useState, useRef } from 'react';
import { UserProfile, ThemeConfig } from '../types';
import { THEMES, DOMAINS, SKILL_LEVELS } from '../constants';
import { platformService } from '../services/platformService';
import { fileService } from '../services/fileService';

interface SettingsProps {
  theme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  profile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, onThemeChange, profile, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'education' | 'appearance'>('personal');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UserProfile>(profile || {
    name: '',
    designation: '',
    targetRole: '',
    skillLevel: 'Mid-Level',
    domain: 'Software Engineering',
    experienceYears: 0,
    resumeText: ''
  });

  const save = () => {
    platformService.vibrate(10);
    onProfileUpdate(formData);
    alert("Profile Updated Successfully!");
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

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData(prev => ({ ...prev, profilePicture: base64String }));
      platformService.vibrate(10);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Profile Command Center</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your professional identity and application settings.</p>
        </div>
        <button 
          onClick={save}
          className="px-8 py-3 bg-primary-500 text-white rounded-xl font-bold shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">save</span>
          Save Profile
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-72 space-y-1">
          <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} icon="badge" label="Personal Details" />
          <TabButton active={activeTab === 'professional'} onClick={() => setActiveTab('professional')} icon="work_history" label="Career Identity" />
          <TabButton active={activeTab === 'education'} onClick={() => setActiveTab('education')} icon="school" label="Academic Background" />
          <TabButton active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} icon="palette" label="App Customization" />
        </aside>

        <main className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-8">
            {activeTab === 'personal' && (
              <div className="space-y-8">
                <header className="space-y-1">
                   <h3 className="text-xl font-black">Identity Details</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Base demographic information</p>
                </header>

                <div className="flex flex-col sm:flex-row items-center gap-8 pb-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="size-32 rounded-[2.5rem] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl relative transition-transform hover:scale-105 active:scale-95">
                      {formData.profilePicture ? (
                        <img src={formData.profilePicture} alt="Profile" className="size-full object-cover" />
                      ) : (
                        <div className="size-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                          <span className="material-symbols-outlined text-5xl">person</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleProfilePictureUpload} 
                    />
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <h4 className="font-black text-lg">Profile Portrait</h4>
                    <p className="text-sm text-slate-500 font-medium">Click the avatar to upload a professional photo. JPG, PNG or WebP supported.</p>
                    {formData.profilePicture && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, profilePicture: undefined })); }}
                        className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Input label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="e.g. Sarah Mitchell" />
                  <Input label="Professional Designation" value={formData.designation} onChange={v => setFormData({...formData, designation: v})} placeholder="e.g. Senior Backend Engineer" />
                  <Input label="Age" type="number" value={formData.age?.toString() || ''} onChange={v => setFormData({...formData, age: parseInt(v)})} />
                  <Input label="Date of Birth" type="date" value={formData.dob || ''} onChange={v => setFormData({...formData, dob: v})} />
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gender Identification</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Male', 'Female', 'Other', 'Prefer not to say'].map((opt: any) => (
                        <button 
                          key={opt}
                          onClick={() => setFormData({...formData, sex: opt})}
                          className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${formData.sex === opt ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="space-y-8">
                <header className="space-y-1">
                   <h3 className="text-xl font-black">Career Setup</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Target role and expertise levels</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Desired Next Role" placeholder="e.g. Lead Product Manager" value={formData.targetRole} onChange={v => setFormData({...formData, targetRole: v})} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Career Domain</label>
                    <select className="w-full px-5 py-3 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 text-sm font-bold" value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value as any})}>
                      {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Skill Seniority</label>
                    <select className="w-full px-5 py-3 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 text-sm font-bold" value={formData.skillLevel} onChange={e => setFormData({...formData, skillLevel: e.target.value as any})}>
                      {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <Input label="Years of Experience" type="number" value={formData.experienceYears.toString()} onChange={v => setFormData({...formData, experienceYears: parseInt(v)})} />
                  
                  <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Resume Management</label>
                      {formData.resumeText && <span className="text-[9px] font-black text-emerald-500 uppercase">Current Resume Active</span>}
                    </div>
                    
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full px-8 py-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${isUploading ? 'bg-primary-50 border-primary-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-primary-400'}`}>
                        <span className={`material-symbols-outlined text-4xl ${isUploading ? 'animate-bounce text-primary-500' : 'text-slate-400'}`}>
                          {isUploading ? 'upload' : 'cloud_upload'}
                        </span>
                        <p className="text-sm font-bold text-slate-600">
                          {isUploading ? 'Extracting Data...' : 'Drop your Resume here or Click to Browse'}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Supports PDF, DOCX, TXT</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Extracted Resume Text (Review for Accuracy)</label>
                      <textarea 
                        className="w-full h-48 px-5 py-4 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500/20 text-sm font-medium transition-all"
                        value={formData.resumeText || ''}
                        onChange={e => setFormData({...formData, resumeText: e.target.value})}
                        placeholder="Resume text will appear here..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-8">
                <header className="space-y-1">
                   <h3 className="text-xl font-black">Academic History</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Educational pedigree and background</p>
                </header>
                <div className="grid grid-cols-1 gap-6">
                  <Input label="School Name" placeholder="High School or Secondary Institution" value={formData.schoolName} onChange={v => setFormData({...formData, schoolName: v})} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="College / University" placeholder="e.g. Stanford University" value={formData.collegeName} onChange={v => setFormData({...formData, collegeName: v})} />
                    <Input label="Course / Major / Degree" placeholder="e.g. B.S. in Computer Science" value={formData.courseDegree} onChange={v => setFormData({...formData, courseDegree: v})} />
                  </div>
                  <Input label="Graduation Year" placeholder="e.g. 2022" value={formData.graduationYear} onChange={v => setFormData({...formData, graduationYear: v})} />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <header className="space-y-1">
                   <h3 className="text-xl font-black">App Skins</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Personalize your interface</p>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {THEMES.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => onThemeChange(t)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${theme.id === t.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" style={{ backgroundColor: t.primary }}></div>
                      <div className="flex-1">
                        <p className="font-black text-sm">{t.name}</p>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{t.isDark ? 'Professional Dark' : 'Executive Light'}</p>
                      </div>
                      {theme.id === t.id && <span className="material-symbols-outlined text-primary-500 text-xl">check_circle</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${active ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
    {label}
  </button>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
    <input 
      type={type}
      className="w-full px-5 py-3 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500/20 text-sm font-bold transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export default Settings;
