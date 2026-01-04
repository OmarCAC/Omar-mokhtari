
import React, { useState, useEffect } from 'react';
import { siteSettingsStorage, SiteSettings } from '../services/siteSettingsStorage';
import { contactStorage } from '../src/modules/contact/services/contactStorage';

const Contact: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsStorage.getSettings());
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setSettings(siteSettingsStorage.getSettings());
    window.addEventListener('site-settings-updated', handleUpdate);
    return () => window.removeEventListener('site-settings-updated', handleUpdate);
  }, []);

  const formatSocialLink = (key: string, value: string) => {
    if (!value || value === '#' || value === '213' || value === '') return null;
    if (key.toLowerCase() === 'whatsapp') {
      const clean = value.replace(/\D/g, '');
      return `https://wa.me/${clean}`;
    }
    return value.startsWith('http') ? value : `https://${value}`;
  };

  const getSocialIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'facebook': return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>;
      case 'instagram': return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.947.193 4.337 2.609 6.759 6.911 6.941 1.279.053 1.622.063 4.454.067l.565.004c3.259 0 3.667-.014 4.947-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
      case 'linkedin': return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
      case 'whatsapp': return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.89 4.44-9.892 9.886-.001 2.225.614 3.891 1.732 5.526l-1.02 3.721 3.78-1.001zm11.374-6.603c-.312-.156-1.848-.912-2.134-1.017-.286-.104-.494-.156-.701.156-.207.312-.803 1.017-.984 1.225-.181.208-.363.234-.675.078-.312-.156-1.318-.486-2.51-1.549-.928-.827-1.554-1.849-1.735-2.161-.181-.312-.02-.481.136-.636.141-.14.312-.364.468-.546.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.546-.078-.156-.701-1.688-.961-2.312-.253-.607-.51-.525-.701-.535-.181-.01-.389-.012-.597-.012s-.545.078-.83.39c-.286.312-1.091 1.066-1.091 2.6 0 1.534 1.117 3.016 1.273 3.225.156.208 2.197 3.355 5.323 4.704.743.322 1.325.513 1.777.657.747.237 1.427.204 1.965.124.6-.09 1.847-.754 2.108-1.482.261-.728.261-1.352.183-1.482-.078-.13-.286-.208-.598-.364z"/></svg>;
      case 'twitter': return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
      case 'tiktok': return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.032 2.61.123 3.855.458.153.044.205.062.205.162.01.62.062 1.238.155 1.85.056.381.115.759.188 1.137.042.208.007.311-.169.408a5.585 5.585 0 0 1-2.823.771 5.59 5.59 0 0 1-5.064-3.23c-.08-.176-.14-.364-.205-.546-.062-.174-.125-.346-.157-.534-.038-.201-.06-.402-.068-.603C8.441.134 10.42 0 12.525.02zM12.537 23.98c-2.091.02-4.045-.107-6.002-.563-2.12-.494-3.927-1.482-5.323-3.084-1.398-1.604-2.152-3.518-2.147-5.624.006-2.112.766-4.027 2.176-5.632 1.411-1.605 3.221-2.585 5.342-3.064 1.965-.443 3.915-.554 6.006-.511 2.09-.043 4.041.068 6.006.511 2.12.479 3.931 1.459 5.342 3.064 1.41 1.605 2.17 3.52 2.176 5.632.005 2.106-.749 4.02-2.147 5.624-1.396 1.602-3.203 2.59-5.323 3.084-1.957.456-3.911.583-6.002.563z"/></svg>;
      default: return <span className="material-symbols-outlined">link</span>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      contactStorage.createMessage({
        type: 'contact',
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      });
      setSuccess(true);
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
      setIsSubmitting(false);
      setTimeout(() => setSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-32 px-6 transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-32 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 dark:bg-primary text-white text-[10px] font-black uppercase tracking-[0.5em] mb-12 shadow-2xl">
                BUREAU DES RELATIONS ÉLITES
            </div>
            <h1 className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter leading-[0.85] font-display max-w-4xl">
                Entrez dans <br/><span className="text-primary italic">l'alliance.</span>
            </h1>
            <p className="text-2xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
              Pour des questions de souveraineté financière ou d'expansion, demandez une audience avec nos conseillers stratégiques.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* INFOS CONTACT */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <span className="material-symbols-outlined text-[200px]">support_agent</span>
                </div>
                <div className="relative z-10 space-y-12">
                    <div className="flex items-start gap-8 group">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all"><span className="material-symbols-outlined text-4xl">call</span></div>
                        <div>
                            <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em] mb-2">Conciergerie</p>
                            <p className="font-black text-2xl tracking-tighter">{settings.phone}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-8 group">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all"><span className="material-symbols-outlined text-4xl">mail</span></div>
                        <div>
                            <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em] mb-2">Canal Officiel</p>
                            <p className="font-black text-xl break-all tracking-tighter">{settings.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RÉSEAUX SOCIAUX */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8">Écosystème Digital</p>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(settings.socialLinks).map(([key, value]) => {
                        const url = formatSocialLink(key, value);
                        if (!url) return null;
                        return (
                            <a 
                                key={key} href={url} target="_blank" rel="noopener noreferrer" 
                                className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary/30 transition-all group shadow-sm"
                            >
                                <div className="mb-3 transition-transform group-hover:scale-110">
                                    {getSocialIcon(key)}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{key}</span>
                            </a>
                        );
                    })}
                </div>
            </div>
          </div>

          {/* FORMULAIRE */}
          <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-900/50 p-12 md:p-24 rounded-[5rem] shadow-sm border border-slate-100 dark:border-slate-800 relative transition-all">
            {success ? (
              <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in">
                <div className="w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-8 shadow-inner"><span className="material-symbols-outlined text-6xl">verified</span></div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Audience programmée.</h3>
                <p className="text-xl text-slate-600 dark:text-slate-300 font-medium max-w-sm">Notre équipe examine votre demande. Un expert vous recontactera sous 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Dénomination ou Nom *</label>
                        <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full py-4 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary text-2xl font-black text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-100" placeholder="A. BOUDIAF" />
                    </div>
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Email Professionnel *</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full py-4 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary text-2xl font-black text-slate-900 dark:text-white outline-none transition-all" placeholder="directeur@societe.dz" />
                    </div>
                </div>
                <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Projet ou Requête d'expertise *</label>
                    <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full py-4 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary text-xl font-medium text-slate-700 dark:text-slate-300 outline-none transition-all h-32 resize-none" placeholder="Décrivez votre vision stratégique..." />
                </div>
                <button type="submit" disabled={isSubmitting} className="group w-full py-8 bg-slate-900 dark:bg-primary text-white font-black text-2xl rounded-full hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex justify-center items-center gap-6 disabled:opacity-70 uppercase tracking-tighter">
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin text-4xl">sync</span> : <>Soumettre à l'expertise <span className="material-symbols-outlined text-4xl group-hover:translate-x-3 transition-transform">arrow_forward_ios</span></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
