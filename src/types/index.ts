export type Coordinates = [number, number]; // [longitude, latitude]

export interface Location {
  id: string;
  name: string;
  country: string;
  center: Coordinates;
  zoom: number;
  pitch: number;
  bearing: number;
  description: string;
  population: string;
  altitudeMeters: number;
  climateZone: string;
}

export interface AirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
  dominantPollutant: string;
  no2: number;
  o3: number;
  co: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
}

export interface EnvironmentalMetrics {
  airQuality: AirQuality;
  greenCoverPercentage: number;
  wasteIndex: number; // 0 (clean) to 100 (severe)
  waterQualityIndex: number; // 0 (poor) to 100 (pristine)
  heatIslandAnomaly: number; // Degrees Celsius above baseline (+1.2°C, etc.)
  noiseLevelDb: number; // Decibels
  cleanlinessScore: number; // 0 to 100
  terraIndex: number; // 0 to 100 overall composite score
}

export type LayerId = 'aqi' | 'waste' | 'cleanliness' | 'green' | 'water' | 'heat' | 'noise';

export interface EnvironmentalLayer {
  id: LayerId;
  name: string;
  shortDesc: string;
  isActive: boolean;
  opacity: number;
  color: string;
  unit: string;
}

export interface WasteHotspot {
  id: string;
  title: string;
  coordinates: Coordinates;
  severity: 'low' | 'medium' | 'high';
  volumeEst: number; // kg
  wasteType: 'Municipal Solid' | 'Plastic/Microplastics' | 'Electronic/Hazardous' | 'Construction Debris' | 'Organic Accumulation';
  detectionMethod: 'Satellite Spectral Analysis' | 'Drone LiDAR' | 'Citizen Ground Report' | 'Municipal IoT Sensor';
  recommendation: string;
  isResolved?: boolean;
}

export interface CommunityReport {
  id: string;
  coordinates: Coordinates;
  type: 'waste' | 'air' | 'water' | 'green' | 'dumping' | 'noise' | 'other';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  locationName: string;
  timestamp: string;
  upvotes: number;
  author: string;
  status: 'Investigating' | 'Verified' | 'Action Scheduled' | 'Resolved';
}

export interface CommunityAction {
  id: string;
  coordinates: Coordinates;
  type: 'tree_planting' | 'cleanup_drive' | 'sensor_install' | 'water_restoration';
  title: string;
  description: string;
  participants: number;
  targetMetric: string;
  timestamp: string;
}

export interface WhatIfInterventions {
  urbanTrees: number; // 0 to 100% increase
  wasteCollection: number; // 0 to 100% improvement
  recycling: number; // 0 to 100% rate
  greenSpace: number; // 0 to 100% expansion
  publicTransport: number; // 0 to 100% transition
}

export interface SimulationState {
  isActive: boolean;
  interventions: WhatIfInterventions;
  simulatedMetrics: EnvironmentalMetrics;
  disclaimer: "Illustrative projection based on intervention assumptions. Never present fabricated demonstration values as official environmental data.";
}

export type CameraMode = 'global' | 'city' | 'focused';

// --- Biological Age Engine Types ---
export interface OrganImpact {
  organ: 'Lungs' | 'Heart' | 'Skin' | 'Brain';
  ageIncreaseYears: number;
  percentageRisk: number; // 0 to 100%
  severity: 'low' | 'moderate' | 'high' | 'severe';
  description: string;
  cellularMechanism: string;
}

export interface DiseaseRisk {
  disease: string;
  riskFactor: string; // e.g. "+310% relative risk"
  hazardRatio: number;
  severity: 'moderate' | 'high' | 'critical';
  description: string;
}

export interface BioAgeResult {
  actualAge: number;
  biologicalAge: number;
  ageDifference: number;
  lifeExpectancyLostHoursPerMonth: number;
  lifeExpectancyLostDaysPerYear: number;
  organImpacts: {
    lungs: OrganImpact;
    heart: OrganImpact;
    skin: OrganImpact;
    brain: OrganImpact;
  };
  diseaseRisks: DiseaseRisk[];
  scientificExplanation: string;
  clinicalRecommendations: string[];
  calculatedAt: string;
  locationName: string;
  coordinates: Coordinates;
  aqi: number;
  pm25: number;
  pm10: number;
}

// --- AWS Citizen Ground Truth & Reports ---
export type TerraPollutionType =
  | 'stubble_burning'
  | 'factory_smoke'
  | 'vehicle_fleet'
  | 'waste_burning'
  | 'construction'
  | 'illegal_dumping';

export interface TerraReport {
  id: string;
  cityName: string;
  latitude: number;
  longitude: number;
  pollutionType: TerraPollutionType;
  severity: 'moderate' | 'high' | 'critical';
  imageUrl: string;
  description: string;
  timestamp: string;
  status: 'Investigating' | 'Verified' | 'Action Scheduled' | 'Resolved';
  authorName: string;
  authorEmail?: string;
  upvotes: number;
  s3Key?: string;
}

// --- AWS Community Action Social Feed ---
export type TerraPostCategory = 'all' | 'complaint' | 'volunteer' | 'fundraise' | 'discuss';

export interface TerraPost {
  id: string;
  cityName: string;
  areaName?: string;
  timestamp: string;
  postType: 'complaint' | 'volunteer' | 'fundraise' | 'discuss';
  authorName: string;
  authorEmail: string;
  authorRole?: string;
  authorAvatar?: string;
  title: string;
  content: string;
  imageUrl?: string;
  targetGoal?: number;
  currentAmount?: number;
  eventDate?: string;
  rsvpCount?: number;
  hasUserRsvped?: boolean;
  upvotes: number;
  hasUserUpvoted?: boolean;
  commentsCount: number;
  coordinates?: Coordinates;
  taggedAuthorities?: string[];
}

// --- AWS Cognito User Session ---
export interface CognitoUserSession {
  isAuthenticated: boolean;
  userSub: string;
  email: string;
  name: string;
  role: 'Citizen Reporter' | 'Clean Air Activist' | 'Municipal Officer' | 'Environmental Scientist';
  avatarUrl: string;
  accessToken?: string;
}
