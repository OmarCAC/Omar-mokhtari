
import { siteSettingsStorage as rootStorage, SiteSettings as RootSettings, MenuItem as RootMenuItem, SocialLinks as RootSocialLinks, PageSeo as RootPageSeo, Testimonial as RootTestimonial } from '../../services/siteSettingsStorage';

export type MenuItem = RootMenuItem;
export type SocialLinks = RootSocialLinks;
export type SiteSettings = RootSettings;
// Re-export PageSeo to fix import error in src/services/seoService.ts
export type PageSeo = RootPageSeo;
// Re-export Testimonial to fix import error in pages/admin/AdminTestimonials.tsx
export type Testimonial = RootTestimonial;

export const siteSettingsStorage = rootStorage;
