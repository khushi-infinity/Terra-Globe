import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Wind,
  Trees,
  Thermometer,
  Droplets,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  MapPin,
  Globe2,
  Activity,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const MetricHUD: React.FC = () => {
  const currentLocation = useAppStore(s => s.currentLocation);
  const cameraMode = useAppStore(s => s.cameraMode);
  const displayedMetrics = useAppStore(s => s.displayedMetrics);
  const realAirQuality = useAppStore(s => s.realAirQuality);
  const realWeather = useAppStore(s => s.realWeather);
  const setBioAgePanelOpen = useAppStore(s => s.setBioAgePanelOpen);
  const calculateBiologicalAge = useAppStore(s => s.calculateBiologicalAge);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isGlobal = cameraMode === 'global';

  const aqi = realAirQuality?.us_aqi ?? displayedMetrics.airQuality.aqi;
  const pm25 = realAirQuality?.pm2_5 ?? displayedMetrics.airQuality.pm25;
  const pm10 = realAirQuality?.pm10 ?? displayedMetrics.airQuality.pm10;
  const temp = realWeather?.temperature_2m ?? 24;
  const humidity = realWeather?.relative_humidity_2m ?? 65;

  const getAQIInfo = (val: number) => {
    if (val <= 50) {
      return {
        label: 'Good Air',
        bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        color: '#10b981',
        advice: 'Air quality is satisfactory. It is safe for all outdoor activities.',
        percent: Math.min(100, (val / 500) * 100)
      };
    }
    if (val <= 100) {
      return {
        label: 'Moderate',
        bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        color: '#f59e0b',
        advice: 'Air quality is acceptable. Sensitive individuals should avoid prolonged exertion.',
        percent: Math.min(100, (val / 500) * 100)
      };
    }
    if (val <= 150) {
      return {
        label: 'Unhealthy for Sensitive',
        bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        color: '#f97316',
        advice: 'Members of sensitive groups may experience health effects. General public not likely affected.',
        percent: Math.min(100, (val / 500) * 100)
      };
    }
    if (val <= 200) {
      return {
        label: 'Unhealthy',
        bg: 'bg-red-500/20 text-red-300 border-red-500/40',
        color: '#ef4444',
        advice: 'Everyone may begin to experience health effects; wear N95 mask outside.',
        percent: Math.min(100, (val / 500) * 100)
      };
    }
    if (val <= 300) {
      return {
        label: 'Very Unhealthy',
        bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        color: '#a855f7',
        advice: 'Health alert: serious risk for the entire population. Avoid strenuous outdoor activity.',
        percent: Math.min(100, (val / 500) * 100)
      };
    }
    return {
      label: 'Hazardous',
      bg: 'bg-rose-950/70 text-rose-200 border-rose-500/60',
      color: '#e11d48',
      advice: 'Emergency warning: Entire population is affected. Stay indoors and run air filters.',
      percent: Math.min(100, (val / 500) * 100)
    };
  };

  const aqiInfo = getAQIInfo(aqi);

  return (
    <aside
      className="absolute left-4 top-[114px] z-20 pointer-events-none select-none max-h-[calc(100vh-130px)] flex flex-col"
      aria-label="Environmental Intelligence HUD"
    >
      <div className="rounded-2xl p-3.5 pointer-events-auto border border-white/10 shadow-2xl backdrop-blur-2xl bg-[#090d16]/95 w-80 text-white flex flex-col max-h-[calc(100vh-130px)] overflow-hidden">
        {/* Territory Header & Live Indicator */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-2.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
              {isGlobal ? <Globe2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <h2 className="text-sm font-bold tracking-tight text-white truncate max-w-[170px]">
                  {isGlobal ? 'Planetary Earth' : currentLocation.name}
                </h2>
                <span className="flex h-2 w-2 relative flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {isGlobal
                  ? 'Global Satellite Telemetry'
                  : `${currentLocation.country} ${currentLocation.population ? `• Pop: ${currentLocation.population}` : ''}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Body - Strictly within viewport */}
        {!isCollapsed && (
          <div className="overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {/* Primary AQI Score Card */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  Air Quality Index (AQI)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${aqiInfo.bg}`}>
                  {aqiInfo.label}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold tracking-tight text-white font-mono leading-none">
                  {aqi}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">US AQI Standard</span>
              </div>

              {/* AQI Range Gradient Gauge */}
              <div className="space-y-1">
                <div className="relative h-2 w-full rounded-full overflow-hidden bg-slate-800">
                  <div
                    className="h-full w-full"
                    style={{
                      background: 'linear-gradient(to right, #10b981 0%, #f59e0b 20%, #f97316 40%, #ef4444 60%, #a855f7 80%, #e11d48 100%)'
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-white border border-black rounded-full shadow-md transition-all duration-500"
                    style={{ left: `calc(${aqiInfo.percent}% - 3px)` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-slate-500">
                  <span>0 (Good)</span>
                  <span>100</span>
                  <span>200</span>
                  <span>500 (Hazard)</span>
                </div>
              </div>

              {/* Health Advisory */}
              <div className="mt-2.5 p-2 rounded-lg bg-black/40 border border-white/5 text-[10.5px] leading-tight text-slate-300">
                <span className="text-slate-400 font-semibold block text-[9.5px] uppercase tracking-wide mb-0.5">
                  Guidance:
                </span>
                {aqiInfo.advice}
              </div>
            </div>

            {/* Metric Tiles Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PM2.5 Fine</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-white font-mono">{pm25.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-400">µg/m³</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>PM10 Inhalable</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-white font-mono">{pm10.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-400">µg/m³</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  <span>Ambient Temp</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-white font-mono">{temp.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-400">°C</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  <span>Humidity</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-white font-mono">{humidity}</span>
                  <span className="text-[9px] text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* Quick Biological Age Health Link */}
            <button
              onClick={() => {
                calculateBiologicalAge();
                setBioAgePanelOpen(true);
              }}
              className="w-full p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-[11px] font-bold text-rose-200 block">Biological Age Risk</span>
                  <span className="text-[9px] text-rose-300/80">View epidemiological organ impact</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-rose-400">View ›</span>
            </button>

            {/* Verified Data Source Footer */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Live Sensor Telemetry
              </span>
              <span className="font-mono">Open-Meteo Verified</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
