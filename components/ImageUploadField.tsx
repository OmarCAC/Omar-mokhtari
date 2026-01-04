
import React, { useRef, useEffect, useState } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';
import ImageEditor from './ImageEditor';
import { imageOptimization } from '../src/services/imageOptimization';

interface ImageUploadFieldProps {
  label?: string;
  initialImageUrl?: string;
  onImageChange: (dataUrl: string) => void;
  aspectRatio?: number;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ 
  label = "Image", 
  initialImageUrl, 
  onImageChange,
  aspectRatio = 1
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(initialImageUrl || null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  const { isCompressing, error } = useImageUpload();

  // Mise à jour si l'image parente change (ex: switch entre membres de l'équipe)
  useEffect(() => {
    if (initialImageUrl && initialImageUrl !== displayUrl) {
        setDisplayUrl(initialImageUrl);
        setFileSize(null); // Reset size display for external images
    }
  }, [initialImageUrl]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditingUrl(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
      // Reset input value for re-selection same file
      e.target.value = '';
    }
  };

  const handleEditorSave = ({ dataUrl, size }: { dataUrl: string; size: number }) => {
    setDisplayUrl(dataUrl);
    setFileSize(size);
    // On ferme l'éditeur d'abord pour éviter les conflits d'UI
    setEditingUrl(null);
    // On notifie le parent APRÈS
    setTimeout(() => onImageChange(dataUrl), 10);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setEditingUrl(event.target?.result as string);
        };
        reader.readAsDataURL(e.dataTransfer.files[0]);
    }
  };

  const triggerInput = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDisplayUrl(null);
    setFileSize(null);
    onImageChange('');
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</label>
        {fileSize && (
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                WebP : {imageOptimization.formatSize(fileSize)}
            </span>
        )}
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-[1.5rem] transition-all duration-300 overflow-hidden cursor-pointer group ${
          error ? 'border-red-300 bg-red-50' : 
          isCompressing ? 'border-primary/50 bg-primary/5' :
          displayUrl ? 'border-primary bg-white shadow-sm' : 'border-slate-300 hover:border-primary hover:bg-slate-50'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={(e) => !isCompressing && triggerInput(e)}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileSelect} 
          accept="image/png, image/jpeg, image/webp" 
          className="hidden" 
        />

        {displayUrl ? (
          <div className="relative aspect-square">
            <img 
              src={displayUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-3 p-4">
               <div className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <span className="material-symbols-outlined text-sm">photo_camera</span> 
                Modifier le cadrage
              </div>
              <button 
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold transition-all border border-red-500/50"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center aspect-square">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
            </div>
            <p className="text-sm font-bold text-slate-600">Sélectionner une photo</p>
            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tight font-medium">PNG, JPG ou WebP</p>
          </div>
        )}
      </div>

      {editingUrl && (
          <ImageEditor 
            imageUrl={editingUrl}
            aspectRatio={aspectRatio}
            onSave={handleEditorSave}
            onCancel={() => setEditingUrl(null)}
          />
      )}
    </div>
  );
};

export default ImageUploadField;
