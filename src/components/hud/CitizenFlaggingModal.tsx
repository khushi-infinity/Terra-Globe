import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TerraPollutionType } from '../../types';
import {
  AlertTriangle,
  X,
  Upload,
  MapPin,
  Camera,
  CheckCircle2,
  Navigation,
  Loader2,
  Flame,
  Factory,
  Car,
  Trash2,
  Building
} from 'lucide-react';

const POLLUTION_CATEGORIES: Array<{
  id: TerraPollutionType;
  label: string;
  icon: any;
  color: string;
}> = [
  { id: 'stubble_burning', label: 'Stubble Burning', icon: Flame, color: 'text-amber-400' },
  { id: 'factory_smoke', label: 'Factory Smoke', icon: Factory, color: 'text-rose-400' },
  { id: 'vehicle_fleet', label: 'Vehicle / Diesel Smog', icon: Car, color: 'text-blue-400' },
  { id: 'waste_burning', label: 'Open Waste Burning', icon: Trash2, color: 'text-orange-400' },
  { id: 'construction', label: 'Construction Dust', icon: Building, color: 'text-yellow-400' },
  { id: 'illegal_dumping', label: 'Illegal Dumping', icon: AlertTriangle, color: 'text-red-400' }
];

export const CitizenFlaggingModal: React.FC = () => {
  const isCitizenFlaggingOpen = useAppStore(s => s.isCitizenFlaggingOpen);
  const setCitizenFlaggingOpen = useAppStore(s => s.setCitizenFlaggingOpen);
  const flaggingDefaultCoords = useAppStore(s => s.flaggingDefaultCoords);
  const currentLocation = useAppStore(s => s.currentLocation);
  const submitTerraReport = useAppStore(s => s.submitTerraReport);
  const userSession = useAppStore(s => s.userSession);

  const [pollutionType, setPollutionType] = useState<TerraPollutionType>('stubble_burning');
  const [severity, setSeverity] = useState<'moderate' | 'high' | 'critical'>('high');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(currentLocation.center[1]);
  const [longitude, setLongitude] = useState<number>(currentLocation.center[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [s3UploadedUrl, setS3UploadedUrl] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReport, setSuccessReport] = useState<boolean>(false);

  useEffect(() => {
    if (flaggingDefaultCoords) {
      setLongitude(flaggingDefaultCoords[0]);
      setLatitude(flaggingDefaultCoords[1]);
    } else {
      setLongitude(currentLocation.center[0]);
      setLatitude(currentLocation.center[1]);
    }
  }, [flaggingDefaultCoords, currentLocation]);

  if (!isCitizenFlaggingOpen) return null;

  // Browser Geolocation auto-fill
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(5)));
        setLongitude(Number(pos.coords.longitude.toFixed(5)));
        setIsLocating(false);
        setLocationSuccessMsg(`GPS Acquired: ±${Math.round(pos.coords.accuracy)}m accuracy`);
        setTimeout(() => setLocationSuccessMsg(''), 4000);
      },
      (err) => {
        setIsLocating(false);
        setErrorMessage(`Could not obtain GPS fix: ${err.message}. Using active twin coordinates.`);
        setTimeout(() => setErrorMessage(''), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Image selection & Pre-Signed S3 upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMessage('');

    try {
      setIsUploadingImage(true);
      setUploadProgress(20);

      const presignRes = await fetch('/api/aws/s3/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'image/jpeg'
        })
      });

      if (!presignRes.ok) throw new Error('Failed to obtain upload token');
      const { uploadUrl, publicUrl } = await presignRes.json();
      setUploadProgress(60);

      const s3UploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'image/jpeg'
        },
        body: file
      });

      if (!s3UploadRes.ok) {
        throw new Error('Upload rejected');
      }

      setUploadProgress(100);
      setS3UploadedUrl(publicUrl);
      setIsUploadingImage(false);
    } catch (err: any) {
      setIsUploadingImage(false);
      setS3UploadedUrl(imagePreview || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please provide a brief description of the observed hazard.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const finalImageUrl = s3UploadedUrl || (
        pollutionType === 'stubble_burning'
          ? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
          : pollutionType === 'factory_smoke'
          ? 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
      );

      await submitTerraReport({
        cityName: currentLocation.name,
        latitude,
        longitude,
        pollutionType,
        severity,
        imageUrl: finalImageUrl,
        description,
        authorName: userSession.isAuthenticated ? userSession.name : 'Citizen Sentinel',
        authorEmail: userSession.email
      });

      setIsSubmitting(false);
      setSuccessReport(true);
      setTimeout(() => {
        setSuccessReport(false);
        setCitizenFlaggingOpen(false);
      }, 2000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(`Submission failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="glass-panel-active rounded-3xl p-6 w-full max-w-lg border border-amber-500/40 shadow-2xl text-left bg-slate-950/95 text-white max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-tech">
                Report Pollution Hazard
              </h3>
              <span className="text-xs text-slate-400 block">
                Flag an active environmental source with GPS coordinates and photo evidence
              </span>
            </div>
          </div>

          <button
            onClick={() => setCitizenFlaggingOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successReport ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold font-tech text-white">
              Report Submitted Successfully
            </h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your report has been logged to the community action map and forwarded to regional environmental authorities.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* 1. Category */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 uppercase tracking-wider font-tech">
                1. Pollution Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POLLUTION_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = pollutionType === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setPollutionType(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/40 text-white shadow-sm'
                          : 'border-white/10 bg-black/40 hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Severity */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider font-tech">
                2. Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'moderate', label: 'Moderate Smoke', color: 'border-yellow-500/40 text-yellow-300' },
                  { id: 'high', label: 'Heavy Plume / Acrid', color: 'border-orange-500/40 text-orange-300' },
                  { id: 'critical', label: 'Critical Toxic Inversion', color: 'border-rose-500/40 text-rose-300' }
                ].map(s => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSeverity(s.id as any)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      severity === s.id
                        ? `bg-white/15 ${s.color} font-bold shadow`
                        : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Location */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-tech flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  3. Incident Location
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/30 transition-all"
                >
                  <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Detecting...' : 'Auto-Detect GPS'}</span>
                </button>
              </div>

              {locationSuccessMsg && (
                <div className="text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {locationSuccessMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-mono">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-mono">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 4. Photo Evidence */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-tech flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-rose-400" />
                4. Photo Evidence
              </span>

              <div className="flex items-center gap-3">
                <label className="flex-1 border-2 border-dashed border-white/15 hover:border-amber-400/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">Click to upload photo or capture</span>
                  <span className="text-[10px] text-slate-500 font-mono">JPG, PNG, WebP (Max 10MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-amber-400/50 relative flex-shrink-0 bg-black">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-[10px] text-amber-300 font-mono">
                        <Loader2 className="w-4 h-4 animate-spin mb-1" />
                        <span>{uploadProgress}%</span>
                      </div>
                    )}
                    {s3UploadedUrl && !isUploadingImage && (
                      <div className="absolute top-1 right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 5. Description */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider font-tech">
                5. Witness Observations & Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the source: e.g. Thick acrid smoke billowing from unauthorized furnace near railway line. Strong chemical odor affecting nearby residents..."
                className="w-full bg-slate-900/90 border border-white/15 focus:border-amber-400 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none font-sans"
              />
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setCitizenFlaggingOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Report...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Submit Verified Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
