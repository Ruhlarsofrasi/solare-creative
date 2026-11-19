import type { L } from './site';

export type PlanetId = 'films' | 'architecture' | 'social' | 'ai-motion' | 'about' | 'contact' | 'gallery';
/** The destinations are the real planets, in order from the sun. */
export type PlanetKind = 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus';

export interface MoonConfig {
  radius: number;
  distance: number;
  speed: number;
  phase: number;
  incline: number;
  /** Tint multiplied over the grey rock (e.g. Io is sulphur yellow). */
  tint?: string;
}

export interface PlanetConfig {
  id: PlanetId;
  /** URL slug — identical in both languages. */
  slug: string;
  index: string;
  kind: PlanetKind;
  /** The real planet this destination lives on. */
  body: L;
  name: L;
  tagline: L;
  /** Orbit radius, start angle (rad), angular speed (rad/s), vertical offset. */
  orbit: { radius: number; angle: number; speed: number; y: number };
  radius: number;
  spin: number;
  tilt: number;
  /** Accent used by UI, atmosphere and audio. */
  color: string;
  atmosphere: string;
  /** Atmosphere shell: relative size and brightness (0 = airless). */
  air: { scale: number; strength: number };
  /** Base frequency (Hz) of this destination's ambient chord. */
  tone: number;
  moons: MoonConfig[];
}

/**
 * The seven orbital destinations. Order = journey order = order from the sun.
 * Sizes and distances are art-directed, not to scale.
 */
