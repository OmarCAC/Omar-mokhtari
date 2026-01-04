
import { siteSettingsStorage, PageSeo } from './siteSettingsStorage';

export const seoService = {
  applySeoForPage: (pageKey: string) => {
    const settings = siteSettingsStorage.getSettings();
    const seo = settings.seo[pageKey] || settings.seo['home'];

    // Fix: Add guard for potentially undefined seo object
    if (!seo) return;

    // 1. Title
    document.title = seo.title;

    // 2. Meta Description
    // Fix: Use seoService instead of this due to arrow function lexical binding
    seoService.updateMetaTag('description', seo.description);

    // 3. Meta Keywords
    seoService.updateMetaTag('keywords', seo.keywords);

    // 4. Open Graph
    seoService.updateMetaTag('og:title', seo.title, 'property');
    seoService.updateMetaTag('og:description', seo.description, 'property');
    seoService.updateMetaTag('og:image', seo.ogImage, 'property');
    seoService.updateMetaTag('og:url', window.location.href, 'property');

    // 5. Canonical
    let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', seo.canonical || window.location.href);
  },

  updateMetaTag: (name: string, content: string, attr: 'name' | 'property' = 'name') => {
    if (!content) return;
    let element = document.querySelector(`meta[${attr}='${name}']`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }
};
