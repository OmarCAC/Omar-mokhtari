
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tool } from '../../src/modules/tools/types/Tool';
import { toolsStorage } from '../../src/modules/tools/services/toolsStorage';
import { TOOL_CATEGORIES, AVAILABLE_ICONS, TOOL_ADMIN_PATHS } from '../../src/modules/tools/constants';

const AdminTools: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Tool>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = () => {
    toolsStorage.checkAndMigrateTools(); // Assurer que tous les outils sont là
    const data = toolsStorage.getTools();
    setTools(data.sort((a, b) => a.order - b.order));
  };

  // --- ACTIONS ---

  const handleToggleActive = (id: string) => {
    toolsStorage.toggleStatus(id);
    loadTools();
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === tools.length - 1)) return;
    const newTools = [...tools];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newTools[index], newTools[targetIndex]] = [newTools[targetIndex], newTools[index]];
    toolsStorage.reorderTools(newTools);
    loadTools();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet outil ?")) {
        toolsStorage.deleteTool(id);
        loadTools();
    }
  };

  // --- EDITION ---

  const openEditor = (tool?: Tool) => {
    if (tool) {
        setEditForm(tool);
    } else {
        // Nouvel outil
        setEditForm({
            id: `tool-${Date.now()}`,
            title: '',
            description: '',
            icon: 'widgets',
            link: '/outils/',
            cta: 'Lancer',
            isActive: false,
            isNew: true,
            isPopular: false,
            category: 'gestion',
            type: 'internal',
            accessLevel: 'public'
        });
    }
    setIsEditing(true);
  };

  const saveTool = () => {
    if (!editForm.title || !editForm.link) return;

    if (tools.find(t => t.id === editForm.id)) {
        toolsStorage.updateTool(editForm.id!, editForm);
    } else {
        // @ts-ignore
        toolsStorage.addTool({ ...editForm, order: tools.length });
    }
    
    setIsEditing(false);
    loadTools();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Filtrage combiné
  const filteredTools = tools.filter(t => {
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sticky top-0 bg-slate-50 py-4 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Outils Interactifs</h1>
          <p className="text-slate-500 text-sm">Gérez le catalogue des applications et leurs configurations.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="w-full sm:w-64 pl-9 p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => openEditor()}
                className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 whitespace-nowrap"
            >
                <span className="material-symbols-outlined text-xl">add_circle</span> 
                Créer
            </button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 animate-fade-in">
          <span className="material-symbols-outlined">check_circle</span>
          Modifications enregistrées !
        </div>
      )}

      {/* FILTRES CATEGORIES */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 w-fit">
        {TOOL_CATEGORIES.map(cat => (
            <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    filterCategory === cat.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
                {cat.label}
            </button>
        ))}
      </div>

      {/* GRILLE D'OUTILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool, index) => {
          const configPath = TOOL_ADMIN_PATHS[tool.id];
          
          return (
            <div 
                key={tool.id} 
                className={`group bg-white rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col ${
                tool.isActive 
                ? 'border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/30' 
                : 'border-slate-200 bg-slate-50 opacity-75'
                }`}
            >
                {/* Status Bar */}
                <div className={`h-1.5 w-full ${tool.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>

                <div className="p-6 flex flex-col h-full">
                    
                    {/* Header Card */}
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors ${
                            tool.isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'
                        }`}>
                            <span className="material-symbols-outlined">{tool.icon}</span>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                                tool.accessLevel === 'public' ? 'bg-green-50 text-green-700 border-green-200' : 
                                tool.accessLevel === 'member' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {tool.accessLevel === 'public' ? 'Public' : tool.accessLevel === 'member' ? 'Membre' : 'Premium'}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{tool.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{tool.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {tool.category && (
                            <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {TOOL_CATEGORIES.find(c => c.id === tool.category)?.label || tool.category}
                            </span>
                        )}
                        {tool.isNew && <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">Nouveau</span>}
                        {tool.isPopular && <span className="text-[10px] font-bold uppercase text-yellow-700 bg-yellow-50 px-2 py-1 rounded">Populaire</span>}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                        {configPath ? (
                            <Link 
                                to={configPath}
                                className="flex-1 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors text-xs flex items-center justify-center gap-1 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-sm">settings</span> Configurer
                            </Link>
                        ) : (
                            <div className="flex-1"></div>
                        )}

                        <button 
                            onClick={() => openEditor(tool)} 
                            className="p-2 bg-slate-50 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center border border-slate-200"
                            title="Éditer les métadonnées"
                        >
                            <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        
                        <div className="flex gap-1 border-l border-slate-100 pl-2 ml-1">
                            <button onClick={() => handleMove(index, 'up')} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg hover:text-primary">
                                <span className="material-symbols-outlined text-lg">arrow_upward</span>
                            </button>
                            <button onClick={() => handleMove(index, 'down')} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg hover:text-primary">
                                <span className="material-symbols-outlined text-lg">arrow_downward</span>
                            </button>
                            <button onClick={() => handleDelete(tool.id)} className="p-2 text-slate-400 hover:bg-red-50 rounded-lg hover:text-red-500">
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          );
        })}
      </div>

      {/* MODAL EDITEUR */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditing(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-900">
                        {tools.find(t => t.id === editForm.id) ? 'Modifier l\'outil' : 'Créer un outil'}
                    </h2>
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Titre</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-bold text-lg" 
                                value={editForm.title}
                                onChange={e => setEditForm({...editForm, title: e.target.value})}
                                placeholder="Ex: Calculateur de TVA"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Description</label>
                            <textarea 
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none h-24"
                                value={editForm.description}
                                onChange={e => setEditForm({...editForm, description: e.target.value})}
                                placeholder="Description courte affichée sur la carte..."
                            ></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Catégorie</label>
                            <select 
                                className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                                value={editForm.category}
                                onChange={e => setEditForm({...editForm, category: e.target.value})}
                            >
                                {TOOL_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Lien interne</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-slate-300 rounded-lg font-mono text-sm" 
                                value={editForm.link}
                                onChange={e => setEditForm({...editForm, link: e.target.value})}
                                placeholder="/outils/..."
                            />
                        </div>
                    </div>

                    {/* Security Level */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 mb-3 uppercase">Niveau d'accès requis</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="accessLevel" 
                                    value="public"
                                    checked={editForm.accessLevel === 'public'} 
                                    onChange={() => setEditForm({...editForm, accessLevel: 'public'})}
                                    className="text-green-500 focus:ring-green-500"
                                />
                                <span className="text-sm font-bold text-slate-700">Public (Ouvert)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="accessLevel" 
                                    value="member"
                                    checked={editForm.accessLevel === 'member'} 
                                    onChange={() => setEditForm({...editForm, accessLevel: 'member'})}
                                    className="text-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-sm font-bold text-slate-700">Membre (Compte gratuit)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="accessLevel" 
                                    value="premium"
                                    checked={editForm.accessLevel === 'premium'} 
                                    onChange={() => setEditForm({...editForm, accessLevel: 'premium'})}
                                    className="text-amber-500 focus:ring-amber-500"
                                />
                                <span className="text-sm font-bold text-slate-700">Premium (Payant)</span>
                            </label>
                        </div>
                    </div>

                    {/* Icon Picker */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Icône</label>
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                            {AVAILABLE_ICONS.map(icon => (
                                <button
                                    key={icon}
                                    onClick={() => setEditForm({...editForm, icon})}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                        editForm.icon === icon 
                                        ? 'bg-primary text-white shadow-md scale-110' 
                                        : 'bg-white text-slate-500 hover:bg-white hover:text-primary hover:shadow-sm'
                                    }`}
                                    title={icon}
                                >
                                    <span className="material-symbols-outlined text-xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${editForm.isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${editForm.isActive ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <input type="checkbox" className="hidden" checked={editForm.isActive} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} />
                            <span className="font-bold text-sm text-slate-700">Outil Actif</span>
                        </label>

                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" className="w-5 h-5 text-primary rounded" checked={editForm.isNew} onChange={e => setEditForm({...editForm, isNew: e.target.checked})} />
                            <span className="font-bold text-sm text-slate-700">Badge "Nouveau"</span>
                        </label>

                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                            <input type="checkbox" className="w-5 h-5 text-primary rounded" checked={editForm.isPopular} onChange={e => setEditForm({...editForm, isPopular: e.target.checked})} />
                            <span className="font-bold text-sm text-slate-700">Badge "Populaire"</span>
                        </label>
                    </div>

                    {/* Advanced */}
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-yellow-800 mb-1 uppercase">Texte du Bouton (CTA)</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-yellow-200 rounded bg-white text-sm" 
                                    value={editForm.cta}
                                    onChange={e => setEditForm({...editForm, cta: e.target.value})}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-yellow-800 mb-1 uppercase">Type d'intégration</label>
                                <select 
                                    className="w-full p-2 border border-yellow-200 rounded bg-white text-sm"
                                    value={editForm.type}
                                    onChange={e => setEditForm({...editForm, type: e.target.value as any})}
                                >
                                    <option value="internal">Interne (App)</option>
                                    <option value="link">Lien Externe</option>
                                    <option value="download">Téléchargement</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl sticky bottom-0">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={saveTool}
                        className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">save</span>
                        Enregistrer
                    </button>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default AdminTools;
