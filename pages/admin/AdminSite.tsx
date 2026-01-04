
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteSettings, siteSettingsStorage, ThemeCustomization } from '../../services/siteSettingsStorage';
import { useNotification } from '../../src/context/NotificationContext';
import ImageUploadField from '../../components/ImageUploadField';
import { THEMES } from '../../src/styles/themes';
import { useTheme } from '../../src/hooks/useTheme';

const FONT_OPTIONS = [
  { id: 'Manrope', label: 'Manrope (Moderne)' },
  { id: 'Plus Jakarta Sans', label: 'Jakarta (Épuré)' },
  { id: 'Montserrat', label: 'Montserrat (Institutionnel)' },
  { id: 'Space Grotesk', label: 'Grotesk (Technique)' }
];

const RADIUS_OPTIONS = [
  { id: '0px', label: 'Carré (Luxe/Archi)' },
  { id: '8px', label: 'Léger' },
  { id: '16px', label: 'Standard' },
  { id: '32px', label: ' स्टार्टअप (Startup)' }
];

const AdminSite: React.FC = () => {
  const location = useLocation();
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsStorage.getSettings());
  const [activeTab, setActiveTab] = useState<'branding' | 'home' | 'theme' | 'social'>('branding');
  const { addNotification } = useNotification();
  const { setTheme, refresh } = useTheme();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (['social', 'branding', 'home', 'theme'].includes(tabParam || '')) {
      setActiveTab(tabParam as any);
    }
  }, [location]);

  const handleSaveSettings = () => {
    siteSettingsStorage.saveSettings(settings);
    addNotification('success', 'Design publié avec succès.');
    refresh(); // Forcer le hook à réappliquer
  };

  const updateCustomization = (themeId: string, updates: Partial<ThemeCustomization>) => {
    const currentCustoms = settings.themeCustomizations[themeId] || {};
    const newSettings = {
        ...settings,
        themeCustomizations: {
            ...settings.themeCustomizations,
            [themeId]: { ...currentCustoms, ...updates }
        }
    };
    setSettings(newSettings);
    // On sauvegarde et on rafraîchit immédiatement l'UI pour le mode "Live"
    siteSettingsStorage.saveSettings(newSettings);
    refresh();
  };

  const handleThemeSelect = (themeId: string) => {
    setSettings({ ...settings, defaultThemeId: themeId });
    setTheme(themeId);
    localStorage.removeItem('comptalink_theme_id');
  };

  const currentThemeCustom = settings.themeCustomizations[settings.defaultThemeId] || {};
  const currentThemeBase = THEMES.find(t => t.id === settings.defaultThemeId) || THEMES[0];
  const activeFont = currentThemeCustom.fontDisplay || currentThemeBase.fonts.display;

  return (
    <div className="max-w-6xl mx-auto pb-20 p-4 font-display animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-30 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Studio de Marque</h1>
          <p className="text-slate-500 text-sm">Contrôlez l'image et l'ADN visuel du cabinet.</p>
        </div>
        <button onClick={handleSaveSettings} className="px-8 py-3 bg-primary text-white rounded-xl font-black hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">publish</span>
            Publier le Design
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-2">
            {[
                { id: 'branding', label: 'Logo & Nom', icon: 'verified' },
                { id: 'home', label: 'Visuels Hero', icon: 'image' },
                { id: 'social', label: 'Contact & Réseaux', icon: 'contact_support' },
                { id: 'theme', label: 'Style & Couleurs', icon: 'palette' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'}`}
                >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>

        <div className="lg:col-span-9 space-y-8">
            {activeTab === 'branding' && (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 animate-fade-in">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter border-b pb-4">Identité Visuelle</h2>
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Nom du Cabinet</label>
                                <input value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Aperçu Header</h4>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="flex items-center gap-3">
                                        {settings.logo ? (
                                            <img src={settings.logo} alt="Logo" className="h-8 w-auto object-contain" />
                                        ) : (
                                            <div className="text-primary"><svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path></svg></div>
                                        )}
                                        <span 
                                          className="font-black italic uppercase text-lg tracking-tighter whitespace-nowrap"
                                          style={{ fontFamily: `'${activeFont}', sans-serif` }}
                                        >
                                          {settings.companyName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ImageUploadField label="Logo Officiel" initialImageUrl={settings.logo} onImageChange={(url) => setSettings({...settings, logo: url})} />
                    </div>
                </div>
            )}

            {activeTab === 'home' && (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 animate-fade-in">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter border-b pb-4">Visuels Page d'Accueil</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Grand Titre (Hero)</label><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg" value={settings.homeHeroTitle} onChange={e => setSettings({...settings, homeHeroTitle: e.target.value})} /></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Sous-titre Vision</label><textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium h-32" value={settings.homeHeroSubtitle} onChange={e => setSettings({...settings, homeHeroSubtitle: e.target.value})} /></div>
                        </div>
                        <ImageUploadField label="Image de fond Hero" initialImageUrl={settings.homeHeroImage} onImageChange={(url) => setSettings({...settings, homeHeroImage: url})} />
                    </div>
                </div>
            )}

            {activeTab === 'theme' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Choix du Preset */}
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter border-b pb-6 mb-6">1. Sélectionner une Ambiance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {THEMES.map((theme) => (
                                <div key={theme.id} onClick={() => handleThemeSelect(theme.id)} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${settings.defaultThemeId === theme.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
                                    <div className="w-full h-12 rounded-lg mb-3" style={{ backgroundColor: theme.colors.primary }}></div>
                                    <h3 className="font-bold text-[10px] uppercase text-slate-900 text-center">{theme.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Personnalisation Précise */}
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter border-b pb-6 mb-8">2. Personnalisation de l'Expert</h2>
                        
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Couleurs */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Palettes de Couleurs</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full border border-slate-200" style={{ backgroundColor: currentThemeCustom.primary || currentThemeBase.colors.primary }}></div>
                                            <span className="text-sm font-bold text-slate-700">Couleur Primaire</span>
                                        </div>
                                        <input 
                                            type="color" 
                                            value={currentThemeCustom.primary || currentThemeBase.colors.primary} 
                                            onChange={e => updateCustomization(settings.defaultThemeId, { primary: e.target.value })}
                                            className="w-10 h-10 border-0 bg-transparent cursor-pointer" 
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full border border-slate-200" style={{ backgroundColor: currentThemeCustom.accent || currentThemeBase.colors.accent }}></div>
                                            <span className="text-sm font-bold text-slate-700">Couleur d'Accent</span>
                                        </div>
                                        <input 
                                            type="color" 
                                            value={currentThemeCustom.accent || currentThemeBase.colors.accent} 
                                            onChange={e => updateCustomization(settings.defaultThemeId, { accent: e.target.value })}
                                            className="w-10 h-10 border-0 bg-transparent cursor-pointer" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Typographie & UI */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Styles d'écriture & UI</h3>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Police des Titres</label>
                                    <select 
                                        value={currentThemeCustom.fontDisplay || currentThemeBase.fonts.display}
                                        onChange={e => updateCustomization(settings.defaultThemeId, { fontDisplay: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                                    >
                                        {FONT_OPTIONS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Courbure des composants (Arrondis)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {RADIUS_OPTIONS.map(r => (
                                            <button 
                                                key={r.id}
                                                onClick={() => updateCustomization(settings.defaultThemeId, { radius: r.id })}
                                                className={`py-2 px-3 rounded-lg text-[10px] font-black border uppercase transition-all ${ (currentThemeCustom.radius || currentThemeBase.ui.radius) === r.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-primary' }`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Zone de test rapide */}
                        <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Aperçu en temps réel</h4>
                            <div className="bg-white p-6 rounded-theme shadow-theme border border-slate-100 w-full max-w-sm">
                                <h5 className="font-display text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: currentThemeCustom.fontDisplay || currentThemeBase.fonts.display }}>Titre de test</h5>
                                <p className="text-slate-500 text-sm mb-6">Ceci est un exemple du rendu de votre police de corps.</p>
                                <button className="px-6 py-2 bg-primary text-white font-black rounded-lg text-xs" style={{ backgroundColor: currentThemeCustom.primary || currentThemeBase.colors.primary }}>Bouton Primaire</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'social' && (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10 animate-fade-in">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter border-b pb-4 mb-8">Coordonnées & Réseaux Sociaux</h2>
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Coordonnées de Base</h3>
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Email Public</label><input value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" /></div>
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Téléphone</label><input value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" /></div>
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Adresse du Siège</label><textarea value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none h-24" /></div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Écosystème Digital</h3>
                                <div className="space-y-4">
                                    {['linkedin', 'instagram', 'facebook', 'tiktok', 'whatsapp'].map(platform => (
                                        <div key={platform} className="group">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-2 capitalize">{platform}</label>
                                            <input 
                                                value={(settings.socialLinks as any)[platform]} 
                                                onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, [platform]: e.target.value}})} 
                                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-primary/20" 
                                                placeholder={`Lien ${platform}`} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminSite;
