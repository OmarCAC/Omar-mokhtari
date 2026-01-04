
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SavedProject, userStorage } from '../src/services/userStorage';
import { useAuth } from '../src/context/AuthContext';
import { useNotification } from '../src/context/NotificationContext';
import { FISCAL_EVENTS_2025 } from '../src/modules/tools/services/fiscalCalendarData';
import { regulatoryService, RegulatoryAlert } from '../src/services/regulatoryService';
import { BlogService } from '../services/blogService';
import { BlogPost } from '../types';

const UserDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotification();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [alerts, setAlerts] = useState<RegulatoryAlert[]>([]);
  const [latestExpertises, setLatestExpertises] = useState<BlogPost[]>([]);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [showProfileComplete, setShowProfileComplete] = useState(!user?.companyName);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('reg-alerts-updated', handleUpdate);
    return () => window.removeEventListener('reg-alerts-updated', handleUpdate);
  }, [user]);

  const loadData = async () => {
    const p = await userStorage.getProjects();
    setProjects(p);
    
    // Charger les alertes de veille
    setAlerts(regulatoryService.getAlerts().slice(0, 3));
    
    // Charger les derniers articles de blog (expertises)
    const posts = await BlogService.getAllPosts();
    setLatestExpertises(posts.filter(p => p.status === 'published').slice(0, 2));

    const next = FISCAL_EVENTS_2025.find(e => new Date(e.date) >= new Date());
    setNextEvent(next || FISCAL_EVENTS_2025[0]);
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      updateUser({
          companyName: formData.get('companyName') as string,
          nif: formData.get('nif') as string,
          address: formData.get('address') as string
      });
      setShowProfileComplete(false);
      addNotification('success', 'Profil entreprise mis à jour !');
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terminal Utilisateur</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-slate-900 leading-none">{user?.name}</p>
                    <p className="text-[10px] text-primary font-bold uppercase mt-1">{user?.role}</p>
                </div>
                <img src={user?.avatar} className="w-10 h-10 rounded-xl border-2 border-primary/20 shadow-md" alt="Avatar" />
            </div>
        </div>
      </nav>

      <div className="max-w-[1800px] mx-auto p-6 md:p-12">
        
        <header className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-4">
                Quartier <span className="text-primary italic">Général.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-2xl">
                Pilotez votre conformité et votre croissance depuis une interface unique.
            </p>
        </header>

        {showProfileComplete && (
            <div className="mb-12 bg-white border border-primary/20 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-9xl text-primary">contact_page</span>
                </div>
                <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Finalisez votre profil entreprise.</h3>
                        <p className="text-slate-500 mb-6 font-medium">Ces informations permettent à notre IA de personnaliser vos rapports d'audit.</p>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <input name="companyName" placeholder="Raison sociale" required className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="nif" placeholder="NIF" className="p-3 bg-slate-50 border rounded-xl outline-none" />
                                <input name="address" placeholder="Ville" className="p-3 bg-slate-50 border rounded-xl outline-none" />
                            </div>
                            <button type="submit" className="px-6 py-3 bg-primary text-white font-black rounded-xl hover:bg-primary-dark transition-all shadow-lg">Sauvegarder</button>
                        </form>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-8 space-y-8">
                <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm min-h-[400px]">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Projets & Documents</h2>
                        <Link to="/outils" className="text-primary font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-1">Nouvelle Mission <span className="material-symbols-outlined text-sm">add_circle</span></Link>
                    </div>

                    {projects.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                             <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">inventory_2</span>
                             <p className="text-slate-400 font-bold">Aucun document sauvegardé.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map(p => (
                                <div key={p.id} className="p-6 bg-[#FDFBF7] border border-slate-100 rounded-[2rem] hover:shadow-xl transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                                            <span className="material-symbols-outlined">{p.type === 'invoice' ? 'receipt_long' : 'rocket_launch'}</span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-slate-400">{new Date(p.date).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-black text-slate-900 text-lg mb-1">{p.name}</h4>
                                    <p className="text-xs text-primary font-bold uppercase tracking-widest">{p.type}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: 'Facturation', icon: 'receipt', link: '/outils/facturation', color: 'bg-blue-500' },
                        { title: 'Expert IA', icon: 'psychology', link: '/expert-ai', color: 'bg-purple-600' },
                        { title: 'Fiscalité', icon: 'event', link: '/outils/calendrier-fiscal', color: 'bg-red-500' }
                    ].map(tool => (
                        <Link key={tool.title} to={tool.link} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group">
                            <div className={`w-14 h-14 ${tool.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined text-3xl">{tool.icon}</span>
                            </div>
                            <h4 className="font-black text-slate-900">{tool.title}</h4>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
                {nextEvent && (
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <span className="material-symbols-outlined text-9xl">notifications_active</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-10">Échéance Proche</p>
                        <h4 className="text-4xl font-black mb-2 tracking-tighter leading-none">{new Date(nextEvent.date).getDate()} {new Date(nextEvent.date).toLocaleString('fr-FR', { month: 'long' })}</h4>
                        <p className="text-lg font-bold text-slate-300 mb-10">{nextEvent.title}</p>
                        <Link to="/outils/calendrier-fiscal" className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl text-center block hover:bg-primary hover:text-white transition-all shadow-xl">Gérer</Link>
                    </div>
                )}

                {/* BLOC VEILLE DYNAMIQUE */}
                <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-8">Veille Réglementaire</h3>
                    <div className="space-y-8">
                        {/* 1. Affichage des Flashs de l'admin */}
                        {alerts.map(alert => (
                            <div key={alert.id} className={`border-l-4 pl-6 ${alert.level === 'critical' ? 'border-red-500' : alert.level === 'warning' ? 'border-orange-500' : 'border-primary'}`}>
                                <p className={`text-[10px] font-black uppercase mb-1 ${alert.level === 'critical' ? 'text-red-500' : alert.level === 'warning' ? 'text-orange-500' : 'text-primary'}`}>
                                    {alert.title}
                                </p>
                                <p className="text-sm font-bold text-slate-800 leading-snug">{alert.content}</p>
                                <span className="text-[9px] text-slate-400 font-bold mt-1 block uppercase">Actualité Flash</span>
                            </div>
                        ))}

                        {/* 2. Affichage des derniers articles (Expertises) */}
                        {latestExpertises.map(post => (
                            <Link key={post.id} to={`/blog/${post.id}`} className="block border-l-4 border-slate-200 pl-6 group">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 group-hover:text-primary transition-colors">Expertise</p>
                                <p className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors leading-snug">{post.title}</p>
                                <span className="text-[9px] text-primary font-black mt-1 block uppercase tracking-widest">Lire l'analyse →</span>
                            </Link>
                        ))}
                        
                        {alerts.length === 0 && latestExpertises.length === 0 && (
                            <p className="text-xs text-slate-400 italic">Aucune actualité récente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
