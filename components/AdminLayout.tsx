
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path 
    ? "bg-primary/10 text-primary font-black border-r-4 border-primary" 
    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold";

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans overflow-hidden transition-colors duration-500">
      {isSidebarOpen && (<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden" onClick={closeSidebar}></div>)}
      
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col md:translate-x-0 md:static md:flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-24 flex items-center px-8 border-b border-slate-100 flex-shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="text-primary transition-transform group-hover:scale-110">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path></svg>
             </div>
             <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">Admin.</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <Link to="/admin" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin')}`}>
            <span className="material-symbols-outlined">dashboard</span>Tableau de bord
          </Link>
          
          <div className="pt-8 pb-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contenu & Médias</div>
          <Link to="/admin/blog" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/blog')}`}>
            <span className="material-symbols-outlined">article</span>Articles & Blog
          </Link>
          <Link to="/admin/services" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/services')}`}>
            <span className="material-symbols-outlined">design_services</span>Pôles d'Expertise
          </Link>
          <Link to="/admin/media" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/media')}`}>
            <span className="material-symbols-outlined">photo_library</span>Médiathèque
          </Link>
          
          <div className="pt-8 pb-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identité & Équipe</div>
          <Link to="/admin/site" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/site')}`}>
            <span className="material-symbols-outlined">auto_fix</span>Identité Visuelle
          </Link>
          {/* NOUVEAU VOLET CONTACT ET RÉSEAUX */}
          <Link to="/admin/site?tab=social" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.search.includes('tab=social') ? 'bg-primary/10 text-primary font-black border-r-4 border-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold'}`}>
            <span className="material-symbols-outlined">contact_support</span>Contact & Réseaux
          </Link>
          <Link to="/admin/fondateurs" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/fondateurs')}`}>
            <span className="material-symbols-outlined">groups</span>Gestion Équipe
          </Link>
          <Link to="/admin/testimonials" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/testimonials')}`}>
            <span className="material-symbols-outlined">forum</span>Témoignages
          </Link>
          
          <div className="pt-8 pb-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Système</div>
          <Link to="/admin/messages" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/messages')}`}>
            <span className="material-symbols-outlined">hub</span>CRM Leads
          </Link>
          <Link to="/admin/ai" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/ai')}`}>
            <span className="material-symbols-outlined">psychology</span>Studio IA
          </Link>
        </nav>
        
        <div className="p-6 border-t border-slate-100 flex-shrink-0">
            <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-500 font-bold transition-colors w-full px-4 py-2 text-sm">
                <span className="material-symbols-outlined text-lg">logout</span>Déconnexion
            </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Console Executive</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/" className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white hover:bg-primary transition-all shadow-lg">
                <span className="material-symbols-outlined text-sm">public</span>
            </Link>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
