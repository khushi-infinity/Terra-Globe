import { create } from 'zustand';
import {
  Location,
  CameraMode,
  EnvironmentalMetrics,
  EnvironmentalLayer,
  WasteHotspot,
  CommunityReport,
  CommunityAction,
  WhatIfInterventions,
  LayerId,
  BioAgeResult,
  TerraReport,
  TerraPost,
  TerraPostCategory,
  CognitoUserSession
} from '../types';
import {
  SUPPORTED_LOCATIONS,
  COMMUNITY_ACTIONS,
  calculateSimulation
} from '../api/mockData';
import { DataService } from '../api/dataService';
import {
  getCityRealEnvironmentalPackage,
  DataMetricStatus
} from '../services/environmentalDataService';
import { RealAirQuality } from '../services/airQualityService';
import { RealWeather } from '../services/weatherService';
import { SupportedLanguage } from '../i18n/translations';
import { computeBiologicalAge } from '../services/bioAgeService';

const getInitialLanguage = (): SupportedLanguage => {
  try {
    const saved = localStorage.getItem('terra_language') as SupportedLanguage;
    if (saved && ['en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'bn', 'pt'].includes(saved)) {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = saved;
        if (saved === 'ar') document.documentElement.dir = 'rtl';
      }
      return saved;
    }
  } catch (e) {
    // fallback
  }
  return 'en';
};

export const INITIAL_LAYERS: EnvironmentalLayer[] = [
  { id: 'aqi', name: 'Air Quality (AQI)', shortDesc: 'Real Open-Meteo / CAMS PM2.5 & Ozone', isActive: true, opacity: 0.85, color: '#f59e0b', unit: 'AQI' },
  { id: 'waste', name: 'Waste Hotspots', shortDesc: 'Georeferenced GPS Observation Pins', isActive: false, opacity: 0.9, color: '#ef4444', unit: 'Index' },
  { id: 'cleanliness', name: 'Cleanliness Index', shortDesc: 'Community Sanitation Score', isActive: false, opacity: 0.75, color: '#06b6d4', unit: 'Score' },
  { id: 'green', name: 'Green Canopy', shortDesc: 'Real Mapbox / OSM Park Polygons', isActive: true, opacity: 0.95, color: '#10b981', unit: '%' },
  { id: 'water', name: 'Water Health', shortDesc: 'Real Lakes & River Hydrography', isActive: true, opacity: 0.8, color: '#3b82f6', unit: 'WQI' },
  { id: 'heat', name: 'Thermal Heat Island', shortDesc: 'Open-Meteo Regional Temperature Heatmap', isActive: false, opacity: 0.85, color: '#f97316', unit: '°C' },
  { id: 'noise', name: 'Acoustic / Noise', shortDesc: 'Arterial Transit Corridors', isActive: false, opacity: 0.7, color: '#8b5cf6', unit: 'dB' },
];

export const INITIAL_INTERVENTIONS: WhatIfInterventions = {
  urbanTrees: 0,
  wasteCollection: 0,
  recycling: 0,
  greenSpace: 0,
  publicTransport: 0
};

const INITIAL_BASELINE: EnvironmentalMetrics = {
  airQuality: {
    aqi: 65,
    pm25: 22.0,
    pm10: 38.0,
    dominantPollutant: 'PM2.5',
    no2: 24.0,
    o3: 32.0,
    co: 0.6,
    category: 'Moderate'
  },
  greenCoverPercentage: 32.5,
  wasteIndex: 45,
  waterQualityIndex: 58,
  heatIslandAnomaly: 1.8,
  noiseLevelDb: 66.0,
  cleanlinessScore: 68,
  terraIndex: 68
};

const DEFAULT_COGNITO_USER: CognitoUserSession = {
  isAuthenticated: false,
  userSub: 'guest_unauth',
  email: 'citizen@terra.earth',
  name: 'Citizen Sentinel',
  role: 'Citizen Reporter',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
};

interface AppState {
  // Language & Internationalization
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;

  // Navigation & Location
  currentLocation: Location;
  cameraMode: CameraMode;
  isFlying: boolean;
  isScanning: boolean;
  searchQuery: string;

