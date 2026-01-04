
// Liste exhaustive des fonctionnalités contrôlables de l'application
export const AVAILABLE_FEATURES = [
  { id: 'access_dashboard', label: 'Accès au Tableau de Bord', category: 'Général' },
  { id: 'access_admin', label: 'Accès Administration', category: 'Administration' },
  
  // Outils
  { id: 'tool_calculator', label: 'Calculateur Honoraires', category: 'Outils' },
  { id: 'tool_valuation', label: 'Valorisation Startup', category: 'Outils' },
  { id: 'tool_business_plan', label: 'Générateur Business Plan', category: 'Outils' },
  { id: 'tool_forecast', label: 'Prévisions Financières', category: 'Outils' },
  { id: 'tool_checklist', label: 'Checklist Création', category: 'Outils' },
  { id: 'tool_payroll', label: 'Simulateur Paie', category: 'Outils' },
  { id: 'tool_invoicing', label: 'Facturation', category: 'Outils' },
  
  // Fonctionnalités avancées
  { id: 'export_pdf', label: 'Export PDF Illimité', category: 'Fonctionnalités' },
  { id: 'save_projects', label: 'Sauvegarde Projets', category: 'Fonctionnalités' },
  { id: 'ai_assistant', label: 'Assistant IA', category: 'Fonctionnalités' },
  { id: 'priority_support', label: 'Support Prioritaire', category: 'Support' },
];

export interface RolePermissions {
  [role: string]: string[]; // ex: 'premium': ['access_dashboard', 'export_pdf', ...]
}

const PERMISSIONS_KEY = 'comptalink_role_permissions';

// Configuration par défaut si rien n'est défini
const DEFAULT_PERMISSIONS: RolePermissions = {
  guest: ['tool_calculator', 'tool_checklist', 'tool_payroll'],
  free: [
    'access_dashboard', 
    'tool_calculator', 
    'tool_checklist', 
    'tool_payroll',
    'tool_business_plan', // Accès limité
    'save_projects'
  ],
  premium: [
    'access_dashboard',
    'tool_calculator',
    'tool_valuation',
    'tool_business_plan',
    'tool_forecast',
    'tool_checklist',
    'tool_payroll',
    'tool_invoicing',
    'export_pdf',
    'save_projects',
    'ai_assistant',
    'priority_support'
  ],
  admin: AVAILABLE_FEATURES.map(f => f.id) // Tout par défaut
};

export const permissionService = {
  getPermissions: (): RolePermissions => {
    try {
      const stored = localStorage.getItem(PERMISSIONS_KEY);
      if (!stored) {
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(DEFAULT_PERMISSIONS));
        return DEFAULT_PERMISSIONS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  },

  savePermissions: (permissions: RolePermissions) => {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
    // Notifier l'app du changement
    window.dispatchEvent(new Event('permissions-updated'));
  },

  // Vérifie si un rôle possède une permission spécifique
  hasPermission: (role: string, featureId: string): boolean => {
    if (role === 'admin') return true; // Super-admin bypass
    const allPerms = permissionService.getPermissions();
    const rolePerms = allPerms[role] || [];
    return rolePerms.includes(featureId);
  }
};
