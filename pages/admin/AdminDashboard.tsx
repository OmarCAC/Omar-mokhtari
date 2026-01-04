
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogService } from '../../services/blogService';
import { contactStorage } from '../../src/modules/contact/services/contactStorage';
import { userService } from '../../src/services/userService';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    quotes: 0,
    articles: 0,
    storage: 0
  });

  useEffect(() => {
    loadStats();
    const handleUpdate = () => loadStats();
    window.addEventListener('comptalink-users-changed', handleUpdate);
    return () => window.removeEventListener('comptalink-users-changed', handleUpdate);
  }, []);

  const loadStats = async () => {
      const posts = await BlogService.getAllPosts();
      const messages = await contactStorage.getStats();
      const allUsers = userService.getAllUsers();
      
      setStats({
          users: allUsers.length,
          quotes: messages.quotes,
          articles: posts.length,
          storage: 15 // Valeur simulée en %
      });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Cabinet <span className="text-primary italic">Compalik.</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Interface de contrôle de l'infrastructure digitale.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
            { label: 'Comptes Clients', value: stats.users, color: 'text-primary', icon: 'groups' },
            { label: 'Leads (Devis)', value: stats.quotes, color: 'text-green-600', icon: 'request_quote' },
            { label: 'Expertises Publiées', value: stats.articles, color: 'text-blue-600', icon: 'article' },
            { label: 'Espace Cloud', value: stats.storage + '%', color: 'text-orange-600', icon: 'database' }
        ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-500 group">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                <p className={`text-4xl font-black mt-2 tracking-tighter ${stat.color}`}>{stat.value}</p>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-widest">
                <span className="material-symbols-outlined text-primary">edit_note</span> Rédaction
            </h2>
            <div className="space-y-3">
                <Link to="/admin/blog/new" className="flex items-center justify-between p-4 bg-slate-50 hover:bg-primary/10 rounded-2xl text-sm font-bold text-slate-700 transition-all group border border-slate-100">
                    <span>Créer une expertise</span>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">add_circle</span>
                </Link>
                <Link to="/admin/media" className="flex items-center justify-between p-4 bg-slate-50 hover:bg-primary/10 rounded-2xl text-sm font-bold text-slate-700 transition-all group border border-slate-100">
                    <span>Bibliothèque visuelle</span>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">photo_library</span>
                </Link>
            </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
            <h2 className="text-lg font-black mb-8 flex items-center gap-3 uppercase tracking-widest text-primary">
                <span className="material-symbols-outlined">hub</span> CRM & IA
            </h2>
            <div className="space-y-3">
                <Link to="/admin/messages" className="flex items-center justify-between p-4 bg-white/5 hover:bg-primary/20 rounded-2xl text-sm font-bold transition-all group border border-white/5">
                    <span>Journal des Leads</span>
                    <span className="material-symbols-outlined text-white/30 group-hover:text-primary">mail</span>
                </Link>
                <Link to="/admin/ai" className="flex items-center justify-between p-4 bg-white/5 hover:bg-primary/20 rounded-2xl text-sm font-bold transition-all group border border-white/5">
                    <span>Cerveaux IA (Experts)</span>
                    <span className="material-symbols-outlined text-white/30 group-hover:text-primary">psychology</span>
                </Link>
            </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-widest">
                <span className="material-symbols-outlined text-primary">group</span> Membres
            </h2>
            <div className="space-y-3">
                <Link to="/admin/users" className="flex items-center justify-between p-4 bg-slate-50 hover:bg-primary/10 rounded-2xl text-sm font-bold text-slate-700 transition-all group border border-slate-100">
                    <span>Comptes Actifs</span>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">manage_accounts</span>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
