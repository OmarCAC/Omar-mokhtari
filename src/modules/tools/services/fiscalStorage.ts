import { FiscalFormDefinition, FISCAL_FORM_TYPES, FiscalCategory, DEFAULT_FISCAL_CATEGORIES, PenaltyRule, DEFAULT_PENALTY_RULES } from "./fiscalCalendarData";
import { TaxRegime } from "../types/Tool";

const LINKS_KEY = "comptalink_fiscal_forms_links";
const CUSTOM_FORMS_KEY = "comptalink_fiscal_custom_forms";
const HIDDEN_FORMS_KEY = "comptalink_fiscal_hidden_forms";
const LABEL_OVERRIDES_KEY = "comptalink_fiscal_label_overrides"; 
const CAT_LABEL_OVERRIDES_KEY = "comptalink_fiscal_cat_label_overrides"; 
const FORM_CAT_OVERRIDES_KEY = "comptalink_fiscal_form_cat_overrides"; 
const CATEGORIES_KEY = "comptalink_fiscal_categories"; 
const RULES_KEY = "comptalink_fiscal_rules"; // Nouvelle clé pour les règles
const USER_STATUS_KEY = "comptalink_fiscal_user_status";
const USER_PREFS_KEY = "comptalink_fiscal_user_prefs";

export interface FiscalLinks { [key: string]: string; }
export interface LabelOverrides { [key: string]: string; }
export interface EventStatusMap { [eventId: string]: boolean; }

export const fiscalStorage = {
  // --- GESTION DES RÈGLES DE PÉNALITÉ ---
  getPenaltyRules: (): PenaltyRule[] => {
    try {
      const stored = localStorage.getItem(RULES_KEY);
      if (stored) {
        // Merge avec les défauts pour ne pas perdre les nouvelles règles système en cas de mise à jour
        const customRules = JSON.parse(stored) as PenaltyRule[];
        // On retourne d'abord les règles stockées (qui peuvent contenir des modifications des règles par défaut)
        // Mais il faut s'assurer d'avoir toutes les règles par défaut si elles n'existent pas
        const rulesMap = new Map();
        DEFAULT_PENALTY_RULES.forEach(r => rulesMap.set(r.id, r));
        customRules.forEach(r => rulesMap.set(r.id, r));
        return Array.from(rulesMap.values());
      }
      return DEFAULT_PENALTY_RULES;
    } catch {
      return DEFAULT_PENALTY_RULES;
    }
  },

  savePenaltyRules: (rules: PenaltyRule[]): void => {
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
    window.dispatchEvent(new Event('fiscal-rules-updated'));
  },

  // --- GESTION DES LIENS ---
  getLinks: (): FiscalLinks => {
    try {
      const stored = localStorage.getItem(LINKS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  },

  saveLinks: (links: FiscalLinks): void => {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
    window.dispatchEvent(new Event('fiscal-links-updated'));
  },

  // --- GESTION DES NOMS (LIBELLÉS FORMULAIRES) ---
  getLabelOverrides: (): LabelOverrides => {
    try {
      const stored = localStorage.getItem(LABEL_OVERRIDES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  },

  saveLabelOverrides: (overrides: LabelOverrides): void => {
    localStorage.setItem(LABEL_OVERRIDES_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new Event('fiscal-links-updated'));
  },

  // --- GESTION DES CATEGORIES (RENOMMAGE & CUSTOM) ---
  getCategoryLabelOverrides: (): LabelOverrides => {
    try {
      const stored = localStorage.getItem(CAT_LABEL_OVERRIDES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  },

  saveCategoryLabelOverrides: (overrides: LabelOverrides): void => {
    localStorage.setItem(CAT_LABEL_OVERRIDES_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new Event('fiscal-links-updated'));
  },

  getCategories: (): FiscalCategory[] => {
    try {
      // 1. Catégories Custom
      let customCats: FiscalCategory[] = [];
      const storedCustom = localStorage.getItem(CATEGORIES_KEY);
      if (storedCustom) customCats = JSON.parse(storedCustom);

      // 2. Catégories Système (avec application des renommages)
      const overrides = fiscalStorage.getCategoryLabelOverrides();
      const systemCats = DEFAULT_FISCAL_CATEGORIES.map(cat => ({
        ...cat,
        label: overrides[cat.id] || cat.label, // Appliquer le renommage
        isSystem: true
      }));

      return [...systemCats, ...customCats];
    } catch {
      return DEFAULT_FISCAL_CATEGORIES;
    }
  },

  // Création de catégorie purement custom
  addCategory: (category: Omit<FiscalCategory, 'isSystem'>): void => {
    const customCatsString = localStorage.getItem(CATEGORIES_KEY);
    const customCats = customCatsString ? JSON.parse(customCatsString) : [];
    customCats.push({ ...category, isSystem: false });
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCats));
    window.dispatchEvent(new Event('fiscal-links-updated'));
  },

  // Sauvegarde globale (utilisée pour mettre à jour les labels des catégories custom)
  saveCustomCategories: (categories: FiscalCategory[]): void => {
    const customOnly = categories.filter(c => !c.isSystem);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(customOnly));
    window.dispatchEvent(new Event('fiscal-links-updated'));
  },

  deleteCategory: (id: string): void => {
    const customCatsString = localStorage.getItem(CATEGORIES_KEY);
    if (customCatsString) {
        const customCats = JSON.parse(customCatsString);
        const filtered = customCats.filter((c: FiscalCategory) => c.id !== id);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new Event('fiscal-links-updated'));
    }
  },

  // --- GESTION DES FORMULAIRES (DÉPLACEMENT & VISIBILITÉ) ---
  getFormCategoryOverrides: (): LabelOverrides => {
    try {
      const stored = localStorage.getItem(FORM_CAT_OVERRIDES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  },

  saveFormCategoryOverrides: (overrides: LabelOverrides): void => {
    localStorage.setItem(FORM_CAT_OVERRIDES_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new Event('fiscal-links-updated'));
  },

  getCustomForms: (): FiscalFormDefinition[] => {
    try {
      const stored = localStorage.getItem(CUSTOM_FORMS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  saveCustomForms: (forms: FiscalFormDefinition[]): void => {
    const customOnly = forms.filter(f => !f.isSystem);
    localStorage.setItem(CUSTOM_FORMS_KEY, JSON.stringify(customOnly));
  },

  getAllForms: (): FiscalFormDefinition[] => {
    const customForms = fiscalStorage.getCustomForms();
    const labelOverrides = fiscalStorage.getLabelOverrides();
    const catOverrides = fiscalStorage.getFormCategoryOverrides();

    // Appliquer les surcharges aux formulaires systèmes
    const systemForms = FISCAL_FORM_TYPES.map(f => ({ 
      ...f, 
      label: labelOverrides[f.id] || f.label, // Nom surchargé
      category: catOverrides[f.id] || f.category, // Catégorie surchargée (déplacée)
      isSystem: true 
    }));

    const processedCustomForms = customForms.map(f => ({
        ...f,
        category: catOverrides[f.id] || f.category
    }));

    return [...systemForms, ...processedCustomForms];
  },

  getVisibleForms: (): FiscalFormDefinition[] => {
    const all = fiscalStorage.getAllForms();
    const hidden = fiscalStorage.getHiddenForms();
    return all.filter(f => !hidden.includes(f.id));
  },

  addCustomForm: (form: Omit<FiscalFormDefinition, 'isSystem'>): void => {
    const customForms = fiscalStorage.getCustomForms();
    const newForm = { ...form, isSystem: false };
    customForms.push(newForm);
    localStorage.setItem(CUSTOM_FORMS_KEY, JSON.stringify(customForms));
    
    if (form.defaultLink) {
        const links = fiscalStorage.getLinks();
        links[form.id] = form.defaultLink;
        fiscalStorage.saveLinks(links);
    }
    
    window.dispatchEvent(new Event('fiscal-links-updated'));
  },

  deleteCustomForm: (id: string): void => {
    const customForms = fiscalStorage.getCustomForms();
    const filtered = customForms.filter(f => f.id !== id);
    localStorage.setItem(CUSTOM_FORMS_KEY, JSON.stringify(filtered));
    
    const links = fiscalStorage.getLinks();
    if (links[id]) { delete links[id]; fiscalStorage.saveLinks(links); }
    
    const labelOverrides = fiscalStorage.getLabelOverrides();
    if (labelOverrides[id]) { delete labelOverrides[id]; fiscalStorage.saveLabelOverrides(labelOverrides); }

    const catOverrides = fiscalStorage.getFormCategoryOverrides();
    if (catOverrides[id]) { delete catOverrides[id]; fiscalStorage.saveFormCategoryOverrides(catOverrides); }
    
    window.dispatchEvent(new Event('fiscal-links-updated'));
  },

  // --- MASQUER / AFFICHER ---
  getHiddenForms: (): string[] => {
    try {
      const stored = localStorage.getItem(HIDDEN_FORMS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  toggleFormVisibility: (id: string): void => {
    const hidden = fiscalStorage.getHiddenForms();
    const index = hidden.indexOf(id);
    if (index === -1) hidden.push(id);
    else hidden.splice(index, 1);
    localStorage.setItem(HIDDEN_FORMS_KEY, JSON.stringify(hidden));
    window.dispatchEvent(new Event('fiscal-links-updated'));
  },

  // --- SUIVI UTILISATEUR ---
  getEventStatus: (): EventStatusMap => {
    try {
        const stored = localStorage.getItem(USER_STATUS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  },

  toggleEventStatus: (eventId: string): void => {
      const statuses = fiscalStorage.getEventStatus();
      if (statuses[eventId]) delete statuses[eventId];
      else statuses[eventId] = true;
      localStorage.setItem(USER_STATUS_KEY, JSON.stringify(statuses));
      window.dispatchEvent(new Event('fiscal-status-updated'));
  },

  getUserRegime: (): TaxRegime => {
      return (localStorage.getItem(USER_PREFS_KEY) as TaxRegime) || 'reel';
  },

  saveUserRegime: (regime: TaxRegime): void => {
      localStorage.setItem(USER_PREFS_KEY, regime);
  }
};