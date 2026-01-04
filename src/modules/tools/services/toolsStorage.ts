
import { Tool } from "../types/Tool";

const STORAGE_KEY = "comptalink_tools_config";

const DEFAULT_TOOLS: Tool[] = [
  // --- IA STUDIO ---
  {
    id: "tool-ai-studio",
    title: "Expert Studio IA",
    description: "Interagissez avec nos agents IA spécialisés en fiscalité, juridique et stratégie d'entreprise.",
    icon: "psychology",
    link: "/expert-ai",
    cta: "Entrer dans le studio",
    isActive: true,
    isNew: true,
    isPopular: true,
    order: -1, // En premier
    type: 'internal',
    category: 'ai',
    accessLevel: 'member'
  },
  // --- PÔLE STARTUP ---
  {
    id: "tool-valuation",
    title: "Valorisation Startup",
    description: "Estimez la valeur de votre entreprise en quelques clics selon les méthodes VC.",
    icon: "trending_up",
    link: "/outils/valorisation",
    cta: "Lancer",
    isActive: true,
    isNew: false,
    isPopular: true,
    order: 0,
    type: 'internal',
    category: 'startup',
    accessLevel: 'premium'
  },
  {
    id: "tool-bp",
    title: "Business Plan",
    description: "Créez un plan d'affaires structuré pour convaincre les investisseurs.",
    icon: "description",
    link: "/outils/business-plan",
    cta: "Créer",
    isActive: true,
    isNew: false,
    isPopular: true,
    order: 1,
    type: 'internal',
    category: 'startup',
    accessLevel: 'member'
  },
  {
    id: "tool-forecast",
    title: "Prévisions Financières",
    description: "Modélisez vos projections financières SCF sur 3 ans.",
    icon: "query_stats",
    link: "/outils/previsions",
    cta: "Projeter",
    isActive: true,
    isNew: false,
    isPopular: false,
    order: 2,
    type: 'internal',
    category: 'startup',
    accessLevel: 'member'
  },
  {
    id: "tool-cac-ltv",
    title: "Calculateur CAC/LTV",
    description: "Mesurez l'efficacité de votre marketing et la rentabilité de vos clients.",
    icon: "target",
    link: "/outils/cac-ltv",
    cta: "Calculer",
    isActive: true,
    isNew: false,
    isPopular: false,
    order: 3,
    type: 'internal',
    category: 'startup',
    accessLevel: 'member'
  },
  {
    id: "tool-checklist",
    title: "Checklist Création",
    description: "Suivez les étapes clés pour lancer votre entreprise en Algérie.",
    icon: "checklist",
    link: "/outils/checklist",
    cta: "Vérifier",
    isActive: true,
    isNew: false,
    isPopular: false,
    order: 4,
    type: 'internal',
    category: 'startup',
    accessLevel: 'public'
  },

  // --- PÔLE COMPTABILITÉ & FISCALITÉ ---
  {
    id: "tool-calculator",
    title: "Calculateur d'Honoraires",
    description: "Estimez le coût de votre comptabilité en quelques secondes selon votre activité.",
    icon: "calculate",
    link: "/outils/calculateur-honoraires",
    cta: "Estimer",
    isActive: true,
    isNew: false,
    isPopular: true,
    order: 10,
    type: 'internal',
    category: 'compta',
    accessLevel: 'public'
  },
  {
    id: "tool-calendar",
    title: "Assistant Fiscal & Social",
    description: "Calendrier des échéances et simulateur de pénalités (Fiscal & Parafiscal).",
    icon: "calendar_month",
    link: "/outils/calendrier-fiscal",
    cta: "Accéder",
    isActive: true,
    isNew: true,
    isPopular: false,
    order: 11,
    type: 'internal',
    category: 'compta',
    accessLevel: 'public'
  },

  // --- PÔLE RH ---
  {
    id: "tool-payroll",
    title: "Simulateur de Paie",
    description: "Calculez le salaire net, l'IRG (Barème 2025) et les charges patronales en temps réel.",
    icon: "payments",
    link: "/outils/simulateur-paie",
    cta: "Simuler",
    isActive: true,
    isNew: true,
    isPopular: true,
    order: 20,
    type: 'internal',
    category: 'rh',
    accessLevel: 'public'
  },

  // --- PÔLE GESTION ---
  {
    id: "tool-invoicing",
    title: "Générateur Factures",
    description: "Créez des factures et devis professionnels conformes en quelques clics.",
    icon: "receipt",
    link: "/outils/facturation",
    cta: "Créer",
    isActive: true,
    isNew: true,
    isPopular: true,
    order: 30,
    type: 'internal',
    category: 'gestion',
    accessLevel: 'member'
  }
];

export const toolsStorage = {
  getTools: (): Tool[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TOOLS));
        return DEFAULT_TOOLS;
      }
      return JSON.parse(stored);
    } catch (error) {
      return DEFAULT_TOOLS;
    }
  },

  saveTools: (tools: Tool[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
  },

  addTool: (tool: Tool): void => {
    const tools = toolsStorage.getTools();
    tools.push(tool);
    toolsStorage.saveTools(tools);
  },

  deleteTool: (id: string): void => {
    const tools = toolsStorage.getTools();
    const filtered = tools.filter(t => t.id !== id);
    toolsStorage.saveTools(filtered);
  },

  toggleStatus: (id: string): void => {
    const tools = toolsStorage.getTools();
    const tool = tools.find(t => t.id === id);
    if (tool) {
      tool.isActive = !tool.isActive;
      toolsStorage.saveTools(tools);
    }
  },

  updateTool: (id: string, updates: Partial<Tool>): void => {
    const tools = toolsStorage.getTools();
    const index = tools.findIndex(t => t.id === id);
    if (index !== -1) {
      tools[index] = { ...tools[index], ...updates };
      toolsStorage.saveTools(tools);
    }
  },

  reorderTools: (newOrder: Tool[]): void => {
    const updated = newOrder.map((t, idx) => ({ ...t, order: idx + 1 }));
    toolsStorage.saveTools(updated);
  },

  checkAndMigrateTools: (): void => {
    const currentTools = toolsStorage.getTools();
    let hasChanges = false;

    // 1. Ajouter les manquants
    DEFAULT_TOOLS.forEach(defaultTool => {
      if (!currentTools.find(t => t.id === defaultTool.id)) {
        currentTools.push(defaultTool);
        hasChanges = true;
      }
    });

    // 2. Mettre à jour les catégories et accessLevel
    currentTools.forEach(tool => {
        const defaultDef = DEFAULT_TOOLS.find(t => t.id === tool.id);
        if (defaultDef) {
            if (tool.category !== defaultDef.category) {
                tool.category = defaultDef.category;
                hasChanges = true;
            }
            // Migration Access Level si manquant
            if (!tool.accessLevel) {
                tool.accessLevel = defaultDef.accessLevel;
                hasChanges = true;
            }
        } else if (!tool.accessLevel) {
            tool.accessLevel = 'public'; // Défaut pour les outils custom
            hasChanges = true;
        }
    });

    if (hasChanges) {
      toolsStorage.saveTools(currentTools);
    }
  }
};
