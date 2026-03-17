import React from 'react';
import { AnalysisMetadata, AnalysisType } from '../types';
import { MapPin, Info, Layers, Hammer } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2">
        {(['macro', 'micro', 'field'] as AnalysisType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`py-2 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
              type === t 
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' 
                : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Layers className="absolute left-3 top-3 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Rock Type (e.g. Igneous, Quartz Vein)"
            value={metadata.rockType || ''}
            onChange={(e) => setMetadata(prev => ({ ...prev, rockType: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Location / District"
            value={metadata.location || ''}
            onChange={(e) => setMetadata(prev => ({ ...prev, location: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Hammer className="absolute left-3 top-3 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Hardness / Weight Notes"
            value={metadata.hardness || ''}
            onChange={(e) => setMetadata(prev => ({ ...prev, hardness: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Info className="absolute left-3 top-3 text-neutral-400" size={18} />
          <textarea
            placeholder="Additional observations..."
            value={metadata.notes || ''}
            onChange={(e) => setMetadata(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
};
