
import { Service, ServicesSettings } from "../types/Service";

const SERVICES_KEY = "comptalink_services";
const SERVICES_SETTINGS_KEY = "comptalink_services_settings";

// Fonction utilitaire pour générer des IDs uniques compatibles partout
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const DEFAULT_SETTINGS: ServicesSettings = {
  pageTitle: "Nos Services",
  pageDescription: "Nous offrons une gamme complète de services pour répondre à tous vos besoins comptables, fiscaux et juridiques en Algérie.",
  showContactForm: true
};

const INITIAL_SERVICES: Service[] = [
  {
    id: "svc-1",
    title: "Comptabilité Générale",
    slug: "comptabilite-generale",
    description: "Gestion complète de vos comptes et bilans.",
    fullDescription: "De la saisie à la production des états financiers, nous assurons la conformité et la fiabilité de vos comptes. Nos services incluent la tenue de comptabilité, les déclarations périodiques et l'établissement des bilans.",
    icon: "account_balance",
    features: [
      { id: "f1", text: "Tenue de la comptabilité" },
      { id: "f2", text: "Établissement des bilans annuels" },
      { id: "f3", text: "Situations intermédiaires" }
    ],
    primaryCta: {
      label: "Obtenir un devis",
      action: "calculator"
    },
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "svc-2",
    title: "Fiscalité",
    slug: "fiscalite",
    description: "Optimisation fiscale et déclarations conformes.",
    fullDescription: "Optimisez votre charge fiscale et sécurisez vos déclarations. Nous vous assistons dans l'établissement de toutes vos déclarations fiscales (G50, G29, etc.) et vous conseillons pour l'optimisation fiscale.",
    icon: "receipt_long",
    features: [
      { id: "f4", text: "Déclarations mensuelles (G50)" },
      { id: "f5", text: "Optimisation fiscale" },
      { id: "f6", text: "Assistance en cas de contrôle" }
    ],
    primaryCta: {
      label: "Contacter un expert",
      action: "contact"
    },
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "svc-3",
    title: "Conseil Juridique",
    slug: "conseil-juridique",
    description: "Accompagnement juridique pour sécuriser vos décisions.",
    fullDescription: "Accompagnement juridique pour sécuriser vos décisions. Nous offrons une assistance pour le secrétariat juridique et la rédaction de contrats commerciaux.",
    icon: "gavel",
    features: [
      { id: "f7", text: "Secrétariat juridique annuel" },
      { id: "f8", text: "Modification de statuts" },
      { id: "f9", text: "Contrats commerciaux" }
    ],
    primaryCta: {
      label: "Demander conseil",
      action: "contact"
    },
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "svc-4",
    title: "Création d'entreprise",
    slug: "creation-entreprise",
    description: "Lancement de votre entreprise de A à Z.",
    fullDescription: "Nous vous accompagnons à chaque étape : choix de la forme juridique, rédaction des statuts, immatriculation au registre de commerce.",
    icon: "business_center",
    features: [
      { id: "f10", text: "Statuts juridiques" },
      { id: "f11", text: "Immatriculation CNRC" },
      { id: "f12", text: "Dossier fiscal et social" }
    ],
    primaryCta: {
      label: "Lancer mon projet",
      action: "contact"
    },
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "svc-5",
    title: "Commissariat aux Comptes",
    slug: "commissariat-aux-comptes",
    description: "Certification et audit légal de vos comptes.",
    fullDescription: "Nous assurons la mission légale de certification des comptes annuels pour garantir la transparence et la régularité de votre information financière auprès des tiers et des actionnaires.",
    icon: "verified_user",
    features: [
      { id: "f13", text: "Certification des comptes" },
      { id: "f14", text: "Audit légal" },
      { id: "f15", text: "Rapport aux actionnaires" }
    ],
    primaryCta: {
      label: "Demander un audit",
      action: "contact"
    },
    order: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "svc-6",
    title: "Vérification Fiscale Préventive",
    slug: "verification-fiscale-preventive",
    description: "Audit blanc pour sécuriser vos déclarations.",
    fullDescription: "Anticipez les contrôles fiscaux grâce à notre audit préventif. Nous analysons votre comptabilité pour détecter et corriger les risques fiscaux en amont.",
    icon: "fact_check",
    features: [
      { id: "f16", text: "Audit fiscal à blanc" },
      { id: "f17", text: "Revue des liasses" },
      { id: "f18", text: "Correction des anomalies" }
    ],
    primaryCta: {
      label: "Sécuriser ma fiscalité",
      action: "contact"
    },
    order: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const servicesStorage = {
  // --- Services ---

  getServices: (): Service[] => {
    try {
      const stored = localStorage.getItem(SERVICES_KEY);
      if (!stored) {
        // Initialisation si vide
        localStorage.setItem(SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
        return INITIAL_SERVICES;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error("Erreur lecture services:", error);
      return [];
    }
  },

  getServiceById: (id: string): Service | null => {
    const services = servicesStorage.getServices();
    return services.find(s => s.id === id) || null;
  },

  createService: (service: Service): void => {
    const services = servicesStorage.getServices();
    const newService = {
      ...service,
      id: service.id || generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    services.push(newService);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  },

  updateService: (id: string, updatedService: Service): void => {
    const services = servicesStorage.getServices();
    const index = services.findIndex(s => s.id === id);
    if (index !== -1) {
      services[index] = {
        ...updatedService,
        id: id, // Sécurité : on garde l'ID original
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
    }
  },

  deleteService: (id: string): void => {
    const services = servicesStorage.getServices();
    const filtered = services.filter(s => s.id !== id);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(filtered));
  },

  saveServices: (services: Service[]): void => {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  },

  // --- Settings ---

  getSettings: (): ServicesSettings => {
    try {
      const stored = localStorage.getItem(SERVICES_SETTINGS_KEY);
      if (!stored) return DEFAULT_SETTINGS;
      return JSON.parse(stored);
    } catch (error) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: ServicesSettings): void => {
    localStorage.setItem(SERVICES_SETTINGS_KEY, JSON.stringify(settings));
  }
};
