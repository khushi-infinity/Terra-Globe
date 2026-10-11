import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/useTranslation';
import { LanguageSelector } from './LanguageSelector';
import { DataService } from '../../api/dataService';
import { Location } from '../../types';
import {
  Search,
  Globe2,
  Users,
  HeartPulse,
  AlertTriangle,
  User,
  MoreVertical,
  Play,
  Radar,
  Bot,
  Sparkles,
  Box,
  Compass,
  X,
  Loader2
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const { t } = useTranslation();
  const currentLocation = useAppStore(s => s.currentLocation);
  const cameraMode = useAppStore(s => s.cameraMode);
  const isScanning = useAppStore(s => s.isScanning);
  const isDemoActive = useAppStore(s => s.isDemoActive);
  const mainView = useAppStore(s => s.mainView);
  const setMainView = useAppStore(s => s.setMainView);
  const userSession = useAppStore(s => s.userSession);
  const setCognitoModalOpen = useAppStore(s => s.setCognitoModalOpen);

  const flyToLocation = useAppStore(s => s.flyToLocation);
  const setCameraMode = useAppStore(s => s.setCameraMode);
  const triggerScan = useAppStore(s => s.triggerScan);
  const startDemo = useAppStore(s => s.startDemo);
  const stopDemo = useAppStore(s => s.stopDemo);
  const setAiCopilotOpen = useAppStore(s => s.setAiCopilotOpen);
  const setAiVisionOpen = useAppStore(s => s.setAiVisionOpen);
  const setBioAgePanelOpen = useAppStore(s => s.setBioAgePanelOpen);
  const calculateBiologicalAge = useAppStore(s => s.calculateBiologicalAge);
  const setCitizenFlaggingOpen = useAppStore(s => s.setCitizenFlaggingOpen);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Live World Search through DataService (Mapbox Geocoding + Supported Database)
  useEffect(() => {
    let active = true;
    if (query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await DataService.searchLocations(query);
        if (active) {
          setSearchResults(results);
          setIsSearchOpen(true);
          setIsSearching(false);
        }
      } catch (e) {
        if (active) setIsSearching(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Click Outside to Dismiss Menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPlace = (place: Location) => {
    setQuery('');
    setIsSearchOpen(false);
    setCameraMode('city');
    flyToLocation(place);
  };

  const handleToggle3DView = () => {
    if (cameraMode === 'global') {
      setCameraMode('city');
    } else {
      setCameraMode('global');
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 w-full h-14 z-40 bg-[#080c14]/95 border-b border-white/10 backdrop-blur-2xl px-2.5 sm:px-4 lg:px-6 flex items-center justify-between gap-2 select-none text-white">
      {/* Brand: TERRA */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20">
            T
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950" />
          </div>
          <div className="hidden xs:block">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm font-black tracking-widest text-white uppercase">TERRA</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {t('nav.live_badge', 'LIVE')}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 leading-none tracking-wide">
              {t('nav.tagline', 'Global Environmental Intelligence')}
            </span>
          </div>
        </div>
      </div>

      {/* CONTINUOUS CONTROL PANEL (Exact 6 controls in user order):
          1. Global or 3D view
          2. Searching the city or place
          3. Air quality map
          4. Community feed
          5. Health impact
          6. Report hazard
      */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center max-w-4xl mx-1 sm:mx-2">
        {/* 1. Global or 3D view */}
        <button
          onClick={handleToggle3DView}
          className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 border ${
            cameraMode === 'global'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/25'
              : 'bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 border-white/10'
          }`}
          title={cameraMode === 'global' ? 'Currently viewing 3D Planetary Globe. Click for 3D Surface view.' : 'Switch to 3D Planetary Earth Globe'}
        >
          {cameraMode === 'global' ? (
            <>
              <Globe2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav.globe_3d', '3D Globe')}</span>
            </>
          ) : (
            <>
              <Box className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t('nav.surface_3d', '3D View')}</span>
            </>
          )}
        </button>

        {/* 2. Searching the city or place (For the whole world!) */}
        <div ref={searchRef} className="relative flex-1 min-w-[130px] max-w-xs sm:max-w-sm md:max-w-md">
          <div className="rounded-xl flex items-center px-2.5 sm:px-3 py-1.5 border border-white/10 bg-[#0d121f]/90 shadow-inner focus-within:border-emerald-500/80 focus-within:bg-[#0b0f19] transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  handleSelectPlace(searchResults[0]);
                }
              }}
              placeholder={t('nav.search_placeholder', 'Search city or place...')}
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none truncate"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin flex-shrink-0 ml-1" />
            )}
            {query && !isSearching && (
              <button
                onClick={() => {
                  setQuery('');
                  setSearchResults([]);
                  setIsSearchOpen(false);
                }}
                className="text-slate-500 hover:text-slate-300 ml-1"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* World Search Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full min-w-[260px] max-w-sm rounded-2xl border border-white/10 shadow-2xl py-1 z-50 backdrop-blur-2xl bg-[#090d16]/98 text-white left-0 max-h-64 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/5">
                {t('nav.worldwide_locations', 'Worldwide Locations')}
              </div>
              {searchResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectPlace(loc)}
                  className="w-full px-3 py-2 text-left hover:bg-emerald-500/10 flex items-center justify-between transition-colors border-b border-white/5 last:border-0 group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-300 truncate">
                      {loc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {loc.country} {loc.population ? `• Pop: ${loc.population}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400 group-hover:text-emerald-400">
                    <span className="text-[10px] font-mono">{t('nav.fly', 'Fly')}</span>
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Air quality map */}
        <button
          onClick={() => setMainView('map')}
          className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 border ${
            mainView === 'map'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
          }`}
          title="Air quality global heatmaps and sensor layer"
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t('nav.air_quality_map', 'Air Quality Map')}</span>
        </button>

        {/* 4. Community feed */}
        <button
          onClick={() => setMainView('community')}
          className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all flex-shrink-0 border ${
            mainView === 'community'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/25'
              : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
          }`}
          title="Citizen observations and community feed"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t('nav.community_feed', 'Community Feed')}</span>
        </button>

        {/* 5. Health impact */}
        <button
          onClick={() => {
            calculateBiologicalAge();
            setBioAgePanelOpen(true);
          }}
          className="px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-rose-500/30 text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 hover:border-rose-400 transition-all flex-shrink-0 shadow-sm"
          title="Analyze health impact and biological age"
        >
          <HeartPulse className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="hidden lg:inline">{t('nav.health_impact', 'Health Impact')}</span>
        </button>

        {/* 6. Report hazard */}
        <button
          onClick={() => setCitizenFlaggingOpen(true)}
          className="px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm flex-shrink-0 border border-amber-400"
          title="Report an active pollution hazard with GPS evidence"
        >
          <AlertTriangle className="w-3.5 h-3.5 fill-current" />
          <span className="hidden lg:inline">{t('nav.report_hazard', 'Report Hazard')}</span>
        </button>
      </div>

      {/* Right User & Tools Section */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Global Language Selector Dropdown */}
        <LanguageSelector />

        {/* User Account / Profile */}
        <button
          onClick={() => setCognitoModalOpen(true)}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white border border-white/10 hover:border-white/20 flex items-center justify-center transition-all bg-white/5"
          title={userSession.isAuthenticated ? `${userSession.name} (${userSession.role})` : t('nav.citizen_account', 'Citizen Account')}
        >
          {userSession.isAuthenticated ? (
            <img src={userSession.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-lg object-cover" />
          ) : (
            <User className="w-4 h-4 text-slate-300" />
          )}
        </button>

        {/* More Tools Overflow Menu */}
        <div ref={moreRef} className="relative">
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white border border-white/10 hover:border-white/20 flex items-center justify-center transition-all bg-white/5"
            title={t('nav.more_tools', 'More Environmental Tools')}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute top-full mt-2 right-0 w-52 rounded-2xl border border-white/10 p-1.5 shadow-2xl z-50 backdrop-blur-2xl bg-[#090d16]/98 text-xs text-left space-y-1">
              <button
                onClick={() => {
                  triggerScan();
                  setIsMoreMenuOpen(false);
                }}
                disabled={isScanning}
                className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors"
              >
                <Radar className={`w-4 h-4 text-emerald-400 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? t('nav.scanning', 'Scanning...') : t('nav.atmospheric_scan', 'Atmospheric Scan')}</span>
              </button>

              <button
                onClick={() => {
                  setAiCopilotOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors"
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>{t('nav.ai_copilot', 'AI Urban Copilot')}</span>
              </button>

              <button
                onClick={() => {
                  setAiVisionOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t('nav.future_projections', 'Future Projections')}</span>
              </button>

              <div className="border-t border-white/10 pt-1 mt-1">
                <button
                  onClick={() => {
                    isDemoActive ? stopDemo() : startDemo();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Play className="w-4 h-4 text-emerald-400 fill-current" />
                  <span>{isDemoActive ? t('nav.exit_walkthrough', 'Exit Walkthrough') : t('nav.interactive_demo', 'Interactive Demo')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
