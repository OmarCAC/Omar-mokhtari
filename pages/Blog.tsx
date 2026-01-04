
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, Category } from '../types';
import { BlogService } from '../services/blogService';
import { siteSettingsStorage, SiteSettings } from '../services/siteSettingsStorage';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(siteSettingsStorage.getSettings());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const allCategories = await BlogService.getCategories();
            setCategories(allCategories || []);
            const allPosts = await BlogService.getAllPosts();
            setPosts(allPosts || []);
            setSettings(siteSettingsStorage.getSettings());
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const filteredPosts = posts
    .filter(post => {
      const matchCategory = filter === 'all' || post.categoryId === filter;
      const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-500 overflow-x-hidden">
      
      {/* HEADER MAGAZINE DYNAMIQUE */}
      <section className="relative py-48 px-6 overflow-hidden bg-slate-50 dark:bg-slate-900/30">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src={settings.blogHeroImage} className="w-full h-full object-cover" alt="Savoir" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 dark:bg-primary text-white text-[10px] font-black uppercase tracking-[0.5em] mb-12 shadow-2xl">
            LE CERCLE DU SAVOIR • DZ
          </div>
          <h1 className="text-6xl md:text-[10rem] font-black font-display leading-[0.85] tracking-tighter mb-12 text-slate-900 dark:text-white">
            Forger <br/><span className="text-primary italic">l'Intelligence.</span>
          </h1>
          <p className="text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-tight">
            "La connaissance est le seul actif qui prend de la valeur avec le temps. Décryptez les enjeux de demain."
          </p>
        </div>
      </section>

      {/* FILTRES & RECHERCHE */}
      <section className="sticky top-20 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-y border-slate-100 dark:border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-wrap gap-4">
                <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}>Tout</button>
                {categories.map(cat => (
                    <button key={cat.id} onClick={() => setFilter(cat.id)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-400 hover:text-primary'}`}>{cat.name}</button>
                ))}
            </div>
            <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                    type="text" 
                    placeholder="Chercher une expertise..." 
                    className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </section>

      {/* GRILLE MAGAZINE */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {filteredPosts.map((post, idx) => {
            const isLarge = idx === 0 || idx === 5;
            
            return (
              <div key={post.id} className={`${isLarge ? 'lg:col-span-8' : 'lg:col-span-4'} group cursor-pointer`}>
                <Link to={`/blog/${post.id}`}>
                    <div className={`relative overflow-hidden rounded-[3.5rem] shadow-2xl mb-8 ${isLarge ? 'aspect-video' : 'aspect-[4/5]'}`}>
                        <img 
                            src={post.featuredImageUrl} 
                            alt={post.title} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-10 left-10 right-10">
                            <span className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg mb-4 inline-block">
                                {categories.find(c => c.id === post.categoryId)?.name || 'ANALYSE'}
                            </span>
                            <h2 className={`${isLarge ? 'text-4xl md:text-5xl' : 'text-2xl'} font-black text-white font-display tracking-tighter leading-none group-hover:text-primary transition-colors`}>{post.title}</h2>
                        </div>
                    </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA ÉDUCATIF */}
      <section className="py-40 px-6">
          <div className="max-w-7xl mx-auto bg-slate-900 rounded-[5rem] p-20 md:p-32 text-center relative overflow-hidden shadow-2xl">
             <div className="relative z-10">
                <h2 className="text-4xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none">Voulez-vous diriger <br/>ou suivre ?</h2>
                <p className="text-2xl text-white/70 mb-16 max-w-3xl mx-auto font-medium leading-relaxed">
                  Abonnez-vous à notre lettre d'intelligence stratégique pour recevoir chaque mois un décryptage exclusif de l'économie algérienne.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <input type="email" placeholder="votre@email.dz" className="px-8 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white outline-none w-full sm:w-96 text-lg font-bold focus:ring-4 focus:ring-primary/20" />
                    <button className="px-10 py-5 bg-primary text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl text-lg uppercase tracking-widest">S'inscrire</button>
                </div>
             </div>
          </div>
      </section>

      <footer className="py-24 text-center border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950">
         <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[1em] mb-6">
            COMPALIK KNOWLEDGE HUB • L'EXCELLENCE SANS COMPROMIS
         </p>
      </footer>
    </div>
  );
};

export default Blog;
