
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

const AICoach: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Hello! I'm your CogniFy Coach. Ask me anything about career strategies, STAR method, or specific interview tips." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const response = await geminiService.chatWithCoach([], userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to my neural network right now. Try again shortly!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-[60]">
      {isOpen ? (
        <div 
          className="w-80 h-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-3xl flex flex-col overflow-hidden animate-slide-up"
          role="dialog"
          aria-label="AI Career Coach Chat"
        >
          <header className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-primary-500 text-white p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">smart_toy</span>
              </div>
              <span className="text-xs font-black uppercase tracking-widest">AI Career Coach</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close Chat"
            >
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </header>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed ${m.role === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl animate-pulse text-[10px] font-black uppercase text-slate-400">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="relative">
              <input 
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-4 pr-12 py-3 text-xs font-bold"
                placeholder="Ask me a tip..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                aria-label="Message text"
              />
              <button 
                onClick={sendMessage} 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-500 hover:scale-110 transition-transform"
                aria-label="Send Message"
              >
                <span className="material-symbols-outlined" aria-hidden="true">send</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="size-16 bg-primary-500 text-white rounded-full shadow-2xl shadow-primary-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
          aria-label="Open AI Career Coach"
        >
          <span className="material-symbols-outlined text-3xl" aria-hidden="true">voice_chat</span>
          <div className="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950"></div>
        </button>
      )}
    </div>
  );
};

export default AICoach;
