import type { L } from '../config/site';

/**
 * Gallery — the frames shown on the Gallery planet (Uranus).
 * Files live in /public/gallery: full size (long edge 2400 px) and /thumb (800 px wide).
 * To add a frame: export it there with the same name in both folders and add a line below.
 * Never name a hotel here (alt text included) until the owner provides approved names.
 */
export interface GalleryItem {
  id: string;
  kind: 'image' | 'video';
  w: number;
  h: number;
  alt: L;
}

const img = (id: string, w: number, h: number, tr: string, en: string): GalleryItem => ({ id, kind: 'image', w, h, alt: { tr, en } });

export const galleryItems: GalleryItem[] = [
  { id: 'v01', kind: 'video', w: 1080, h: 1942, alt: { tr: 'Gün batımında iskelede şapkasını sallayan bir kadın', en: 'A woman waving her hat on a pier at sunset' } },
  img('g01', 1340, 2400, 'Lobi barı, akşam ışığında', 'Lobby bar in evening light'),
  img('g02', 1340, 2400, 'Ahşap masada nane yapraklı bir içecek', 'A mint drink on a wooden table'),
  img('g03', 1340, 2400, 'Havuzda şişme yatakta süzülen bir misafir', 'A guest floating on a pool lounger'),
  img('g04', 1340, 2400, 'Kavisli beyaz otel cephesi', 'Curved white hotel façade'),
  img('g05', 1340, 2400, 'Gün batımında palmiyeli havuz', 'Palm-lined pool at sunset'),
  img('g06', 1340, 2400, 'Altın yapraklı avize', 'Gold-leaf chandelier'),
  img('g07', 1340, 2400, 'Havuz kenarında portakal suyu ve havlular', 'Orange juice and towels by the pool'),
  img('g08', 1340, 2400, 'Espresso makinesinde kahve hazırlığı', 'Espresso being pulled'),
  img('g09', 1340, 2400, 'Bar tezgâhında bir kokteyl', 'A cocktail on the bar'),
  img('g10', 1340, 2400, 'Ateşin üstünde wok', 'A wok over open flame'),
  img('g11', 1340, 2400, 'Izgara et ve mantar tabağı', 'Grilled meat and mushrooms'),
  img('g12', 1340, 2400, 'Soslarla servis edilen et', 'Steak served with sauces'),
  img('g13', 1340, 2400, 'Yukarıdan akşam yemeği masası', 'Dinner table from above'),
  img('g14', 1340, 2400, 'Ahşap sauna ve havlu', 'Wooden sauna with a towel'),
  img('g15', 1340, 2400, 'Çorbaya limon sıkılırken', 'Lemon squeezed over soup'),
  img('g16', 1340, 2400, 'Sandalyeye konmuş bir serçe', 'A sparrow perched on a chair'),
  img('g17', 1340, 2400, 'Tatile hazır açık bir valiz', 'An open suitcase packed for a holiday'),
  img('g18', 1856, 2304, 'Ağaç dalında nazar boncuğu', 'An evil-eye bead on a branch'),
  img('g19', 1856, 2304, 'Tenis kortunda raketler', 'Rackets on a tennis court'),
  img('g20', 1340, 2400, 'Kurutulmuş portakallı bir kokteyl', 'A cocktail with dried orange'),
  img('g21', 1348, 2400, 'Peynir tekerinde makarna', 'Pasta tossed in a cheese wheel'),
  img('g22', 2400, 1340, 'Dünya’nın üstünde bir astronot', 'An astronaut above the Earth'),
  img('g23', 1792, 2400, 'Bar tezgâhında kırmızı kokteyl', 'A red cocktail at the bar'),
  img('g24', 1792, 2400, 'Havuz kenarında martini', 'A martini at the pool’s edge'),
  img('g25', 896, 1200, 'Somon tabağı', 'A plated salmon dish'),
  img('g26', 1792, 2400, 'Ekmekle servis edilen köfte', 'Meatballs served with bread'),
  img('g27', 1856, 2304, 'Dumanlı bir kokteyl', 'A smoking cocktail'),
  img('g28', 1856, 2304, 'Yeşillikler arasında buzlu kahveler', 'Iced coffees among the plants'),
  img('g29', 1856, 2304, 'Masada buzlu kahve', 'An iced coffee on a table'),
  img('g30', 1856, 2304, 'Mor bir kokteyl ve shaker’lar', 'A purple cocktail and shakers'),
];

const BASE = import.meta.env.BASE_URL;
export const galleryFull = (it: GalleryItem) => `${BASE}gallery/${it.id}.${it.kind === 'video' ? 'mp4' : 'webp'}`;
export const galleryThumb = (it: GalleryItem) => `${BASE}gallery/thumb/${it.id}.webp`;
export const galleryPoster = (it: GalleryItem) => `${BASE}gallery/${it.id}.webp`;
