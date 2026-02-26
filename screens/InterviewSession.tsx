
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { UserProfile, InterviewMode, Question, Answer, InterviewSession as ISession, Feedback } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { platformService } from '../services/platformService';
import { INTERVIEW_MODES } from '../constants';

const SAMPLE_RATE_IN = 16000;
const SAMPLE_RATE_OUT = 24000;

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const InterviewSession: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const profile = state?.profile as UserProfile;
  const mode = state?.mode as InterviewMode || 'Quick';
  const isVoiceMode = state?.isVoiceMode || false;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [hint, setHint] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);

  // Live API States
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [aiTranscription, setAiTranscription] = useState('');
  
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const outCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const q = await geminiService.generateQuestions(
          profile, 
          mode, 
          INTERVIEW_MODES.find(m => m.id === mode)?.count || 5
        );
        setQuestions(q);
        setLoading(false);
        
        if (isVoiceMode) {
          startLiveAudio(q);
        } else {
          loadFlashHint(q[0].text);
        }
      } catch (e) {
        console.error("Initialization failed", e);
        navigate('/');
      }
    };
    init();
    
    return () => {
      sessionRef.current?.close();
      audioSourcesRef.current.forEach(s => s.stop());
    };
  }, []);

  const loadFlashHint = async (qText: string) => {
    setLoadingHint(true);
    try {
      const h = await geminiService.getInstantHint(qText, profile);
      setHint(h);
    } catch (e) {
      setHint('');
    } finally {
      setLoadingHint(false);
    }
  };

  const startLiveAudio = async (qs: Question[]) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const inCtx = new AudioContext({ sampleRate: SAMPLE_RATE_IN });
    const outCtx = new AudioContext({ sampleRate: SAMPLE_RATE_OUT });
    outCtxRef.current = outCtx;
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          console.log("Live session established");
          const source = inCtx.createMediaStreamSource(stream);
          const processor = inCtx.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const volume = inputData.reduce((a, b) => a + Math.abs(b), 0) / inputData.length;
            setIsUserSpeaking(volume > 0.02);

            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              int16[i] = inputData[i] * 32768;
            }
            
            const pcmData = new Uint8Array(int16.buffer);
            sessionPromise.then(s => {
              s.sendRealtimeInput({
                media: { data: encode(pcmData), mimeType: 'audio/pcm;rate=16000' }
              });
            });
          };

          source.connect(processor);
          processor.connect(inCtx.destination);
          
          sessionPromise.then(s => {
            s.sendRealtimeInput({
              text: `Hello! I am your AI interviewer. We are practicing for a ${profile.targetRole} role. 
                     Please greet the candidate and ask this first question: ${qs[0].text}`
            });
          });
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            setIsAiSpeaking(true);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, SAMPLE_RATE_OUT, 1);
            const source = outCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outCtx.destination);
            source.onended = () => {
              audioSourcesRef.current.delete(source);
              if (audioSourcesRef.current.size === 0) setIsAiSpeaking(false);
            };
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioSourcesRef.current.add(source);
          }
          if (message.serverContent?.inputTranscription) {
            setLiveTranscription(prev => (prev + ' ' + message.serverContent?.inputTranscription?.text).trim());
          }
          if (message.serverContent?.outputTranscription) {
            setAiTranscription(prev => (prev + ' ' + message.serverContent?.outputTranscription?.text).trim());
          }
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        }
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const finalizeSession = async (finalAnswers: Answer[]) => {
    setIsEvaluating(true);
    sessionRef.current?.close();
    
    const detailedFeedback: Record<string, Feedback> = {};
    let totalScore = 0;

    try {
      for (let i = 0; i < finalAnswers.length; i++) {
        setEvaluationProgress(Math.round(((i + 1) / finalAnswers.length) * 100));
        const fb = await geminiService.evaluateAnswer(profile, finalAnswers[i]);
        detailedFeedback[finalAnswers[i].questionId] = fb;
        totalScore += fb.score;
      }

      const overallScore = Math.round(totalScore / finalAnswers.length);
      const session: ISession = {
        id: Math.random().toString(36).substring(7),
        date: new Date().toISOString(),
        profile,
        mode,
        isVoiceMode,
        questions,
        answers: finalAnswers,
        results: {
          overallScore,
          detailedFeedback,
          summary: `You completed a ${mode} session with an overall readiness of ${overallScore}%. You showed particular strength in ${Object.values(detailedFeedback)[0]?.strengths[0] || 'your technical clarity'}.`
        }
      };
      
      storageService.saveSession(session);
      navigate(`/results/${session.id}`);
    } catch (e) {
      console.error("Evaluation failed", e);
      alert("Evaluation failed. Saving raw session.");
      navigate('/');
    }
  };

  const handleNext = async () => {
    const finalAnswerText = isVoiceMode ? (liveTranscription || "[Audio Recorded]") : currentText;
    const ans: Answer = {
      questionId: questions[currentIndex].id,
      questionText: questions[currentIndex].text,
      userAnswer: finalAnswerText,
      timeSpent: 180 - timeLeft
    };
    
    const updatedAnswers = [...answers, ans];
    setAnswers(updatedAnswers);
    platformService.vibrate(15);

    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTimeLeft(180);
      setCurrentText('');
      setLiveTranscription('');
      setAiTranscription('');
      if (isVoiceMode && sessionRef.current) {
        sessionRef.current.sendRealtimeInput({ text: `Question ${nextIdx + 1}: ${questions[nextIdx].text}` });
      } else {
        loadFlashHint(questions[nextIdx].text);
      }
    } else {
      finalizeSession(updatedAnswers);
    }
  };

  if (loading || isEvaluating) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-8 p-12">
      <div className="relative">
        <div className="size-32 border-4 border-primary-500/10 border-t-primary-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-500 text-5xl animate-pulse">psychology</span>
        </div>
      </div>
      <div className="text-center space-y-4 max-w-sm">
        <h2 className="text-2xl font-black uppercase tracking-widest">{isEvaluating ? 'Neural Evaluation' : 'Studio Sync'}</h2>
        {isEvaluating && (
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${evaluationProgress}%` }}></div>
          </div>
        )}
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
          {isEvaluating ? `Processing Response ${Math.ceil((evaluationProgress/100) * questions.length)} of ${questions.length}` : 'Calibrating Professional Context'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <header className="h-20 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-5">
          <div className="p-2.5 bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-500/20">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <div>
            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Live Simulation</span>
            <span className="block font-black text-sm tracking-tight">{profile.targetCompany || 'General'} | {mode} Mode</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Progress</span>
            <div className="flex gap-1.5 mt-1">
              {questions.map((_, i) => (
                <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i <= currentIndex ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
              ))}
            </div>
          </div>
          <button onClick={() => navigate('/')} className="size-10 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-center p-8 lg:p-12 overflow-hidden">
        <div className="max-w-3xl w-full space-y-12 text-center z-10">
          <div className="space-y-4">
            <span className="inline-flex px-4 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary-500/10">Challenge {currentIndex + 1}</span>
            <h1 className="text-3xl lg:text-4xl font-black italic tracking-tight leading-tight text-slate-900 dark:text-white transition-all">
              "{questions[currentIndex].text}"
            </h1>
          </div>

          <div className="relative group flex justify-center">
            <div className={`absolute rounded-full blur-[80px] transition-all duration-700 opacity-30 size-64 ${isAiSpeaking ? 'bg-primary-500' : isUserSpeaking ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800 opacity-10'}`}></div>
            <div className={`relative size-48 lg:size-56 rounded-[4rem] bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center transition-all border-4 ${isAiSpeaking ? 'border-primary-500 scale-110' : isUserSpeaking ? 'border-emerald-500 scale-105' : 'border-slate-100 dark:border-slate-800'}`}>
               <div className="flex gap-2 items-end h-16">
                 {[1,2,3,4,5,6,7].map(i => (
                   <div key={i} className={`w-1.5 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-primary-500' : isUserSpeaking ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} style={{ height: (isAiSpeaking || isUserSpeaking) ? `${20 + Math.random() * 80}%` : '20%' }}></div>
                 ))}
               </div>
            </div>
          </div>

          {isVoiceMode && (
            <div className="space-y-4 max-w-xl mx-auto h-24 overflow-hidden relative">
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-10"></div>
              {aiTranscription && <p className="text-xs font-bold text-primary-500 opacity-80 animate-fade-in line-clamp-2">AI: {aiTranscription}</p>}
              {liveTranscription && <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-fade-in line-clamp-2 italic">"{liveTranscription}"</p>}
            </div>
          )}
        </div>
      </main>

      <footer className="p-8 lg:p-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1 w-full space-y-4">
             <div className="flex justify-between items-center px-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isVoiceMode ? 'Neural Transcription Active' : 'Professional Response'}</span>
             </div>
             <textarea 
               className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[2.5rem] p-8 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 min-h-[140px] shadow-inner resize-none transition-all"
               placeholder={isVoiceMode ? "AI is transcribing your speech..." : "Formulate your response using the STAR method..."}
               value={isVoiceMode ? liveTranscription : currentText}
               onChange={e => !isVoiceMode && setCurrentText(e.target.value)}
               readOnly={isVoiceMode}
             />
          </div>
          <button onClick={handleNext} className="h-24 px-12 bg-primary-500 text-white rounded-[2.5rem] font-black shadow-2xl shadow-primary-500/40 hover:bg-primary-600 transition-all flex items-center gap-4 text-xs uppercase tracking-widest">
            {currentIndex === questions.length - 1 ? 'Analyze Final Session' : 'Next Challenge'}
            <span className="material-symbols-outlined text-xl">{currentIndex === questions.length - 1 ? 'verified' : 'arrow_forward'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default InterviewSession;
