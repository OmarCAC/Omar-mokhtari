
import React, { useState, useEffect } from 'react';
import ImageUploadField from '../../components/ImageUploadField';

interface Founder {
  id: number;
  name: string;
  role: string;
  department: string;
  bio: string;
  image: string;
  email: string;
  linkedin: string;
  twitter: string;
  isVisible: boolean;
  order: number;
}

const INITIAL_FOUNDERS: Founder[] = [
  {
    id: 1,
    name: "Amina Kaddour",
    role: "Fondatrice & Expert-Comptable",
    department: "Direction Générale",
    bio: "Expert-comptable agréée avec plus de 15 ans d'expérience dans l'accompagnement des startups et PME en Algérie.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyDkAFHV3zPhQ5dtqa0MDnE-lQfZq6IR8GY9g7JkIfp4LTOoGrLMlLl1vfxS7e6CTamN9faIX8DT5NdLVqUWrVIjOJeq8lP8ciSBmO4HhhaendOIQokVPxv7mAO8jLfrjJjAng1yagXPbZSBFqw032rGBYn68Whh0uaR3YNHAABLQdYasBqSu1d19MLwuOsYYFoqsmdBn0cRW0jXrssSkjMF4Ar0Z8uWkeLYLRbN6wb4kMLrb_Am4lRxhf3Y6lIdOWvuA8om0QGNjy",
    email: "amina.k@comptalink.dz",
    linkedin: "https://linkedin.com",
    twitter: "",
    isVisible: true,
    order: 1
  },
  {
    id: 2,
    name: "Yacine Benali",
    role: "Directeur Conseil",
    department: "Stratégie & Finance",
    bio: "Spécialiste en stratégie financière et développement d'entreprise, passionné par l'innovation technologique.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK3dQr-hbfUsTKyEzsb8kSRqHRpq4DnPB10ORmlg4g-lIPXotvkAoBV_-ZpvB1oyofZdXf0QzPrr-E83d6XCNG_xdXf-Nh0j0J7XnfO8RED9PvBr3G-G2plkW7PP9Owes25dW4-RX2ekaIUe-BQAInTviKS9_PZIHk0c4Xjlh18sCPqRhBVgx8VTrIr42M_rDBJIA8GSXbf-1DKyYgGBfumUaJEB9ZCJyfhOeU_qoyyC6vVyjVVJHqbEW9eB58SlMFxXsM3SZwwu8g",
    email: "yacine.b@comptalink.dz",
    linkedin: "https://linkedin.com",
    twitter: "",
    isVisible: true,
    order: 2
  },
  {
    id: 3,
    name: "Karim Zitouni",
    role: "Responsable Juridique",
    department: "Juridique & Fiscal",
    bio: "Juriste d'affaires spécialisé dans le droit des sociétés et la fiscalité algérienne.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUwjlF0jE6r2jhs_nFPk-z1oxKookqrR2AXJfdFz8I5g2RgcDXfnc7TJnUJrh6sLVcq1b4guV21Mz3XsCmtQpjOj0L_m_Q-7_YlEkFj-lor2Bto2s_sPFsMVTVNe9xPrezjUJWn7GUxnWaZbawuFy2xG1ORNRnRHHcn4w7JDAYwIcMtRnLuXS5FpbBrCQBAIN9GcVzlSTTVLrLYmOChhps3hFcHFKZ1blaUlM1BzkK2yF4UJLF3koWqqfU3mGYRMfqNAhYTwLCCS7d",
    email: "karim.z@comptalink.dz",
    linkedin: "https://linkedin.com",
    twitter: "",
    isVisible: true,
    order: 3
  }
];

