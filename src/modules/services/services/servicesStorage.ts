
import { Service, ServicesSettings } from "../types/Service";
import { supabase, isSupabaseConfigured } from "../../../lib/supabase";

const SERVICES_KEY = "comptalink_services_local";
const SETTINGS_KEY = "comptalink_services_settings";

const DEFAULT_SETTINGS: ServicesSettings = {
  pageTitle: "Notre Expertise au Service de votre Croissance",
  pageDescription: "ComptaLink vous accompagne avec des solutions digitales et une expertise humaine de haut niveau pour sécuriser votre gestion.",
  showContactForm: true
};

const INITIAL_SERVICES: Service[] = [
  {
    id: "svc-compta",
    title: "Comptabilité Générale",
    slug: "comptabilite-generale",
    description: "Tenue de comptabilité et bilans certifiés.",
    fullDescription: "Nous assurons la saisie, le lettrage et l'établissement de vos états financiers (Bilan, TCR) en totale conformité avec le SCF algérien. Nos experts utilisent l'IA pour automatiser la saisie et se concentrer sur l'analyse de vos chiffres.",
    icon: "account_balance",
    features: [
      { id: "f1", text: "Tenue de comptabilité mensuelle" },
      { id: "f2", text: "Établissement du bilan annuel" },
      { id: "f3", text: "Situations comptables intermédiaires" }
    ],
    primaryCta: { label: "Estimer mes honoraires", action: "calculator" },
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "svc-fiscal",
    title: "Fiscalité & Déclarations",
    slug: "fiscalite",
    description: "Optimisation fiscale et déclarations G50.",
    fullDescription: "Ne craignez plus les échéances fiscales. Nous gérons vos déclarations mensuelles (G50) et annuelles tout en optimisant votre charge fiscale selon les dernières Lois de Finances.",
    icon: "receipt_long",
    features: [
      { id: "f4", text: "Déclarations G50 et acomptes" },
      { id: "f5", text: "Optimisation fiscale légale" },
      { id: "f6", text: "Assistance contrôle fiscal" }
    ],
    primaryCta: { label: "Contacter un expert", action: "contact" },
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "svc-startup",
    title: "Pôle Start-up & Création",
    slug: "creation-startup",
    description: "Accompagnement complet du projet au Label.",
    fullDescription: "De la rédaction des statuts à l'obtention du Label Start-up, nous vous guidons dans le labyrinthe administratif algérien pour lancer votre projet sur des bases solides.",
    icon: "rocket_launch",
    features: [
      { id: "f7", text: "Rédaction des statuts & RC" },
      { id: "f8", text: "Dossier Label Startup" },
      { id: "f9", text: "Business Plan & Valorisation" }
    ],
    primaryCta: { label: "Lancer mon projet", action: "contact" },
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "svc-audit",
    title: "Audit & Commissariat",
    slug: "audit",
    description: "Certification légale et audit de performance.",
    fullDescription: "Assurez la transparence de vos comptes auprès des tiers et des banques grâce à nos missions de commissariat aux comptes et d'audit contractuel.",
    icon: "verified_user",
    features: [
      { id: "f10", text: "Certification des comptes" },
      { id: "f11", text: "Audit d'acquisition" },
      { id: "f12", text: "Commissariat aux apports" }
    ],
    primaryCta: { label: "Demander un audit", action: "contact" },
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const servicesStorage = {
  getServices: async (): Promise<Service[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('services').select('*').order('sort_order');
      if (error || !data || data.length === 0) return servicesStorage.getLocalServices();
      return data.map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        description: s.description,
        fullDescription: s.full_description,
        icon: s.icon,
        features: s.features,
        primaryCta: s.primary_cta,
        order: s.sort_order,
        isActive: s.is_active,
        createdAt: s.created_at,
        updatedAt: s.created_at
      }));
    }
    return servicesStorage.getLocalServices();
  },

  getLocalServices: (): Service[] => {
    const stored = localStorage.getItem(SERVICES_KEY);
    if (!stored) {
        localStorage.setItem(SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
        return INITIAL_SERVICES;
    }
    return JSON.parse(stored);
  },

  getServiceById: async (id: string): Promise<Service | null> => {
    const all = await servicesStorage.getServices();
    return all.find(s => s.id === id) || null;
  },

  createService: async (service: Service): Promise<void> => {
    const id = Date.now().toString();
    const newService = { ...service, id, createdAt: new Date().toISOString() };
    
    if (isSupabaseConfigured) {
      await supabase.from('services').insert([{
        title: service.title,
        slug: service.slug,
        description: service.description,
        full_description: service.fullDescription,
        icon: service.icon,
        features: service.features,
        primary_cta: service.primaryCta,
        sort_order: service.order,
        is_active: service.isActive
      }]);
    } else {
      const local = servicesStorage.getLocalServices();
      localStorage.setItem(SERVICES_KEY, JSON.stringify([...local, newService]));
    }
  },

  updateService: async (id: string, service: Service): Promise<void> => {
    if (isSupabaseConfigured && id.length > 20) {
      await supabase.from('services').update({
        title: service.title,
        description: service.description,
        full_description: service.fullDescription,
        icon: service.icon,
        features: service.features,
        primary_cta: service.primaryCta,
        sort_order: service.order,
        is_active: service.isActive
      }).eq('id', id);
    } else {
      const local = servicesStorage.getLocalServices();
      const updated = local.map(s => s.id === id ? { ...service, updatedAt: new Date().toISOString() } : s);
      localStorage.setItem(SERVICES_KEY, JSON.stringify(updated));
    }
  },

  deleteService: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && id.length > 20) {
      await supabase.from('services').delete().eq('id', id);
    } else {
      const local = servicesStorage.getLocalServices();
      const filtered = local.filter(s => s.id !== id);
      localStorage.setItem(SERVICES_KEY, JSON.stringify(filtered));
    }
  },

  getSettings: (): ServicesSettings => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  },

  saveSettings: (settings: ServicesSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
