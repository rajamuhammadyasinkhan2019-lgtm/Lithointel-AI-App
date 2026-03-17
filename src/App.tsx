import React, { useState, useEffect } from 'react';
import { Camera } from './components/Camera';
import { MetadataForm } from './components/MetadataForm';
import { AnalysisView } from './components/AnalysisView';
import { HistoryList } from './components/HistoryList';
import { analyzeMineral } from './services/gemini';
import { AnalysisResult, AnalysisMetadata, AnalysisType } from './types';
import { 
  Camera as CameraIcon, 
  History, 
  Search, 
  Settings, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type View = 'home' | 'camera' | 'analyzing' | 'result';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<AnalysisType>('macro');
  const [metadata, setMetadata] = useState<AnalysisMetadata>({
    timestamp: Date.now()
  });
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lithointel_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('lithointel_history', JSON.stringify(history));
  }, [history]);

  const handleCapture = (image: string) => {
    setCurrentImage(image);
    setView('home');
    
    // Try to get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMetadata(prev => ({
            ...prev,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (err) => console.warn('Geolocation failed', err)
      );
    }
  };

  const startAnalysis = async () => {
    if (!currentImage) return;
    
    setView('analyzing');
    setError(null);
    
    try {
      const response = await analyzeMineral(currentImage, currentType, metadata);
      
      const result: AnalysisResult = {
        id: Math.random().toString(36).substring(7),
        image: currentImage,
        type: currentType,
        metadata: { ...metadata, timestamp: Date.now() },
        response,
        timestamp: Date.now()
      };
      
      setHistory(prev => [result, ...prev]);
      setCurrentResult(result);
      setView('result');
      setCurrentImage(null);
      setMetadata({ timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setView('home');
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="p-6 pt-12 flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-neutral-900 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">System Active</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-neutral-900">
                  Litho<span className="text-neutral-400">Intel</span>
                </h1>
              </div>
              <button className="p-3 bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <Settings size={20} className="text-neutral-500" />
              </button>
            </header>

            <main className="flex-1 p-6 space-y-8">
              {/* Main Action Area */}
              <section className="space-y-4">
                {currentImage ? (
                  <div className="bg-white p-4 rounded-3xl border border-neutral-200 shadow-xl space-y-4">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 relative group">
                      <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setCurrentImage(null)}
                        className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <AlertCircle size={18} />
                      </button>
                    </div>
                    
                    <MetadataForm 
                      metadata={metadata} 
                      setMetadata={setMetadata} 
                      type={currentType}
                      setType={setCurrentType}
                    />

                    <button 
                      onClick={startAnalysis}
                      className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-lg shadow-neutral-200"
                    >
                      <Sparkles size={20} />
                      Analyze Sample
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setView('camera')}
                    className="w-full aspect-[4/3] bg-neutral-900 rounded-[2.5rem] flex flex-col items-center justify-center text-white gap-4 shadow-2xl shadow-neutral-300 active:scale-[0.98] transition-all group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <CameraIcon size={40} strokeWidth={1.5} />
                    </div>
                    <div className="text-center relative z-10">
                      <p className="text-lg font-bold tracking-tight">Capture New Sample</p>
                      <p className="text-xs text-neutral-400 font-medium mt-1">Macro • Micro • Field</p>
                    </div>
                  </button>
                )}
              </section>

              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600">
                  <AlertCircle size={20} />
                  <p className="text-xs font-medium">{error}</p>
                </div>
              )}

              {/* History Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Recent Analysis</h2>
                  <button className="text-[10px] font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1">
                    View All <ChevronRight size={12} />
                  </button>
                </div>
                <HistoryList 
                  history={history} 
                  onSelect={(res) => {
                    setCurrentResult(res);
                    setView('result');
                  }}
                  onDelete={deleteHistoryItem}
                />
              </section>
            </main>

            {/* Footer Branding */}
            <footer className="p-8 text-center">
              <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.4em]">Advanced Geological Intelligence</p>
            </footer>
          </motion.div>
        )}

        {view === 'camera' && (
          <Camera 
            onCapture={handleCapture} 
            onClose={() => setView('home')} 
          />
        )}

        {view === 'analyzing' && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-neutral-100" />
              <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-neutral-900 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={32} className="text-neutral-900" />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Analyzing Mineralogy</h2>
            <p className="text-neutral-500 text-sm max-w-xs leading-relaxed">
              GeoAI is cross-referencing visual indicators with economic mineral databases...
            </p>
            
            <div className="mt-12 w-full max-w-xs space-y-3">
              {[
                'Detecting crystal habits...',
                'Analyzing lustre & color...',
                'Evaluating paragenetic context...',
                'Assessing economic significance...'
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                  <div className="w-1 h-1 bg-neutral-200 rounded-full" />
                  {step}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'result' && currentResult && (
          <AnalysisView 
            result={currentResult} 
            onBack={() => {
              setView('home');
              setCurrentResult(null);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
