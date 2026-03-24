import React, { useRef, useState, useCallback } from 'react';
import { Camera as CameraIcon, RefreshCw, X, AlertCircle } from 'lucide-react';

interface CameraProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsReady(true);
      }
    } catch (err) {
      setError('Could not access camera. Please ensure permissions are granted.');
      console.error(err);
    }
  }, []);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-paper ag-grid z-50 flex flex-col">
      <div className="flex justify-between items-center p-6 bg-white border-b-4 border-ink shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-ink flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,255,0,1)]">
            <CameraIcon size={18} className="text-neon" />
          </div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-ink">Optical // <span className="text-neon bg-ink px-2">Input</span></h2>
        </div>
        <button 
          onClick={onClose} 
          className="p-3 bg-white border-2 border-ink hover:bg-neon transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-ink m-6 ag-border shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-neon font-mono uppercase tracking-widest">
            <AlertCircle size={48} className="mb-4 mx-auto" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover opacity-80"
            />
            {/* Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neon/30 shadow-[0_0_15px_rgba(0,255,0,0.5)] animate-scan" />
              <div className="absolute inset-0 border-[40px] border-ink/40" />
              
              {/* Corner Brackets */}
              <div className="absolute top-12 left-12 w-12 h-12 border-t-4 border-l-4 border-neon shadow-[-4px_-4px_0_0_rgba(0,0,0,1)]" />
              <div className="absolute top-12 right-12 w-12 h-12 border-t-4 border-r-4 border-neon shadow-[4px_-4px_0_0_rgba(0,0,0,1)]" />
              <div className="absolute bottom-12 left-12 w-12 h-12 border-b-4 border-l-4 border-neon shadow-[-4px_4px_0_0_rgba(0,0,0,1)]" />
              <div className="absolute bottom-12 right-12 w-12 h-12 border-b-4 border-r-4 border-neon shadow-[4px_4px_0_0_rgba(0,0,0,1)]" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-neon/50 rotate-45" />
            </div>
          </>
        )}
        
        {/* Scale Bar Overlay */}
        <div className="absolute bottom-12 left-12 pointer-events-none">
          <div className="flex flex-col items-start gap-2">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`w-4 h-2 ${i % 2 === 0 ? 'bg-neon' : 'bg-white'}`} />
              ))}
            </div>
            <span className="text-[9px] text-neon font-mono font-bold bg-ink px-2 py-0.5 uppercase tracking-widest">Scale Ref // 5cm</span>
          </div>
        </div>
      </div>

      <div className="p-10 flex justify-center items-center gap-12 bg-white border-t-4 border-ink shadow-[0_-4px_0_0_rgba(0,0,0,1)]">
        <button 
          onClick={startCamera}
          className="p-5 bg-white border-2 border-ink hover:bg-neon transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <RefreshCw size={28} className="text-ink" />
        </button>
        
        <button 
          onClick={capture}
          disabled={!isReady}
          className="w-24 h-24 bg-ink border-4 border-neon flex items-center justify-center shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 group"
        >
          <div className="w-16 h-16 border-2 border-neon/30 group-hover:border-neon transition-colors" />
        </button>

        <div className="w-16" /> {/* Spacer */}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
