import React from 'react';
import { AnalysisMetadata, AnalysisType } from '../types';
import { MapPin, Info, Layers, Hammer, Fingerprint, Compass, Navigation } from 'lucide-react';

interface MetadataFormProps {
  metadata: AnalysisMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<AnalysisMetadata>>;
  type: AnalysisType;
  setType: (type: AnalysisType) => void;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({ 
  metadata, 
  setMetadata, 
  type, 
  setType 
}) => {
  const getGPSLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMetadata(prev => ({
          ...prev,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }));
      }, (error) => {
        console.error("Error getting location:", error);
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-3">
        {(['macro', 'micro', 'field'] as AnalysisType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`py-3 px-4 ag-border text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
              type === t 
                ? 'bg-ink text-neon shadow-[4px_4px_0px_0px_rgba(0,255,0,1)]' 
                : 'bg-white text-ink/40 hover:border-ink hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Fingerprint className="absolute left-4 top-4 text-ink/20" size={18} />
          <input
            type="text"
            placeholder="SAMPLE ID // LITH-001"
            value={metadata.sampleId || ''}
            onChange={(e) => setMetadata(prev => ({ ...prev, sampleId: e.target.value }))}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-ink text-sm font-mono focus:bg-neon/5 outline-none transition-all placeholder:text-ink/20"
          />
        </div>

        <div className="relative">
          <Layers className="absolute left-4 top-4 text-ink/20" size={18} />
          <input
            type="text"
            placeholder="ROCK TYPE // QUARTZ VEIN"
            value={metadata.rockType || ''}
            onChange={(e) => setMetadata(prev => ({ ...prev, rockType: e.target.value }))}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-ink text-sm font-mono focus:bg-neon/5 outline-none transition-all placeholder:text-ink/20"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-4 top-4 text-ink/20" size={18} />
          <input
            type="text"
            placeholder="LOCATION // DISTRICT"
            value={metadata.location || ''}
            onChange={(e) => setMetadata(prev => ({ ...prev, location: e.target.value }))}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-ink text-sm font-mono focus:bg-neon/5 outline-none transition-all placeholder:text-ink/20"
          />
        </div>

        <div className="relative">
          <Hammer className="absolute left-4 top-4 text-ink/20" size={18} />
          <input
            type="text"
            placeholder="HARDNESS // WEIGHT"
            value={metadata.hardness || ''}
            onChange={(e) => setMetadata(prev => ({ ...prev, hardness: e.target.value }))}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-ink text-sm font-mono focus:bg-neon/5 outline-none transition-all placeholder:text-ink/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="relative">
            <Compass className="absolute left-4 top-4 text-ink/20" size={18} />
            <input
              type="text"
              placeholder="STRIKE // 045°"
              value={metadata.strike || ''}
              onChange={(e) => setMetadata(prev => ({ ...prev, strike: e.target.value }))}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-ink text-sm font-mono focus:bg-neon/5 outline-none transition-all placeholder:text-ink/20"
            />
          </div>
          <div className="relative">
            <Navigation className="absolute left-4 top-4 text-ink/20 rotate-45" size={18} />
            <input
              type="text"
              placeholder="DIP // 30° SE"
              value={metadata.dip || ''}
              onChange={(e) => setMetadata(prev => ({ ...prev, dip: e.target.value }))}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-ink text-sm font-mono focus:bg-neon/5 outline-none transition-all placeholder:text-ink/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={getGPSLocation}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-white border-2 border-ink text-[10px] font-mono font-bold uppercase tracking-widest text-ink hover:bg-neon transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <MapPin size={16} />
            {metadata.coordinates ? 'Update GPS' : 'Get GPS Location'}
          </button>
          {metadata.coordinates && (
            <div className="px-4 py-4 bg-ink text-neon border-2 border-ink text-[10px] font-mono font-bold shadow-[4px_4px_0px_0px_rgba(0,255,0,1)]">
              {metadata.coordinates.latitude.toFixed(4)}N // {metadata.coordinates.longitude.toFixed(4)}E
            </div>
          )}
        </div>

        <div className="relative">
          <Info className="absolute left-4 top-4 text-ink/20" size={18} />
          <textarea
            placeholder="ADDITIONAL OBSERVATIONS..."
            value={metadata.notes || ''}
            onChange={(e) => setMetadata(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-ink text-sm font-mono focus:bg-neon/5 outline-none transition-all placeholder:text-ink/20 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
