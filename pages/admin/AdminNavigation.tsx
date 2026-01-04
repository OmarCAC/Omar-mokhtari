
import React, { useState, useEffect } from 'react';
import { MenuItem, siteSettingsStorage, SiteSettings } from '../../src/services/siteSettingsStorage';
import { AVAILABLE_ICONS } from '../../src/modules/tools/constants';

const AdminNavigation: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsStorage.getSettings());
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    label: '',
    path: '/',
    icon: '',
    isVisible: true,
    isExternal: false,
    accessLevel: 'public',
    order: settings.mainMenu.length + 1
  });

  const handleSave = (updatedMenu: MenuItem[]) => {
    const newSettings = { ...settings, mainMenu: updatedMenu };
    setSettings(newSettings);
    siteSettingsStorage.saveSettings(newSettings);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleVisibility = (id: string) => {
    const updated = settings.mainMenu.map(m => m.id === id ? { ...m, isVisible: !m.isVisible } : m);
    handleSave(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newMenu = [...settings.mainMenu].sort((a, b) => a.order - b.order);
    if (direction === 'up' && index > 0) {
      [newMenu[index], newMenu[index - 1]] = [newMenu[index - 1], newMenu[index]];
    } else if (direction === 'down' && index < newMenu.length - 1) {
      [newMenu[index], newMenu[index + 1]] = [newMenu[index + 1], newMenu[index]];
    }
    const reordered = newMenu.map((m, i) => ({ ...m, order: i + 1 }));
    handleSave(reordered);
  };

  const deleteItem = (id: string) => {
    if (window.confirm("Supprimer cet espace définitivement ?")) {
      const updated = settings.mainMenu.filter(m => m.id !== id);
      handleSave(updated);
    }
  };

  const addItem = () => {
    if (!newItem.label || !newItem.path) return;
    const item: MenuItem = {
      ...newItem as MenuItem,
      id: 'm-' + Date.now(),
      order: settings.mainMenu.length + 1
    };
    handleSave([...settings.mainMenu, item]);
    setIsAdding(false);
    setNewItem({ label: '', path: '/', icon: '', isVisible: true, isExternal: false, accessLevel: 'public' });
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 p-6 space-y-8 font-display">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-md py-4 z-20 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Architecture & Navigation</h1>
          <p className="text-slate-500 text-sm">Organisez les espaces de votre cabinet en temps réel.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-black hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span> Nouvel Espace
        </button>
      </div>

      {showSuccess && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in border border-green-200 shadow-sm">
          <span className="material-symbols-outlined">verified</span> Configuration déployée instantanément !
        </div>
      )}

      {/* Aperçu du Header Actuel */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-9xl text-white">preview</span>
        </div>
        <div className="relative z-10">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Aperçu de la Barre de Navigation</p>
            <div className="flex flex-wrap gap-4 items-center">
                <div className="text-primary"><svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path></svg></div>
                <div className="flex flex-wrap gap-6 items-center">
                    {settings.mainMenu.filter(m => m.isVisible).sort((a, b) => a.order - b.order).map(m => (
                        <div key={m.id} className="text-xs font-bold text-white flex items-center gap-1 opacity-80 hover:opacity-100 cursor-default">
                            {m.icon && <span className="material-symbols-outlined text-[16px]">{m.icon}</span>}
                            {m.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                    <tr>
                        <th className="p-6 w-16 text-center">Pos.</th>
                        <th className="p-6">Espace / Page</th>
                        <th className="p-6">Destination</th>
                        <th className="p-6">Accès</th>
                        <th className="p-6 text-center">Visibilité</th>
                        <th className="p-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {settings.mainMenu.sort((a, b) => a.order - b.order).map((item, idx) => (
                        <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${!item.isVisible ? 'opacity-60 bg-slate-50/50 grayscale' : ''}`}>
                            <td className="p-6">
                                <div className="flex flex-col items-center gap-1">
                                    <button onClick={() => moveItem(idx, 'up')} className="text-slate-300 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">expand_less</span></button>
                                    <span className="font-mono font-black text-slate-600 bg-slate-100 w-6 h-6 flex items-center justify-center rounded-lg text-[10px]">{item.order}</span>
                                    <button onClick={() => moveItem(idx, 'down')} className="text-slate-300 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">expand_more</span></button>
                                </div>
                            </td>
                            <td className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                                        <span className="material-symbols-outlined text-xl">{item.icon || 'link'}</span>
                                    </div>
                                    <p className="font-black text-slate-900 text-base">{item.label}</p>
                                </div>
                            </td>
                            <td className="p-6">
                                <p className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 inline-block max-w-[150px] truncate">{item.path}</p>
                                {item.isExternal && <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded ml-1 font-black">EXT</span>}
                            </td>
                            <td className="p-6">
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tight border ${
                                    item.accessLevel === 'admin' ? 'bg-red-50 text-red-600 border-red-100' : 
                                    item.accessLevel === 'member' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                    'bg-green-50 text-green-600 border-green-100'
                                }`}>
                                    {item.accessLevel}
                                </span>
                            </td>
                            <td className="p-6 text-center">
                                <button 
                                    onClick={() => toggleVisibility(item.id)}
                                    className={`w-11 h-6 rounded-full p-1 transition-colors ${item.isVisible ? 'bg-primary shadow-inner shadow-black/10' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${item.isVisible ? 'translate-x-5' : ''}`}></div>
                                </button>
                            </td>
                            <td className="p-6 text-right">
                                <button onClick={() => deleteItem(item.id)} className="p-2.5 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* MODAL AJOUT D'ESPACE */}
      {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setIsAdding(false)}>
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
                  <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
                      <div>
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Ajouter un Nouvel Espace</h3>
                        <p className="text-xs text-slate-500 mt-1">Configurez l'accès et la destination du lien.</p>
                      </div>
                      <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  
                  <div className="p-10 space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nom affiché</label>
                            <input type="text" value={newItem.label} onChange={e => setNewItem({...newItem, label: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-black text-slate-800" placeholder="Ex: Espace Fiscal" />
                        </div>
                        <div className="relative">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Icône de menu</label>
                            <button 
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">{newItem.icon || 'circle'}</span>
                                    <span className="font-bold text-xs">{newItem.icon || 'Sélectionner...'}</span>
                                </span>
                                <span className="material-symbols-outlined text-slate-400">arrow_drop_down</span>
                            </button>
                            
                            {showIconPicker && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 grid grid-cols-6 gap-2 max-h-48 overflow-y-auto z-20 animate-slide-in custom-scrollbar">
                                    {AVAILABLE_ICONS.map(icon => (
                                        <button key={icon} onClick={() => { setNewItem({...newItem, icon}); setShowIconPicker(false); }} className={`p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors ${newItem.icon === icon ? 'bg-primary text-white' : 'text-slate-400'}`}>
                                            <span className="material-symbols-outlined text-lg">{icon}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Destination (URL)</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-slate-200 bg-slate-50 text-slate-400 text-xs font-mono">comptalink.dz/</span>
                            <input type="text" value={newItem.path} onChange={e => setNewItem({...newItem, path: e.target.value})} className="flex-1 p-4 border border-slate-200 rounded-r-2xl outline-none font-mono text-sm focus:ring-2 focus:ring-primary/20" placeholder="page-interne" />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Type de lien</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button onClick={() => setNewItem({...newItem, isExternal: false})} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!newItem.isExternal ? 'bg-white shadow text-primary' : 'text-slate-500'}`}>Interne</button>
                                <button onClick={() => setNewItem({...newItem, isExternal: true})} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${newItem.isExternal ? 'bg-white shadow text-primary' : 'text-slate-500'}`}>Externe</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Niveau d'Accès</label>
                            <select value={newItem.accessLevel} onChange={e => setNewItem({...newItem, accessLevel: e.target.value as any})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-tighter outline-none focus:border-primary">
                                <option value="public">Public (Tout le monde)</option>
                                <option value="member">Privé (Membres seuls)</option>
                                <option value="admin">Restreint (Admins)</option>
                            </select>
                          </div>
                      </div>
                  </div>

                  <div className="p-8 bg-slate-50 border-t flex gap-4">
                      <button onClick={() => setIsAdding(false)} className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-100 rounded-2xl transition-colors">Annuler</button>
                      <button onClick={addItem} className="flex-1 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/30 transform active:scale-95 transition-all">Créer l'espace</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminNavigation;
