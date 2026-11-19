import type { L } from '../config/site';
import type { PlanetId } from '../config/planets';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  PROJECT DATA — the only file you need to edit to add or replace work.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  To publish a real film:
 *   1. Put the files in  /public/media/   (e.g. golden-hour.mp4, golden-hour.jpg)
 *   2. Fill in `video` and `poster` below, e.g.
 *        video:  '/media/golden-hour.mp4',
 *        poster: '/media/golden-hour.jpg',
 *      (an external URL such as a CDN / Mux / Cloudflare Stream MP4 also works)
 *   3. Set `demo: false` once the project is a real, approved credit.
 *
 *  Optional: `gallery` — extra stills shown on the project page.
 *  Optional: `previewVideo` — a small, short, muted loop for the 3D billboard
 *            (falls back to `video`; keep it light, e.g. 720p / < 4 MB).
 *
 *  Media mix: set `kind: 'still'` + `poster` for photography, `kind: 'film'` for films.
 *  A film without `video` shows its `poster` (or, with neither, the procedural study).
 *
 *  While `video` is empty, the site shows a procedural "light study" on the
 *  billboard and in the player, clearly labelled as a demo visual.
 *
 *  `planet` decides which orbital destination the project belongs to:
 *    'films' | 'architecture' | 'social' | 'ai-motion'
 *  `format` decides the billboard architecture in space:
 *    'wide' (21:9 screen) | 'vertical' (9:16 tower) | 'curved' (orbital arc)
 */
export interface Project {
  slug: string;
  planet: Extract<PlanetId, 'films' | 'architecture' | 'social' | 'ai-motion'>;
  format: 'wide' | 'vertical' | 'curved';
  title: string;
  /** true = placeholder / demo project, not a client credit. */
  demo: boolean;
  category: L;
  location?: L;
  year?: string;
  summary: L;
  description: L;
  scope: L<string[]>;
  /**
   * What the piece is: a 'film' (plays in the player; shows poster until video is set)
   * or a 'still' (photography — shown as an image on the billboard, card and project page).
   */
  kind: 'film' | 'still';
  /** Three colours driving the procedural demo visual + poster. */
  palette: [string, string, string];
  video?: string;
  previewVideo?: string;
  poster?: string;
  gallery?: string[];
}

