
import React, { useState, useEffect, useRef } from 'react';
import { mediaStorage, ManagedAsset, MediaPage } from '../../src/modules/media/services/mediaStorage';
import ImageEditor from '../../components/ImageEditor';
import { useNotification } from '../../src/context/NotificationContext';

const PAGES_CONFIG: { id: MediaPage; label: string; icon: string }[] = [
    { id: 'home', label: 'Accueil', icon: 'home' },
    { id: 'about', label: 'Manifeste', icon: 'history_edu' },
    { id: 'services', label: 'Excellence', icon: 'verified_user' },
    { id: 'tools', label: 'Arsenal Tech', icon: 'construction' },
    { id: 'blog', label: 'Savoir', icon: 'auto_stories' }
];

const AdminMedia: React.FC = () => {
  const [assets, setAssets] = useState<ManagedAsset[]>([]);
  const [activeTab, setActiveTab] = useState<MediaPage>('home');
  const [editingAsset, setEditingAsset] = useState<ManagedAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotification();

  const loadAssets = () => {
    setAssets(mediaStorage.getSiteAssets());
  };

  useEffect(() => {
    loadAssets();
    window.addEventListener('storage', loadAssets);
    window.addEventListener('site-settings-updated', loadAssets);
    return () => {
        window.removeEventListener('storage', loadAssets);
        window.removeEventListener('site-settings-updated', loadAssets);
    };
  }, []);

  const handleReplaceClick = (asset: ManagedAsset) => {
    setEditingAsset(asset);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingAsset) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditingAsset({ ...editingAsset, url: event.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveAdjustments = (result: { dataUrl: string; size: number }) => {
    if (editingAsset) {
      mediaStorage.updateAssetUrl(editingAsset, result.dataUrl);
      addNotification('success', `L'image "${editingAsset.label}" a été mise à jour.`);
      setEditingAsset(null);
      loadAssets();
    }
  };

  const handleResetAsset = (asset: ManagedAsset) => {
      if (confirm(`Réinitialiser l'image "${asset.label}" ?`)) {
          mediaStorage.updateAssetUrl(asset, "");
          addNotification('info', "Image réinitialisée.");
          loadAssets();
      }
  };

  const filteredAssets = assets.filter(a => a.page === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-fade-in font-display">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Médiathèque <span className="text-primary">Pages</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Contrôlez les visuels monumentaux de chaque section du site.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-3 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Explorateur par Page</p>
            {PAGES_CONFIG.map(page => (
                <button 
                    key={page.id}
                    onClick={() => setActiveTab(page.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === page.id ? 'bg-slate-900 text-white shadow-xl translate-x-2' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                >
                    <span className="material-symbols-outlined">{page.icon}</span>
                    {page.label}
                </button>
            ))}
        </div>

        <div className="lg:col-span-9">
            {filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-300 text-center px-10">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">photo_library</span>
                    <p className="font-black uppercase tracking-widest text-sm">Aucun visuel détecté</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredAssets.map((asset) => (
                        <div key={asset.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
                            <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                <img src={asset.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={asset.label} />
                                
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => handleReplaceClick(asset)}
                                        className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
                                        title="Remplacer"
                                    >
                                        <span className="material-symbols-outlined">add_photo_alternate</span>
                                    </button>
                                    <button 
                                        onClick={() => setEditingAsset(asset)}
                                        className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
                                        title="Ajuster"
                                    >
                                        <span className="material-symbols-outlined">crop_free</span>
                                    </button>
                                    <button 
                                        onClick={() => handleResetAsset(asset)}
                                        className="w-12 h-12 rounded-2xl bg-white text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                        title="Supprimer"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6 flex justify-between items-center bg-white">
                                <div>
                                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">{asset.label}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Champ : {asset.key}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>

      {editingAsset && editingAsset.url && (
          <ImageEditor 
            imageUrl={editingAsset.url}
            aspectRatio={activeTab === 'home' ? 16/9 : 4/3}
            onSave={handleSaveAdjustments}
            onCancel={() => setEditingAsset(null)}
          />
      )}
    </div>
  );
};

export default AdminMedia;
