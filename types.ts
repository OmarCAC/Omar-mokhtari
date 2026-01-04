
export type BlogStatus = "draft" | "review" | "ready" | "published" | "archived";
export type UserRole = "author" | "editor" | "admin";

export interface BlogUser {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isVisible?: boolean; // Nouveau champ pour gérer la visibilité
}

export interface Tag {
  id: string;
  name: string;
}

export interface QualityChecklist {
  goalDefined: boolean;
  spellchecked: boolean;
  structuredWithHeadings: boolean;
  hasImagesWithAlt: boolean;
  hasSources: boolean;
  minLengthReached: boolean;
}

export interface BlogStats {
  postId: string;
  views: number;
  avgReadTimeSeconds: number;
  primaryCtaClicks: number;
  shares: number;
  lastUpdatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // HTML content
  featuredImageUrl: string;
  featuredImageAlt: string;
  categoryId: string;
  tagIds: string[];
  status: BlogStatus;
  authorId: string;
  editorId?: string;
  createdAt: string;
  publishedAt?: string;
  updatedAt?: string;
  targetKeywords: string[];
  metaTitle?: string;
  metaDescription?: string;
  wordCount: number;
  qualityChecklist: QualityChecklist;
  isPinned?: boolean;
}

export const INITIAL_CHECKLIST: QualityChecklist = {
  goalDefined: false,
  spellchecked: false,
  structuredWithHeadings: false,
  hasImagesWithAlt: false,
  hasSources: false,
  minLengthReached: false,
};
