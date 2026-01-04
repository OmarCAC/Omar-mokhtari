
export type ToolAccessLevel = 'public' | 'member' | 'premium';

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  cta: string;
  isActive: boolean;
  isNew: boolean;
  isPopular: boolean;
  order: number;
  category?: string;
  type?: 'internal' | 'link' | 'download';
  resourceUrl?: string;
  accessLevel: ToolAccessLevel; // Nouveau champ
}

export type TaxRegime = 'reel' | 'simplifie' | 'ifu' | 'auto-entrepreneur' | 'agricole' | 'particulier';

export interface FiscalEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'mensuel' | 'trimestriel' | 'annuel' | 'acompte';
  description: string;
  formLink?: string; // Lien vers le formulaire DGI
  isRecurring?: boolean;
  regimes: TaxRegime[]; // Régimes concernés
}
