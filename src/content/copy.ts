import type { Lang } from '../config/site';
import type { PlanetId } from '../config/planets';

/**
 * All interface + editorial copy, Turkish (default) and English.
 *
 * Voice: short, plain, confident. No superlatives, no unverifiable claims
 * (team size, clients, awards, equipment). FPV is not offered.
 * No comma-heavy list sentences in prose. No hotel names.
 */

export interface ServiceCopy {
  eyebrow: string;
  lede: string;
  body: string[];
  capabilitiesTitle: string;
  capabilities: { title: string; text: string }[];
  deliverablesTitle: string;
  deliverables: string[];
  workTitle: string;
  workNote: string;
}

interface Copy {
  meta: { title: string; description: string };
  ui: Record<string, string>;
  home: { tagline: string; sub: string; positioning: string; overviewTitle: string; overviewText: string };
  services: Record<'films' | 'architecture' | 'social' | 'ai-motion', ServiceCopy>;
  about: {
    eyebrow: string;
    quote: string;
    lede: string;
    body: string[];
    pillarsTitle: string;
    pillars: { title: string; text: string }[];
    processTitle: string;
    processLede: string;
    process: { title: string; text: string }[];
    servicesTitle: string;
    servicesLede: string;
    serviceCards: { planet: PlanetId; title: string; text: string }[];
    cta: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    lede: string;
    methodsTitle: string;
    emailLabel: string;
    whatsappLabel: string;
    whatsappCta: string;
    whatsappText: string;
    instagramLabel: string;
    locationLabel: string;
    formTitle: string;
    formNote: string;
    name: string;
    email: string;
    company: string;
    interest: string;
    interests: string[];
    message: string;
    messagePlaceholder: string;
    send: string;
    sendMail: string;
    sending: string;
    sent: string;
    mailOpened: string;
    failed: string;
    required: string;
    invalidEmail: string;
    mailSubject: string;
    copy: string;
    copied: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    lede: string;
    open: string;
    close: string;
    prev: string;
    next: string;
    video: string;
    counter: string;
  };
  project: Record<string, string>;
  legal: { title: string; note: string; sections: { title: string; text: string[] }[] };
  notFound: { code: string; title: string; text: string; cta: string };
  secrets: Record<'flare' | 'eclipse' | 'chime' | 'comet', string>;
  ring: string;
}

