import React from 'react';
import Markdown from 'react-markdown';
import { AnalysisResult } from '../types';
import { Download, Share2, ChevronLeft, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisViewProps {
  result: AnalysisResult;
  onBack: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onBack }) => {
  const exportReport = () => {
    const report = `
LithoIntel Analysis Report
-------------------------
Sample ID: ${result.metadata.sampleId || 'N/A'}
Internal ID: ${result.id}
Timestamp: ${new Date(result.timestamp).toLocaleString()}
Type: ${result.type.toUpperCase()}
Rock Type: ${result.metadata.rockType || 'N/A'}
Location: ${result.metadata.location || 'N/A'}
Strike: ${result.metadata.strike || 'N/A'}
Dip: ${result.metadata.dip || 'N/A'}
GPS: ${result.metadata.coordinates ? `${result.metadata.coordinates.latitude}, ${result.metadata.coordinates.longitude}` : 'N/A'}

Analysis:
${result.response}
    `;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LithoIntel_Report_${result.id}.txt`;
    a.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen bg-paper ag-grid"
    >
      <header className="sticky top-0 z-10 bg-white border-b-4 border-ink p-6 flex items-center justify-between shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <button 
          onClick={onBack} 
          className="p-3 bg-white border-2 border-ink hover:bg-neon transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-mono font-bold uppercase tracking-[0.3em] text-ink">
          Analysis // <span className="text-neon bg-ink px-2">Report</span>
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={exportReport} 
            className="p-3 bg-white border-2 border-ink hover:bg-neon transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Download size={20} />
          </button>
          <button className="p-3 bg-white border-2 border-ink hover:bg-neon transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="aspect-video w-full border-b-4 border-ink relative overflow-hidden bg-ink">
          <img 
            src={result.image} 
            alt="Sample" 
            className="w-full h-full object-cover opacity-80 grayscale hover:grayscale-0 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 pointer-events-none ag-grid opacity-30" />
          <div className="absolute bottom-6 left-6 right-6 flex gap-3">
            <span className="px-4 py-2 bg-ink text-neon text-[10px] font-mono font-bold uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,255,0,0.3)] flex items-center gap-2">
              <Clock size={14} />
              {new Date(result.timestamp).toLocaleTimeString()}
            </span>
            {result.metadata.location && (
              <span className="px-4 py-2 bg-ink text-neon text-[10px] font-mono font-bold uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,255,0,0.3)] flex items-center gap-2">
                <MapPin size={14} />
                {result.metadata.location}
              </span>
            )}
          </div>
          <div className="absolute top-6 right-6">
            <div className="w-12 h-12 border-2 border-neon/50 flex items-center justify-center">
              <div className="w-1 h-1 bg-neon animate-pulse" />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-12 max-w-4xl mx-auto">
          <section className="ag-card bg-white p-8">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-neon bg-ink px-4 py-1">
                Mineralogical Assessment
              </span>
              <div className="h-0.5 flex-1 bg-ink/10" />
            </div>
            
            <div className="prose prose-neutral max-w-none">
              <div className="markdown-body font-sans text-ink leading-relaxed">
                <Markdown>{result.response}</Markdown>
              </div>
            </div>
          </section>

          <section className="ag-card bg-ink text-white p-8 shadow-[8px_8px_0_0_rgba(0,255,0,1)]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-neon mb-8">
              Sample Metadata // <span className="opacity-30">Telemetry</span>
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {result.metadata.sampleId && (
                <div className="col-span-full border-b border-white/10 pb-4">
                  <dt className="text-[10px] font-mono uppercase text-neon/50 font-bold mb-2 tracking-widest">Sample ID</dt>
                  <dd className="text-2xl font-bold text-white tracking-tighter italic">#{result.metadata.sampleId}</dd>
                </div>
              )}
              <div className="border-b border-white/10 pb-4">
                <dt className="text-[10px] font-mono uppercase text-neon/50 font-bold mb-2 tracking-widest">Type</dt>
                <dd className="text-lg font-bold text-white uppercase">{result.type}</dd>
              </div>
              <div className="border-b border-white/10 pb-4">
                <dt className="text-[10px] font-mono uppercase text-neon/50 font-bold mb-2 tracking-widest">Rock Type</dt>
                <dd className="text-lg font-bold text-white uppercase">{result.metadata.rockType || 'Unspecified'}</dd>
              </div>
              {result.metadata.strike && (
                <div className="border-b border-white/10 pb-4">
                  <dt className="text-[10px] font-mono uppercase text-neon/50 font-bold mb-2 tracking-widest">Strike</dt>
                  <dd className="text-lg font-bold text-white font-mono">{result.metadata.strike}</dd>
                </div>
              )}
              {result.metadata.dip && (
                <div className="border-b border-white/10 pb-4">
                  <dt className="text-[10px] font-mono uppercase text-neon/50 font-bold mb-2 tracking-widest">Dip</dt>
                  <dd className="text-lg font-bold text-white font-mono">{result.metadata.dip}</dd>
                </div>
              )}
              {result.metadata.coordinates && (
                <div className="col-span-full border-b border-white/10 pb-4">
                  <dt className="text-[10px] font-mono uppercase text-neon/50 font-bold mb-2 tracking-widest">GPS Coordinates</dt>
                  <dd className="text-lg font-mono text-neon font-bold">
                    {result.metadata.coordinates.latitude.toFixed(6)}N // {result.metadata.coordinates.longitude.toFixed(6)}E
                  </dd>
                </div>
              )}
              <div className="col-span-full">
                <dt className="text-[10px] font-mono uppercase text-neon/50 font-bold mb-2 tracking-widest">Notes</dt>
                <dd className="text-sm text-white/70 font-sans leading-relaxed italic">
                  "{result.metadata.notes || 'No additional notes provided.'}"
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
