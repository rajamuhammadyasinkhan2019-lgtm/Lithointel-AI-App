import React from 'react';
import { AnalysisResult } from '../types';
import { Clock, MapPin, ChevronRight, Trash2 } from 'lucide-react';

interface HistoryListProps {
  history: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
  onDelete: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onDelete }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-ink/20 border-2 border-dashed border-line">
        <div className="w-20 h-20 bg-neutral-50 flex items-center justify-center mb-6">
          <Clock size={40} strokeWidth={1} />
        </div>
        <p className="text-xs font-mono font-bold uppercase tracking-[0.3em]">No Dataset Found</p>
        <p className="text-[10px] mt-2 uppercase tracking-widest">Waiting for optical input...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {history.map((item) => (
        <div 
          key={item.id}
          className="group relative bg-white ag-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,255,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none"
        >
          <div 
            className="flex items-center p-4 cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <div className="w-20 h-20 border-2 border-ink overflow-hidden bg-neutral-100 flex-shrink-0 relative">
              <img 
                src={item.image} 
                alt="Sample" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-2 border-neon/20 pointer-events-none" />
            </div>
            
            <div className="ml-6 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-neon bg-ink px-2 py-0.5">
                  {item.type} // {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-ink truncate mt-2 uppercase italic tracking-tighter">
                {item.metadata.sampleId ? (
                  <>
                    <span className="text-ink/30 font-mono mr-2">#{item.metadata.sampleId}</span>
                    {item.metadata.rockType || 'Unidentified'}
                  </>
                ) : (
                  item.metadata.rockType || 'Unidentified Sample'
                )}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-ink/40">
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase">
                  <Clock size={12} className="text-neon" />
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {item.metadata.location && (
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase truncate">
                    <MapPin size={12} className="text-neon" />
                    {item.metadata.location}
                  </div>
                )}
              </div>
            </div>

            <ChevronRight size={24} className="text-ink/10 group-hover:text-neon transition-colors ml-4" />
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="absolute top-2 right-2 p-2 text-ink/10 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