export const copy: Record<Lang, Copy> = {
  // ════════════════════════════════════════════════════════════ TÜRKÇE
  tr: {
    meta: {
      title: 'Solare Creative — Otel ve Turizm Prodüksiyonu, Antalya',
      description: 'Antalya merkezli bağımsız prodüksiyon stüdyosu. Oteller için sinematik film, mimari çekim, fotoğraf ve sosyal medya içeriği.',
    },
    ui: {
      skip: 'İçeriğe geç',
      home: 'Ana sayfa',
      menu: 'Menü',
      close: 'Kapat',
      back: 'Yörüngeye dön',
      backTo: 'Geri',
      enter: 'İncele',
      scroll: 'Kaydırarak gezin',
      swipe: 'Kaydırarak gezin',
      soundOn: 'Sesi aç',
      soundOff: 'Sesi kapat',
      sound: 'Ses',
      volume: 'Ses seviyesi',
      align: 'Hizala',
      alignHint: 'Gezegenleri tek sıraya dizer, tıklamak kolaylaşır',
      language: 'Dil',
      destinations: 'Sayfalar',
      overview: 'Güneş Sistemi',
      prev: 'Önceki',
      next: 'Sonraki',
      quality: 'Görsel kalite',
      qualityAuto: 'Otomatik',
      qualityHigh: 'Yüksek',
      qualityLow: 'Düşük',
      motion: 'Hareket',
      motionFull: 'Tam',
      motionReduced: 'Azaltılmış',
      loading: 'Işık hazırlanıyor',
      skipIntro: 'Girişi geç',
      legal: 'Yasal bilgiler',
      privacy: 'Gizlilik',
      rights: 'Tüm hakları saklıdır.',
      discoveries: 'Gizli keşif',
      webglTitle: '3B görünüm bu cihazda açılamadı',
      webglText: 'Bütün sayfalara ve iletişim bilgilerine menüden ulaşabilirsiniz.',
      viewProject: 'Projeyi aç',
      demo: 'Örnek',
      studio: 'Otel ve Turizm Prodüksiyonu',
      explore: 'İncele',
      follow: 'Takip et',
      write: 'Yaz',
    },
    home: {
      tagline: 'Atmosferi yakalıyoruz.',
      sub: 'Antalya’da otel ve turizm sektörü için film, fotoğraf ve sosyal medya içeriği üretiyoruz.',
      positioning: 'Otel ve Turizm Prodüksiyonu · Antalya',
      overviewTitle: 'Solare Creative',
      overviewText: 'Bir gezegen seçin ya da aşağı kaydırın.',
    },
    services: {
      films: {
        eyebrow: 'Hizmet',
        lede: 'Otel tanıtım filmi, marka filmi ve sezon kampanyaları.',
        body: [
          'İyi bir otel filmi odaları tek tek saymaz. Sabah ışığını, havuz başını, akşam yemeğini gösterir; izleyen kişi orada bir gün geçirmiş gibi olur.',
          'Çekimden önce filmin kime, hangi sezon için ve nerede yayınlanacağını konuşuruz. Senaryodan renk düzenlemeye kadar süreci baştan sona biz yürütürüz.',
        ],
        capabilitiesTitle: 'Neler yapıyoruz',
        capabilities: [
          { title: 'Tanıtım filmi', text: 'Otelin genel karakterini anlatan ana film.' },
          { title: 'Kampanya filmi', text: 'Sezon açılışı, yeni konsept ya da özel dönemler için kısa filmler.' },
          { title: 'Drone çekimi', text: 'Konumu, sahili ve çevreyi gösteren hava planları.' },
          { title: 'Deneyim filmleri', text: 'Restoran, spa, süit ya da etkinlik alanına odaklanan kısa filmler.' },
        ],
        deliverablesTitle: 'Teslim',
        deliverables: ['4K ana film', '30 ve 15 saniyelik versiyonlar', 'Yatay ve dikey kurgular'],
        workTitle: 'Projeler',
        workNote: 'Buradakiler örnek konseptlerdir. Gerçek projeler yayınlandıkça eklenecek.',
      },
      architecture: {
        eyebrow: 'Hizmet',
        lede: 'Cephe, iç mekân ve hava çekimleriyle mimari film ve fotoğraf.',
        body: [
          'Bir binayı en iyi anlatan şey ışığın ona nasıl düştüğüdür. Sabahın yumuşak ışığını da akşamın uzun gölgelerini de kadraja alıyoruz.',
          'Havadan lobiye, lobiden odaya geçerken izleyen kişi nerede olduğunu kaybetmez. Mekânı ilk kez gören biri bile yerini tarif edebilir.',
        ],
        capabilitiesTitle: 'Neler yapıyoruz',
        capabilities: [
          { title: 'Mimari film', text: 'Cepheden iç mekâna, malzemeye ve ışığa odaklanan film.' },
          { title: 'Drone çekimi', text: 'Yapının konumu ve çevresiyle ilişkisi.' },
          { title: 'İç mekân ve oda', text: 'Oda tipleri, ortak alanlar ve detaylar.' },
          { title: 'Mimari fotoğraf', text: 'Web sitesi ve OTA için tutarlı bir fotoğraf seti.' },
        ],
        deliverablesTitle: 'Teslim',
        deliverables: ['Mimari tanıtım filmi', 'Oda ve alan bazlı kısa klipler', 'Web sitesi ve OTA için fotoğraf seti', 'Drone açılış planları'],
        workTitle: 'Projeler',
        workNote: 'Buradakiler örnek konseptlerdir. Gerçek projeler yayınlandıkça eklenecek.',
      },
      social: {
        eyebrow: 'Hizmet',
        lede: 'Reels, kısa video ve fotoğraf: sosyal medya için düzenli içerik.',
        body: [
          'Kısa videonun kendi ritmi var. Kurguyu müziğe, kadrajı telefon ekranına göre kuruyoruz.',
          'Bir çekim gününden olabildiğince çok içerik çıkarmak için konuları ve formatları önceden belirleriz.',
        ],
        capabilitiesTitle: 'Neler yapıyoruz',
        capabilities: [
          { title: 'Kısa video', text: 'Reels, TikTok ve Shorts için dikey kurgular.' },
          { title: 'İçerik serileri', text: 'Oda, mutfak, spa gibi başlıklarda tekrar eden formatlar.' },
          { title: 'Reklam versiyonları', text: 'Farklı oran ve sürelerde yayına hazır kurgular.' },
          { title: 'Fotoğraf', text: 'Oda, yemek ve deneyim fotoğrafları.' },
        ],
        deliverablesTitle: 'Teslim',
        deliverables: ['9:16, 4:5 ve 1:1 kurgular', 'Aylık içerik paketleri', 'Reklam versiyonları', 'Düzenli arşiv'],
        workTitle: 'Projeler',
        workNote: 'Buradakiler örnek konseptlerdir. Gerçek içerikler yayınlandıkça eklenecek.',
      },
      'ai-motion': {
        eyebrow: 'Hizmet',
        lede: 'Yapay zekâ destekli görsel üretim, motion grafik ve CGI.',
        body: [
          'Yapay zekâyı konsept görseller ve kampanya varyasyonları için kullanıyoruz. Henüz çekilmemiş bir sahneyi önceden görmek için de.',
          'Logo animasyonu ve başlık tasarımı da bu tarafta yaptığımız işler. Görsel efekt ve 3B görselleştirme de öyle.',
        ],
        capabilitiesTitle: 'Neler yapıyoruz',
        capabilities: [
          { title: 'Yapay zekâ destekli üretim', text: 'Konsept görseller, moodboard ve kampanya varyasyonları.' },
          { title: 'Motion grafik', text: 'Logo animasyonu, başlık ve film içi tipografi.' },
          { title: 'VFX', text: 'Temizlik, gökyüzü değişimi, ekran yerleştirme.' },
          { title: 'CGI', text: 'Henüz yapılmamış mekânlar için 3B görselleştirme.' },
        ],
        deliverablesTitle: 'Teslim',
        deliverables: ['Konsept ve ön görselleştirme', 'Animasyonlu logo ve başlık', 'Efekt uygulanmış final kurgu', 'Kampanya varyasyonları'],
        workTitle: 'Stüdyo çalışmaları',
        workNote: 'Bunlar stüdyo içi denemelerdir, müşteri işi değildir.',
      },
    },
    about: {
      eyebrow: 'Hakkında',
      quote: 'Bazı deneyimler anlatılmaya değer.',
      lede: 'Solare Creative, Antalya’da bağımsız bir yaratıcı prodüksiyon stüdyosu.',
      body: [
        'Otel ve turizm sektörüne odaklanıyoruz. Bir otelin mimarisini, mutfağını, atmosferini ve misafirin orada yaşadıklarını film, fotoğraf ve sosyal medya içeriğiyle anlatıyoruz.',
      ],
      pillarsTitle: 'Nasıl çalışıyoruz',
      pillars: [
        { title: 'Otel odaklı', text: 'Otellerin günlük akışını biliyor ve çekimi bu akışa göre kuruyoruz.' },
        { title: 'Baştan sona aynı çizgi', text: 'İlk plandan son renk ayarına kadar her karede aynı bakışı koruyoruz.' },
        { title: 'Ortak dil', text: 'Film, fotoğraf ve sosyal içerik yan yana geldiğinde aynı elden çıktıkları belli olur.' },
      ],
      processTitle: 'Çalışma süreci',
      processLede: 'İlk görüşmeden teslime kadar her adımı önceden konuşuruz.',
      process: [
        { title: 'Görüşme', text: 'Hedefi, misafir profilini, sezonu ve içeriğin nerede kullanılacağını konuşuruz.' },
        { title: 'Plan', text: 'Senaryo, çekim akışı, mekânlar ve teslim listesi tek bir dokümanda.' },
        { title: 'Çekim', text: 'Otelin günlük işleyişini bozmadan çekeriz.' },
        { title: 'Teslim', text: 'Kurgu, renk, revizyon ve kullanılacağı yere göre hazırlanmış dosyalar.' },
      ],
      servicesTitle: 'Hizmetler',
      servicesLede: 'Otel ve turizm için ürettiklerimiz.',
      serviceCards: [
        { planet: 'films', title: 'Sinematik Otel Filmleri', text: 'Tanıtım, marka ve kampanya filmleri.' },
        { planet: 'architecture', title: 'Mimari & Drone', text: 'Mimari film, iç mekân ve hava çekimi.' },
        { planet: 'social', title: 'Fotoğraf & Sosyal İçerik', text: 'Kısa video, içerik serileri ve fotoğraf.' },
        { planet: 'ai-motion', title: 'AI & Motion', text: 'Yapay zekâ destekli üretim, motion ve CGI.' },
      ],
      cta: 'İletişime geç',
    },
    contact: {
      eyebrow: 'İletişim',
      title: 'Otelinizi konuşalım.',
      lede: 'Bir mesajınız yeterli.',
      methodsTitle: 'Doğrudan ulaşın',
      emailLabel: 'E-posta',
      whatsappLabel: 'WhatsApp',
      whatsappCta: 'WhatsApp’tan yaz',
      whatsappText: 'Merhaba Solare Creative, bir proje hakkında görüşmek istiyorum.',
      instagramLabel: 'Instagram',
      locationLabel: 'Konum',
      formTitle: 'Mesaj gönderin',
      formNote: 'Bu form mesajınızı e-posta uygulamanızda hazır olarak açar. Göndermek için orada onaylamanız gerekir.',
      name: 'Adınız',
      email: 'E-posta adresiniz',
      company: 'Otel / şirket',
      interest: 'Konu',
      interests: ['Otel filmi', 'Mimari & drone', 'Sosyal içerik', 'AI & motion', 'Henüz emin değilim'],
      message: 'Mesajınız',
      messagePlaceholder: 'Oteliniz, ne istediğiniz ve düşündüğünüz tarih hakkında birkaç cümle.',
      send: 'Gönder',
      sendMail: 'E-posta uygulamasında aç',
      sending: 'Gönderiliyor…',
      sent: 'Mesajınız ulaştı. En kısa sürede dönüş yapacağız.',
      mailOpened: 'E-posta uygulamanız mesajınız hazır şekilde açıldı. Orada “Gönder”e bastığınızda bize ulaşır. Açılmadıysa aşağıdaki adrese doğrudan yazabilirsiniz.',
      failed: 'Mesaj gönderilemedi. E-posta ya da WhatsApp üzerinden doğrudan yazabilirsiniz.',
      required: 'Bu alan gerekli.',
      invalidEmail: 'Geçerli bir e-posta adresi girin.',
      mailSubject: 'Solare Creative — Proje görüşmesi',
      copy: 'Kopyala',
      copied: 'Kopyalandı',
    },
    gallery: {
      eyebrow: 'Galeri',
      title: 'Galeri',
      lede: 'Seçilmiş kareler.',
      open: 'Büyüt',
      close: 'Kapat',
      prev: 'Önceki kare',
      next: 'Sonraki kare',
      video: 'Video',
      counter: 'Kare',
    },
    project: {
      demoBadge: 'Örnek proje',
      still: 'Fotoğraf',
      filmSoon: 'Film hazırlanıyor — poster karesi',
      demoVisual: 'Örnek görsel — film hazırlanıyor',
      demoExplain: 'Bu ekranda gerçek film yerine bir ışık çalışması oynuyor. Film hazır olduğunda burada yer alacak.',
      play: 'Oynat',
      pause: 'Duraklat',
      mute: 'Sesi kapat',
      unmute: 'Sesi aç',
      fullscreen: 'Tam ekran',
      seek: 'Zaman çizelgesi',
      scope: 'Kapsam',
      category: 'Kategori',
      location: 'Konum',
      destination: 'Bölüm',
      prev: 'Önceki proje',
      next: 'Sonraki proje',
      close: 'Projeyi kapat',
      mediaError: 'Video yüklenemedi. Yerine örnek görsel gösteriliyor.',
      gallery: 'Kareler',
      discuss: 'Benzer bir iş konuşalım',
    },
    legal: {
      title: 'Yasal bilgiler',
      note: 'Bu sayfa bir yer tutucudur. Yayına almadan önce metinler hukuk danışmanınız tarafından işletmenize göre düzenlenmelidir.',
      sections: [
        {
          title: 'Künye',
          text: ['Solare Creative — Antalya, Türkiye.', 'İletişim: hello@solarecreative.art', 'Ticari unvan, vergi ve sicil bilgileri bu alana eklenecektir.'],
        },
        {
          title: 'Gizlilik',
          text: [
            'Bu site, siz bir iletişim yöntemi kullanmadıkça kişisel veri toplamaz. İletişim formu mesajınızı kendi e-posta uygulamanızda açar; site tarafında saklanmaz.',
            'Analitik araçları kapalıdır. Açılırsa yalnızca çerezsiz ve gizliliğe saygılı ölçüm kullanılacaktır.',
            'Dil, ses ve hizalama tercihleriniz yalnızca tarayıcınızda saklanır.',
          ],
        },
        {
          title: 'Telif ve kullanım',
          text: [
            'Sitedeki görseller, metinler ve yazılım Solare Creative’e aittir.',
            'Gezegen dokuları: Solar System Scope (solarsystemscope.com), CC BY 4.0 lisansı ile; NASA verilerine dayanır.',
            '“Örnek” olarak işaretlenen projeler konsept çalışmalardır; müşteri işi değildir.',
          ],
        },
      ],
    },
    notFound: {
      code: '404',
      title: 'Yörünge dışı',
      text: 'Aradığınız sayfa bu güneş sisteminde bulunamadı. Işığa geri dönelim.',
      cta: 'Güneşe dön',
    },
    secrets: {
      flare: 'Güneş patlaması',
      eclipse: 'Tam güneş tutulması',
      chime: 'Ayın sesi',
      comet: 'Kuyruklu yıldız',
    },
    ring: 'ATMOSFERİ YAKALIYORUZ — SOLARE CREATIVE — ANTALYA — ',
  },

  // ════════════════════════════════════════════════════════════ ENGLISH
  en: {
    meta: {
      title: 'Solare Creative — Hotel & Tourism Production, Antalya',
      description: 'An independent production studio in Antalya. Cinematic films, architectural work, photography and social content for hotels.',
    },
    ui: {
      skip: 'Skip to content',
      home: 'Home',
      menu: 'Menu',
      close: 'Close',
      back: 'Back to orbit',
      backTo: 'Back',
      enter: 'Open',
      scroll: 'Scroll to explore',
      swipe: 'Swipe to explore',
      soundOn: 'Turn sound on',
      soundOff: 'Turn sound off',
      volume: 'Volume',
      align: 'Align',
      alignHint: 'Puts the planets in one row, easier to click',
      sound: 'Sound',
      language: 'Language',
      destinations: 'Pages',
      overview: 'Solar System',
      prev: 'Previous',
      next: 'Next',
      quality: 'Visual quality',
      qualityAuto: 'Auto',
      qualityHigh: 'High',
      qualityLow: 'Low',
      motion: 'Motion',
      motionFull: 'Full',
      motionReduced: 'Reduced',
      loading: 'Preparing the light',
      skipIntro: 'Skip intro',
      legal: 'Legal',
      privacy: 'Privacy',
      rights: 'All rights reserved.',
      discoveries: 'Hidden finds',
      webglTitle: 'The 3D view could not start on this device',
      webglText: 'Every page and all contact details are available from the menu.',
      viewProject: 'Open project',
      demo: 'Sample',
      studio: 'Hotel & Tourism Production',
      explore: 'Open',
      follow: 'Follow',
      write: 'Write',
    },
    home: {
      tagline: 'We capture atmosphere.',
      sub: 'Film, photography and social content for hotels and tourism, made in Antalya.',
      positioning: 'Hotel & Tourism Production · Antalya',
      overviewTitle: 'Solare Creative',
      overviewText: 'Pick a planet, or scroll down.',
    },
    services: {
      films: {
        eyebrow: 'Service',
        lede: 'Hotel promotional films, brand films and seasonal campaigns.',
        body: [
          'A good hotel film doesn’t list the rooms one by one. It shows the morning light, the pool, dinner — and the viewer feels they spent a day there.',
          'Before we shoot, we agree who the film is for, which season it serves and where it will run. We handle the whole process, from script to colour grade.',
        ],
        capabilitiesTitle: 'What we do',
        capabilities: [
          { title: 'Promotional film', text: 'The main film that shows the hotel’s character.' },
          { title: 'Campaign film', text: 'Short films for a season opening, a new concept or a special period.' },
          { title: 'Drone footage', text: 'Aerial shots of the location, the shore and the surroundings.' },
          { title: 'Experience films', text: 'Short films on a restaurant, spa, suite or event space.' },
        ],
        deliverablesTitle: 'Delivery',
        deliverables: ['4K master film', '30- and 15-second versions', 'Landscape and vertical edits'],
        workTitle: 'Projects',
        workNote: 'These are sample concepts. Real projects will be added as they are released.',
      },
      architecture: {
        eyebrow: 'Service',
        lede: 'Architectural film and photography: façades, interiors and aerials.',
        body: [
          'What tells a building’s story best is the way light falls on it. We frame the soft morning light and the long evening shadows alike.',
          'Moving from the air to the lobby and on to a room, the viewer never loses their place. Even someone seeing the building for the first time could find their way around.',
        ],
        capabilitiesTitle: 'What we do',
        capabilities: [
          { title: 'Architectural film', text: 'From façade to interior, focused on material and light.' },
          { title: 'Drone footage', text: 'Where the building sits and how it relates to its surroundings.' },
          { title: 'Interiors & rooms', text: 'Room types, shared spaces and details.' },
          { title: 'Architectural photography', text: 'A consistent photo set for the website and OTAs.' },
        ],
        deliverablesTitle: 'Delivery',
        deliverables: ['Architectural showcase film', 'Short clips per room and space', 'Photo set for website and OTAs', 'Drone opening shots'],
        workTitle: 'Projects',
        workNote: 'These are sample concepts. Real projects will be added as they are released.',
      },
      social: {
        eyebrow: 'Service',
        lede: 'Reels, short video and photography: steady content for social media.',
        body: [
          'Short video has its own rhythm. We cut to the music and frame for the phone screen.',
          'To get as much as possible out of one shoot day, we decide the topics and formats in advance.',
        ],
        capabilitiesTitle: 'What we do',
        capabilities: [
          { title: 'Short video', text: 'Vertical edits for Reels, TikTok and Shorts.' },
          { title: 'Content series', text: 'Recurring formats on rooms, the kitchen, the spa.' },
          { title: 'Ad versions', text: 'Ready-to-run edits in different ratios and lengths.' },
          { title: 'Photography', text: 'Rooms, food and guest experiences.' },
        ],
        deliverablesTitle: 'Delivery',
        deliverables: ['9:16, 4:5 and 1:1 edits', 'Monthly content packages', 'Ad versions', 'An organised archive'],
        workTitle: 'Projects',
        workNote: 'These are sample concepts. Real content will be added as it is released.',
      },
      'ai-motion': {
        eyebrow: 'Service',
        lede: 'AI-assisted visuals, motion graphics and CGI.',
        body: [
          'We use AI for concept visuals and campaign variations. And to see a scene before it has been shot.',
          'Logo animation and title design are part of this work too. So are visual effects and 3D visualisation.',
        ],
        capabilitiesTitle: 'What we do',
        capabilities: [
          { title: 'AI-assisted production', text: 'Concept visuals, moodboards and campaign variations.' },
          { title: 'Motion graphics', text: 'Logo animation, titles and in-film typography.' },
          { title: 'VFX', text: 'Clean-up, sky replacement, screen inserts.' },
          { title: 'CGI', text: '3D visualisation for spaces that aren’t built yet.' },
        ],
        deliverablesTitle: 'Delivery',
        deliverables: ['Concept and previsualisation', 'Animated logo and titles', 'Final edit with effects', 'Campaign variations'],
        workTitle: 'Studio work',
        workNote: 'These are in-house experiments, not client work.',
      },
    },
    about: {
      eyebrow: 'About',
      quote: 'Some experiences deserve to be told.',
      lede: 'Solare Creative is an independent creative production studio in Antalya.',
      body: [
        'We focus on hotels and tourism. We show a hotel’s architecture, its kitchen, its atmosphere and what guests experience there, through film, photography and social content.',
      ],
      pillarsTitle: 'How we work',
      pillars: [
        { title: 'Hotel-focused', text: 'We know the daily rhythm of a hotel and build the shoot around it.' },
        { title: 'One line, start to finish', text: 'From the first plan to the last colour pass, every frame keeps the same eye.' },
        { title: 'A shared language', text: 'Put the film, the photos and the social content side by side and you can tell they come from the same hands.' },
      ],
      processTitle: 'How a project runs',
      processLede: 'Every step is agreed in advance, from the first call to delivery.',
      process: [
        { title: 'Call', text: 'We talk through the goal, the guests, the season and where the content will be used.' },
        { title: 'Plan', text: 'Script, shooting order, locations and the delivery list in one document.' },
        { title: 'Shoot', text: 'We film without disrupting the hotel’s day.' },
        { title: 'Delivery', text: 'Edit, colour, revisions and files prepared for where they will run.' },
      ],
      servicesTitle: 'Services',
      servicesLede: 'What we make for hotels and tourism.',
      serviceCards: [
        { planet: 'films', title: 'Cinematic Hotel Films', text: 'Promotional, brand and campaign films.' },
        { planet: 'architecture', title: 'Architecture & Drone', text: 'Architectural film, interiors and aerials.' },
        { planet: 'social', title: 'Photography & Social Content', text: 'Short video, content series and photography.' },
        { planet: 'ai-motion', title: 'AI & Motion', text: 'AI-assisted production, motion and CGI.' },
      ],
      cta: 'Get in touch',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Let’s talk about your hotel.',
      lede: 'A message is enough.',
      methodsTitle: 'Reach us directly',
      emailLabel: 'E-mail',
      whatsappLabel: 'WhatsApp',
      whatsappCta: 'Message on WhatsApp',
      whatsappText: 'Hello Solare Creative, I would like to talk about a project.',
      instagramLabel: 'Instagram',
      locationLabel: 'Location',
      formTitle: 'Send a message',
      formNote: 'This form opens your message, ready to send, in your own e-mail app. You confirm sending there.',
      name: 'Your name',
      email: 'Your e-mail',
      company: 'Hotel / company',
      interest: 'Topic',
      interests: ['Hotel film', 'Architecture & drone', 'Social content', 'AI & motion', 'Not sure yet'],
      message: 'Your message',
      messagePlaceholder: 'A few lines about your hotel, what you need and the dates you have in mind.',
      send: 'Send',
      sendMail: 'Open in e-mail app',
      sending: 'Sending…',
      sent: 'Your message reached us. We’ll get back to you soon.',
      mailOpened: 'Your e-mail app opened with the message ready. It reaches us once you press “Send” there. If nothing opened, write to the address below directly.',
      failed: 'The message could not be sent. Please write to us directly by e-mail or WhatsApp.',
      required: 'This field is required.',
      invalidEmail: 'Enter a valid e-mail address.',
      mailSubject: 'Solare Creative — Project enquiry',
      copy: 'Copy',
      copied: 'Copied',
    },
    gallery: {
      eyebrow: 'Gallery',
      title: 'Gallery',
      lede: 'Selected frames.',
      open: 'Enlarge',
      close: 'Close',
      prev: 'Previous frame',
      next: 'Next frame',
      video: 'Video',
      counter: 'Frame',
    },
    project: {
      demoBadge: 'Sample project',
      still: 'Photography',
      filmSoon: 'Film in progress — poster frame',
      demoVisual: 'Sample visual — film in progress',
      demoExplain: 'A light study is playing here in place of the film. The film will appear here when it is ready.',
      play: 'Play',
      pause: 'Pause',
      mute: 'Mute',
      unmute: 'Unmute',
      fullscreen: 'Fullscreen',
      seek: 'Timeline',
      scope: 'Scope',
      category: 'Category',
      location: 'Location',
      destination: 'Section',
      prev: 'Previous project',
      next: 'Next project',
      close: 'Close project',
      mediaError: 'The video could not be loaded. A sample visual is shown instead.',
      gallery: 'Stills',
      discuss: 'Talk about a similar project',
    },
    legal: {
      title: 'Legal information',
      note: 'This page is a placeholder. Before launch, the texts should be adapted to your business by your legal advisor.',
      sections: [
        {
          title: 'Imprint',
          text: ['Solare Creative — Antalya, Türkiye.', 'Contact: hello@solarecreative.art', 'Registered company name, tax and registry details will be added here.'],
        },
        {
          title: 'Privacy',
          text: [
            'This site collects no personal data unless you choose a contact method. The contact form opens your message in your own e-mail app; nothing is stored by the site.',
            'Analytics are off. If turned on, only cookieless, privacy-respecting measurement will be used.',
            'Your language, sound and alignment preferences are stored only in your browser.',
          ],
        },
        {
          title: 'Copyright & use',
          text: [
            'The images, texts and software of this site belong to Solare Creative.',
            'Planet textures: Solar System Scope (solarsystemscope.com), licensed CC BY 4.0; based on NASA data.',
            'Projects marked “Sample” are concept work, not client projects.',
          ],
        },
      ],
    },
    notFound: {
      code: '404',
      title: 'Out of orbit',
      text: 'The page you are looking for is not in this solar system. Let’s return to the light.',
      cta: 'Return to the sun',
    },
    secrets: {
      flare: 'Solar flare',
      eclipse: 'A total solar eclipse',
      chime: 'The moon’s note',
      comet: 'A comet',
    },
    ring: 'WE CAPTURE ATMOSPHERE — SOLARE CREATIVE — ANTALYA — ',
  },
};
