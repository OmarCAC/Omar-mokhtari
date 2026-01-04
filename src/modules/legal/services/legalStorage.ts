
import { LegalContent, LegalPageType } from "../types/LegalContent";

const STORAGE_KEY = "comptalink_legal_content";

const DEFAULT_CONTENT: Record<LegalPageType, LegalContent> = {
  'mentions-legales': {
    type: 'mentions-legales',
    title: 'Mentions Légales',
    content: "<h2>1. Éditeur du site</h2><p>Le site ComptaLink est édité par [Nom de la Société], SARL au capital de [Montant] DA, immatriculée au Registre du Commerce sous le numéro [Numéro].</p><p>Siège social : 123 Rue de la Liberté, Alger, Algérie.</p><h2>2. Directeur de la publication</h2><p>[Nom du Directeur]</p><h2>3. Hébergement</h2><p>Le site est hébergé par [Nom de l'hébergeur].</p>",
    lastUpdated: new Date().toISOString()
  },
  'politique-confidentialite': {
    type: 'politique-confidentialite',
    title: 'Politique de Confidentialité',
    content: "<h2>1. Collecte des données</h2><p>Nous collectons les informations suivantes : Nom, Prénom, Adresse email, Numéro de téléphone.</p><h2>2. Utilisation des données</h2><p>Ces données sont utilisées pour répondre à vos demandes de devis et vous contacter.</p>",
    lastUpdated: new Date().toISOString()
  },
  'conditions-utilisation': {
    type: 'conditions-utilisation',
    title: "Conditions Générales d'Utilisation",
    content: "<h2>1. Objet</h2><p>Les présentes CGU ont pour objet de définir les modalités de mise à disposition des services du site ComptaLink.</p><h2>2. Accès au site</h2><p>Le site est accessible gratuitement à tout utilisateur disposant d'un accès à internet.</p>",
    lastUpdated: new Date().toISOString()
  }
};

export const legalStorage = {
  getAll: (): Record<LegalPageType, LegalContent> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTENT));
        return DEFAULT_CONTENT;
      }
      return { ...DEFAULT_CONTENT, ...JSON.parse(stored) }; // Merge pour éviter les erreurs si clés manquantes
    } catch (error) {
      return DEFAULT_CONTENT;
    }
  },

  getPage: (type: LegalPageType): LegalContent => {
    const all = legalStorage.getAll();
    return all[type];
  },

  savePage: (type: LegalPageType, data: LegalContent): void => {
    const all = legalStorage.getAll();
    all[type] = { ...data, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
};
