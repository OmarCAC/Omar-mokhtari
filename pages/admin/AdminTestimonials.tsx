
import React, { useState, useEffect } from 'react';
import ImageUploadField from '../../components/ImageUploadField';
import { siteSettingsStorage, Testimonial } from '../../services/siteSettingsStorage';
import { useNotification } from '../../src/context/NotificationContext';

const AdminTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { addNotification } = useNotification();

  const loadData = () => {
    const settings = siteSettingsStorage.getSettings();
    setTestimonials(settings.testimonials || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    const settings = siteSettingsStorage.getSettings();
    let updated;
    
    // Si l'ID commence par new-, c'est une création
    if (selected.id.startsWith('new-')) {
        const newId = 't-' + Date.now();
        updated = [...testimonials, { ...selected, id: newId }];
    } else {
        // Sinon c'est une mise à jour
        updated = testimonials.map(t => t.id === selected.id ? selected : t);
    }

    setTestimonials(updated);
    siteSettingsStorage.saveSettings({ ...settings, testimonials: updated });
    setIsEditing(false);
    setSelected(null);
    addNotification('success', 'Témoignage enregistré avec succès.');
  };

  const startNew = () => {
    setSelected({ 
        id: 'new-' + Date.now(), 
        name: '', 
        role: '', 
        content: '', 
        image: '' 
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Supprimer ce témoignage définitivement ?")) {
        const updated = testimonials.filter(t => t.id !== id);
        setTestimonials(updated);
        const settings = siteSettingsStorage.getSettings();
        siteSettingsStorage.saveSettings({ ...settings, testimonials: updated });
        if (selected?.id === id) {
            setIsEditing(false);
            setSelected(null);
        }
        addNotification('info', 'Témoignage supprimé.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 p-4 space-y-8 font-display animate-fade-in">
      <div className="flex justify-between items-center sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-10 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Gestion des Témoignages</h1>
          <p className="text-slate-500 text-sm">Contrôlez les preuves de succès affichées sur le site.</p>
        </div>
        <button 
          onClick={startNew} 
          className="px-6 py-3 bg-primary text-white rounded-xl font-black hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add_comment</span>
          Nouveau Témoignage
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Liste à gauche */}
        <div className="lg:col-span-4 space-y-3">
          {testimonials.map(t => (
            <div 
                key={t.id} 
                onClick={() => { setSelected(t); setIsEditing(true); }}
                className={`group p-5 bg-white border rounded-[2rem] cursor-pointer transition-all flex items-center gap-4 ${selected?.id === t.id ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
            >
                <div className="relative shrink-0">
                    <img src={t.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name || 'User')}&background=random`} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100" alt={t.name} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 truncate text-sm">{t.name || 'Nom à remplir'}</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest truncate">{t.role || 'Rôle / Entreprise'}</p>
                </div>
                <button 
                    onClick={(e) => handleDelete(t.id, e)} 
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Supprimer"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>
          ))}
          
          {testimonials.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 bg-slate-50">
                <span className="material-symbols-outlined text-4xl mb-2">reviews</span>
                <p className="font-bold text-sm">La liste est vide.</p>
            </div>
          )}
        </div>

        {/* Formulaire à droite */}
        <div className="lg:col-span-8">
            {isEditing && selected ? (
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 animate-slide-in space-y-8">
                    <div className="flex justify-between items-center border-b pb-6">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                            {selected.id.startsWith('new-') ? "Ajouter un client" : "Modifier l'avis"}
                        </h2>
                        <button onClick={() => { setIsEditing(false); setSelected(null); }} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Identité du Client</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={selected.name} 
                                        onChange={e => setSelected({...selected, name: e.target.value})} 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20" 
                                        placeholder="Ex: Omar Benali"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Titre / Entreprise</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={selected.role} 
                                        onChange={e => setSelected({...selected, role: e.target.value})} 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20" 
                                        placeholder="Ex: CEO, Tech DZ"
                                    />
                                </div>
                            </div>
                            <div>
                                <ImageUploadField 
                                    label="Photo Portrait (1:1)" 
                                    initialImageUrl={selected.image} 
                                    onImageChange={(url) => setSelected({...selected, image: url})} 
                                    aspectRatio={1}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message / Citation</label>
                            <textarea 
                                required 
                                rows={5} 
                                value={selected.content} 
                                onChange={e => setSelected({...selected, content: e.target.value})} 
                                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] italic text-slate-700 font-medium leading-relaxed outline-none focus:ring-2 focus:ring-primary/20" 
                                placeholder="Décrivez l'expérience client..."
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <button 
                                type="button" 
                                onClick={() => { setIsEditing(false); setSelected(null); }} 
                                className="px-8 py-3 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-50 rounded-2xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-primary transition-all shadow-xl uppercase text-xs tracking-widest"
                            >
                                Enregistrer les modifications
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[4rem] text-slate-300 p-10 text-center">
                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-6xl opacity-30">format_quote</span>
                    </div>
                    <p className="font-black uppercase tracking-[0.2em] text-sm">Sélectionnez un témoignage</p>
                    <p className="text-xs text-slate-400 mt-2 max-w-xs">Vous pouvez modifier les avis existants ou en créer de nouveaux pour renforcer la crédibilité du cabinet.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminTestimonials;
