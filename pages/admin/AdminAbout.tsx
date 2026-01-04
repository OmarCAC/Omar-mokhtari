
import React, { useState, useEffect } from 'react';

interface VisionPillar {
  title: string;
  desc: string;
  icon: string;
  tag: string;
}

interface AboutData {
  heroHeadline: string;
  heroSub: string;
  visionTitle: string;
  visionIntro: string;
  pillars: VisionPillar[];
}

const DEFAULT_DATA: AboutData = {
  heroHeadline: "Bâtir l'infrastructure financière du nouveau siècle.",
  heroSub: "ComptaLink n'est pas qu'un cabinet. C'est le moteur de croissance.",
  visionTitle: "Notre Vision",
  visionIntro: "Nous croyons que la bureaucratie ne devrait jamais freiner le génie algérien.",
  pillars: [
    { tag: "Intelligence", title: "Comptabilité Augmentée", desc: "L'IA traite les données.", icon: "psychology" },
    { tag: "Vitesse", title: "Zéro Friction", desc: "Vos chiffres en temps réel.", icon: "bolt" },
    { tag: "Sécurité", title: "Confiance Totale", desc: "Un coffre-fort numérique.", icon: "shield_with_heart" },
    { tag: "Impact", title: "Croissance DZ", desc: "Propulser l'économie.", icon: "rocket_launch" }
  ]
};

const AdminAbout: React.FC = () => {
  const [data, setData] = useState<AboutData>(DEFAULT_DATA);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('comptalink_about_vision_v2');
    if (saved) {
      try { setData({ ...DEFAULT_DATA, ...JSON.parse(saved) }); } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('comptalink_about_vision_v2', JSON.stringify(data));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    window.dispatchEvent(new Event('storage'));
  };

  const updatePillar = (index: number, field: keyof VisionPillar, value: string) => {
    const newPillars = [...data.pillars];
    newPillars[index] = { ...newPillars[index], [field]: value };
    setData({ ...data, pillars: newPillars });
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8 p-6">
      <div className="flex justify-between items-center sticky top-0 bg-slate-50 py-4 z-10 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configuration Page À Propos</h1>
          <p className="text-slate-500 text-sm">Ce contenu s'adapte automatiquement au thème choisi.</p>
        </div>
        <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark shadow-lg transition-all flex items-center gap-2">
          <span className="material-symbols-outlined">save</span> Publier les modifications
        </button>
      </div>

      {showSuccess && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="material-symbols-outlined">check_circle</span> Mise à jour en ligne réussie !
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest border-b pb-4"><span className="material-symbols-outlined text-primary">rocket</span> Section Impact (Hero)</h2>
        <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-black text-slate-400 uppercase">Grand Titre Monumental</span>
              <input type="text" value={data.heroHeadline} onChange={e => setData({...data, heroHeadline: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xl font-black" />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-400 uppercase">Sous-titre de Vision</span>
              <textarea value={data.heroSub} onChange={e => setData({...data, heroSub: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 h-24" />
            </label>
        </div>
      </div>

      {/* ADN Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest border-b pb-4"><span className="material-symbols-outlined text-primary">diversity_3</span> Notre Vision & ADN</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-xs font-black text-slate-400 uppercase">Titre de la section Vision</span>
              <input type="text" value={data.visionTitle} onChange={e => setData({...data, visionTitle: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-400 uppercase">Introduction textuelle</span>
              <textarea value={data.visionIntro} onChange={e => setData({...data, visionIntro: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 h-24" />
            </label>
        </div>
      </div>

      {/* Pillars Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest border-b pb-4"><span className="material-symbols-outlined text-primary">grid_view</span> Les 4 Piliers de l'Ambition</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.pillars.map((pillar, i) => (
                <div key={i} className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={pillar.tag} onChange={e => updatePillar(i, 'tag', e.target.value)} className="p-2 border rounded-lg text-[10px] font-black uppercase tracking-widest bg-white" placeholder="Badge (ex: Vitesse)" />
                        <input type="text" value={pillar.icon} onChange={e => updatePillar(i, 'icon', e.target.value)} className="p-2 border rounded-lg text-xs font-mono bg-white" placeholder="Nom Icône" />
                    </div>
                    <input type="text" value={pillar.title} onChange={e => updatePillar(i, 'title', e.target.value)} className="w-full p-2 border rounded-lg font-bold text-sm bg-white" placeholder="Titre Pilier" />
                    <textarea value={pillar.desc} onChange={e => updatePillar(i, 'desc', e.target.value)} className="w-full p-2 border rounded-lg text-xs h-16 bg-white" placeholder="Description courte..." />
                </div>
            ))}
        </div>
      </div>

      <div className="p-6 bg-slate-900 rounded-3xl text-white">
          <div className="flex gap-4 items-center">
              <span className="material-symbols-outlined text-primary text-4xl">style</span>
              <div>
                  <p className="text-sm font-bold leading-relaxed">Intelligence Graphique :</p>
                  <p className="text-xs text-slate-400">Les cartes et conteneurs utilisent des classes Tailwind génériques (rounded-3xl). Le système de thèmes de ComptaLink les transformera en bords arrondis, carrés ou néo-brutalistes selon le choix de l'utilisateur.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminAbout;
