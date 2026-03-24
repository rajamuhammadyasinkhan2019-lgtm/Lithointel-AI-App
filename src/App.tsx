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
  Sparkles,
  Upload,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, setDoc, doc, deleteDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { ErrorBoundary } from './components/ErrorBoundary';

type View = 'home' | 'camera' | 'analyzing' | 'result';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<View>('home');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<AnalysisType>('macro');
  const [metadata, setMetadata] = useState<AnalysisMetadata>({
    timestamp: Date.now()
  });
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      if (u) {
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', u.uid);
        setDoc(userRef, {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
          createdAt: Date.now()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${u.uid}`));
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore history listener
  useEffect(() => {
    if (!user || !isAuthReady) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: AnalysisResult[] = [];
      snapshot.forEach((doc) => {
        results.push(doc.data() as AnalysisResult);
      });
      setHistory(results);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'analyses');
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

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
    if (!currentImage || !user) return;
    
    setView('analyzing');
    setError(null);
    
    try {
      const response = await analyzeMineral(currentImage, currentType, metadata);
      
      const resultId = Math.random().toString(36).substring(7);
      const result: AnalysisResult = {
        id: resultId,
        image: currentImage,
        type: currentType,
        metadata: { ...metadata, timestamp: Date.now() },
        response,
        timestamp: Date.now()
      };
      
      // Save to Firestore
      const analysisRef = doc(db, 'analyses', resultId);
      await setDoc(analysisRef, {
        ...result,
        userId: user.uid
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, `analyses/${resultId}`));
      
      setCurrentResult(result);
      setView('result');
      setCurrentImage(null);
      setMetadata({ timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setView('home');
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'analyses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `analyses/${id}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-neutral-900" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-paper ag-grid flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Decorative Terminal Lines */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-px bg-ink w-full mb-8" />
          ))}
        </div>

        <div className="w-24 h-24 bg-ink flex items-center justify-center mb-12 shadow-[8px_8px_0px_0px_rgba(0,255,0,1)] rotate-3 relative z-10">
          <Sparkles size={48} className="text-neon" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <h1 className="text-7xl font-bold tracking-tighter uppercase italic leading-none">LithoIntel</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-ink/20" />
            <p className="text-[10px] font-mono font-bold text-neon bg-ink px-3 py-1 uppercase tracking-[0.3em]">
              Strategic Geo-Intelligence
            </p>
            <div className="h-px w-8 bg-ink/20" />
          </div>
        </div>

        <p className="text-ink/60 text-sm max-w-xs my-12 font-mono uppercase tracking-tight leading-relaxed relative z-10">
          Advanced AI-driven mineralogical assessment for field geologists and exploration teams.
        </p>

        <button
          onClick={signInWithGoogle}
          className="ag-button w-full max-w-xs flex items-center justify-center gap-4 relative z-10"
        >
          <LogIn size={20} />
          Initialize Session
        </button>

        <div className="mt-16 pt-8 border-t-2 border-ink/10 w-full max-w-xs relative z-10">
          <div className="flex justify-between items-center text-[8px] font-mono font-bold text-ink/20 uppercase tracking-widest">
            <span>Auth // Secure</span>
            <span>v3.1.0-PRO</span>
            <span>Status // Ready</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-paper ag-grid font-sans text-ink selection:bg-neon selection:text-ink">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto min-h-screen bg-white ag-border shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col my-8"
            >
              {/* Header */}
              <header className="p-6 border-b-2 border-ink flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-ink flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,255,0,1)]">
                    <Sparkles size={24} className="text-neon" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tighter uppercase italic leading-none">LithoIntel</h1>
                    <p className="text-[10px] font-mono font-bold text-ink/40 uppercase tracking-widest mt-1">v3.1 Pro // Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={logout}
                    className="p-2 hover:bg-neon border border-transparent hover:border-ink transition-all"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-10 h-10 border-2 border-ink shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                  ) : (
                    <div className="w-10 h-10 bg-ink flex items-center justify-center border-2 border-ink">
                      <UserIcon size={20} className="text-neon" />
                    </div>
                  )}
                </div>
              </header>

            <main className="flex-1 p-6 space-y-10">
              {/* Main Action Area */}
              <section className="space-y-6">
                {currentImage ? (
                  <div className="ag-card p-6 space-y-6">
                    <div className="aspect-square border-2 border-ink overflow-hidden bg-neutral-100 relative group">
                      <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 border-4 border-neon/30 pointer-events-none" />
                      <button 
                        onClick={() => setCurrentImage(null)}
                        className="absolute top-4 right-4 p-2 bg-ink text-neon border border-neon hover:bg-neon hover:text-ink transition-all"
                      >
                        <AlertCircle size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono font-bold text-ink/40 uppercase tracking-widest">Metadata Input</p>
                      <MetadataForm 
                        metadata={metadata} 
                        setMetadata={setMetadata} 
                        type={currentType}
                        setType={setCurrentType}
                      />
                    </div>

                    <button 
                      onClick={startAnalysis}
                      className="ag-button w-full flex items-center justify-center gap-3"
                    >
                      <Sparkles size={20} />
                      Run Analysis
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    <button 
                      onClick={() => setView('camera')}
                      className="w-full aspect-[16/9] bg-ink flex flex-col items-center justify-center text-paper gap-4 shadow-[8px_8px_0px_0px_rgba(0,255,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,255,0,1)] transition-all group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_70%)]" />
                      <div className="w-16 h-16 border-2 border-neon flex items-center justify-center group-hover:bg-neon group-hover:text-ink transition-all duration-300">
                        <CameraIcon size={32} strokeWidth={1.5} />
                      </div>
                      <div className="text-center relative z-10">
                        <p className="text-lg font-bold uppercase tracking-widest italic">Capture Sample</p>
                        <p className="text-[10px] font-mono text-neon/60 mt-1 uppercase">Optical Input // Active</p>
                      </div>
                    </button>

                    <label className="w-full py-8 bg-paper border-2 border-dashed border-ink flex flex-col items-center justify-center text-ink/40 gap-3 cursor-pointer hover:bg-neon/5 hover:border-neon hover:text-ink transition-all">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                      <Upload size={28} strokeWidth={1.5} />
                      <span className="text-xs font-bold uppercase tracking-[0.3em]">Import Dataset</span>
                    </label>
                  </div>
                )}
              </section>

              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600">
                  <AlertCircle size={20} />
                  <p className="text-xs font-medium">{error}</p>
                </div>
              )}

              {/* History Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-ink pb-2">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] italic">Recent Analysis</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-neon rounded-full" />
                    <span className="text-[10px] font-mono font-bold uppercase text-ink/40">Live Feed</span>
                  </div>
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
            <footer className="p-10 text-center space-y-4 bg-ink text-paper border-t-4 border-neon">
              <div className="flex justify-center gap-8 opacity-30">
                <div className="w-px h-8 bg-paper" />
                <div className="w-px h-8 bg-paper" />
                <div className="w-px h-8 bg-paper" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-neon uppercase tracking-[0.5em]">Advanced Geological Intelligence</p>
                <p className="text-[10px] font-mono text-paper/40 uppercase tracking-widest">Expert App Developer: Muhammad Yasin Khan</p>
              </div>
              <p className="text-[8px] font-mono text-paper/20 uppercase tracking-tighter">Terminal // LithoIntel v3.1 // Antigravity Core</p>
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
            className="fixed inset-0 bg-paper ag-grid z-50 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-12">
              <div className="w-32 h-32 border-4 border-line" />
              <div className="absolute inset-0 w-32 h-32 border-4 border-neon border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={48} className="text-ink animate-pulse" />
              </div>
            </div>
            <h2 className="text-4xl font-bold tracking-tighter mb-4 uppercase italic">Analyzing Dataset</h2>
            <p className="text-ink/60 text-sm max-w-xs font-mono uppercase leading-relaxed">
              GeoAI is cross-referencing visual indicators with global mineralogical databases...
            </p>
            
            <div className="mt-16 w-full max-w-xs space-y-4">
              {[
                'Detecting crystal habits...',
                'Analyzing lustre & color...',
                'Evaluating paragenetic context...',
                'Assessing economic significance...'
              ].map((step, i) => (
                <motion.div 
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-ink/40"
                >
                  <div className="w-2 h-2 bg-neon" />
                  {step}
                </motion.div>
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
    </ErrorBoundary>
  );
}
