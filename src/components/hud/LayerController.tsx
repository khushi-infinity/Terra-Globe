import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/useTranslation';
import { LayerId } from '../../types';
import { LAYER_REGISTRY } from '../../types/layerRegistry';
import {
  Layers,
  Wind,
  Trash2,
  Sparkles,
  Trees,
  Droplets,
  Flame,
  Volume2,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  SplitSquareVertical,
  Crosshair
} from 'lucide-react';

export const LayerController: React.FC = () => {
  const { t } = useTranslation();
  const layers = useAppStore(s => s.layers);
  const primaryLayer = useAppStore(s => s.primaryLayer);
  const isCompareMode = useAppStore(s => s.isCompareMode);
  const geoDebugMode = useAppStore(s => s.geoDebugMode);
  const toggleLayer = useAppStore(s => s.toggleLayer);
  const setPrimaryLayer = useAppStore(s => s.setPrimaryLayer);
  const toggleCompareMode = useAppStore(s => s.toggleCompareMode);
  const toggleGeoDebugMode = useAppStore(s => s.toggleGeoDebugMode);
  const setLayerOpacity = useAppStore(s => s.setLayerOpacity);

  const [activeLayerId, setActiveLayerId] = useState<LayerId | null>(null);

  const getLayerIcon = (id: LayerId) => {
    switch (id) {
      case 'aqi': return <Wind className="w-4 h-4" />;
      case 'waste': return <Trash2 className="w-4 h-4" />;
      case 'cleanliness': return <Sparkles className="w-4 h-4" />;
      case 'green': return <Trees className="w-4 h-4" />;
      case 'water': return <Droplets className="w-4 h-4" />;
      case 'heat': return <Flame className="w-4 h-4" />;
      case 'noise': return <Volume2 className="w-4 h-4" />;
    }
  };

  const getLayerLegend = (id: LayerId) => {
    switch (id) {
      case 'aqi':
        return (
          <div className="space-y-1 mt-2 pt-2 border-t border-white/10 text-[10px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">US AQI Categories</div>
            <div className="grid grid-cols-2 gap-1 text-[9.5px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" /> 0–50 Good
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-[#eab308]" /> 51–100 Moderate
              </span>
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2 h-2 rounded-full bg-[#f97316]" /> 101–150 Sensitive
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> 151–200 Unhealthy
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-[#a855f7]" /> 201–300 V.Unhealthy
              </span>
              <span className="flex items-center gap-1.5 text-rose-300">
                <span className="w-2 h-2 rounded-full bg-[#881337]" /> 300+ Hazardous
              </span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1 italic">
              Atmospheric field + ground indicators locked to fixed geographic lattice.
            </div>
          </div>
        );

      case 'heat':
        return (
          <div className="space-y-1 mt-2 pt-2 border-t border-white/10 text-[10px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">Regional Temperature</div>
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 py-1">
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#06b6d4]" /> Cooler (&lt;15°C)
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Average (~24°C)
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> Hotter (&gt;32°C)
              </span>
            </div>
            <div className="text-[9px] text-slate-400 italic">
              Open-Meteo 2m air temperature field across visible viewport.
            </div>
          </div>
        );

      case 'noise':
        return (
          <div className="space-y-1 mt-2 pt-2 border-t border-white/10 text-[10px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">Modeled Transit Exposure</div>
            <div className="grid grid-cols-2 gap-1 text-[9.5px] font-mono">
              <span className="text-rose-400">● 72–78 dB Arterial Highway</span>
              <span className="text-orange-400">● 62–68 dB Rail & Commercial</span>
            </div>
            <div className="text-[9px] text-amber-300/80 mt-1 italic">
              Acoustic exposure corridors locked to real motorway and railway vector geometries.
            </div>
          </div>
        );

      case 'water':
        return (
          <div className="space-y-1 mt-2 pt-2 border-t border-white/10 text-[10px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">Hydrography & Basin Health</div>
            <div className="text-[10px] text-cyan-300">
              ● Mapped Waterways: Real Rivers, Lakes, Canals, Reservoirs
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-[9px] text-slate-400 mt-1">
              Water Quality: No verified real-time biochemical sensor connected for this area.
            </div>
          </div>
        );

      case 'green':
        return (
          <div className="space-y-1 mt-2 pt-2 border-t border-white/10 text-[10px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">Vegetation & Canopy</div>
            <div className="text-[10px] text-emerald-300">
              ● Mapped Parks, Botanic Gardens, Nature Reserves, Woodlands
            </div>
            <div className="text-[9px] text-slate-400 mt-1 italic">
              Real vector park polygons emphasized directly on the base map.
            </div>
          </div>
        );

      case 'waste':
        return (
          <div className="space-y-1 mt-2 pt-2 border-t border-white/10 text-[10px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">Verified & Community Reports</div>
            <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
              <span className="text-rose-400">● High Risk</span>
              <span className="text-orange-400">● Medium</span>
              <span className="text-yellow-400">● Low</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1 italic">
              Citizen ground observations pinned to immutable GPS coordinates.
            </div>
          </div>
        );

      case 'cleanliness':
        return (
          <div className="space-y-1 mt-2 pt-2 border-t border-white/10 text-[10px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">Cleanliness Index</div>
            <div className="text-[9px] text-slate-400 italic">
              Aggregated community sanitation reports. No arbitrary global constant.
            </div>
          </div>
        );
    }
  };

  const activeLayer = layers.find(l => l.id === activeLayerId);
  const primaryMeta = LAYER_REGISTRY[primaryLayer];

  return (
    <div className="absolute right-4 top-[66px] z-20 flex items-start gap-2.5 pointer-events-none select-none max-h-[calc(100vh-80px)]">
      {/* Contextual Opacity & Legend Panel */}
      {activeLayer && (
        <div className="rounded-2xl p-3 pointer-events-auto border border-white/10 shadow-2xl backdrop-blur-2xl bg-[#090d16]/95 w-64 animate-in fade-in slide-in-from-right-2 duration-200 text-white max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeLayer.color }} />
              {t(`layers.${activeLayer.id}`, activeLayer.name)}
            </span>
            <button
              onClick={() => setActiveLayerId(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="text-[10px] text-slate-300 mb-2">
            {t(`layers.${activeLayer.id}_desc`, activeLayer.shortDesc)}
          </div>

          {activeLayer.isActive && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-slate-400">{t('layers.opacity', 'Opacity')}:</span>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={activeLayer.opacity}
                onChange={(e) => setLayerOpacity(activeLayer.id, parseFloat(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-white/20 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-emerald-300 w-8 text-right">
                {Math.round(activeLayer.opacity * 100)}%
              </span>
            </div>
          )}

          {/* Layer-Specific Legend */}
          {getLayerLegend(activeLayer.id)}
        </div>
      )}

      {/* Layer Toggle Stack */}
      <div className="rounded-2xl p-2.5 pointer-events-auto border border-white/10 shadow-2xl backdrop-blur-2xl bg-[#090d16]/95 flex flex-col gap-1 w-56 text-white max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin">
        {/* Header with Active Primary Layer Badge */}
        <div className="px-2 py-1 flex items-center justify-between border-b border-white/10 mb-1">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wide text-xs">{t('layers.title', 'Map Layers')}</span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium font-mono">
            {layers.filter(l => l.isActive).length} ON
          </span>
        </div>

        {layers.map(layer => {
          const isSelected = activeLayerId === layer.id;
          return (
            <div
              key={layer.id}
              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl transition-all border ${
                layer.isActive
                  ? 'bg-slate-800/80 border-slate-700/80 text-white'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              } ${isSelected ? 'ring-1 ring-emerald-400' : ''}`}
            >
              <div
                className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                onClick={() => setActiveLayerId(isSelected ? null : layer.id)}
                title="Click to view legend & adjust opacity"
              >
                <span className="p-1 rounded-lg bg-slate-800/60" style={{ color: layer.isActive ? layer.color : '#64748b' }}>
                  {getLayerIcon(layer.id)}
                </span>
                <span className="text-xs font-medium tracking-tight truncate">
                  {t(`layers.${layer.id}`, layer.name.split(' (')[0])}
                </span>
              </div>

              {/* Modern Sliding Toggle Switch Button */}
              <button
                type="button"
                role="switch"
                aria-checked={layer.isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayer(layer.id);
                }}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  layer.isActive ? 'bg-emerald-500 shadow-sm shadow-emerald-500/40' : 'bg-slate-700/80'
                }`}
                title={`Toggle ${layer.name} ${layer.isActive ? 'OFF' : 'ON'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    layer.isActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}

        {/* Precision Controls: Compare Mode & Geo Debug */}
        <div className="mt-1 pt-1.5 border-t border-slate-800 space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
              <SplitSquareVertical className="w-3 h-3 text-cyan-400" />
              <span>Compare Mode</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isCompareMode}
              onClick={() => toggleCompareMode()}
              className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isCompareMode ? 'bg-cyan-500' : 'bg-slate-700/80'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  isCompareMode ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between px-2 py-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
              <Crosshair className="w-3 h-3 text-emerald-400" />
              <span>Geo Grid</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={geoDebugMode}
              onClick={() => toggleGeoDebugMode()}
              className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                geoDebugMode ? 'bg-emerald-500' : 'bg-slate-700/80'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  geoDebugMode ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
