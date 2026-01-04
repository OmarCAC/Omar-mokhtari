
import React, { useState, useRef, useEffect } from 'react';
import { imageOptimization } from '../src/services/imageOptimization';

interface ImageEditorProps {
  imageUrl: string;
  aspectRatio?: number; 
  onSave: (result: { dataUrl: string; size: number }) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, aspectRatio = 1, onSave, onCancel }) => {
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [quality, setQuality] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    imageOptimization.loadImage(imageUrl).then(img => {
      setImgElement(img);
    }).catch(err => {
      console.error("Erreur chargement image", err);
      onCancel();
    });
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!imgElement || !containerRef.current || isProcessing) return;
    
    setIsProcessing(true);

    try {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      const cropSize = Math.min(rect.width, rect.height) * 0.7;
      const frameW = cropSize;
      const frameH = cropSize / aspectRatio;

      const displayedWidth = imgElement.width * zoom;
      const displayedHeight = imgElement.height * zoom;

      const scaleX = imgElement.width / displayedWidth;
      const scaleY = imgElement.height / displayedHeight;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const imageLeft = centerX + position.x - (displayedWidth / 2);
      const imageTop = centerY + position.y - (displayedHeight / 2);
      
      const frameLeft = centerX - (frameW / 2);
      const frameTop = centerY - (frameH / 2);

      const sourceX = (frameLeft - imageLeft) * scaleX;
      const sourceY = (frameTop - imageTop) * scaleY;
      const sourceW = frameW * scaleX;
      const sourceH = frameH * scaleY;

      const result = await imageOptimization.processImage(
        imgElement, 
        { x: sourceX, y: sourceY, width: sourceW, height: sourceH }, 
        quality, 
        800
      );

      onSave({ dataUrl: result.dataUrl, size: result.size });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la capture. Réessayez.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!imgElement) return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl">
      <div className="text-center">
        <div className="animate-spin material-symbols-outlined text-white text-5xl mb-4">sync</div>
        <p className="text-white font-bold">Chargement de l'éditeur...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 md:p-8 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden max-h-[95vh] border border-white/20">
        
        <div 
          ref={containerRef}
          className="flex-1 bg-slate-200 relative min-h-[300px] md:min-h-[500px] overflow-hidden cursor-move select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img 
            src={imageUrl} 
            alt="Ajustement" 
            className="max-w-none pointer-events-none absolute"
            style={{ 
              width: imgElement.width * zoom,
              height: imgElement.height * zoom,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
            }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] rounded-lg relative"
              style={{
                  width: 'min(80%, 450px)',
                  aspectRatio: aspectRatio.toString()
              }}
            >
               <div className="absolute -top-10 left-0 right-0 text-center">
                 <span className="bg-primary text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg">Zone de Capture</span>
               </div>
               <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
                  {[...Array(9)].map((_, i) => <div key={i} className="border border-white"></div>)}
               </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
             <p className="inline-block bg-black/60 text-white text-[11px] px-4 py-2 rounded-full backdrop-blur-md font-medium border border-white/10">
                Glissez pour déplacer • Utilisez le zoom à droite
             </p>
          </div>
        </div>

        <div className="w-full md:w-80 lg:w-96 p-8 flex flex-col bg-white border-l border-slate-100 z-[600]">
          <div className="mb-10">
            <h3 className="text-2xl font-black text-slate-900 mb-1">Ajustement</h3>
            <p className="text-slate-500 text-sm">Préparez l'affichage de votre équipe.</p>
          </div>

          <div className="space-y-10 flex-1">
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Niveau de Zoom</label>
                  <span className="text-lg font-black text-primary">{Math.round(zoom * 100)}%</span>
               </div>
               <input 
                  type="range" min="0.1" max="3" step="0.01" 
                  value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
               />
            </div>

            <div className="space-y-4">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Qualité d'image (WebP)</label>
               <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuality(0.7); }}
                    className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 ${quality === 0.7 ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <span>Standard</span>
                    <span className={`text-[9px] font-bold ${quality === 0.7 ? 'text-primary/60' : 'text-slate-400'}`}>Léger</span>
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuality(0.95); }}
                    className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 ${quality === 0.95 ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <span>Haute Déf (HD)</span>
                    <span className={`text-[9px] font-bold ${quality === 0.95 ? 'text-primary/60' : 'text-slate-400'}`}>Netteté Max</span>
                  </button>
               </div>
               <p className="text-[10px] text-slate-400 italic">La qualité HD génère un fichier légèrement plus lourd.</p>
            </div>

            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
               <div className="flex gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-xl">auto_fix</span>
                  <p className="text-blue-800 text-[11px] leading-relaxed font-semibold">
                    L'image sera automatiquement compressée au format <b>WebP</b> pour garantir une vitesse de chargement optimale.
                  </p>
               </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10 pt-6 border-t border-slate-100">
             <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel(); }}
                className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all border border-slate-200"
             >
                 Annuler
             </button>
             <button 
                type="button"
                onClick={handleSave}
                disabled={isProcessing}
                className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
             >
                 {isProcessing ? (
                     <span className="material-symbols-outlined animate-spin">sync</span>
                 ) : (
                    <>
                        <span className="material-symbols-outlined">check_circle</span>
                        Appliquer
                    </>
                 )}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
