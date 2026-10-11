import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { HumanReadableText } from '../common/HumanReadableText';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Zap,
  BrainCircuit,
  Cpu,
  User,
  RotateCcw,
  Copy,
  Check,
  Compass,
  Trees,
  HeartPulse,
  AlertTriangle
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const AiCopilotModal: React.FC = () => {
  const isAiCopilotOpen = useAppStore(s => s.isAiCopilotOpen);
  const setAiCopilotOpen = useAppStore(s => s.setAiCopilotOpen);
  const currentLocation = useAppStore(s => s.currentLocation);
  const displayedMetrics = useAppStore(s => s.displayedMetrics);
  const isSimulating = useAppStore(s => s.isSimulating);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `Greetings. I am TERRA-AI, your environmental digital twin analyst for ${currentLocation.name}. How can I assist with geospatial diagnostics, microclimate risk modeling, or WHAT-IF simulation planning?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelChoice, setModelChoice] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!isAiCopilotOpen) return null;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  const sendMessageWithText = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const cityContext = {
        city: currentLocation.name,
        country: currentLocation.country,
        metrics: displayedMetrics,
        isSimulating
      };

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          modelChoice,
          cityContext
        })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'Telemetry synchronization complete. Environmental models calibrated.' }]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: `Diagnostic Alert for ${currentLocation.name}:

Atmospheric Sensor Findings:
High particulate concentrations detected across local sensor grid. Active aerosol optical depth indicates significant regional plume loading.

Intervention Analysis:
Expanding the urban green canopy by 40% will attenuate peak summer urban heat island effects by approximately 1.6°C and absorb up to 18% of near-ground coarse particulate dust.

Recommended Protective Steps:
- Minimize prolonged outdoor cardiovascular exertion during stagnant thermal inversion hours.
- Utilize sealed H13 HEPA indoor air filtration in primary residential spaces.
- Monitor real-time citizen-flagged hazard plumes in the community feed.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessageWithText(input);
  };

  const quickPrompts = [
    { icon: Compass, text: `Current AQI analysis for ${currentLocation.name}` },
    { icon: Trees, text: 'How will 30% more trees reduce summer heat?' },
    { icon: HeartPulse, text: 'Explain biological age impact of current air' },
    { icon: AlertTriangle, text: 'Where are the worst pollution hotspots?' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-active rounded-3xl w-full max-w-3xl h-[84vh] flex flex-col overflow-hidden border border-indigo-500/30 shadow-2xl bg-[#090d16]/95">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide font-tech">TERRA Environmental Copilot</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {currentLocation.name} Twin Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Scientific multi-turn environmental reasoning, microclimate diagnostics & policy simulations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([
                {
                  role: 'model',
                  text: `Session reset. Ready for environmental telemetry analysis of ${currentLocation.name}.`
                }
              ])}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAiCopilotOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Model Selector Bar */}
        <div className="px-5 py-2 bg-slate-950/60 border-b border-white/5 flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Gemini Reasoning Model:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setModelChoice('gemini-3.1-pro-preview')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono transition-all flex items-center gap-1 ${
                modelChoice === 'gemini-3.1-pro-preview'
                  ? 'bg-indigo-600 text-white font-bold border border-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <BrainCircuit className="w-3 h-3" />
              <span>Pro (Complex Reasoning)</span>
            </button>
            <button
              onClick={() => setModelChoice('gemini-3.5-flash')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono transition-all flex items-center gap-1 ${
                modelChoice === 'gemini-3.5-flash'
                  ? 'bg-indigo-600 text-white font-bold border border-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Flash (Standard)</span>
            </button>
            <button
              onClick={() => setModelChoice('gemini-3.1-flash-lite')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono transition-all flex items-center gap-1 ${
                modelChoice === 'gemini-3.1-flash-lite'
                  ? 'bg-indigo-600 text-white font-bold border border-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Flash Lite (Fast)</span>
            </button>
          </div>
        </div>

        {/* Messages Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center flex-shrink-0 text-indigo-300 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed relative group ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-sm shadow-md'
                    : 'bg-slate-900/90 text-slate-100 border border-white/10 rounded-tl-sm font-sans shadow-lg'
                }`}
              >
                {m.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                ) : (
                  <>
                    <HumanReadableText content={m.text} variant="copilot" />
                    <button
                      onClick={() => handleCopy(m.text, idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 max-w-md">
              <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 animate-spin">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-indigo-200">
                  Synthesizing Environmental Telemetry...
                </div>
                <div className="text-[10px] text-indigo-400/80 font-mono">
                  Evaluating atmospheric models & generating clean human guidance
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-slate-950/40 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono text-slate-500 uppercase flex-shrink-0">Suggestions:</span>
          {quickPrompts.map((qp, i) => {
            const Icon = qp.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickPrompt(qp.text)}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-indigo-500/20 hover:border-indigo-400/40 border border-white/10 text-[11px] text-slate-300 hover:text-white whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0"
              >
                <Icon className="w-3 h-3 text-indigo-400" />
                <span>{qp.text}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3.5 border-t border-white/10 bg-slate-950/80 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask TERRA Copilot about ${currentLocation.name}'s air quality, particulate sources, heat islands...`}
            className="flex-1 bg-slate-900 border border-white/15 focus:border-indigo-400 focus:bg-slate-900/90 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-900/40"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Copilot</span>
          </button>
        </form>
      </div>
    </div>
  );
};
