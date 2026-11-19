/**
 * SITE CONFIGURATION — single source of truth for business details,
 * contact methods, form submission and analytics.
 * Everything here was taken from the live solarecreative.art site.
 */
export const site = {
  name: 'Solare Creative',
  shortName: 'SOLARE',
  url: 'https://www.solarecreative.art',
  location: { tr: 'Antalya, Türkiye', en: 'Antalya, Türkiye' },

  contact: {
    email: 'hello@solarecreative.art',
    instagram: 'https://www.instagram.com/solarecreative.art/',
    instagramHandle: '@solarecreative.art',
    /** International format without "+" — used for wa.me links. Set to '' to hide WhatsApp. */
    whatsapp: '905051562376',
    whatsappDisplay: '+90 505 156 23 76',
  },

  form: {
    /**
     * Contact form submission.
     * Leave '' to use the mailto fallback (opens the visitor's e-mail app with
     * the message pre-filled — nothing is sent by the site itself).
     * Set to a JSON-accepting POST endpoint to submit in the background, e.g.
     *   Formspree:  'https://formspree.io/f/xxxxxxx'
     *   Web3Forms / your own API: any URL that accepts JSON and returns 2xx.
     */
    endpoint: '',
    /** Extra fields merged into the POST body (e.g. { access_key: '...' } for Web3Forms). */
    extraFields: {} as Record<string, string>,
  },

  audio: {
    /**
     * Your own music / ambience. Put the file at public/audio/ambient.mp3
     * (or change this path). It loops when the visitor turns sound on.
     * While the file is missing, the built-in synthesised ambience plays instead.
     */
    music: '/audio/ambient.mp3',
    /** 0..1 */
    volume: 0.8,
  },

  analytics: {
    /**
     * Privacy-respecting analytics. Disabled until configured.
     * provider: 'none' | 'plausible' | 'umami'
     */
    provider: 'none' as 'none' | 'plausible' | 'umami',
    /** plausible: your domain (data-domain). umami: website id. */
    siteId: '',
    /** Script URL, e.g. 'https://plausible.io/js/script.js' or your Umami script. */
    scriptSrc: '',
    /** Honour the browser's Do-Not-Track signal. */
    respectDnt: true,
  },
} as const;

export type Lang = 'tr' | 'en';
export type L<T = string> = Record<Lang, T>;
