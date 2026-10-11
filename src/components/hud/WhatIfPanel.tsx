import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/useTranslation';
import {
  Sliders,
  Trees,
  Truck,
  Recycle,
  Sparkles,
  Bus,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';

interface WhatIfPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose
}) => {
  const { t } = useTranslation();
  const interventions = useAppStore(s => s.interventions);
  const baselineMetrics = useAppStore(s => s.baselineMetrics);
  const simulatedMetrics = useAppStore(s => s.simulatedMetrics);
  const isSimulating = useAppStore(s => s.isSimulating);
  const setIntervention = useAppStore(s => s.setIntervention);
  const resetInterventions = useAppStore(s => s.resetInterventions);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : true;

  if (!isOpen) return null;

  const applyPreset = (preset: 'canopy' | 'circular' | 'transit') => {
    if (preset === 'canopy') {
      setIntervention('urbanTrees', 75);
      setIntervention('greenSpace', 65);
      setIntervention('wasteCollection', 35);
      setIntervention('recycling', 30);
      setIntervention('publicTransport', 40);
    } else if (preset === 'circular') {
      setIntervention('wasteCollection', 90);
      setIntervention('recycling', 85);
      setIntervention('urbanTrees', 35);
      setIntervention('greenSpace', 30);
      setIntervention('publicTransport', 35);
    } else {
      setIntervention('publicTransport', 85);
      setIntervention('urbanTrees', 55);
      setIntervention('greenSpace', 45);
      setIntervention('wasteCollection', 60);
      setIntervention('recycling', 55);
    }
  };

  const currentScore = baselineMetrics.terraIndex;
  const simScore = simulatedMetrics.terraIndex;
  const scoreDiff = simScore - currentScore;

  return (
    <aside
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-auto select-none max-h-[calc(100vh-120px)] flex flex-col"
      aria-label="Environmental Simulation Lab"
    >
      <div className="rounded-3xl p-4 w-full border border-white/10 shadow-2xl backdrop-blur-2xl bg-[#090d16]/95 text-white max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-wide block">
                {t('simulator.title', 'Environmental Simulation Lab')}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {t('simulator.subtitle', 'Live 3D Intervention Modeling & Ecosystem Response')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSimulating && (
              <button
                onClick={resetInterventions}
                className="px-2 py-1 rounded-lg text-[10.5px] text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                title={t('simulator.reset', 'Reset simulation')}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('simulator.reset', 'Reset')}</span>
              </button>
            )}
            {externalOnClose && (
              <button
                onClick={externalOnClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={t('simulator.close', 'Close simulator')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Intervention Scenarios */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-mono text-slate-400 uppercase flex-shrink-0">Presets:</span>
          <button
            onClick={() => applyPreset('canopy')}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10.5px] font-medium flex items-center gap-1 transition-all flex-shrink-0"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Net-Zero Canopy</span>
          </button>
          <button
            onClick={() => applyPreset('circular')}
            className="px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-[10.5px] font-medium flex items-center gap-1 transition-all flex-shrink-0"
          >
            <Recycle className="w-3 h-3 text-amber-400" />
            <span>Zero-Waste Grid</span>
          </button>
          <button
            onClick={() => applyPreset('transit')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-[10.5px] font-medium flex items-center gap-1 transition-all flex-shrink-0"
          >
            <Bus className="w-3 h-3 text-cyan-400" />
            <span>Clean Transit</span>
          </button>
        </div>

        {/* 5 Intervention Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          {/* Urban Trees */}
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                <Trees className="w-3.5 h-3.5 text-emerald-400" />
                {t('simulator.urban_trees', 'Urban Afforestation')}
              </span>
              <span className="font-mono text-emerald-400 text-xs font-semibold">
                +{interventions.urbanTrees}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={interventions.urbanTrees}
              onChange={(e) => setIntervention('urbanTrees', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Waste Collection */}
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                <Truck className="w-3.5 h-3.5 text-rose-400" />
                {t('simulator.waste_remediation', 'Waste Fleet Optimization')}
              </span>
              <span className="font-mono text-rose-400 text-xs font-semibold">
                +{interventions.wasteCollection}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={interventions.wasteCollection}
              onChange={(e) => setIntervention('wasteCollection', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
          </div>

          {/* Recycling */}
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                <Recycle className="w-3.5 h-3.5 text-amber-400" />
                {t('simulator.recycling', 'Circular Recycling')}
              </span>
              <span className="font-mono text-amber-400 text-xs font-semibold">
                +{interventions.recycling}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={interventions.recycling}
              onChange={(e) => setIntervention('recycling', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Green Space */}
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                {t('simulator.urban_trees_desc', 'Green Space & Parks')}
              </span>
              <span className="font-mono text-teal-400 text-xs font-semibold">
                +{interventions.greenSpace}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={interventions.greenSpace}
              onChange={(e) => setIntervention('greenSpace', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
          </div>

          {/* Public Transport */}
          <div className="sm:col-span-2 p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium text-[11px]">
                <Bus className="w-3.5 h-3.5 text-cyan-400" />
                {t('simulator.electric_transit', 'Public Transport Modernization')}
              </span>
              <span className="font-mono text-cyan-400 text-xs font-semibold">
                +{interventions.publicTransport}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={interventions.publicTransport}
              onChange={(e) => setIntervention('publicTransport', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Outcome Comparison Hero */}
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-black/60 via-emerald-950/30 to-black/60 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center px-3 py-1 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[9px] font-mono text-slate-400 block uppercase">
                {t('simulator.baseline_aqi', 'CURRENT')}
              </span>
              <span className="text-lg font-mono font-bold text-slate-300">{currentScore}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="text-center px-3 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/40">
              <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold">
                {t('simulator.projected_aqi', 'SIMULATED')}
              </span>
              <span className="text-lg font-mono font-bold text-emerald-300">{simScore}</span>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono">
            <span className="text-slate-400 block text-[9.5px]">
              {t('simulator.net_improvement', 'PROJECTED OUTCOME')}
            </span>
            <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
              <TrendingUp className="w-3 h-3" />
              +{scoreDiff} Environmental Health Score
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