export const projects: Project[] = [
  // ── CINEMATIC FILMS ───────────────────────────────────────────────────
  {
    slug: 'golden-hour',
    planet: 'films',
    format: 'wide',
    title: 'Golden Hour',
    demo: true,
    category: { tr: 'Marka Filmi', en: 'Brand Film' },
    location: { tr: 'Örnek konsept', en: 'Sample concept' },
    summary: {
      tr: 'Sabahtan akşama, bir günün ışığıyla anlatılan otel filmi.',
      en: 'A hotel film told through the light of one day, morning to evening.',
    },
    description: {
      tr: 'Örnek bir konsept. Film ilk ışıkla açılıyor, misafirin gününü takip ediyor ve akşam mavisinde kapanıyor. Gerçek film yayınlandığında bu sayfa güncellenecek.',
      en: 'A sample concept. The film opens on first light, follows a guest’s day and closes at dusk. This page will be updated when the real film is released.',
    },
    scope: {
      tr: ['Konsept & senaryo', 'Sinematik çekim', 'Drone', 'Renk & ses'],
      en: ['Concept & script', 'Cinematography', 'Drone', 'Colour & sound'],
    },
    palette: ['#f2c27a', '#b4552a', '#1b1410'],
    kind: 'film',
    video: '',
    poster: '/media/hero-pool.webp',
  },
  {
    slug: 'horizon',
    planet: 'films',
    format: 'wide',
    title: 'Horizon',
    demo: true,
    category: { tr: 'Kampanya Filmi', en: 'Campaign Film' },
    location: { tr: 'Örnek konsept', en: 'Sample concept' },
    summary: {
      tr: 'Deniz, ufuk ve sessizlik üzerine bir sezon kampanyası.',
      en: 'A seasonal campaign about the sea, the horizon and quiet.',
    },
    description: {
      tr: 'Örnek bir konsept. Sahil, havuz ve hava çekimlerini tek bir ufuk çizgisi etrafında toplayan sezon kampanyası.',
      en: 'A sample concept. A seasonal campaign that brings the shore, the pool and aerial shots together around one horizon line.',
    },
    scope: {
      tr: ['Kampanya fikri', 'Hava çekimi', 'Kurgu', '30 / 15 sn versiyonlar'],
      en: ['Campaign idea', 'Aerials', 'Edit', '30 / 15 sec versions'],
    },
    palette: ['#9fd8d2', '#e9c58d', '#0e1a1c'],
    kind: 'film',
    video: '',
    poster: '',
  },

  // ── ARCHITECTURE ──────────────────────────────────────────────────────
  {
    slug: 'quiet-room',
    planet: 'architecture',
    format: 'wide',
    title: 'Quiet Room',
    demo: true,
    category: { tr: 'Mimari Fotoğraf', en: 'Architectural Photography' },
    location: { tr: 'Örnek konsept', en: 'Sample concept' },
    summary: {
      tr: 'Bir odanın oranlarını ve dokusunu izleyen sakin bir seri.',
      en: 'A calm series following the proportions and textures of a room.',
    },
    description: {
      tr: 'Örnek bir konsept. Malzemeyi ve ışığı öne alan, yavaş ve kontrollü kadrajlardan oluşan bir mimari seri.',
      en: 'A sample concept. An architectural series of slow, controlled frames that put material and light first.',
    },
    scope: {
      tr: ['Mekân keşfi', 'Gimbal çekimi', 'Mimari fotoğraf', 'Renk'],
      en: ['Location scouting', 'Gimbal work', 'Architectural photography', 'Colour'],
    },
    palette: ['#d8d2c4', '#7c8a8e', '#141618'],
    kind: 'still',
    video: '',
    poster: '/media/services-room.webp',
    gallery: ['/media/about-lounge.webp'],
  },
  {
    slug: 'night-reveal',
    planet: 'architecture',
    format: 'vertical',
    title: 'Night Reveal',
    demo: true,
    category: { tr: 'Drone & Gece Çekimi', en: 'Drone & Night Shoot' },
    location: { tr: 'Örnek konsept', en: 'Sample concept' },
    summary: {
      tr: 'Dışarıdan içeriye uzanan bir gece açılışı.',
      en: 'A night opening that moves from outside to inside.',
    },
    description: {
      tr: 'Örnek bir konsept. Havadan başlayıp cepheye, oradan aydınlatılmış restorana inen bir gece açılışı.',
      en: 'A sample concept. A night opening that starts in the air, comes down to the façade and ends inside the lit restaurant.',
    },
    scope: {
      tr: ['Drone çekimi', 'Gimbal çekimi', 'Gece çekimi', 'Ses tasarımı'],
      en: ['Drone', 'Gimbal work', 'Night shoot', 'Sound design'],
    },
    palette: ['#c9b8ff', '#e3a45e', '#0c0d16'],
    kind: 'film',
    video: '',
    poster: '/media/process-restaurant.webp',
  },

  // ── SOCIAL CONTENT ────────────────────────────────────────────────────
  {
    slug: 'shoreline',
    planet: 'social',
    format: 'vertical',
    title: 'Shoreline',
    demo: true,
    category: { tr: 'Sosyal İçerik Serisi', en: 'Social Series' },
    location: { tr: 'Örnek konsept', en: 'Sample concept' },
    summary: {
      tr: 'Bir sezon boyunca yayınlanacak dikey kısa video serisi.',
      en: 'A series of vertical short videos for one season.',
    },
    description: {
      tr: 'Örnek bir konsept. Tek bir çekim döneminde üretilen; oda, mutfak ve deneyim başlıklarına ayrılmış, takvime göre planlanmış dikey içerikler.',
      en: 'A sample concept. Vertical content shot in one window, split into rooms, kitchen and experiences, and planned against a calendar.',
    },
    scope: {
      tr: ['İçerik planı', 'Dikey çekim', 'Reels / TikTok kurgusu', 'Yayın takvimi'],
      en: ['Content plan', 'Vertical shoot', 'Reels / TikTok edits', 'Publishing calendar'],
    },
    palette: ['#f4d9c2', '#a6b18a', '#161713'],
    kind: 'still',
    video: '',
    poster: '/media/work-beach.webp',
  },
  {
    slug: 'kitchen-rhythm',
    planet: 'social',
    format: 'vertical',
    title: 'Kitchen Rhythm',
    demo: true,
    category: { tr: 'Dijital Kampanya', en: 'Digital Campaign' },
    location: { tr: 'Örnek konsept', en: 'Sample concept' },
    summary: {
      tr: 'Mutfağa odaklanan kısa bir dijital kampanya.',
      en: 'A short digital campaign about the kitchen.',
    },
    description: {
      tr: 'Örnek bir konsept. Mutfağın temposunu, servisin detaylarını ve akşam masasını 15 saniyelik parçalara bölen bir kampanya.',
      en: 'A sample concept. A campaign that cuts the pace of the kitchen, the details of service and the evening table into 15-second pieces.',
    },
    scope: {
      tr: ['Kampanya fikri', 'Yemek çekimi', '9:16 / 4:5 teslim', 'Reklam versiyonları'],
      en: ['Campaign idea', 'Food shoot', '9:16 / 4:5 delivery', 'Ad versions'],
    },
    palette: ['#e8b37a', '#8c3f2b', '#150f0c'],
    kind: 'still',
    video: '',
    poster: '/media/work-gastronomy.webp',
    gallery: ['/media/process-restaurant.webp'],
  },

  // ── AI & MOTION ───────────────────────────────────────────────────────
  {
    slug: 'solar-study',
    planet: 'ai-motion',
    format: 'curved',
    title: 'Solar Study',
    demo: true,
    category: { tr: 'AI Konsept Filmi', en: 'AI Concept Film' },
    location: { tr: 'Stüdyo çalışması', en: 'Studio work' },
    summary: {
      tr: 'Işığın bir mekânı nasıl değiştirdiğine dair stüdyo denemesi.',
      en: 'A studio experiment on how light changes a space.',
    },
    description: {
      tr: 'Stüdyo içi bir deneme. Gerçek çekime eklenebilecek yapay zekâ destekli varyasyonları ve konsept görselleri araştırıyor.',
      en: 'An in-house experiment exploring AI-assisted variations and concept visuals that can be added to a real shoot.',
    },
    scope: {
      tr: ['Konsept görseller', 'AI destekli varyasyon', 'Compositing', 'Görünüm geliştirme'],
      en: ['Concept visuals', 'AI-assisted variations', 'Compositing', 'Look development'],
    },
    palette: ['#ffb057', '#ff5a1f', '#120a06'],
    kind: 'film',
    video: '',
    poster: '',
  },
  {
    slug: 'afterglow',
    planet: 'ai-motion',
    format: 'wide',
    title: 'Afterglow',
    demo: true,
    category: { tr: 'Motion & CGI', en: 'Motion & CGI' },
    location: { tr: 'Stüdyo çalışması', en: 'Studio work' },
    summary: {
      tr: 'Bir otel kimliği için hareketli tipografi ve CGI geçişleri.',
      en: 'Kinetic typography and CGI transitions for a hotel identity.',
    },
    description: {
      tr: 'Stüdyo içi bir deneme. Logo animasyonu, başlıklar ve film içi CGI geçişlerinin aynı hareket diliyle nasıl birleşeceğine bakıyor.',
      en: 'An in-house experiment looking at how logo animation, titles and in-film CGI transitions can move the same way.',
    },
    scope: {
      tr: ['Motion tasarım', 'Başlık & tipografi', 'CGI geçişler', 'VFX'],
      en: ['Motion design', 'Titles & typography', 'CGI transitions', 'VFX'],
    },
    palette: ['#f1e6cf', '#c96a2e', '#0f0d0b'],
    kind: 'film',
    video: '',
    poster: '',
  },
];
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
export const projectsOf = (planet: string) => projects.filter((p) => p.planet === planet);

const SEED_ORDER = ['films', 'architecture', 'social', 'ai-motion'];
/** Stable 0..1 seed per project — keeps the billboard and the player showing the same demo visual. */
export const projectSeed = (slug: string) => {
  const p = projectBySlug(slug);
  if (!p) return 0.5;
  return ((SEED_ORDER.indexOf(p.planet) + 1) * 0.173 + projectsOf(p.planet).indexOf(p) * 0.311) % 1;
};