  // The TERRA Toggle View ("Map Intelligence" vs "Community Action")
  mainView: 'map' | 'community';
  setMainView: (view: 'map' | 'community') => void;

  // Real Environmental Data
  layers: EnvironmentalLayer[];
  baselineMetrics: EnvironmentalMetrics;
  displayedMetrics: EnvironmentalMetrics;
  realAirQuality: RealAirQuality | null;
  realWeather: RealWeather | null;
  dataStatuses: DataMetricStatus[];
  isDataLoading: boolean;
  dataError: string | null;

  // Waste & Community
  wasteHotspots: WasteHotspot[];
  selectedHotspot: WasteHotspot | null;
  communityReports: CommunityReport[];
  selectedReport: CommunityReport | null;
  communityActions: CommunityAction[];
  isReportModalOpen: boolean;
  isActivityFeedOpen: boolean;
  isDataSourceModalOpen: boolean;

  // --- Biological Age Engine ---
  isBioAgePanelOpen: boolean;
  selectedBioAgeData: BioAgeResult | null;
  isBioAgeLoading: boolean;
  userBaselineAge: number;
  dailyExposureHours: number;
  setBioAgePanelOpen: (open: boolean) => void;
  setUserBaselineAge: (age: number) => void;
  setDailyExposureHours: (hours: number) => void;
  calculateBiologicalAge: (customCoords?: [number, number], customAQI?: number, customCity?: string) => Promise<void>;

  // --- AWS Citizen Ground Truth Flagging ---
  isCitizenFlaggingOpen: boolean;
  setCitizenFlaggingOpen: (open: boolean) => void;
  flaggingDefaultCoords: [number, number] | null;
  setFlaggingDefaultCoords: (coords: [number, number] | null) => void;
  terraReports: TerraReport[];
  fetchTerraReports: (bounds?: { north: number; south: number; east: number; west: number }) => Promise<void>;
  submitTerraReport: (report: Omit<TerraReport, 'id' | 'timestamp' | 'status' | 'upvotes'>) => Promise<TerraReport>;
  selectedTerraReport: TerraReport | null;
  setSelectedTerraReport: (report: TerraReport | null) => void;

  // --- Localized Community Social Feed ---
  terraPosts: TerraPost[];
  feedCategory: TerraPostCategory;
  feedCityFilter: string;
  feedAreaFilter: string;
  isCreatePostOpen: boolean;
  userSession: CognitoUserSession;
  isCognitoModalOpen: boolean;
  cognitoTab: 'login' | 'signup';
  perspectiveMode: '2d' | '3d';
  setFeedCategory: (cat: TerraPostCategory) => void;
  setFeedCityFilter: (city: string) => void;
  setFeedAreaFilter: (area: string) => void;
  setPerspectiveMode: (mode: '2d' | '3d') => void;
  setCreatePostOpen: (open: boolean) => void;
  setCognitoModalOpen: (open: boolean, tab?: 'login' | 'signup') => void;
  fetchTerraPosts: () => Promise<void>;
  submitTerraPost: (postData: Partial<TerraPost>) => Promise<TerraPost>;
  upvotePost: (id: string) => Promise<void>;
  rsvpPost: (id: string) => Promise<void>;
  donatePost: (id: string, amount: number) => Promise<void>;
  loginCognito: (email: string, name?: string, role?: CognitoUserSession['role']) => void;
  logoutCognito: () => void;

  // --- AWS Architecture Inspector Modal ---
  isAwsInspectorOpen: boolean;
  setAwsInspectorOpen: (open: boolean) => void;

  // Simulation ("WHAT IF")
  isSimulating: boolean;
  interventions: WhatIfInterventions;
  simulatedMetrics: EnvironmentalMetrics;
  splitViewActive: boolean;

  // Demo Mode
  isDemoActive: boolean;
  demoStepIndex: number;
  demoStepName: string;
  demoStepDesc: string;

  // Modals
  isAiCopilotOpen: boolean;
  isAiVisionOpen: boolean;
  activeTab: 'hud' | 'whatif' | 'community' | 'layers';
  show3DDepth: boolean;