export const planets: PlanetConfig[] = [
  {
    id: 'films',
    slug: 'films',
    index: '01',
    kind: 'mercury',
    body: { tr: 'Merkür', en: 'Mercury' },
    name: { tr: 'Sinematik Filmler', en: 'Cinematic Films' },
    tagline: { tr: 'Tanıtım, marka ve kampanya filmleri', en: 'Promotional, brand and campaign films' },
    orbit: { radius: 26, angle: 0.55, speed: 0.012, y: 0.6 },
    radius: 1.8,
    spin: 0.02,
    tilt: 0.03,
    color: '#cdbfae',
    atmosphere: '#bfae98',
    air: { scale: 1.04, strength: 0.06 },
    tone: 110,
    moons: [],
  },
  {
    id: 'architecture',
    slug: 'architecture',
    index: '02',
    kind: 'venus',
    body: { tr: 'Venüs', en: 'Venus' },
    name: { tr: 'Mimari', en: 'Architecture' },
    tagline: { tr: 'Mimari film, iç mekân ve drone', en: 'Architectural film, interiors and drone' },
    orbit: { radius: 35, angle: 2.05, speed: 0.0095, y: -0.8 },
    radius: 2.3,
    spin: -0.012,
    tilt: 0.05,
    color: '#ecd09a',
    atmosphere: '#f6dca6',
    air: { scale: 1.14, strength: 1.0 },
    tone: 146.83,
    moons: [],
  },
  {
    id: 'social',
    slug: 'social',
    index: '03',
    kind: 'earth',
    body: { tr: 'Dünya', en: 'Earth' },
    name: { tr: 'Sosyal İçerik', en: 'Social Content' },
    tagline: { tr: 'Kısa video, içerik serileri ve fotoğraf', en: 'Short video, content series and photography' },
    orbit: { radius: 44, angle: 3.7, speed: 0.008, y: 1.2 },
    radius: 2.4,
    spin: 0.06,
    tilt: 0.41,
    color: '#9cc0e6',
    atmosphere: '#6fa8ff',
    air: { scale: 1.12, strength: 0.95 },
    tone: 164.81,
    moons: [{ radius: 0.62, distance: 6.4, speed: 0.16, phase: 2.0, incline: 0.09 }],
  },
  {
    id: 'ai-motion',
    slug: 'ai-motion',
    index: '04',
    kind: 'mars',
    body: { tr: 'Mars', en: 'Mars' },
    name: { tr: 'AI & Motion', en: 'AI & Motion' },
    tagline: { tr: 'Yapay zekâ destekli üretim, motion ve CGI', en: 'AI-assisted production, motion and CGI' },
    orbit: { radius: 53, angle: 5.1, speed: 0.0068, y: -1.0 },
    radius: 2.0,
    spin: 0.055,
    tilt: 0.44,
    color: '#e58a5c',
    atmosphere: '#e9a070',
    air: { scale: 1.07, strength: 0.4 },
    tone: 98,
    moons: [
      { radius: 0.16, distance: 3.6, speed: 0.5, phase: 4.2, incline: 0.02 },
      { radius: 0.11, distance: 5.0, speed: 0.26, phase: 1.0, incline: 0.03 },
    ],
  },
  {
    id: 'about',
    slug: 'about',
    index: '05',
    kind: 'jupiter',
    body: { tr: 'Jüpiter', en: 'Jupiter' },
    name: { tr: 'Solare Hakkında', en: 'About Solare' },
    tagline: { tr: 'Stüdyo, süreç ve hizmetler', en: 'Studio, process and services' },
    orbit: { radius: 63, angle: 0.95, speed: 0.0056, y: 0.9 },
    radius: 3.7,
    spin: 0.09,
    tilt: 0.05,
    color: '#e3bd8f',
    atmosphere: '#f0cfa0',
    air: { scale: 1.08, strength: 0.5 },
    tone: 130.81,
    moons: [
      { radius: 0.2, distance: 6.2, speed: 0.36, phase: 1.1, incline: 0.02, tint: '#f2d77a' },
      { radius: 0.18, distance: 7.6, speed: 0.26, phase: 3.0, incline: 0.02, tint: '#e9e2d2' },
      { radius: 0.28, distance: 9.4, speed: 0.18, phase: 5.0, incline: 0.02, tint: '#b8a996' },
      { radius: 0.26, distance: 11.6, speed: 0.12, phase: 0.2, incline: 0.02, tint: '#8f8679' },
    ],
  },
  {
    id: 'contact',
    slug: 'contact',
    index: '06',
    kind: 'saturn',
    body: { tr: 'Satürn', en: 'Saturn' },
    name: { tr: 'İletişim', en: 'Contact' },
    tagline: { tr: 'Otelinizi konuşalım', en: 'Let’s talk about your hotel' },
    orbit: { radius: 75, angle: 2.75, speed: 0.0047, y: -0.5 },
    radius: 3.0,
    spin: 0.08,
    tilt: 0.47,
    color: '#ecd9a8',
    atmosphere: '#f3e0b0',
    air: { scale: 1.08, strength: 0.45 },
    tone: 196,
    moons: [{ radius: 0.3, distance: 10.5, speed: 0.12, phase: 2.2, incline: 0.45, tint: '#e0b070' }],
  },
  {
    id: 'gallery',
    slug: 'gallery',
    index: '07',
    kind: 'uranus',
    body: { tr: 'Uranüs', en: 'Uranus' },
    name: { tr: 'Galeri', en: 'Gallery' },
    tagline: { tr: 'Seçilmiş kareler', en: 'Selected frames' },
    orbit: { radius: 85, angle: 4.35, speed: 0.0041, y: 0.7 },
    radius: 2.7,
    spin: 0.07,
    // Uranus rolls on its side
    tilt: 1.71,
    color: '#a6dde0',
    atmosphere: '#9fe3ee',
    air: { scale: 1.07, strength: 0.55 },
    tone: 174.61,
    moons: [
      { radius: 0.22, distance: 6.0, speed: 0.3, phase: 0.6, incline: 1.5, tint: '#d8d4cc' },
      { radius: 0.2, distance: 7.6, speed: 0.2, phase: 3.4, incline: 1.5, tint: '#c9c2b8' },
    ],
  },
];

export const SUN_RADIUS = 10;
export const planetById = (id: string) => planets.find((p) => p.id === id);
export const planetBySlug = (slug: string) => planets.find((p) => p.slug === slug);
export const planetIndex = (id: PlanetId) => planets.findIndex((p) => p.id === id);
