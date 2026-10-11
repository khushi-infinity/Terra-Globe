import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Globe2, Users, Sparkles, ShieldAlert, Cpu } from 'lucide-react';

export const TerraToggle: React.FC = () => {
  const mainView = useAppStore(s => s.mainView);
  const setMainView = useAppStore(s => s.setMainView);
  const currentLocation = useAppStore(s => s.currentLocation);
  const setAwsInspectorOpen = useAppStore(s => s.setAwsInspectorOpen);
  const setBioAgePanelOpen = useAppStore(s => s.setBioAgePanelOpen);
  const calculateBiologicalAge = useAppStore(s => s.calculateBiologicalAge);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center gap-2 select-none">
      {/* The Central TERRA Switcher */}
      <div className="glass-panel p-1 rounded-2xl flex items-center gap-1 border border-cyan-500/30 backdrop-blur-2xl bg-black/75 shadow-[0_0_25px_rgba(6,182,212,0.18)]">
        <button
          onClick={() => setMainView('map')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            mainView === 'map'
              ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/35 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Globe2 className={`w-3.5 h-3.5 ${mainView === 'map' ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
          <span>🌍 Map Intelligence</span>
        </button>

        <button
          onClick={() => setMainView('community')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            mainView === 'community'
              ? 'bg-gradient-to-r from-emerald-500/30 to-teal-600/35 text-emerald-300 border border-emerald-400/50 shadow-md shadow-emerald-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Users className={`w-3.5 h-3.5 ${mainView === 'community' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>👥 Community Action</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
            AWS
          </span>
        </button>
      </div>

      {/* Quick Launch Biological Age Impact */}
      <button
        onClick={() => {
          calculateBiologicalAge();
          setBioAgePanelOpen(true);
        }}
        className="glass-panel px-3 py-1.5 rounded-2xl text-xs font-medium flex items-center gap-1.5 border border-rose-500/30 text-rose-300 bg-black/60 hover:bg-rose-950/40 hover:border-rose-400 transition-all backdrop-blur-2xl shadow-lg shadow-rose-950/20"
        title="Open Biological Age Impact Engine"
      >
        <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
        <span className="hidden md:inline font-mono font-semibold">AeroHealth Bio-Age</span>
      </button>

      {/* AWS Cloud Architecture Inspector */}
      <button
        onClick={() => setAwsInspectorOpen(true)}
        className="glass-panel px-2.5 py-1.5 rounded-2xl text-xs font-mono text-amber-300 border border-amber-500/30 bg-black/60 hover:bg-amber-950/40 hover:border-amber-400 transition-all backdrop-blur-2xl flex items-center gap-1.5 shadow-lg shadow-amber-950/20"
        title="View AWS Free Tier Serverless Architecture (DynamoDB, S3, Cognito, Lambda)"
      >
        <Cpu className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden lg:inline text-[11px] font-bold">AWS ARCH</span>
      </button>
    </div>
  );
};