  // Layer Architecture
  primaryLayer: LayerId;
  isCompareMode: boolean;
  geoDebugMode: boolean;

  // Actions
  setLocation: (loc: Location) => Promise<void>;
  flyToLocation: (loc: Location) => void;
  setCameraMode: (mode: CameraMode) => void;
  triggerScan: () => void;
  toggleLayer: (id: LayerId) => void;
  setPrimaryLayer: (id: LayerId) => void;
  toggleCompareMode: () => void;
  toggleGeoDebugMode: () => void;
  setLayerOpacity: (id: LayerId, opacity: number) => void;
  selectHotspot: (hotspot: WasteHotspot | null) => void;
  selectReport: (report: CommunityReport | null) => void;
  setIntervention: (key: keyof WhatIfInterventions, value: number) => void;
  resetInterventions: () => void;
  setReportModalOpen: (open: boolean) => void;
  setActivityFeedOpen: (open: boolean) => void;
  setDataSourceModalOpen: (open: boolean) => void;
  setAiCopilotOpen: (open: boolean) => void;
  setAiVisionOpen: (open: boolean) => void;
  startDemo: () => void;
  stopDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  addCommunityReport: (report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes'>) => Promise<void>;
  submitNewReport: (report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes'>) => Promise<void>;
  upvoteReport: (reportId: string) => Promise<void>;
  refreshRealData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  language: getInitialLanguage(),
  setLanguage: (lang: SupportedLanguage) => {
    try {
      localStorage.setItem('terra_language', lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
        if (lang === 'ar') {
          document.documentElement.dir = 'rtl';
        } else {
          document.documentElement.dir = 'ltr';
        }
      }
    } catch (e) {
      // ignore
    }
    set({ language: lang });
  },

  currentLocation: SUPPORTED_LOCATIONS[0],
  cameraMode: 'global',
  isFlying: false,
  isScanning: false,
  searchQuery: '',

  mainView: 'map',
  setMainView: (view: 'map' | 'community') => {
    set({ mainView: view });
    if (view === 'community') {
      get().fetchTerraPosts();
    }
  },

  layers: INITIAL_LAYERS,
  baselineMetrics: INITIAL_BASELINE,
  displayedMetrics: INITIAL_BASELINE,
  realAirQuality: null,
  realWeather: null,
  dataStatuses: [],
  isDataLoading: true,
  dataError: null,

  // Waste & Community
  wasteHotspots: [],
  selectedHotspot: null,
  communityReports: [],
  selectedReport: null,
  communityActions: COMMUNITY_ACTIONS,
  isReportModalOpen: false,
  isActivityFeedOpen: false,
  isDataSourceModalOpen: false,

  // Biological Age Engine
  isBioAgePanelOpen: false,
  selectedBioAgeData: computeBiologicalAge({
    locationName: 'Delhi NCR',
    aqi: 185,
    pm25: 112,
    pm10: 198,
    userAge: 28,
    dailyHoursOutdoor: 4,
    coordinates: [77.2090, 28.6139]
  }),
  isBioAgeLoading: false,
  userBaselineAge: 28,
  dailyExposureHours: 4,
  setBioAgePanelOpen: (open: boolean) => {
    set({ isBioAgePanelOpen: open });
    if (open && !get().selectedBioAgeData) {
      get().calculateBiologicalAge();
    }
  },
  setUserBaselineAge: (age: number) => {
    set({ userBaselineAge: age });
    get().calculateBiologicalAge();
  },
  setDailyExposureHours: (hours: number) => {
    set({ dailyExposureHours: hours });
    get().calculateBiologicalAge();
  },

  calculateBiologicalAge: async (customCoords, customAQI, customCity) => {
    const state = get();
    const coords = customCoords || state.currentLocation.center;
    const aqi = customAQI ?? (state.realAirQuality?.us_aqi ?? state.displayedMetrics.airQuality.aqi);
    const pm25 = state.realAirQuality?.pm2_5 ?? state.displayedMetrics.airQuality.pm25;
    const pm10 = state.realAirQuality?.pm10 ?? state.displayedMetrics.airQuality.pm10;
    const cityName = customCity || state.currentLocation.name;

    // 1. Immediately calculate deterministic Lancet GEMM model client-side (works 100% in live links, S3, offline)
    const instantLocalResult = computeBiologicalAge({
      aqi,
      pm25,
      pm10,
      userAge: state.userBaselineAge,
      dailyHoursOutdoor: state.dailyExposureHours,
      locationName: cityName,
      coordinates: coords
    });

    set({
      selectedBioAgeData: instantLocalResult,
      isBioAgePanelOpen: true,
      isBioAgeLoading: false
    });

    // 2. Asynchronously try to fetch Gemini AI enriched analysis (if backend server is available)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/gemini/biological-age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          aqi,
          pm25,
          pm10,
          userAge: state.userBaselineAge,
          dailyHoursOutdoor: state.dailyExposureHours,
          locationName: cityName,
          coordinates: coords
        })
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const enrichedData: BioAgeResult = await res.json();
        set({ selectedBioAgeData: enrichedData });
      }
    } catch {
      // Gracefully silent: the instant local GEMM calculation is already active and accurate
    }
  },

  // Citizen Flagging
  isCitizenFlaggingOpen: false,
  setCitizenFlaggingOpen: (open: boolean) => set({ isCitizenFlaggingOpen: open }),
  flaggingDefaultCoords: null,
  setFlaggingDefaultCoords: (coords) => set({ flaggingDefaultCoords: coords }),
  terraReports: [],
  selectedTerraReport: null,
  setSelectedTerraReport: (report) => set({ selectedTerraReport: report }),

  fetchTerraReports: async (bounds) => {
    try {
      let url = '/api/aws/dynamodb/reports';
      if (bounds) {
        url += `?north=${bounds.north}&south=${bounds.south}&east=${bounds.east}&west=${bounds.west}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        set({ terraReports: json.reports || [] });
      }
    } catch (e) {
      console.warn('Failed to fetch DynamoDB reports:', e);
    }
  },

  submitTerraReport: async (reportData) => {
    const res = await fetch('/api/aws/dynamodb/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!res.ok) throw new Error('Failed to register pollution report');
    const json = await res.json();
    const created: TerraReport = json.report;
    set(s => ({
      terraReports: [created, ...s.terraReports],
      isCitizenFlaggingOpen: false
    }));
    // Refresh posts as well
    get().fetchTerraPosts();
    return created;
  },

  // Localized Community Social Feed & Cognito
  terraPosts: [],
  feedCategory: 'all',
  feedCityFilter: 'Delhi',
  feedAreaFilter: 'all',
  isCreatePostOpen: false,
  userSession: DEFAULT_COGNITO_USER,
  isCognitoModalOpen: false,
  cognitoTab: 'login',
  perspectiveMode: '3d',

  setFeedCategory: (cat) => {
    set({ feedCategory: cat });
    get().fetchTerraPosts();
  },
  setFeedCityFilter: (city) => {
    set({ feedCityFilter: city, feedAreaFilter: 'all' });
    get().fetchTerraPosts();
  },
  setFeedAreaFilter: (area) => {
    set({ feedAreaFilter: area });
    get().fetchTerraPosts();
  },
  setPerspectiveMode: (mode) => set({ perspectiveMode: mode }),
  setCreatePostOpen: (open) => set({ isCreatePostOpen: open }),
  setCognitoModalOpen: (open, tab = 'login') => set({ isCognitoModalOpen: open, cognitoTab: tab }),

  fetchTerraPosts: async () => {
    try {
      const city = get().feedCityFilter;
      const cat = get().feedCategory;
      const area = get().feedAreaFilter;
      let url = `/api/aws/dynamodb/posts?cityName=${encodeURIComponent(city)}`;
      if (cat !== 'all') url += `&category=${encodeURIComponent(cat)}`;
      if (area && area !== 'all') url += `&areaName=${encodeURIComponent(area)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        set({ terraPosts: json.posts || [] });
      }
    } catch (e) {
      console.warn('Failed to fetch posts:', e);
    }
  },

  submitTerraPost: async (postData) => {
    const user = get().userSession;
    const currentCity = get().currentLocation.name;
    const res = await fetch('/api/aws/dynamodb/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cityName: postData.cityName || currentCity,
        postType: postData.postType || 'discuss',
        authorName: user.name,
        authorEmail: user.email,
        authorRole: user.role,
        authorAvatar: user.avatarUrl,
        ...postData
      })
    });
    if (!res.ok) throw new Error('Failed to publish post');
    const json = await res.json();
    const created: TerraPost = json.post;
    set(s => ({
      terraPosts: [created, ...s.terraPosts],
      isCreatePostOpen: false
    }));
    return created;
  },

  upvotePost: async (id) => {
    try {
      const res = await fetch(`/api/aws/dynamodb/posts/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote' })
      });
      if (res.ok) {
        const json = await res.json();
        set(s => ({
          terraPosts: s.terraPosts.map(p => (p.id === id ? { ...p, ...json.post } : p))
        }));
      }
    } catch (e) {
      console.warn('Failed to upvote post:', e);
    }
  },

  rsvpPost: async (id) => {
    try {
      const res = await fetch(`/api/aws/dynamodb/posts/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rsvp' })
      });
      if (res.ok) {
        const json = await res.json();
        set(s => ({
          terraPosts: s.terraPosts.map(p => (p.id === id ? { ...p, ...json.post } : p))
        }));
      }
    } catch (e) {
      console.warn('Failed to rsvp post:', e);
    }
  },

  donatePost: async (id, amount) => {
    try {
      const res = await fetch(`/api/aws/dynamodb/posts/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'donate', amount })
      });
      if (res.ok) {
        const json = await res.json();
        set(s => ({
          terraPosts: s.terraPosts.map(p => (p.id === id ? { ...p, ...json.post } : p))
        }));
      }
    } catch (e) {
      console.warn('Failed to donate to post:', e);
    }
  },

  loginCognito: (email, name, role = 'Citizen Reporter') => {
    const user: CognitoUserSession = {
      isAuthenticated: true,
      userSub: `cognito_sub_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      role,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name || email}`,
      accessToken: `aws_cognito_jwt_${Date.now()}_token`
    };
    set({ userSession: user, isCognitoModalOpen: false });
  },

  logoutCognito: () => {
    set({ userSession: DEFAULT_COGNITO_USER });
  },

  // AWS Architecture Inspector
  isAwsInspectorOpen: false,
  setAwsInspectorOpen: (open) => set({ isAwsInspectorOpen: open }),

  // Simulation ("WHAT IF")
  isSimulating: false,
  interventions: INITIAL_INTERVENTIONS,
  simulatedMetrics: INITIAL_BASELINE,
  splitViewActive: false,

  // Demo Mode
  isDemoActive: false,
  demoStepIndex: 0,
  demoStepName: 'Welcome to TERRA',
  demoStepDesc: 'Explore real atmospheric twin telemetry.',

  // Modals
  isAiCopilotOpen: false,
  isAiVisionOpen: false,
  activeTab: 'hud',
  show3DDepth: true,

  // Layer Architecture
  primaryLayer: 'aqi',
  isCompareMode: false,
  geoDebugMode: false,

  // Actions
  setLocation: async (loc: Location) => {
    set({
      currentLocation: loc,
      isDataLoading: true,
      dataError: null,
      feedCityFilter: loc.name,
      feedAreaFilter: 'all'
    });
    get().fetchTerraPosts();

    try {
      const envPackage = await getCityRealEnvironmentalPackage(loc);
      set({
        baselineMetrics: envPackage.metrics,
        displayedMetrics: envPackage.metrics,
        realAirQuality: envPackage.realAirQuality,
        realWeather: envPackage.realWeather,
        dataStatuses: envPackage.statuses,
        isDataLoading: false
      });
    } catch {
      set({ isDataLoading: false, dataError: 'Failed to load real data.' });
    }
  },

  flyToLocation: (loc: Location) => {
    set({ isFlying: true });
    get().setLocation(loc);
    setTimeout(() => {
      set({ isFlying: false });
    }, 1800);
  },

  setCameraMode: (mode: CameraMode) => set({ cameraMode: mode }),

  triggerScan: () => {
    set({ isScanning: true });
    setTimeout(() => {
      set({ isScanning: false });
    }, 4000);
  },

  toggleLayer: (id: LayerId) => {
    set(state => {
      const updated = state.layers.map(l =>
        l.id === id ? { ...l, isActive: !l.isActive } : l
      );
      return { layers: updated };
    });
  },

  setPrimaryLayer: (id: LayerId) => {
    set(state => {
      const continuousLayers: LayerId[] = ['aqi', 'heat', 'noise', 'green', 'water', 'cleanliness'];
      const updated = state.layers.map(l => {
        if (l.id === id) return { ...l, isActive: true };
        if (!state.isCompareMode && continuousLayers.includes(l.id)) return { ...l, isActive: false };
        return l;
      });
      return { layers: updated, primaryLayer: id };
    });
  },

  toggleCompareMode: () => {
    set(state => ({ isCompareMode: !state.isCompareMode }));
  },

  toggleGeoDebugMode: () => {
    set(state => ({ geoDebugMode: !state.geoDebugMode }));
  },

  setLayerOpacity: (id: LayerId, opacity: number) => {
    set(state => {
      const updated = state.layers.map(l =>
        l.id === id ? { ...l, opacity: Math.max(0.1, Math.min(1.0, opacity)) } : l
      );
      return { layers: updated };
    });
  },

  selectHotspot: (hotspot: WasteHotspot | null) => set({ selectedHotspot: hotspot }),
  selectReport: (report: CommunityReport | null) => set({ selectedReport: report }),

  setIntervention: (key: keyof WhatIfInterventions, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    const interventions = { ...get().interventions, [key]: clamped };
    const simulated = calculateSimulation(get().baselineMetrics, interventions);
    const hasAnyActive = Object.values(interventions).some(v => v > 0);

    set({
      interventions,
      simulatedMetrics: simulated,
      displayedMetrics: hasAnyActive ? simulated : get().baselineMetrics,
      isSimulating: hasAnyActive
    });
  },

  resetInterventions: () => {
    set({
      interventions: INITIAL_INTERVENTIONS,
      simulatedMetrics: calculateSimulation(get().baselineMetrics, INITIAL_INTERVENTIONS),
      displayedMetrics: get().baselineMetrics,
      isSimulating: false
    });
  },

  setReportModalOpen: (open: boolean) => set({ isReportModalOpen: open }),
  setActivityFeedOpen: (open: boolean) => set({ isActivityFeedOpen: open }),
  setDataSourceModalOpen: (open: boolean) => set({ isDataSourceModalOpen: open }),
  setAiCopilotOpen: (open: boolean) => set({ isAiCopilotOpen: open }),
  setAiVisionOpen: (open: boolean) => set({ isAiVisionOpen: open }),

  startDemo: () => {
    set({ isDemoActive: true, demoStepIndex: 0 });
  },

  stopDemo: () => {
    set({ isDemoActive: false });
  },

  nextDemoStep: () => {
    set(s => ({ demoStepIndex: s.demoStepIndex + 1 }));
  },

  prevDemoStep: () => {
    set(s => ({ demoStepIndex: Math.max(0, s.demoStepIndex - 1) }));
  },

  addCommunityReport: async (report) => {
    const locId = get().currentLocation.id;
    const added = await DataService.submitCommunityReport(locId, report);
    set(state => ({
      communityReports: [added, ...state.communityReports]
    }));
  },

  submitNewReport: async (report) => {
    await get().addCommunityReport(report);
  },

  upvoteReport: async (reportId: string) => {
    const locId = get().currentLocation.id;
    const newCount = await DataService.upvoteCommunityReport(locId, reportId);
    set(state => ({
      communityReports: state.communityReports.map(r =>
        r.id === reportId ? { ...r, upvotes: newCount } : r
      )
    }));
  },

  refreshRealData: async () => {
    await get().setLocation(get().currentLocation);
  }
}));
