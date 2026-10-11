import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Activity,
  Heart,
  Wind,
  ShieldAlert,
  X,
  AlertTriangle,
  Sparkles,
  Clock,
  MapPin,
  TrendingUp,
  Brain,
  Layers,
  ChevronRight,
  Flame,
  FileText,
  UserCheck
} from 'lucide-react';

export const BiologicalAgePanel: React.FC = () => {
  const isBioAgePanelOpen = useAppStore(s => s.isBioAgePanelOpen);
  const setBioAgePanelOpen = useAppStore(s => s.setBioAgePanelOpen);
  const selectedBioAgeData = useAppStore(s => s.selectedBioAgeData);
  const isBioAgeLoading = useAppStore(s => s.isBioAgeLoading);
  const userBaselineAge = useAppStore(s => s.userBaselineAge);
  const setUserBaselineAge = useAppStore(s => s.setUserBaselineAge);
  const dailyExposureHours = useAppStore(s => s.dailyExposureHours);
  const setDailyExposureHours = useAppStore(s => s.setDailyExposureHours);
  const calculateBiologicalAge = useAppStore(s => s.calculateBiologicalAge);
  const setCitizenFlaggingOpen = useAppStore(s => s.setCitizenFlaggingOpen);
  const setFlaggingDefaultCoords = useAppStore(s => s.setFlaggingDefaultCoords);

  const [activeTab, setActiveTab] = useState<'organs' | 'diseases' | 'prevention'>('organs');
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  if (!isBioAgePanelOpen) return null;

  const data = selectedBioAgeData;

  const handleReportHere = () => {
    if (data?.coordinates) {
      setFlaggingDefaultCoords(data.coordinates);
    }
    setBioAgePanelOpen(false);
    setCitizenFlaggingOpen(true);
  };

  const handleCopyCertificate = () => {
    if (!data) return;
    const certText = `=== TERRA AEROHEALTH CLINICAL CERTIFICATE ===
Location: ${data.locationName} [Coords: ${data.coordinates[0].toFixed(4)}°E, ${data.coordinates[1].toFixed(4)}°N]
Ambient AQI: ${data.aqi} (PM2.5: ${data.pm25} µg/m³)
Chronological Age: ${data.actualAge} yrs | Biological Age: ${data.biologicalAge} yrs (+${data.ageDifference} yrs)
Life Expectancy Depletion: -${data.lifeExpectancyLostHoursPerMonth} hrs/month (-${data.lifeExpectancyLostDaysPerYear} days/yr)
Organs: Lungs (+${data.organImpacts.lungs.ageIncreaseYears}y), Heart (+${data.organImpacts.heart.ageIncreaseYears}y), Skin (+${data.organImpacts.skin.ageIncreaseYears}y), Brain (+${data.organImpacts.brain.ageIncreaseYears}y)
Diagnosis: ${data.scientificExplanation}
=============================================`;
    navigator.clipboard.writeText(certText);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2500);
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-950/98 border-l border-white/10 backdrop-blur-3xl text-white shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-300"
      aria-label="Biological Age Impact Engine"
    >
      {/* Top Clinical Bar */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-tech text-sm font-bold tracking-wider text-white uppercase">
                AeroHealth™ Biological Impact Report
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                EPIDEMIOLOGY
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              {data?.locationName || 'Monitored Atmosphere Zone'}
              {data?.coordinates && ` [${data.coordinates[0].toFixed(2)}°, ${data.coordinates[1].toFixed(2)}°]`}
            </span>
          </div>
        </div>

        <button
          onClick={() => setBioAgePanelOpen(false)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isBioAgeLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-rose-500/30 border-t-rose-400 animate-spin" />
            <span className="text-xs font-mono text-slate-300 tracking-wider">
              CALCULATING CELLULAR OXIDATIVE PATHOLOGY...
            </span>
            <span className="text-[10px] text-slate-500">
              Correlating PM2.5 mass with Lancet GEMM epidemiological curves
            </span>
          </div>
        ) : data ? (
          <>
            {/* Hero Biological Age vs Actual Age Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-950/40 via-black/60 to-purple-950/30 border border-rose-500/30 relative overflow-hidden shadow-xl">
              {/* Pulsing ECG line effect */}
              <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-75" />

              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  PHYSIOLOGICAL AGE ACCELERATION
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/40 font-bold">
                  AQI: {data.aqi} • PM2.5: {data.pm25} µg/m³
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2">
                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Actual Age</span>
                  <div className="text-xl font-bold font-tech text-white mt-0.5">
                    {data.actualAge} <span className="text-xs font-normal text-slate-400">yrs</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 shadow-inner">
                  <span className="text-[10px] font-mono text-rose-300 uppercase block font-semibold">Bio Age</span>
                  <div className="text-2xl font-bold font-tech text-rose-400 mt-0.5">
                    {data.biologicalAge} <span className="text-xs font-normal text-rose-300">yrs</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] font-mono text-amber-300 uppercase block">Degradation</span>
                  <div className="text-xl font-bold font-tech text-amber-400 mt-0.5">
                    +{data.ageDifference} <span className="text-xs font-normal text-amber-300">yrs</span>
                  </div>
                </div>
              </div>

              {/* Life Expectancy Depletion Callout */}
              <div className="mt-3 p-3 rounded-2xl bg-black/50 border border-rose-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      Life Expectancy Depletion
                    </span>
                    <span className="text-xs font-bold text-rose-300">
                      -{data.lifeExpectancyLostHoursPerMonth} hours lost / month
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Annual Loss</span>
                  <span className="text-xs font-bold font-mono text-amber-400">
                    -{data.lifeExpectancyLostDaysPerYear} days / yr
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive User Parameters Slider Card */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-tech uppercase tracking-wide">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Personal Exposure Profile
                </span>
                <span className="text-[10px] font-mono text-cyan-400">Interactive Model</span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Chronological Age:</span>
                    <span className="font-mono text-cyan-300 font-bold">{userBaselineAge} years</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={75}
                    value={userBaselineAge}
                    onChange={(e) => setUserBaselineAge(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Daily Outdoor Ambient Exposure:</span>
                    <span className="font-mono text-cyan-300 font-bold">{dailyExposureHours} hrs/day</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={dailyExposureHours}
                    onChange={(e) => setDailyExposureHours(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Sub-tabs: Organ Breakdown | Disease Risks | Clinical Prevention */}
            <div className="flex items-center rounded-xl bg-black/50 p-1 border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('organs')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'organs'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Organ Systems
              </button>
              <button
                onClick={() => setActiveTab('diseases')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'diseases'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Disease Hazards
              </button>
              <button
                onClick={() => setActiveTab('prevention')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'prevention'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Clinical Protocols
              </button>
            </div>

            {/* TAB CONTENT: ORGAN SYSTEMS */}
            {activeTab === 'organs' && (
              <div className="space-y-2.5">
                {/* LUNGS */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
                        <Wind className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white font-tech uppercase">Pulmonary & Lungs</span>
                        <span className="text-[10px] text-slate-400 block">Alveolar Macrophage & FEV1</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-rose-400">
                        +{data.organImpacts.lungs.ageIncreaseYears} yrs wear
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 block uppercase">
                        {data.organImpacts.lungs.severity} risk
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, data.organImpacts.lungs.percentageRisk)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {data.organImpacts.lungs.description}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Mechanism: {data.organImpacts.lungs.cellularMechanism}
                  </span>
                </div>

                {/* HEART */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white font-tech uppercase">Cardiovascular & Heart</span>
                        <span className="text-[10px] text-slate-400 block">Coronary Endothelial Tone</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        +{data.organImpacts.heart.ageIncreaseYears} yrs wear
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 block uppercase">
                        {data.organImpacts.heart.severity} risk
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, data.organImpacts.heart.percentageRisk)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {data.organImpacts.heart.description}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Mechanism: {data.organImpacts.heart.cellularMechanism}
                  </span>
                </div>

                {/* SKIN */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white font-tech uppercase">Dermal & Skin</span>
                        <span className="text-[10px] text-slate-400 block">Aryl Hydrocarbon Receptor Matrix</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        +{data.organImpacts.skin.ageIncreaseYears} yrs wear
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 block uppercase">
                        {data.organImpacts.skin.severity} risk
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                      style={{ width: `${Math.min(100, data.organImpacts.skin.percentageRisk)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {data.organImpacts.skin.description}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Mechanism: {data.organImpacts.skin.cellularMechanism}
                  </span>
                </div>

                {/* BRAIN */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white font-tech uppercase">Cerebral & Neuro</span>
                        <span className="text-[10px] text-slate-400 block">Microglial Translocation Wear</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-purple-400">
                        +{data.organImpacts.brain.ageIncreaseYears} yrs wear
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 block uppercase">
                        {data.organImpacts.brain.severity} risk
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(100, data.organImpacts.brain.percentageRisk)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {data.organImpacts.brain.description}
                  </p>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Mechanism: {data.organImpacts.brain.cellularMechanism}
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DISEASE HAZARDS */}
            {activeTab === 'diseases' && (
              <div className="space-y-2.5">
                {data.diseaseRisks.map((d, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-tech">{d.disease}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        d.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        HR: {d.hazardRatio}x
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-rose-400 font-semibold">
                      {d.riskFactor}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {d.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: CLINICAL PREVENTATIVE PROTOCOLS */}
            {activeTab === 'prevention' && (
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2">
                  <span className="text-xs font-bold text-emerald-300 font-tech uppercase block">
                    Shielding & Exposure Reduction Recommendations
                  </span>
                  <ul className="space-y-2 text-[11px] text-slate-300">
                    {data.clinicalRecommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-mono font-bold mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Clinical Toxicology Synthesis Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-black/60 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                  Toxicological Analysis
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{data.scientificExplanation}"
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleReportHere}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Pollution Hazard at this Coordinate</span>
              </button>

              <button
                onClick={handleCopyCertificate}
                className="w-full py-2 rounded-xl text-xs font-medium border border-white/10 hover:border-cyan-400/50 bg-black/40 hover:bg-white/5 text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>{copiedBriefing ? '✓ Copied Clinical Briefing' : 'Save Health Assessment'}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            Select a point on the 3D map or click "Calculate" to generate the AeroHealth Biological Age Report.
          </div>
        )}
      </div>
    </aside>
  );
};
