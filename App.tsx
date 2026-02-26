
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { storageService } from './services/storageService';
import { platformService } from './services/platformService';
import { UserProfile, ThemeConfig, AuthUser } from './types';
import { THEMES } from './constants';

// Screen Imports
import Dashboard from './screens/Dashboard';
import InterviewSetup from './screens/InterviewSetup';
import InterviewSession from './screens/InterviewSession';
import Results from './screens/Results';
import History from './screens/History';
import Analytics from './screens/Analytics';
import Settings from './screens/Settings';
import ResumeOptimizer from './screens/ResumeOptimizer';
import AICoach from './components/AICoach';

// Types and Interfaces
interface NavLinkProps {
  to: string;
  icon: string;
  label: string;
  active: boolean;
}

interface MainLayoutProps {
  children: React.ReactNode;
  theme: ThemeConfig;
  profile: UserProfile | null;
  authUser: AuthUser;
  onLogout: () => void;
}

const Logo: React.FC<{ className?: string }> = ({ className = "h-8" }) => (
  <div className={`${className} flex items-center gap-3 select-none pointer-events-none`}>
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-full w-auto drop-shadow-sm"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Outer Hexagon with rounded corners */}
      <path 
        d="M50 5L89.5 28.5V71.5L50 95L10.5 71.5V28.5L50 5Z" 
        stroke="url(#logo-grad)" 
        strokeWidth="8" 
        strokeLinejoin="round" 
        fill="none"
        className="opacity-20"
      />
      {/* Inner Neural Path */}
      <circle cx="50" cy="50" r="10" fill="url(#logo-grad)" filter="url(#glow)" />
      <path 
        d="M50 40V25M50 60V75M60 50H75M40 50H25" 
        stroke="url(#logo-grad)" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
      <path 
        d="M57 43L68 32M43 57L32 68M57 57L68 68M43 43L32 32" 
        stroke="url(#logo-grad)" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
      {/* Floating orbital dots */}
      <circle cx="80" cy="30" r="4" fill="url(#logo-grad)" />
      <circle cx="20" cy="70" r="4" fill="url(#logo-grad)" />
      <circle cx="50" cy="15" r="3" fill="url(#logo-grad)" className="animate-pulse" />
    </svg>
    <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
      Cogni<span className="text-primary-500">Fy</span>
    </span>
  </div>
);

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617] overflow-hidden" role="alert" aria-busy="true">
      <div className="relative flex flex-col items-center">
        <div className="animate-logo-pop">
           <div className="bg-white/5 backdrop-blur-sm rounded-[3rem] p-12 shadow-2xl border border-white/10">
             <Logo className="h-24 md:h-32" />
           </div>
        </div>
        <div className="mt-12 overflow-hidden text-center text-white/50 text-[10px] font-black uppercase tracking-[0.5em] animate-fade-in" style={{ animationDelay: '0.8s' }}>
          Future Intelligence Studio
        </div>
      </div>
    </div>
  );
};

