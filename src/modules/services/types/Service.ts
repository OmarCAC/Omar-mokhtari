
export interface ServiceFeature {
  /** ID unique de la fonctionnalité (UUID) */
  id: string;
  /** Texte descriptif de la fonctionnalité */
  text: string;
}

export interface ServiceCta {
  /** Texte affiché sur le bouton */
  label: string;
  /** Type d'action déclenchée au clic */
  action: "link" | "contact" | "calculator";
  /** URL de destination si action = "link" */
  url?: string;
}

export interface Service {
  /** Identifiant unique du service (UUID) */
  id: string;
  /** Titre principal du service */
  title: string;
  /** URL-friendly identifier (généré depuis le titre) */
  slug: string;
  /** Description courte pour les aperçus (1-2 lignes) */
  description: string;
  /** Description complète et détaillée */
  fullDescription: string;
  /** Nom de l'icône Material Symbols (ex: 'account_balance') */
  icon: string;
  /** Liste des points clés / avantages */
  features: ServiceFeature[];
  /** Bouton d'action principal */
  primaryCta: ServiceCta;
  /** Bouton d'action secondaire (optionnel) */
  secondaryCta?: ServiceCta;
  /** Ordre d'affichage dans la liste */
  order: number;
  /** État de publication (true = visible, false = brouillon) */
  isActive: boolean;
  /** Date de création (ISO String) */
  createdAt: string;
  /** Date de dernière modification (ISO String) */
  updatedAt: string;
}

export interface ServicesSettings {
  /** Titre H1 de la page publique */
  pageTitle: string;
  /** Sous-titre / Introduction de la page publique */
  pageDescription: string;
  /** Afficher ou non la section de contact en bas de page */
  showContactForm: boolean;
}
