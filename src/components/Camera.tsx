import React, { useRef, useState, useCallback } from 'react';
import { Camera as CameraIcon, RefreshCw, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 text-white">
        <h2 className="text-lg font-medium">Capture Sample</h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-neutral-900">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
            <p>{error}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Scale Bar Overlay */}
        <div className="absolute bottom-24 left-8 right-8 pointer-events-none">
          <div className="flex flex-col items-start">
            <div className="w-24 h-1 bg-white shadow-lg" />
            <span className="text-[10px] text-white font-mono mt-1 bg-black/50 px-1">SCALE REF</span>
          </div>
        </div>
      </div>

      <div className="p-8 flex justify-center items-center gap-8 bg-black/80 backdrop-blur-md">
        <button 
          onClick={startCamera}
          className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <RefreshCw size={24} />
        </button>
        
        <button 
          onClick={capture}
          disabled={!isReady}
          className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl active:scale-95 transition-transform disabled:opacity-50"
        >
          <div className="w-16 h-16 rounded-full border-4 border-black/10" />
        </button>

        <div className="w-12" /> {/* Spacer */}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
