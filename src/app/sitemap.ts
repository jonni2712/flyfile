import { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/config';

// Map of Italian paths to their translated versions per locale
const translatedPaths: Record<string, Record<string, string>> = {
  '/': { it: '/', en: '/', de: '/', fr: '/', es: '/' },
  '/funzionalita': { it: '/funzionalita', en: '/features', de: '/funktionen', fr: '/fonctionnalites', es: '/funcionalidades' },
  '/prezzi': { it: '/prezzi', en: '/pricing', de: '/preise', fr: '/tarifs', es: '/precios' },
  '/sicurezza': { it: '/sicurezza', en: '/security', de: '/sicherheit', fr: '/securite', es: '/seguridad' },
  '/chi-siamo': { it: '/chi-siamo', en: '/about', de: '/ueber-uns', fr: '/a-propos', es: '/quienes-somos' },
  '/documentazione': { it: '/documentazione', en: '/documentation', de: '/dokumentation', fr: '/documentation', es: '/documentacion' },
  '/contatti': { it: '/contatti', en: '/contact', de: '/kontakt', fr: '/contact', es: '/contacto' },
  '/supporto': { it: '/supporto', en: '/support', de: '/support', fr: '/support', es: '/soporte' },
  '/privacy': { it: '/privacy', en: '/privacy', de: '/datenschutz', fr: '/confidentialite', es: '/privacidad' },
  '/termini': { it: '/termini', en: '/terms', de: '/agb', fr: '/conditions', es: '/terminos' },
  '/cookie': { it: '/cookie', en: '/cookies', de: '/cookies', fr: '/cookies', es: '/cookies' },
};

const pages: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/funzionalita', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/prezzi', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/sicurezza', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/chi-siamo', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/documentazione', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/contatti', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/supporto', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/termini', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/cookie', changeFrequency: 'yearly', priority: 0.3 },
];

function getLocalizedUrl(path: string, locale: string): string {
  const baseUrl = 'https://flyfile.it';
  const translatedPath = translatedPaths[path]?.[locale] || path;
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return `${baseUrl}${prefix}${translatedPath === '/' ? '' : translatedPath}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  return pages.map((page) => {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = getLocalizedUrl(page.path, locale);
    }

    return {
      url: getLocalizedUrl(page.path, defaultLocale),
      lastModified: currentDate,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages,
      },
    };
  });
}
