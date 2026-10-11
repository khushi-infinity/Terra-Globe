import React, { useState } from 'react';
import { MapboxGeographicView } from './components/MapboxGeographicView';
import { TopNav } from './components/hud/TopNav';
import { MetricHUD } from './components/hud/MetricHUD';
import { LayerController } from './components/hud/LayerController';
import { WhatIfPanel } from './components/hud/WhatIfPanel';
import { ActivityFeed } from './components/hud/ActivityFeed';
import { HotspotDrawer } from './components/hud/HotspotDrawer';
import { CommunityModal } from './components/hud/CommunityModal';
import { DataSourceModal } from './components/hud/DataSourceModal';
import { EnvironmentalScanBanner } from './components/hud/EnvironmentalScanBanner';
import { DemoController } from './components/hud/DemoController';
import { AiCopilotModal } from './components/hud/AiCopilotModal';
import { AiVisionGeneratorModal } from './components/hud/AiVisionGeneratorModal';
import { BiologicalAgePanel } from './components/hud/BiologicalAgePanel';
import { CitizenFlaggingModal } from './components/hud/CitizenFlaggingModal';
import { CommunitySocialFeed } from './components/community/CommunitySocialFeed';
import { CognitoAuthModal } from './components/auth/CognitoAuthModal';
import { useAppStore } from './store/useAppStore';
import { useTranslation } from './i18n/useTranslation';
import {
  Layers,
  Sliders,
  BarChart3
} from 'lucide-react';

export default function App() {
  const { t } = useTranslation();
  const isDemoActive = useAppStore(s => s.isDemoActive);
  const mainView = useAppStore(s => s.mainView);

  const [showMetrics, setShowMetrics] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [showWhatIf, setShowWhatIf] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#05070c] select-none font-sans">
      {/* Real Geographic Mapbox GL 3D Earth Globe with Synchronized Three.js Layer */}
      <MapboxGeographicView />

      {/* Continuous Top Navigation Bar with the 6 Control Panel Items */}
      <TopNav />

      {/* Control Buttons Directly Below Continuous Top Bar: Air Quality, Map Layers, Simulator */}
      {mainView === 'map' && (
        <div className="absolute left-4 top-[64px] z-30 flex items-center gap-2 pointer-events-auto">
          {/* Button 1: Air Quality */}
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 border shadow-xl backdrop-blur-2xl transition-all ${
              showMetrics
                ? 'border-emerald-500/40 bg-[#090d16]/95 text-white shadow-emerald-950/20'
                : 'border-white/10 bg-[#090d16]/80 text-slate-400 hover:text-white'
            }`}
            title={t('toggles.hint_air_quality', 'Toggle Air Quality Information Card')}
          >
            <BarChart3 className={`w-3.5 h-3.5 ${showMetrics ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>{t('toggles.air_quality', 'Air Quality')}</span>
            {/* Tactile Toggle Switch */}
            <span
              className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors duration-200 ease-in-out ${
                showMetrics ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  showMetrics ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </span>
          </button>

          {/* Button 2: Map Layers */}
          <button
            onClick={() => setShowLayers(!showLayers)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 border shadow-xl backdrop-blur-2xl transition-all ${
              showLayers
                ? 'border-emerald-500/40 bg-[#090d16]/95 text-white shadow-emerald-950/20'
                : 'border-white/10 bg-[#090d16]/80 text-slate-400 hover:text-white'
            }`}
            title={t('toggles.hint_map_layers', 'Toggle Map Data Layers Panel')}
          >
            <Layers className={`w-3.5 h-3.5 ${showLayers ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>{t('toggles.map_layers', 'Map Layers')}</span>
            {/* Tactile Toggle Switch */}
            <span
              className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors duration-200 ease-in-out ${
                showLayers ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  showLayers ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </span>
          </button>

          {/* Button 3: Simulator */}
          <button
            onClick={() => setShowWhatIf(!showWhatIf)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 border shadow-xl backdrop-blur-2xl transition-all ${
              showWhatIf
                ? 'border-emerald-500/40 bg-[#090d16]/95 text-white shadow-emerald-950/20'
                : 'border-white/10 bg-[#090d16]/80 text-slate-400 hover:text-white'
            }`}
            title={t('toggles.hint_simulator', 'Toggle Clean Air Simulator')}
          >
            <Sliders className={`w-3.5 h-3.5 ${showWhatIf ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>{t('toggles.simulator', 'Simulator')}</span>
            {/* Tactile Toggle Switch */}
            <span
              className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors duration-200 ease-in-out ${
                showWhatIf ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  showWhatIf ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </span>
          </button>
        </div>
      )}

      {/* Spatial HUDs (Visible on Map Intelligence View) */}
      {mainView === 'map' && (
        <>
          {/* Environmental Intelligence HUD (Left) */}
          {showMetrics && <MetricHUD />}

          {/* 7-Layer Environmental Toggle & Opacity Panel (Right) */}
          {showLayers && <LayerController />}

          {/* WHAT-IF Environmental Simulation Lab */}
          {showWhatIf && (
            <WhatIfPanel isOpen={showWhatIf} onClose={() => setShowWhatIf(false)} />
          )}

          {/* Real-time Activity Stream (Bottom Center) */}
          <ActivityFeed />

          {/* Hotspot Inspection Drawer (when clicking 3D waste beacon) */}
          <HotspotDrawer />

          {/* Sequential LiDAR Environmental Scan Banner */}
          <EnvironmentalScanBanner />
        </>
      )}

      {/* Community Action Feed (Visible on Community View) */}
      {mainView === 'community' && <CommunitySocialFeed />}

      {/* --- CORE CONSUMER ACTION MODALS & DRAWERS --- */}

      {/* Biological Age & Disease Risk Clinical Dashboard */}
      <BiologicalAgePanel />

      {/* Citizen Ground Truth Severe Pollution Reporting Flow */}
      <CitizenFlaggingModal />

      {/* Citizen Authentication & Profile Modal */}
      <CognitoAuthModal />

      {/* Legacy Community Reports & Transparency Modals */}
      <CommunityModal />
      <DataSourceModal />

      {/* Interactive Walkthrough Demo Controller */}
      {isDemoActive && <DemoController />}

      {/* AI Intelligence Copilot & Vision Modals */}
      <AiCopilotModal />
      <AiVisionGeneratorModal />

      {/* Discreet Platform Tag */}
      <div className="absolute right-5 bottom-2 z-10 pointer-events-none text-right">
        <span className="text-[10px] text-slate-500 tracking-wider block font-mono">
          TERRA • Global Environmental Intelligence Platform
        </span>
      </div>
    </main>
  );
}
