import type { L } from '../config/site';
import type { PlanetId } from '../config/planets';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  PROJECT DATA — the only file you need to edit to add or replace work.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  To publish a real film:
 *   1. Put the files in  /public/media/   (e.g. amanzoe.mp4, amanzoe.jpg)
 *   2. Fill in `video` and `poster` below, e.g.
 *        video:  '/media/amanzoe.mp4',
 *        poster: '/media/amanzoe.jpg',
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
   * What the piece is: a 'film' (plays in the player; shows poster until ideo is set)
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
  // ── 01 CINEMATIC FILMS ────────────────────────────────────────────────
  {
    slug: 'amanzoe',
    planet: 'films',
    format: 'wide',
    title: 'Amanzoe',
    demo: true,
    category: { tr: 'Marka Filmi', en: 'Brand Film' },
    location: { tr: 'Demo konsept', en: 'Demo concept' },
    summary: {
      tr: 'Gün doğumundan alacakaranlığa, tek bir günün ışığıyla anlatılan otel filmi konsepti.',
      en: 'A hotel film concept told through the light of a single day, from sunrise to dusk.',
    },
    description: {
      tr: 'Bu bir demo projedir. Yapının sütunları arasından süzülen ilk ışıkla açılan, misafirin gün içindeki ritmini takip eden ve mavi saatte kapanan bir ana marka filmi yaklaşımını gösterir. Gerçek film yayına alındığında bu alan otelin hikâyesi, ekip ve teslim edilen formatlarla güncellenecektir.',
      en: 'This is a demo project. It illustrates our approach to a flagship brand film: opening on first light between the colonnades, following the rhythm of a guest\'s day and closing in blue hour. When the real film is released, this space will be updated with the story, crew and delivered formats.',
    },
    scope: {
      tr: ['Konsept & senaryo', 'Sinematik çekim', 'FPV & drone', 'Renk & ses tasarımı'],
      en: ['Concept & script', 'Cinematic photography', 'FPV & drone', 'Colour & sound design'],
    },
    palette: ['#f2c27a', '#b4552a', '#1b1410'],
    kind: 'film',
    video: '',
    poster: '/media/hero-pool.webp',
  },
  {
    slug: 'four-seasons-maldives',
    planet: 'films',
    format: 'wide',
    title: 'Four Seasons Maldives',
    demo: true,
    category: { tr: 'Kampanya Filmi', en: 'Campaign Film' },
    location: { tr: 'Demo konsept', en: 'Demo concept' },
    summary: {
      tr: 'Su, ufuk ve sessizlik üzerine kurulu bir resort kampanyası konsepti.',
      en: 'A resort campaign concept built on water, horizon and stillness.',
    },
    description: {
      tr: 'Bu bir demo projedir. Tek bir ufuk çizgisi etrafında kurgulanan; su üstü villalar, sualtı sekansları ve hava çekimlerini aynı görsel dilde birleştiren sezonluk kampanya filmi yaklaşımını temsil eder.',
      en: 'This is a demo project. It represents a seasonal campaign film composed around a single horizon line — uniting overwater villas, underwater sequences and aerials in one visual language.',
    },
    scope: {
      tr: ['Kampanya konsepti', 'Hava & sualtı çekimi', 'Kurgu', '30" / 15" uyarlamalar'],
      en: ['Campaign concept', 'Aerial & underwater', 'Edit', '30" / 15" cut-downs'],
    },
    palette: ['#9fd8d2', '#e9c58d', '#0e1a1c'],
    kind: 'film',
    video: '',
    poster: '',
  },

  // ── 02 ARCHITECTURE ───────────────────────────────────────────────────
  {
    slug: 'rosewood-london',
    planet: 'architecture',
    format: 'wide',
    title: 'Rosewood London',
    demo: true,
    category: { tr: 'Mimari Film', en: 'Architectural Film' },
    location: { tr: 'Demo konsept', en: 'Demo concept' },
    summary: {
      tr: 'Avludan süite, mekânın oranlarını ve dokusunu izleyen mimari film konsepti.',
      en: 'An architectural film concept tracing proportion and texture from courtyard to suite.',
    },
    description: {
      tr: 'Bu bir demo projedir. Yavaş, kontrollü kamera hareketleriyle cephe, avlu ve iç mekân arasındaki geçişleri anlatan; malzemeyi ve ışığı başrole koyan mimari film yaklaşımını gösterir.',
      en: 'This is a demo project. It shows an architectural film approach where slow, controlled camera movement connects façade, courtyard and interior — with material and light in the leading role.',
    },
    scope: {
      tr: ['Mekân keşfi', 'Gimbal & slider çekimi', 'Cephe drone çekimi', 'Renk düzenleme'],
      en: ['Location scouting', 'Gimbal & slider work', 'Façade aerials', 'Colour grading'],
    },
    palette: ['#d8d2c4', '#7c8a8e', '#141618'],
    kind: 'still',
    video: '',
    poster: '/media/services-room.webp',
    gallery: ['/media/about-lounge.webp'],
  },
  {
    slug: 'the-peninsula-tokyo',
    planet: 'architecture',
    format: 'vertical',
    title: 'The Peninsula Tokyo',
    demo: true,
    category: { tr: 'Drone Sinematografi', en: 'Drone Cinematography' },
    location: { tr: 'Demo konsept', en: 'Demo concept' },
    summary: {
      tr: 'Şehir ışıklarının içinden yükselen tek planlık FPV açılış konsepti.',
      en: 'A one-take FPV reveal concept rising through the city lights.',
    },
    description: {
      tr: 'Bu bir demo projedir. Sokak seviyesinden lobiye, lobiden çatı katına tek bir kesintisiz FPV hareketiyle ilerleyen açılış sekansı fikrini temsil eder.',
      en: 'This is a demo project. It represents a reveal sequence travelling from street level through the lobby to the rooftop in one uninterrupted FPV move.',
    },
    scope: {
      tr: ['FPV koreografisi', 'İç mekân uçuşu', 'Gece çekimi', 'Ses tasarımı'],
      en: ['FPV choreography', 'Indoor flight', 'Night photography', 'Sound design'],
    },
    palette: ['#c9b8ff', '#e3a45e', '#0c0d16'],
    kind: 'film',
    video: '',
    poster: '/media/process-restaurant.webp',
  },

  // ── 03 SOCIAL CONTENT ─────────────────────────────────────────────────
  {
    slug: 'one-and-only-reethi-rah',
    planet: 'social',
    format: 'vertical',
    title: 'One&Only Reethi Rah',
    demo: true,
    category: { tr: 'Sosyal İçerik Serisi', en: 'Social Series' },
    location: { tr: 'Demo konsept', en: 'Demo concept' },
    summary: {
      tr: 'Dikey formatta, bir sezon boyunca yayınlanacak kısa film serisi konsepti.',
      en: 'A season-long series of vertical short films, concept only.',
    },
    description: {
      tr: 'Bu bir demo projedir. Tek çekim döneminden çıkan; oda, gastronomi ve deneyim başlıklarına ayrılmış, yayın takvimine göre planlanmış dikey içerik serisini örnekler.',
      en: 'This is a demo project. It illustrates a vertical content series produced in one shoot window — organised by rooms, gastronomy and experiences, and planned against a publishing calendar.',
    },
    scope: {
      tr: ['İçerik stratejisi', 'Dikey çekim', 'Reels / TikTok kurgusu', 'Yayın takvimi'],
      en: ['Content strategy', 'Vertical photography', 'Reels / TikTok edits', 'Publishing calendar'],
    },
    palette: ['#f4d9c2', '#a6b18a', '#161713'],
    kind: 'still',
    video: '',
    poster: '/media/work-beach.webp',
  },
  {
    slug: 'mandarin-oriental-bangkok',
    planet: 'social',
    format: 'vertical',
    title: 'Mandarin Oriental Bangkok',
    demo: true,
    category: { tr: 'Dijital Kampanya', en: 'Digital Campaign' },
    location: { tr: 'Demo konsept', en: 'Demo concept' },
    summary: {
      tr: 'Gastronomi odaklı, kısa format bir dijital kampanya konsepti.',
      en: 'A gastronomy-led short-form digital campaign concept.',
    },
    description: {
      tr: 'Bu bir demo projedir. Mutfağın ritmini, servisin detaylarını ve nehir kıyısındaki akşamı 15 saniyelik karelere bölen kampanya kurgusunu örnekler.',
      en: 'This is a demo project. It illustrates a campaign structure that distils the rhythm of the kitchen, the detail of service and a riverside evening into fifteen-second frames.',
    },
    scope: {
      tr: ['Kampanya fikri', 'Gastronomi çekimi', '9:16 / 4:5 teslimler', 'Reklam uyarlamaları'],
      en: ['Campaign idea', 'Gastronomy photography', '9:16 / 4:5 deliverables', 'Paid-media variants'],
    },
    palette: ['#e8b37a', '#8c3f2b', '#150f0c'],
    kind: 'still',
    video: '',
    poster: '/media/work-gastronomy.webp',
    gallery: ['/media/process-restaurant.webp'],
  },

  // ── 04 AI & MOTION ────────────────────────────────────────────────────
  {
    slug: 'solar-study',
    planet: 'ai-motion',
    format: 'curved',
    title: 'Solar Study',
    demo: true,
    category: { tr: 'AI Konsept Filmi', en: 'AI Concept Film' },
    location: { tr: 'Stüdyo deneyi', en: 'Studio experiment' },
    summary: {
      tr: 'Işığın bir mekânı nasıl dönüştürdüğünü araştıran stüdyo içi deneysel çalışma.',
      en: 'An in-house experiment exploring how light transforms a space.',
    },
    description: {
      tr: 'Bu bir demo projedir. Gerçek çekimi tamamlayan yapay zekâ destekli varyasyonların, konsept görsellerin ve kampanya uyarlamalarının nasıl üretilebileceğini gösteren stüdyo içi bir araştırmadır. Araç değil, fikir önde.',
      en: 'This is a demo project — an in-house study showing how AI-assisted variations, concept visuals and campaign adaptations can extend a real shoot. The idea leads, not the tool.',
    },
    scope: {
      tr: ['Konsept görseller', 'AI destekli varyasyon', 'Compositing', 'Görsel geliştirme'],
      en: ['Concept visuals', 'AI-assisted variations', 'Compositing', 'Look development'],
    },
    palette: ['#ffb057', '#ff5a1f', '#120a06'],
    kind: 'film',
    video: '',
    poster: '',
  },
  {
    slug: 'mirage',
    planet: 'ai-motion',
    format: 'wide',
    title: 'Mirage',
    demo: true,
    category: { tr: 'Motion & CGI', en: 'Motion & CGI' },
    location: { tr: 'Stüdyo deneyi', en: 'Studio experiment' },
    summary: {
      tr: 'Bir otel kimliği için hareketli tipografi ve CGI geçişleri üzerine çalışma.',
      en: 'A study in kinetic typography and CGI transitions for a hotel identity.',
    },
    description: {
      tr: 'Bu bir demo projedir. Logo animasyonu, başlık tasarımı ve film içi CGI geçişlerinin tek bir hareket dili içinde nasıl birleşebileceğini araştırır.',
      en: 'This is a demo project exploring how logo animation, title design and in-film CGI transitions can share a single language of motion.',
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
