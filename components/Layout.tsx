
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { siteSettingsStorage, SiteSettings } from '../services/siteSettingsStorage';
import { useAuth } from '../src/context/AuthContext';
import ThemeSwitcher from '../src/components/ThemeSwitcher';
import AiAssistant from '../src/components/AiAssistant';

const Layout: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsStorage.getSettings());
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleRefresh = () => {
      setSettings(siteSettingsStorage.getSettings());
      setLogoError(false);
    };
    
    window.addEventListener('site-settings-updated', handleRefresh);
    window.addEventListener('storage', handleRefresh);
    
    return () => {
      window.removeEventListener('site-settings-updated', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, []);

  const visibleMenu = settings.mainMenu
    .filter(m => m.isVisible)
    .filter(m => {
        if (m.accessLevel === 'public') return true;
        if (m.accessLevel === 'member' && isAuthenticated) return true;
        if (m.accessLevel === 'admin' && user?.role === 'admin') return true;
        return false;
    })
    .sort((a, b) => a.order - b.order);

  const companyName = settings.companyName || "Compalik";

  const getSocialIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'facebook': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>;
      case 'instagram': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.947.193 4.337 2.609 6.759 6.911 6.941 1.279.053 1.622.063 4.454.067l.565.004c3.259 0 3.667-.014 4.947-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
      case 'linkedin': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
      case 'whatsapp': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.89 4.44-9.892 9.886-.001 2.225.614 3.891 1.732 5.526l-1.02 3.721 3.78-1.001zm11.374-6.603c-.312-.156-1.848-.912-2.134-1.017-.286-.104-.494-.156-.701.156-.207.312-.803 1.017-.984 1.225-.181.208-.363.234-.675.078-.312-.156-1.318-.486-2.51-1.549-.928-.827-1.554-1.849-1.735-2.161-.181-.312-.02-.481.136-.636.141-.14.312-.364.468-.546.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.546-.078-.156-.701-1.688-.961-2.312-.253-.607-.51-.525-.701-.535-.181-.01-.389-.012-.597-.012s-.545.078-.83.39c-.286.312-1.091 1.066-1.091 2.6 0 1.534 1.117 3.016 1.273 3.225.156.208 2.197 3.355 5.323 4.704.743.322 1.325.513 1.777.657.747.237 1.427.204 1.965.124.6-.09 1.847-.754 2.108-1.482.261-.728.261-1.352.183-1.482-.078-.13-.286-.208-.598-.364z"/></svg>;
      case 'tiktok': return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.032 2.61.123 3.855.458.153.044.205.062.205.162.01.62.062 1.238.155 1.85.056.381.115.759.188 1.137.042.208.007.311-.169.408a5.585 5.585 0 0 1-2.823.771 5.59 5.59 0 0 1-5.064-3.23c-.08-.176-.14-.364-.205-.546-.062-.174-.125-.346-.157-.534-.038-.201-.06-.402-.068-.603C8.441.134 10.42 0 12.525.02zM12.537 23.98c-2.091.02-4.045-.107-6.002-.563-2.12-.494-3.927-1.482-5.323-3.084-1.398-1.604-2.152-3.518-2.147-5.624.006-2.112.766-4.027 2.176-5.632 1.411-1.605 3.221-2.585 5.342-3.064 1.965-.443 3.915-.554 6.006-.511 2.09-.043 4.041.068 6.006.511 2.12.479 3.931 1.459 5.342 3.064 1.41 1.605 2.17 3.52 2.176 5.632.005 2.106-.749 4.02-2.147 5.624-1.396 1.602-3.203 2.59-5.323 3.084-1.957.456-3.911.583-6.002.563z"/></svg>;
      default: return null;
    }
  };

  const getSocialLink = (key: string, value: string) => {
    if (!value || value === '#' || value === '213' || value === '') return null;
    if (key.toLowerCase() === 'whatsapp') {
      const clean = value.replace(/\D/g, '');
      return `https://wa.me/${clean}`;
    }
    return value.startsWith('http') ? value : `https://${value}`;
  };

  return (
    <div className="flex flex-col min-h-screen font-body bg-background-light dark:bg-slate-900 transition-colors duration-500">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              {/* LOGO ET NOM ALIGNÉS CÔTE À CÔTE */}
              <div className="flex items-center gap-3">
                {settings.logo && !logoError ? (
                    <img 
                      src={settings.logo} 
                      alt={companyName} 
                      onError={() => setLogoError(true)} 
                      className="h-10 w-auto max-w-[120px] object-contain transition-transform group-hover:scale-105" 
                    />
                ) : (
                    <div className="text-primary transition-transform group-hover:scale-110">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path></svg>
                    </div>
                )}
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter font-display uppercase italic whitespace-nowrap">
                  {companyName}
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center justify-center flex-1 px-8 gap-6 lg:gap-10">
              {visibleMenu.map(item => (
                <Link key={item.id} to={item.path} className={`text-sm transition-all flex items-center gap-1.5 ${location.pathname === item.path ? 'text-primary font-black' : 'text-slate-500 hover:text-primary font-bold'}`}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              {isAuthenticated ? (
                <div className="relative">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-10 h-10 rounded-xl border-2 border-primary/20 overflow-hidden hover:border-primary transition-all"><img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} alt="Avatar" /></button>
                    {showUserMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-50 animate-fade-in">
                                <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-700 mb-2">
                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user?.name}</p>
                                    <p className="text-[10px] text-primary font-bold uppercase">{user?.role}</p>
                                </div>
                                <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"><span className="material-symbols-outlined text-sm">dashboard</span> Mon Espace</Link>
                                {user?.role === 'admin' && <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/5"><span className="material-symbols-outlined text-sm">shield_person</span> Administration</Link>}
                                <button onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><span className="material-symbols-outlined text-sm">logout</span> Déconnexion</button>
                            </div>
                        </>
                    )}
                </div>
              ) : (
                <Link to="/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all">Accès Client</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
        <AiAssistant />
      </main>

      <footer className="bg-white dark:bg-slate-950 pt-24 pb-12 border-t border-slate-100 dark:border-slate-800">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
                <div className="md:col-span-4">
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        {/* REPRODUCTION DU LOGO + NOM DANS LE FOOTER */}
                        <div className="flex items-center gap-3">
                          {settings.logo && !logoError ? (
                              <img src={settings.logo} alt={companyName} className="h-10 w-auto max-w-[120px] object-contain" onError={() => setLogoError(true)} />
                          ) : (
                              <div className="text-primary">
                                  <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path></svg>
                              </div>
                          )}
                          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter font-display uppercase italic">{companyName}</span>
                        </div>
                    </Link>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic mb-8">"{settings.footerText}"</p>
                    
                    {/* RÉSEAUX SOCIAUX SOUS LE LOGO */}
                    <div className="flex gap-4">
                        {Object.entries(settings.socialLinks).map(([key, value]) => {
                            const url = getSocialLink(key, value);
                            if (!url) return null;
                            return (
                                <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all hover:scale-110 shadow-sm">
                                    {getSocialIcon(key)}
                                </a>
                            );
                        })}
                    </div>
                </div>
                
                <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] mb-8">Navigation</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-500">
                            {visibleMenu.slice(0, 5).map(m => (
                                <li key={m.id}><Link to={m.path} className="hover:text-primary transition-colors">{m.label}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] mb-8">Légal</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-500">
                            <li><Link to="/legal/mentions-legales" className="hover:text-primary transition-colors">Confidentialité</Link></li>
                            <li><Link to="/legal/conditions-utilisation" className="hover:text-primary transition-colors">CGU</Link></li>
                        </ul>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] mb-8">Contact Direct</h4>
                        <div className="space-y-6 text-sm font-bold text-slate-500">
                            <p className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-lg">mail</span> {settings.email}</p>
                            <p className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-lg">call</span> {settings.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="pt-12 border-t border-slate-50 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <p>© {new Date().getFullYear()} {companyName} • Algeria Executive Solutions</p>
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="hover:text-primary transition-colors">Console Admin</Link>
                </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default Layout;
