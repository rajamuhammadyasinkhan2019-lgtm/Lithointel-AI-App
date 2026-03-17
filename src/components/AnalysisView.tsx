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
ID: ${result.id}
Timestamp: ${new Date(result.timestamp).toLocaleString()}
Type: ${result.type.toUpperCase()}
Rock Type: ${result.metadata.rockType || 'N/A'}
Location: ${result.metadata.location || 'N/A'}

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-screen bg-white"
    >
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-bottom border-neutral-100 p-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-widest">Analysis Report</h1>
        <div className="flex gap-2">
          <button onClick={exportReport} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <Download size={20} />
          </button>
          <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="aspect-square w-full bg-neutral-100 relative overflow-hidden">
          <img 
            src={result.image} 
            alt="Sample" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} />
              {new Date(result.timestamp).toLocaleTimeString()}
            </span>
            {result.metadata.location && (
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                <MapPin size={12} />
                {result.metadata.location}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Mineralogical Assessment</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
            
            <div className="prose prose-neutral prose-sm max-w-none">
              <div className="markdown-body">
                <Markdown>{result.response}</Markdown>
              </div>
            </div>
          </section>

          <section className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Sample Metadata</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[10px] uppercase text-neutral-400 font-bold mb-1">Type</dt>
                <dd className="text-sm font-medium text-neutral-900 capitalize">{result.type}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase text-neutral-400 font-bold mb-1">Rock Type</dt>
                <dd className="text-sm font-medium text-neutral-900">{result.metadata.rockType || 'Unspecified'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] uppercase text-neutral-400 font-bold mb-1">Notes</dt>
                <dd className="text-sm text-neutral-600 leading-relaxed">{result.metadata.notes || 'No additional notes provided.'}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
