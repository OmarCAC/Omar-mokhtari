import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, BlogStatus, Category } from '../../types';
import { BlogService, MOCK_USERS } from '../../services/blogService';
import { userService } from '../../src/services/userService';

const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState<BlogStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // State pour la modification rapide
  const [quickEditPost, setQuickEditPost] = useState<BlogPost | null>(null);
  const [isQuickSaving, setIsQuickSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
        await BlogService.ensureDataInitialized();
        const loadedPosts = await BlogService.getAllPosts();
        const loadedCats = await BlogService.getCategories();
        const loadedUsers = userService.getAllUsers();
        
        setPosts(loadedPosts);
        setCategories(loadedCats);
        setUsers(loadedUsers);

        let views = 0;
        for (const post of loadedPosts) {
            const stats = await BlogService.getStats(post.id);
            views += (stats?.views || 0);
        }
        setTotalViews(views);
    } catch (error) {
        console.error("Erreur chargement blog admin", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer définitivement cet article ?")) {
      await BlogService.deletePost(id);
      loadData();
    }
  };

  const handleTogglePin = async (id: string) => {
    await BlogService.togglePin(id);
    loadData();
  };

  const handleQuickSave = async () => {
    if (!quickEditPost) return;
    setIsQuickSaving(true);
    try {
        await BlogService.savePost(quickEditPost);
        setQuickEditPost(null);
        await loadData();
    } catch (error) {
        alert("Erreur lors de la mise à jour rapide.");
    } finally {
        setIsQuickSaving(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getAuthorName = (id: string) => users.find(u => u.id === id)?.name || 'Inconnu';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Sans catégorie';

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion du Blog</h1>
          <div className="flex items-center gap-4 mt-1">
             <span className="text-slate-500 text-sm">{posts.length} articles</span>
             <span className="text-slate-300">|</span>
             <span className="text-primary text-sm font-bold">{totalViews} vues</span>
          </div>
        </div>
        <Link to="/admin/blog/new" className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
            <span className="material-symbols-outlined text-xl">add</span> Nouvel Article
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
            <div className="flex gap-2">
                {['all', 'published', 'draft', 'review'].map(status => (
                    <button key={status} onClick={() => setFilterStatus(status as any)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === status ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                        {status === 'all' ? 'Tous' : status}
                    </button>
                ))}
            </div>
            <input type="text" placeholder="Rechercher..." className="p-2 border border-slate-200 rounded-lg text-sm w-full md:w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {isLoading ? (
            <div className="p-12 text-center text-slate-400">Chargement...</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-xs">
                        <tr>
                            <th className="p-4 pl-6">Article</th>
                            <th className="p-4">Catégorie</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredPosts.map(post => (
                            <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-4 pl-6">
                                    <div className="font-bold text-slate-900 line-clamp-1">{post.title}</div>
                                    <div className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()} • {getAuthorName(post.authorId)}</div>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                        {getCategoryName(post.categoryId)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                    <div className="flex justify-end gap-1 sm:gap-2">
                                        <button onClick={() => handleTogglePin(post.id)} className={`p-2 rounded hover:bg-slate-100 ${post.isPinned ? 'text-yellow-500' : 'text-slate-300'}`} title="Épingler"><span className="material-symbols-outlined text-xl">star</span></button>
                                        <button 
                                            onClick={() => setQuickEditPost(post)} 
                                            className="p-2 text-primary hover:bg-primary/5 rounded" 
                                            title="Modification rapide"
                                        >
                                            <span className="material-symbols-outlined text-xl">settings_suggest</span>
                                        </button>
                                        <Link to={`/admin/blog/edit/${post.id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded" title="Éditeur complet"><span className="material-symbols-outlined text-xl">edit</span></Link>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Supprimer"><span className="material-symbols-outlined text-xl">delete</span></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* MODALE DE MODIFICATION RAPIDE */}
      {quickEditPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setQuickEditPost(null)}>
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">bolt</span>
                          Modif. Rapide
                      </h3>
                      <button onClick={() => setQuickEditPost(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          <span className="material-symbols-outlined">close</span>
                      </button>
                  </div>
                  
                  <div className="p-8 space-y-6">
                      {/* TITRE */}
                      <div>
                          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Titre de l'article</label>
                          <input 
                              type="text" 
                              value={quickEditPost.title}
                              onChange={e => setQuickEditPost({...quickEditPost, title: e.target.value})}
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold text-slate-900 transition-all"
                              placeholder="Titre de l'article"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          {/* CATEGORIE */}
                          <div>
                              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Catégorie</label>
                              <select 
                                  value={quickEditPost.categoryId}
                                  onChange={e => setQuickEditPost({...quickEditPost, categoryId: e.target.value})}
                                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm font-bold text-slate-700 transition-all cursor-pointer"
                              >
                                  {categories.map(c => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                              </select>
                          </div>

                          {/* STATUT */}
                          <div>
                              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Statut</label>
                              <select 
                                  value={quickEditPost.status}
                                  onChange={e => setQuickEditPost({...quickEditPost, status: e.target.value as BlogStatus})}
                                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm font-bold text-slate-700 transition-all cursor-pointer"
                              >
                                  <option value="draft">Brouillon</option>
                                  <option value="review">En relecture</option>
                                  <option value="ready">Prêt</option>
                                  <option value="published">Publié</option>
                              </select>
                          </div>
                      </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                      <button 
                          onClick={() => setQuickEditPost(null)}
                          className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-colors"
                      >
                          Annuler
                      </button>
                      <button 
                          onClick={handleQuickSave}
                          disabled={isQuickSaving}
                          className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                          {isQuickSaving ? (
                              <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          ) : (
                              <>
                                <span className="material-symbols-outlined">save</span>
                                Enregistrer
                              </>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminBlog;