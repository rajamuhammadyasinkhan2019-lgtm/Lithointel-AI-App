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
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
        <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
          <Clock size={32} strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium">No analysis history yet</p>
        <p className="text-xs mt-1">Captured samples will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div 
          key={item.id}
          className="group relative bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <div 
            className="flex items-center p-3 cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
              <img 
                src={item.image} 
                alt="Sample" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  {item.type} • {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 truncate mt-0.5">
                {item.metadata.rockType || 'Unidentified Sample'}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-neutral-500">
                <div className="flex items-center gap-1 text-[10px] font-medium">
                  <Clock size={12} />
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {item.metadata.location && (
                  <div className="flex items-center gap-1 text-[10px] font-medium truncate">
                    <MapPin size={12} />
                    {item.metadata.location}
                  </div>
                )}
              </div>
            </div>

            <ChevronRight size={20} className="text-neutral-300 ml-2" />
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="absolute top-2 right-2 p-2 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