const LoginScreen: React.FC<{ onLogin: (user: any) => void; theme: ThemeConfig }> = ({ onLogin, theme }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  useEffect(() => {
    if (mode === 'signup' && email.length > 3) {
      const timer = setTimeout(() => {
        setIsEmailAvailable(storageService.isIdentifierAvailable(email));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsEmailAvailable(null);
    }
  }, [email, mode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    if (mode === 'signup') {
      const errors = [];
      if (!hasMinLength) errors.push("Password must be at least 8 characters.");
      if (!hasUppercase) errors.push("Password must contain at least one uppercase letter.");
      if (!hasSpecialChar) errors.push("Password must contain at least one special character.");
      if (isEmailAvailable === false) errors.push("This email is already registered.");
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
    }

    setLoading(true);
    platformService.vibrate(10);
    
    setTimeout(() => {
      if (mode === 'signup') {
        const user = storageService.registerUser({ name, email, phone, password });
        if (user) {
          onLogin(user);
        } else {
          setValidationErrors(["Registration failed. Email or Phone might be taken."]);
        }
      } else {
        const user = storageService.login(email, password);
        if (user) {
          onLogin(user);
        } else {
          setValidationErrors(["Invalid credentials."]);
        }
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a]">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[3.5rem] shadow-2xl space-y-8 animate-slide-up relative overflow-hidden" role="main">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="text-center space-y-4">
          <div className="inline-block py-2">
            <Logo className="h-10" />
          </div>
          <h2 className="text-base font-bold text-slate-400">
            {mode === 'signin' ? 'Welcome Back to your Studio' : 'Create your AI Workspace'}
          </h2>
        </div>

        {validationErrors.length > 0 && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl" role="alert">
            {validationErrors.map((err, i) => (
              <p key={i} className="text-[11px] font-black text-rose-500 uppercase tracking-widest">{err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label htmlFor="full-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Workspace Owner</label>
              <input 
                id="full-name"
                required
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold focus:ring-4 focus:ring-primary-500/10 transition-all" 
                placeholder="Full Name" 
                value={name}
                onChange={e => setName(e.target.value)} 
              />
            </div>
          )}
          
          <div className="space-y-1 relative">
            <label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
            <input 
              id="email"
              required
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold focus:ring-4 focus:ring-primary-500/10 transition-all" 
              placeholder="name@company.com" 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
            />
            {mode === 'signup' && isEmailAvailable !== null && (
              <div className="absolute right-4 top-10 flex items-center" aria-live="polite">
                <span className={`material-symbols-outlined text-sm ${isEmailAvailable ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isEmailAvailable ? 'check_circle' : 'cancel'}
                </span>
                <span className={`text-[9px] font-black uppercase ml-1 ${isEmailAvailable ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isEmailAvailable ? 'Available' : 'Taken'}
                </span>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <label htmlFor="phone" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mobile Number</label>
              <input 
                id="phone"
                required
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                placeholder="+1 (000) 000-0000" 
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)} 
              />
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Access Key</label>
            <input 
              id="password"
              required
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold focus:ring-4 focus:ring-primary-500/10 transition-all" 
              placeholder="••••••••" 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          {mode === 'signup' && (
            <div className="px-4 py-2 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Standards:</p>
              <div className="grid grid-cols-1 gap-1" role="list">
                <Requirement met={hasMinLength} text="At least 8 characters" />
                <Requirement met={hasUppercase} text="One uppercase letter" />
                <Requirement met={hasSpecialChar} text="One special character" />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-primary-500 text-white font-black rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (mode === 'signin' ? 'Enter Studio' : 'Create Workspace')}
          </button>
        </form>
        
        <div className="text-center pt-2">
           <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setValidationErrors([]); }} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-500 transition-colors">
             {mode === 'signin' ? "New to CogniFy? Start Your Journey" : "Already a member? Sign In"}
           </button>
        </div>
      </div>
    </div>
  );
};

const Requirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-2" role="listitem">
    <span className={`material-symbols-outlined text-[14px] ${met ? 'text-emerald-500' : 'text-slate-300'}`}>
      {met ? 'check_circle' : 'circle'}
    </span>
    <span className={`text-[10px] font-bold ${met ? 'text-emerald-600' : 'text-slate-400'}`}>{text}</span>
  </div>
);

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    aria-current={active ? 'page' : undefined}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.15em] ${
      active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
    {label}
  </Link>
);

const MainLayout: React.FC<MainLayoutProps> = ({ children, theme, profile, authUser, onLogout }) => {
  const location = useLocation();
  const isInterviewSession = location.pathname === '/session';

  if (isInterviewSession) return <>{children}</>;

  return (
    <div className="flex h-full overflow-hidden bg-white dark:bg-slate-950">
      <aside className="w-72 hidden md:flex flex-col shrink-0 border-r border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl" role="complementary">
        <div className="p-8 flex justify-center border-b border-slate-100 dark:border-slate-800/50">
          <Logo className="h-10" />
        </div>
        <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto custom-scrollbar" aria-label="Main Navigation">
          <NavLink to="/" icon="dashboard" label="Workspace" active={location.pathname === '/'} />
          <NavLink to="/setup" icon="play_circle" label="New Session" active={location.pathname === '/setup'} />
          <NavLink to="/optimize" icon="analytics" label="ATS Optimizer" active={location.pathname === '/optimize'} />
          <NavLink to="/analytics" icon="bar_chart" label="Performance" active={location.pathname === '/analytics'} />
          <NavLink to="/history" icon="history" label="History" active={location.pathname === '/history'} />
          <NavLink to="/settings" icon="settings" label="Settings" active={location.pathname === '/settings'} />
        </nav>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800/50">
           <button onClick={onLogout} aria-label="Log Out" className="w-full flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors">
             <span className="material-symbols-outlined" aria-hidden="true">logout</span> Log Out
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-transparent" role="main">
        {children}
        <AICoach />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeConfig>(THEMES[0]);
  const [profile, setProfile] = useState<UserProfile | null>(storageService.getProfile());
  const [authUser, setAuthUser] = useState<AuthUser | null>(storageService.getUser());
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    const savedThemeId = storageService.getTheme();
    if (savedThemeId) {
      const found = THEMES.find(t => t.id === savedThemeId);
      if (found) setTheme(found);
    }
  }, []);

  const handleProfileUpdate = (p: UserProfile) => { 
    setProfile(p); 
    storageService.saveProfile(p); 
  };
  
  const handleLogin = (u: any) => { 
    setAuthUser({
      id: u.id,
      name: u.name,
      email: u.email,
      picture: u.picture
    }); 
    storageService.saveUser(u); 
  };

  const handleThemeChange = (t: ThemeConfig) => {
    setTheme(t);
    storageService.saveTheme(t.id);
  };

  if (starting) return <SplashScreen onComplete={() => setStarting(false)} />;

  return (
    <div className={theme.isDark ? 'dark' : ''}>
      <HashRouter>
        <div className="h-screen overflow-hidden transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.text }}>
          {!authUser ? (
            <LoginScreen onLogin={handleLogin} theme={theme} />
          ) : (
            <MainLayout theme={theme} profile={profile} authUser={authUser} onLogout={() => setAuthUser(null)}>
              <Routes>
                <Route path="/" element={<Dashboard profile={profile} />} />
                <Route path="/setup" element={<InterviewSetup profile={profile} onSaveProfile={handleProfileUpdate} />} />
                <Route path="/session" element={<InterviewSession />} />
                <Route path="/results/:id" element={<Results />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/optimize" element={<ResumeOptimizer profile={profile} onProfileUpdate={handleProfileUpdate} />} />
                <Route path="/settings" element={<Settings theme={theme} onThemeChange={handleThemeChange} profile={profile} onProfileUpdate={handleProfileUpdate} />} />
              </Routes>
            </MainLayout>
          )}
        </div>
      </HashRouter>
    </div>
  );
};

export default App;
