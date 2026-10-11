import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Lock,
  X,
  Mail,
  User,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Sparkles,
  Key
} from 'lucide-react';

export const CognitoAuthModal: React.FC = () => {
  const isCognitoModalOpen = useAppStore(s => s.isCognitoModalOpen);
  const setCognitoModalOpen = useAppStore(s => s.setCognitoModalOpen);
  const cognitoTab = useAppStore(s => s.cognitoTab);
  const loginCognito = useAppStore(s => s.loginCognito);

  const [tab, setTab] = useState<'login' | 'signup'>(cognitoTab || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Citizen Reporter' | 'Clean Air Activist' | 'Municipal Officer' | 'Environmental Scientist'>('Citizen Reporter');

  if (!isCognitoModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginCognito(email, name || email.split('@')[0], role);
  };

  const handleQuickDemoUser = (demoEmail: string, demoName: string, demoRole: any) => {
    loginCognito(demoEmail, demoName, demoRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="glass-panel-active rounded-3xl p-6 w-full max-w-md border border-cyan-500/40 shadow-2xl text-left bg-slate-950/95 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-tech uppercase tracking-wide">
                  Citizen Account
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SECURE
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Sign in to report incidents, volunteer for cleanups, and organize community drives
              </span>
            </div>
          </div>

          <button
            onClick={() => setCognitoModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-xl bg-black/50 p-1 border border-white/10 text-xs mb-4">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              tab === 'login'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              tab === 'signup'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Cognito Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'signup' && (
            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Priya Sundaram"
                  className="w-full bg-slate-900 border border-white/15 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@terra.earth"
                className="w-full bg-slate-900 border border-white/15 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900 border border-white/15 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {tab === 'signup' && (
            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">Citizen Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="Citizen Reporter">Citizen Reporter (Ground Truth)</option>
                <option value="Clean Air Activist">Clean Air Activist (Campaign Lead)</option>
                <option value="Environmental Scientist">Environmental Scientist (Epidemiology)</option>
                <option value="Municipal Officer">Municipal Officer (Civic Action)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-500/25"
          >
            <span>{tab === 'login' ? 'Sign In to TERRA' : 'Create Citizen Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-Click Quick Demo Profiles */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
            Quick-Fill Demonstration Profiles:
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-left">
            <button
              onClick={() => handleQuickDemoUser('priya.doc@delhiair.in', 'Dr. Priya Sundaram', 'Environmental Scientist')}
              className="p-2 rounded-xl bg-slate-900/80 border border-white/5 hover:border-cyan-400/40 text-left transition-all"
            >
              <div className="text-xs font-semibold text-white">Dr. Priya Sundaram</div>
              <div className="text-[10px] text-cyan-300">Pulmonologist / Scientist</div>
            </button>
            <button
              onClick={() => handleQuickDemoUser('rohan.activist@terra.earth', 'Rohan Nambiar', 'Clean Air Activist')}
              className="p-2 rounded-xl bg-slate-900/80 border border-white/5 hover:border-emerald-400/40 text-left transition-all"
            >
              <div className="text-xs font-semibold text-white">Rohan Nambiar</div>
              <div className="text-[10px] text-emerald-300">Community Organizer</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
