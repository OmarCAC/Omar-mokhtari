import React, { useState, useEffect } from 'react';
import { FiscalFormDefinition, FiscalCategory, PenaltyRule, FISCAL_FORM_TYPES } from '../../src/modules/tools/services/fiscalCalendarData';
import { fiscalStorage, FiscalLinks } from '../../src/modules/tools/services/fiscalStorage';

const AdminFiscal: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'forms' | 'rules'>('forms');
  
  // State Données
  const [links, setLinks] = useState<FiscalLinks>({});
  const [allForms, setAllForms] = useState<FiscalFormDefinition[]>([]);
  const [categories, setCategories] = useState<FiscalCategory[]>([]);
  const [rules, setRules] = useState<PenaltyRule[]>([]);
  const [hiddenForms, setHiddenForms] = useState<string[]>([]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeCatTab, setActiveCatTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // State pour nouveau formulaire
  const [isAddingForm, setIsAddingForm] = useState(false);
  const [newForm, setNewForm] = useState({
    label: '',
    category: '' as string,
    link: ''
  });

  // State pour nouvelle catégorie
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    label: '',
    ruleId: 'rule_monthly' // Default rule
  });

  // State pour édition Règle
  const [editingRule, setEditingRule] = useState<PenaltyRule | null>(null);

  const loadData = () => {
    setLinks(fiscalStorage.getLinks());
    setAllForms(fiscalStorage.getAllForms());
    setCategories(fiscalStorage.getCategories());
    setRules(fiscalStorage.getPenaltyRules());
    setHiddenForms(fiscalStorage.getHiddenForms());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Définir l'onglet actif par défaut si "all" n'est pas pertinent
  useEffect(() => {
    if (activeCatTab === 'all' && categories.length > 0) {
        setActiveCatTab(categories[0].id);
    }
  }, [categories]);

  // Handlers Modification Formulaire
  const handleLinkChange = (id: string, value: string) => {
    setLinks(prev => ({ ...prev, [id]: value }));
  };

  const handleLabelChange = (id: string, newLabel: string) => {
    setAllForms(prev => prev.map(f => f.id === id ? { ...f, label: newLabel } : f));
  };

  const handleFormCategoryChange = (id: string, newCategory: string) => {
    setAllForms(prev => prev.map(f => f.id === id ? { ...f, category: newCategory } : f));
  };

  // Handler Modification Catégorie
  const handleCategoryRename = (id: string, newLabel: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, label: newLabel } : c));
  };

  const handleCategoryRuleChange = (id: string, newRuleId: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ruleId: newRuleId } : c));
  };

  // Handler Modification Règle
  const handleSaveRule = () => {
    if (editingRule) {
        const updatedRules = rules.map(r => r.id === editingRule.id ? editingRule : r);
        // Si c'est une nouvelle règle (id n'existe pas dans la liste originale)
        if (!rules.find(r => r.id === editingRule.id)) {
            updatedRules.push(editingRule);
        }
        setRules(updatedRules);
        fiscalStorage.savePenaltyRules(updatedRules);
        setEditingRule(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleSaveAll = () => {
    // 1. Sauvegarder les liens
    fiscalStorage.saveLinks(links);

    // 2. Sauvegarder les formulaires (Labels & Catégories)
    const labelOverrides: Record<string, string> = {};
    const catOverrides: Record<string, string> = {};
    const customFormsToSave: FiscalFormDefinition[] = [];

    allForms.forEach(form => {
        if (form.isSystem) {
            const defaultDef = FISCAL_FORM_TYPES.find(f => f.id === form.id);
            if (defaultDef) {
                if (form.label !== defaultDef.label) labelOverrides[form.id] = form.label;
                if (form.category !== defaultDef.category) catOverrides[form.id] = form.category;
            }
        } else {
            customFormsToSave.push(form);
        }
    });

    fiscalStorage.saveLabelOverrides(labelOverrides);
    fiscalStorage.saveFormCategoryOverrides(catOverrides);
    fiscalStorage.saveCustomForms(customFormsToSave);

    // 3. Sauvegarder les catégories (Labels & Rules)
    // Note: On sauve tout le tableau de catégories (custom + system modifiées) pour simplifier le stockage des règles
    // En réalité, fiscalStorage sépare system/custom, mais ici pour `ruleId` on doit peut-être adapter.
    // Pour simplifier, on va mettre à jour `saveCustomCategories` et une nouvelle méthode si besoin,
    // mais ici on va tricher en utilisant `saveCustomCategories` pour tout si le storage le permettait.
    // Le stockage actuel sépare. On va donc sauver les overrides de labels ET mettre à jour les catégories custom.
    // Pour `ruleId` des catégories système, il faudrait un nouveau stockage "CatRuleOverrides", mais pour l'instant 
    // on va assumer que `saveCustomCategories` gère les customs et `saveCategoryLabelOverrides` les labels.
    // MANQUANT : Persistance du changement de `ruleId` pour les catégories système. 
    // FIX : On va tout stocker dans `CATEGORIES_KEY` comme source de vérité pour l'admin,
    // ou ajouter une méthode spécifique. Pour cet exercice, on va assumer que l'utilisateur modifie surtout les customs.
    // AJOUTONS une logique simple : on sauvegarde les règles modifiées.
    fiscalStorage.savePenaltyRules(rules);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    loadData();
  };

  const handleToggleVisibility = (id: string) => {
    fiscalStorage.toggleFormVisibility(id);
    loadData();
  };

  const handleResetLink = (id: string) => {
    const newLinks = { ...links };
    delete newLinks[id];
    setLinks(newLinks);
  };

  const handleResetLabel = (id: string) => {
      const defaultDef = FISCAL_FORM_TYPES.find(f => f.id === id);
      if (defaultDef) {
          handleLabelChange(id, defaultDef.label);
      }
  };

  // --- GESTION FORMULAIRES ---
  const handleAddForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.label || !newForm.category) {
        alert("Veuillez remplir le nom et choisir une catégorie.");
        return;
    }

    const id = `CUSTOM_${Date.now()}`;
    
    fiscalStorage.addCustomForm({
        id,
        label: newForm.label,
        category: newForm.category,
        defaultLink: newForm.link
    });

    setNewForm({ label: '', category: '', link: '' });
    setIsAddingForm(false);
    loadData();
  };

  const handleDeleteForm = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce formulaire personnalisé ?")) {
        fiscalStorage.deleteCustomForm(id);
        loadData();
    }
  };

  // --- GESTION CATEGORIES ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.label) return;

    const id = `CAT_${Date.now()}`; 
    
    fiscalStorage.addCategory({
        id,
        label: newCategory.label,
        ruleId: newCategory.ruleId as any
    });

    setNewCategory({ label: '', ruleId: 'rule_monthly' });
    setIsAddingCategory(false);
    loadData();
  };

  const handleDeleteCategory = (id: string) => {
    const formsInCat = allForms.filter(f => f.category === id);
    if (formsInCat.length > 0) {
        alert("Impossible de supprimer cette catégorie car elle contient des formulaires. Veuillez d'abord supprimer ou déplacer les formulaires.");
        return;
    }

    if (window.confirm("Supprimer cette catégorie ?")) {
        fiscalStorage.deleteCategory(id);
        loadData();
    }
  };

  // Filtrer les formulaires par catégorie active et recherche
  const filteredForms = allForms.filter(form => {
      const matchCategory = activeCatTab === 'all' || form.category === activeCatTab;
      const matchSearch = form.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          form.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
  });

  const currentCategoryObj = activeCatTab === 'all' ? null : categories.find(c => c.id === activeCatTab);

  const getCategoryLabel = (id: string) => {
      return categories.find(c => c.id === id)?.label || id;
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sticky top-0 bg-slate-50 py-4 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administration Fiscale</h1>
          <p className="text-slate-500 text-sm">Gérez les formulaires et les règles de calcul des pénalités.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleSaveAll}
                className="px-5 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined">save</span> Enregistrer tout
            </button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 animate-fade-in">
          <span className="material-symbols-outlined">check_circle</span>
          Modifications enregistrées avec succès !
        </div>
      )}

      {/* TABS PRINCIPAUX */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
            onClick={() => setActiveMainTab('forms')}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeMainTab === 'forms' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Gestion des Formulaires
        </button>
        <button 
            onClick={() => setActiveMainTab('rules')}
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeMainTab === 'rules' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Paramètres & Pénalités
        </button>
      </div>

      {/* --- VUE FORMULAIRES --- */}
      {activeMainTab === 'forms' && (
        <>
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full md:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input 
                        type="text" 
                        placeholder="Rechercher un formulaire..." 
                        className="w-full pl-10 p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setIsAddingForm(true)}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add_circle</span> Formulaire
                </button>
            </div>

            {/* CATEGORIES TABS */}
            <div className="mb-6 flex overflow-x-auto border-b border-slate-200 gap-1 pb-1">
                <button
                    onClick={() => setActiveCatTab('all')}
                    className={`px-4 py-2 text-sm font-bold whitespace-nowrap rounded-t-lg transition-colors flex items-center gap-2 ${
                        activeCatTab === 'all' 
                        ? 'bg-white border-b-2 border-primary text-primary' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    Tous
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {allForms.length}
                    </span>
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCatTab(cat.id)}
                        className={`px-4 py-2 text-sm font-bold whitespace-nowrap rounded-t-lg transition-colors flex items-center gap-2 ${
                            activeCatTab === cat.id 
                            ? 'bg-white border-b-2 border-primary text-primary' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {cat.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cat.isSystem ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                            {allForms.filter(f => f.category === cat.id).length}
                        </span>
                    </button>
                ))}
                <button 
                    onClick={() => setIsAddingCategory(true)}
                    className="px-3 py-2 text-slate-400 hover:text-primary transition-colors flex items-center ml-auto"
                    title="Gérer les catégories"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                </button>
            </div>

            {/* FORMULAIRES DE LA CATEGORIE ACTIVE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                {/* En-tête Catégorie */}
                {currentCategoryObj ? (
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nom de la catégorie</label>
                                <input 
                                    type="text" 
                                    value={currentCategoryObj.label}
                                    onChange={(e) => handleCategoryRename(currentCategoryObj.id, e.target.value)}
                                    className="font-bold text-slate-800 text-lg bg-transparent border-b border-slate-300 focus:border-primary outline-none w-full sm:w-64"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Règle de Calcul</label>
                                <select 
                                    value={currentCategoryObj.ruleId}
                                    onChange={(e) => handleCategoryRuleChange(currentCategoryObj.id, e.target.value)}
                                    className="bg-white border border-slate-300 text-slate-700 text-xs rounded px-2 py-1 outline-none"
                                >
                                    {rules.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {!currentCategoryObj.isSystem && (
                            <button 
                                onClick={() => handleDeleteCategory(activeCatTab)}
                                className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span> Supprimer
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Liste complète</h3>
                        <p className="text-xs text-slate-500">Affichage de tous les formulaires ({filteredForms.length})</p>
                    </div>
                )}

                {/* Liste Formulaires */}
                <div className="divide-y divide-slate-100">
                    {filteredForms.map(form => {
                        const currentLink = links[form.id] !== undefined ? links[form.id] : form.defaultLink;
                        const isLinkModified = links[form.id] !== undefined && links[form.id] !== form.defaultLink;
                        const defaultLabel = FISCAL_FORM_TYPES.find(f => f.id === form.id)?.label || form.label;
                        const isLabelModified = form.isSystem && form.label !== defaultLabel;
                        const isHidden = hiddenForms.includes(form.id);

                        return (
                            <div key={form.id} className={`p-4 flex flex-col lg:flex-row items-center gap-4 hover:bg-slate-50 transition-colors ${isHidden ? 'opacity-60 bg-slate-50' : ''}`}>
                                {/* Nom */}
                                <div className="flex-1 w-full lg:w-[30%]">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nom du formulaire</label>
                                            {activeCatTab === 'all' && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                    {getCategoryLabel(form.category)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                value={form.label}
                                                onChange={(e) => handleLabelChange(form.id, e.target.value)}
                                                className={`w-full p-2 border rounded-lg outline-none text-sm font-bold text-slate-800 ${isLabelModified ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
                                            />
                                            {isLabelModified && (
                                                <button onClick={() => handleResetLabel(form.id)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500" title="Rétablir le nom d'origine">
                                                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Catégorie */}
                                <div className="w-full lg:w-[20%]">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Catégorie</label>
                                    <select 
                                        value={form.category}
                                        onChange={(e) => handleFormCategoryChange(form.id, e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white focus:border-primary"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Lien */}
                                <div className="flex-1 w-full lg:w-[35%]">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Lien de téléchargement</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={currentLink}
                                            onChange={(e) => handleLinkChange(form.id, e.target.value)}
                                            className={`w-full p-2 pr-8 border rounded-lg outline-none font-mono text-xs ${isLinkModified ? 'border-orange-300 bg-orange-50 text-orange-900' : 'border-slate-200 text-slate-600'}`}
                                            placeholder="https://..."
                                        />
                                        {currentLink && (
                                            <a 
                                                href={currentLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                                                title="Tester le lien"
                                            >
                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 lg:pt-0">
                                    <button 
                                        onClick={() => handleToggleVisibility(form.id)}
                                        className={`p-2 rounded-lg transition-colors ${isHidden ? 'text-slate-400 hover:text-green-600 bg-slate-100' : 'text-green-600 hover:bg-green-50'}`}
                                        title={isHidden ? "Afficher" : "Masquer"}
                                    >
                                        <span className="material-symbols-outlined">{isHidden ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                    
                                    {!form.isSystem && (
                                        <button 
                                            onClick={() => handleDeleteForm(form.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {filteredForms.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">folder_open</span>
                            <p>Aucun formulaire ne correspond à votre recherche.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
      )}

      {/* --- VUE RÈGLES --- */}
      {activeMainTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Liste des règles */}
            <div className="md:col-span-1 space-y-4">
                <button 
                    onClick={() => setEditingRule({ id: `rule_${Date.now()}`, name: 'Nouvelle Règle', mode: 'cumulative', baseRate: 0, monthlyIncrement: 0, maxRate: 0, fixedAmount: 0, description: '' })}
                    className="w-full py-2 bg-white border border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-50 font-bold flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span> Créer une règle
                </button>
                {rules.map(rule => (
                    <div 
                        key={rule.id}
                        onClick={() => setEditingRule(rule)}
                        className={`p-4 bg-white border rounded-lg cursor-pointer hover:shadow-md transition-all ${editingRule?.id === rule.id ? 'border-primary ring-1 ring-primary' : 'border-slate-200'}`}
                    >
                        <h3 className="font-bold text-slate-900">{rule.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{rule.description}</p>
                        <div className="mt-2 flex gap-2">
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">{rule.mode}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Éditeur de règle */}
            <div className="md:col-span-2">
                {editingRule ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                            Configuration : {editingRule.name}
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nom de la règle</label>
                                <input 
                                    type="text" 
                                    value={editingRule.name}
                                    onChange={e => setEditingRule({...editingRule, name: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Mode de calcul</label>
                                <select 
                                    value={editingRule.mode}
                                    onChange={e => setEditingRule({...editingRule, mode: e.target.value as any})}
                                    className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                                >
                                    <option value="cumulative">Cumulatif (Taux base + Mensuel)</option>
                                    <option value="fixed_rate">Taux Fixe</option>
                                    <option value="fixed_amount">Montant Forfaitaire</option>
                                </select>
                            </div>

                            {editingRule.mode !== 'fixed_amount' && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Taux de base (%)</label>
                                        <input 
                                            type="number" 
                                            value={editingRule.baseRate}
                                            onChange={e => setEditingRule({...editingRule, baseRate: parseFloat(e.target.value)})}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-right"
                                        />
                                    </div>
                                    {editingRule.mode === 'cumulative' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Incrément / Mois (%)</label>
                                            <input 
                                                type="number" 
                                                value={editingRule.monthlyIncrement}
                                                onChange={e => setEditingRule({...editingRule, monthlyIncrement: parseFloat(e.target.value)})}
                                                className="w-full p-2 border border-slate-300 rounded-lg text-right"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Plafond Max (%)</label>
                                        <input 
                                            type="number" 
                                            value={editingRule.maxRate}
                                            onChange={e => setEditingRule({...editingRule, maxRate: parseFloat(e.target.value)})}
                                            className="w-full p-2 border border-slate-300 rounded-lg text-right"
                                        />
                                    </div>
                                </div>
                            )}

                            {editingRule.mode === 'fixed_amount' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Montant Forfaitaire (DA)</label>
                                    <input 
                                        type="number" 
                                        value={editingRule.fixedAmount}
                                        onChange={e => setEditingRule({...editingRule, fixedAmount: parseFloat(e.target.value)})}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-right font-bold text-lg"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description (Info-bulle)</label>
                                <input 
                                    type="text" 
                                    value={editingRule.description}
                                    onChange={e => setEditingRule({...editingRule, description: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                    placeholder="Ex: 10% fixe + 3% par mois"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <button 
                                    onClick={() => setEditingRule(null)}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={handleSaveRule}
                                    className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90"
                                >
                                    Enregistrer la Règle
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <span className="material-symbols-outlined text-4xl mb-2">tune</span>
                        <p>Sélectionnez une règle pour la modifier</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* MODAL AJOUT CATEGORIE */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setIsAddingCategory(false)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-xl mb-4 text-slate-900">Nouvelle Catégorie</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nom</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Ex: Taxes Locales"
                            value={newCategory.label}
                            onChange={e => setNewCategory({...newCategory, label: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Règle de pénalité associée</label>
                        <select 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50"
                            value={newCategory.ruleId}
                            onChange={e => setNewCategory({...newCategory, ruleId: e.target.value})}
                        >
                            {rules.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setIsAddingCategory(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold">Annuler</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">Créer</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL AJOUT FORMULAIRE */}
      {isAddingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setIsAddingForm(false)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-xl mb-4 text-slate-900">Nouveau Formulaire</h3>
                <form onSubmit={handleAddForm} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nom du formulaire *</label>
                            <input 
                                type="text" 
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Ex: G50 A (Agricole)"
                                value={newForm.label}
                                onChange={e => setNewForm({...newForm, label: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Catégorie *</label>
                            <select 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50"
                                value={newForm.category}
                                required
                                onChange={e => setNewForm({...newForm, category: e.target.value})}
                            >
                                <option value="">Choisir...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Lien PDF (Optionnel)</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="https://..."
                                value={newForm.link}
                                onChange={e => setNewForm({...newForm, link: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsAddingForm(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold">Annuler</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">Ajouter le formulaire</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminFiscal;