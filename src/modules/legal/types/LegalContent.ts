
export type LegalPageType = 'mentions-legales' | 'politique-confidentialite' | 'conditions-utilisation';

export interface LegalContent {
  type: LegalPageType;
  title: string;
  content: string; // HTML ou texte riche
  lastUpdated: string;
}