const AdminFounders: React.FC = () => {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedFounders = localStorage.getItem('comptalink_founders');
    if (savedFounders) {
      try {
        let parsed = JSON.parse(savedFounders);
        parsed = parsed.map((f: any, idx: number) => ({
            ...f,
            order: f.order || idx + 1,
            isVisible: f.isVisible !== undefined ? f.isVisible : true,
            department: f.department || '',
            email: f.email || ''
        })).sort((a: Founder, b: Founder) => a.order - b.order);
        
        setFounders(parsed);
      } catch (e) {
        setFounders(INITIAL_FOUNDERS);
      }
    } else {
      setFounders(INITIAL_FOUNDERS);
      localStorage.setItem('comptalink_founders', JSON.stringify(INITIAL_FOUNDERS));
    }
  }, []);

  const saveData = (newData: Founder[]) => {
    setFounders(newData);
    localStorage.setItem('comptalink_founders', JSON.stringify(newData));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFounder) return;

    let updatedFounders;
    if (selectedFounder.id === 0) {
      const newFounder = { 
        ...selectedFounder, 
        id: Date.now(),
        order: founders.length + 1
      };
      updatedFounders = [...founders, newFounder];
    } else {
      updatedFounders = founders.map(f => f.id === selectedFounder.id ? selectedFounder : f);
    }

    saveData(updatedFounders);
    setIsEditing(false);
    setSelectedFounder(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDelete = (id: number, e?: React.MouseEvent) => {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    if (window.confirm("Supprimer ce membre ?")) {
      const updatedFounders = founders.filter(f => f.id !== id);
      saveData(updatedFounders);
      if (selectedFounder?.id === id) {
        setSelectedFounder(null);
        setIsEditing(false);
      }
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === founders.length - 1)) return;
    const newFounders = [...founders];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFounders[index], newFounders[targetIndex]] = [newFounders[targetIndex], newFounders[index]];
    const reordered = newFounders.map((f, idx) => ({ ...f, order: idx + 1 }));
    saveData(reordered);
  };

  const toggleVisibility = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = founders.map(f => f.id === id ? { ...f, isVisible: !f.isVisible } : f);
    saveData(updated);
  };

  const startEdit = (founder: Founder, e?: React.MouseEvent) => {
    if (e) {
        e.stopPropagation();
    }
    setSelectedFounder(founder);
    setIsEditing(true);
  };

  const startNew = () => {
    setSelectedFounder({
      id: 0,
      name: "",
      role: "",
      department: "",
      bio: "",
      email: "",
      image: "",
      linkedin: "",
      twitter: "",
      isVisible: true,
      order: founders.length + 1
    });
    setIsEditing(true);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-50 py-4 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion de l'équipe</h1>
          <p className="text-slate-500">Gérez les profils, l'ordre d'affichage et la visibilité.</p>
        </div>
        <button onClick={startNew} className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-colors">
          <span className="material-symbols-outlined text-sm">add</span> Ajouter un membre
        </button>
      </div>

      {showSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 animate-fade-in">
          <span className="material-symbols-outlined">check_circle</span> Modifications enregistrées !
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-3">
          {founders.map((founder, index) => (
            <div 
              key={founder.id} 
              onClick={() => startEdit(founder)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 group relative ${selectedFounder?.id === founder.id ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-200 bg-white hover:border-primary/50'}`}
            >
              <div className="flex flex-col gap-0.5">
                <button onClick={(e) => handleMove(index, 'up', e)} disabled={index === 0} className="text-slate-400 hover:text-primary disabled:opacity-20 hover:bg-slate-100 rounded">
                    <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                </button>
                <button onClick={(e) => handleMove(index, 'down', e)} disabled={index === founders.length - 1} className="text-slate-400 hover:text-primary disabled:opacity-20 hover:bg-slate-100 rounded">
                    <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                </button>
              </div>

              <div className={`relative ${!founder.isVisible && 'opacity-50 grayscale'}`}>
                <img src={founder.image || 'https://via.placeholder.com/100'} alt={founder.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                {!founder.isVisible && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                        <span className="material-symbols-outlined text-white text-sm">visibility_off</span>
                    </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold truncate ${founder.isVisible ? 'text-slate-900' : 'text-slate-500'}`}>{founder.name}</h3>
                <p className="text-xs text-slate-500 truncate">{founder.role}</p>
              </div>

              <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => startEdit(founder, e)}
                    className="p-1 text-slate-400 hover:text-primary hover:bg-primary/5 rounded"
                    title="Modifier"
                >
                    <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button 
                    onClick={(e) => toggleVisibility(founder.id, e)}
                    className={`p-1 rounded hover:bg-slate-100 ${founder.isVisible ? 'text-slate-400 hover:text-blue-500' : 'text-slate-400 hover:text-green-500'}`}
                    title={founder.isVisible ? "Masquer" : "Afficher"}
                >
                    <span className="material-symbols-outlined text-lg">{founder.isVisible ? 'visibility' : 'visibility_off'}</span>
                </button>
                <button 
                    onClick={(e) => handleDelete(founder.id, e)}
                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded"
                    title="Supprimer"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          ))}
          
          {founders.length === 0 && (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">Aucun membre trouvé.</div>
          )}
        </div>

        <div className="lg:col-span-2">
          {isEditing && selectedFounder ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">{selectedFounder.id === 0 ? 'Ajouter un membre' : 'Modifier le profil'}</h2>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100">
                    <span className="text-sm font-medium text-slate-700">Visible sur le site</span>
                    <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${selectedFounder.isVisible ? 'bg-green-500' : 'bg-slate-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${selectedFounder.isVisible ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                    <input type="checkbox" checked={selectedFounder.isVisible} onChange={(e) => setSelectedFounder({...selectedFounder, isVisible: e.target.checked})} className="hidden" />
                </label>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-1/3">
                    <ImageUploadField 
                        label="Photo de profil" 
                        initialImageUrl={selectedFounder.image} 
                        onImageChange={(url) => setSelectedFounder({...selectedFounder, image: url})} 
                        aspectRatio={1} // Force le ratio 1:1 pour les membres
                    />
                    <p className="text-[10px] text-slate-400 mt-2 text-center">Portrait carré recommandé.</p>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Nom complet *</label>
                      <input type="text" value={selectedFounder.name} onChange={(e) => setSelectedFounder({...selectedFounder, name: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Titre / Rôle *</label>
                            <input type="text" value={selectedFounder.role} onChange={(e) => setSelectedFounder({...selectedFounder, role: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" required placeholder="ex: Co-fondateur" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Département</label>
                            <input type="text" value={selectedFounder.department} onChange={(e) => setSelectedFounder({...selectedFounder, department: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="ex: Audit, Juridique..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email Professionnel</label>
                        <input type="email" value={selectedFounder.email} onChange={(e) => setSelectedFounder({...selectedFounder, email: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="nom@comptalink.dz" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Biographie</label>
                  <textarea value={selectedFounder.bio} onChange={(e) => setSelectedFounder({...selectedFounder, bio: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none h-32" placeholder="Courte description de l'expertise..."></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Profil LinkedIn</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">in/</span>
                        <input type="text" value={selectedFounder.linkedin} onChange={(e) => setSelectedFounder({...selectedFounder, linkedin: e.target.value})} className="flex-1 p-2.5 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="URL complète" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Autre lien (Twitter/X)</label>
                    <input type="text" value={selectedFounder.twitter} onChange={(e) => setSelectedFounder({...selectedFounder, twitter: e.target.value})} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="https://..." />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  {selectedFounder.id !== 0 ? (
                    <button type="button" onClick={(e) => handleDelete(selectedFounder.id, e)} className="text-red-500 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">delete</span> Supprimer
                    </button>
                  ) : <div></div>}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
                    <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-colors">Enregistrer</button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 p-8 text-center">
              <span className="material-symbols-outlined text-6xl mb-4 text-slate-300">group</span>
              <p className="text-lg font-medium">Sélectionnez un membre pour le modifier</p>
              <p className="text-sm mt-2">Vous pouvez réorganiser la liste via les flèches à gauche.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFounders;
