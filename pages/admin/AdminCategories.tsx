
import React, { useState, useEffect } from 'react';
import { BlogService } from '../../services/blogService';
import { Category } from '../../types';

// Palette de couleurs "Stitch" (cohérente avec le reste du site)
const PRESET_COLORS = [
  { label: 'Rouge (Fiscalité)', class: 'bg-red-100 text-red-800' },
  { label: 'Bleu (Juridique)', class: 'bg-blue-100 text-blue-800' },
  { label: 'Vert (Social)', class: 'bg-green-100 text-green-800' },
  { label: 'Violet (Entrepreneuriat)', class: 'bg-purple-100 text-purple-800' },
  { label: 'Indigo (Techno)', class: 'bg-indigo-100 text-indigo-800' },
  { label: 'Orange (Conseils)', class: 'bg-orange-100 text-orange-800' },
  { label: 'Jaune (Alerte)', class: 'bg-yellow-100 text-yellow-800' },
  { label: 'Gris (Neutre)', class: 'bg-slate-100 text-slate-800' },
  { label: 'Teal (Spécial)', class: 'bg-teal-100 text-teal-800' },
  { label: 'Rose (Event)', class: 'bg-pink-100 text-pink-800' },
];

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCat, setEditingCat] = useState<Partial<Category>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
        const cats = await BlogService.getCategories();
        setCategories(cats || []);
    } catch (error) {
        setCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat.name) return;

    const slug = editingCat.slug || editingCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const catToSave = {
        id: editingCat.id || Date.now().toString(),
        name: editingCat.name,
        slug: slug,
        color: editingCat.color || PRESET_COLORS[0].class,
        description: editingCat.description || '',
        isVisible: editingCat.isVisible !== false 
    };

    await BlogService.saveCategory(catToSave);
    await loadCategories();
    resetForm();
  };

  const handleEdit = (cat: Category) => {
    setEditingCat(cat);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer cette catégorie ?")) {
        await BlogService.deleteCategory(id);
        await loadCategories();
    }
  };

  const handleToggleVisibility = async (cat: Category) => {
    const updatedCat = { ...cat, isVisible: !cat.isVisible };
    await BlogService.saveCategory(updatedCat);
    await loadCategories();
  };

  const resetForm = () => {
    setEditingCat({});
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gestion des Catégories</h1>
        <p className="text-slate-500">Organisez les thématiques de votre blog pour faciliter la navigation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* FORMULAIRE */}
        <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 sticky top-24">
                <h2 className="font-bold text-lg mb-6 text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit</span>
                    {isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nom</label>
                        <input 
                            type="text" 
                            required
                            value={editingCat.name || ''}
                            onChange={e => setEditingCat({...editingCat, name: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-800"
                            placeholder="Ex: Fiscalité"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Slug (URL)</label>
                        <input 
                            type="text" 
                            value={editingCat.slug || ''}
                            onChange={e => setEditingCat({...editingCat, slug: e.target.value})}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-xs text-slate-600"
                            placeholder="auto-genere"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Description</label>
                        <textarea 
                            value={editingCat.description || ''}
                            onChange={e => setEditingCat({...editingCat, description: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 h-24 text-sm resize-none"
                            placeholder="Courte description pour le référencement..."
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3 uppercase">Couleur du badge</label>
                        <div className="grid grid-cols-5 gap-3">
                            {PRESET_COLORS.map((preset, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setEditingCat({...editingCat, color: preset.class})}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${preset.class.split(' ')[0]} ${editingCat.color === preset.class ? 'border-slate-800 scale-110 ring-2 ring-offset-2 ring-slate-200' : 'border-transparent hover:scale-105'}`}
                                    title={preset.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Aperçu */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">Aperçu :</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${editingCat.color || 'bg-slate-200 text-slate-500'}`}>
                            {editingCat.name || 'Nom Catégorie'}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 flex-1">
                            <input 
                                type="checkbox" 
                                checked={editingCat.isVisible !== false}
                                onChange={(e) => setEditingCat({...editingCat, isVisible: e.target.checked})}
                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                            <span className="text-sm font-bold text-slate-700">Visible</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={resetForm}
                                className="px-4 py-3 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Annuler
                            </button>
                        )}
                        <button 
                            type="submit" 
                            className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                        >
                            {isEditing ? 'Mettre à jour' : 'Créer la catégorie'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* LISTE */}
        <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-xs">
                        <tr>
                            <th className="p-5 pl-6">Catégorie</th>
                            <th className="p-5">Badge</th>
                            <th className="p-5">Statut</th>
                            <th className="p-5 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories.map(cat => (
                            <tr key={cat.id} className={`group transition-colors ${cat.isVisible === false ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                                <td className="p-5 pl-6">
                                    <p className={`font-bold text-base ${cat.isVisible === false ? 'text-slate-400' : 'text-slate-900'}`}>{cat.name}</p>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{cat.description || 'Aucune description'}</p>
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.color || 'bg-gray-100 text-gray-800'} ${cat.isVisible === false ? 'opacity-50 grayscale' : ''}`}>
                                        {cat.name}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <button 
                                        onClick={() => handleToggleVisibility(cat)}
                                        className={`flex items-center gap-1.5 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border transition-all ${cat.isVisible !== false ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">
                                            {cat.isVisible !== false ? 'visibility' : 'visibility_off'}
                                        </span>
                                        {cat.isVisible !== false ? 'Active' : 'Masquée'}
                                    </button>
                                </td>
                                <td className="p-5 pr-6 text-right">
                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(cat)}
                                            className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Modifier"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-4xl opacity-20">category</span>
                                        <p>Aucune catégorie définie. Créez-en une pour commencer.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
