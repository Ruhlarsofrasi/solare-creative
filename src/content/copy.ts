import type { Lang } from '../config/site';
import type { PlanetId } from '../config/planets';

/** All interface + editorial copy, Turkish (default) and English. */

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
  project: Record<string, string>;
  legal: { title: string; note: string; sections: { title: string; text: string[] }[] };
  notFound: { code: string; title: string; text: string; cta: string };
  secrets: Record<'flare' | 'alignment' | 'chime' | 'comet', string>;
  ring: string;
}

export const copy: Record<Lang, Copy> = {
  // ════════════════════════════════════════════════════════════ TÜRKÇE
  tr: {
    meta: {
      title: 'Solare Creative — Sinematik Otel ve Turizm Prodüksiyonu',
      description:
        'Solare Creative, Antalya merkezli sinematik otel prodüksiyon stüdyosudur. Oteller, resortlar ve lüks destinasyonlar için film, drone, sosyal içerik ve AI destekli prodüksiyon.',
    },
    ui: {
      skip: 'İçeriğe geç',
      home: 'Ana yörünge',
      menu: 'Menü',
      close: 'Kapat',
      back: 'Yörüngeye dön',
      backTo: 'Geri',
      enter: 'Keşfet',
      scroll: 'Kaydırarak yolculuğa çık',
      swipe: 'Kaydırarak ilerle',
      soundOn: 'Sesi aç',
      soundOff: 'Sesi kapat',
      sound: 'Ses',
      language: 'Dil',
      destinations: 'Destinasyonlar',
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
      discoveries: 'Keşif',
      webglTitle: '3B deneyim bu cihazda başlatılamadı',
      webglText: 'Tüm içerik ve iletişim seçenekleri menüden erişilebilir durumda.',
      viewProject: 'Projeyi görüntüle',
      demo: 'Demo',
      studio: 'Sinematik Otel Prodüksiyonu',
      explore: 'Keşfet',
      follow: 'Takip et',
      write: 'Yaz',
    },
    home: {
      tagline: 'Atmosferi yakalıyoruz.',
      sub: 'Solare Creative; dünyanın seçkin otelleri, resortları ve lüks destinasyonları için ışıltılı görsel hikâyeler üretir.',
      positioning: 'Sinematik Otel Prodüksiyonu · Antalya',
      overviewTitle: 'Bir yaratıcılık evreni',
      overviewText: 'Altı destinasyon, tek bir ışık kaynağı. Kaydırın ya da bir gezegen seçin.',
    },
    services: {
      films: {
        eyebrow: 'Hizmet',
        lede: 'Odanın ışığından restoranın ritmine kadar, deneyimi hikâyeye dönüştüren ana marka filmleri ve kampanya videoları.',
        body: [
          'Bir otel filmi, mekânın envanterini çıkarmaz; orada olmanın nasıl hissettirdiğini anlatır. Biz binaları değil, ışığı, gölgeyi ve o anın duygusunu çekeriz.',
          'Her film; misafir profili, sezon ve yayınlanacağı kanallar netleştirilerek yazılır. Senaryodan renk düzenlemeye kadar tüm süreç tek bir görsel dil etrafında ilerler.',
        ],
        capabilitiesTitle: 'Neler üretiyoruz',
        capabilities: [
          { title: 'Ana marka filmi', text: 'Otelin karakterini ve vaadini tek bir sinematik anlatıda toplayan amiral gemisi film.' },
          { title: 'Kampanya & reklam filmi', text: 'Sezon açılışları, yeni konseptler ve özel dönemler için hedefe yönelik filmler.' },
          { title: 'FPV & drone sekansları', text: 'Mekânın ölçeğini ve akışını tek planda hissettiren hava ve FPV hareketleri.' },
          { title: 'Deneyim filmleri', text: 'Gastronomi, spa, süit ve etkinlik alanları için odaklı kısa filmler.' },
        ],
        deliverablesTitle: 'Teslim formatları',
        deliverables: ['4K ana film', '30" / 15" uyarlamalar', 'Yatay, kare ve dikey versiyonlar', 'Altyazılı ve sessiz izleme kurguları'],
        workTitle: 'Seçili filmler',
        workNote: 'Aşağıdaki işler yer tutucu demo projelerdir; gerçek filmler yayınlandıkça güncellenecektir.',
      },
      architecture: {
        eyebrow: 'Hizmet',
        lede: 'Cepheden iç mekâna, yapının oranlarını, malzemesini ve ışıkla ilişkisini anlatan mimari filmler ve drone sinematografisi.',
        body: [
          'Mimari, yavaş bakıldığında konuşur. Kontrollü kamera hareketleri, doğru saat ve sabırlı kadrajlarla mekânın kendi ritmini görünür kılarız.',
          'Drone açılışlarından iç mekân geçişlerine kadar her plan, mekânı ilk kez gören birinin zihninde net bir harita oluşturacak şekilde tasarlanır.',
        ],
        capabilitiesTitle: 'Neler üretiyoruz',
        capabilities: [
          { title: 'Mimari film', text: 'Cephe, avlu, lobi ve odalar arasında akan, malzeme ve ışık odaklı anlatım.' },
          { title: 'Drone sinematografi', text: 'Konumu, peyzajı ve yapının çevresiyle ilişkisini gösteren hava çekimleri.' },
          { title: 'İç mekân & oda çekimleri', text: 'Oda tipleri, ortak alanlar ve detaylar için tutarlı bir görsel seçki.' },
          { title: 'Mekânsal anlatı', text: 'Misafirin mekân içindeki yolculuğunu takip eden kesintisiz geçişler.' },
        ],
        deliverablesTitle: 'Teslim formatları',
        deliverables: ['Mimari tanıtım filmi', 'Oda ve alan bazlı kısa klipler', 'Web sitesi ve OTA için görsel seçki', 'Drone açılış sekansları'],
        workTitle: 'Seçili mimari işler',
        workNote: 'Aşağıdaki işler yer tutucu demo projelerdir; gerçek filmler yayınlandıkça güncellenecektir.',
      },
      social: {
        eyebrow: 'Hizmet',
        lede: 'Web sitesi, reklam ve sosyal medya için premium kısa format filmler, dijital kampanyalar ve içerik serileri.',
        body: [
          'Sosyal içerik hızlı tüketilir ama özensiz üretilmek zorunda değildir. Ana filmle aynı görsel dili taşıyan, dikey ekran için düşünülmüş içerikler üretiriz.',
          'Tek bir çekim döneminden bir sezona yetecek içerik çıkarmak için konu başlıklarını, formatları ve yayın takvimini baştan planlarız.',
        ],
        capabilitiesTitle: 'Neler üretiyoruz',
        capabilities: [
          { title: 'Kısa format filmler', text: 'Reels, TikTok ve Shorts için dikey kurgulanmış sinematik içerikler.' },
          { title: 'İçerik serileri', text: 'Oda, gastronomi ve deneyim başlıklarında tekrarlanabilir formatlar.' },
          { title: 'Dijital kampanyalar', text: 'Reklam yayınına hazır, farklı oran ve sürelerde kampanya setleri.' },
          { title: 'Fotoğraf seçkisi', text: 'Mimari, oda, gastronomi ve deneyim odaklı fotoğraf üretimi.' },
        ],
        deliverablesTitle: 'Teslim formatları',
        deliverables: ['9:16, 4:5 ve 1:1 kurgular', 'Aylık içerik paketleri', 'Reklam uyarlamaları', 'Yayın takvimine göre arşiv'],
        workTitle: 'Seçili sosyal işler',
        workNote: 'Aşağıdaki işler yer tutucu demo projelerdir; gerçek içerikler yayınlandıkça güncellenecektir.',
      },
      'ai-motion': {
        eyebrow: 'Hizmet',
        lede: 'Gerçek prodüksiyonu tamamlayan yapay zekâ destekli üretim, motion grafik, VFX ve CGI. Araç değil, fikir önde.',
        body: [
          'Yapay zekâyı çekimin yerine değil, çekimin yanına koyuyoruz: konsept görseller, yaratıcı varyasyonlar ve kampanya uyarlamaları için.',
          'Motion tasarım ve görsel efektler, filmin dilini bozmadan onu genişletir; logo animasyonundan film içi geçişlere kadar tek bir hareket dili kurarız.',
        ],
        capabilitiesTitle: 'Neler üretiyoruz',
        capabilities: [
          { title: 'AI destekli prodüksiyon', text: 'Konsept görseller, moodboard filmleri ve mevcut çekimlerden yaratıcı varyasyonlar.' },
          { title: 'Motion grafik', text: 'Logo animasyonu, başlık tasarımı ve film içi tipografi.' },
          { title: 'VFX & compositing', text: 'Temizlik, gökyüzü değişimi, ekran yerleştirme ve görsel düzeltmeler.' },
          { title: 'CGI & deneysel içerik', text: 'Henüz inşa edilmemiş mekânlar ve kampanyalar için üç boyutlu görselleştirme.' },
        ],
        deliverablesTitle: 'Teslim formatları',
        deliverables: ['Konsept ve ön görselleştirme', 'Animasyonlu logo ve başlık paketleri', 'VFX uygulanmış final kurgular', 'Kampanya varyasyon setleri'],
        workTitle: 'Stüdyo deneyleri',
        workNote: 'Aşağıdaki işler stüdyo içi demo çalışmalardır; müşteri projesi değildir.',
      },
    },
    about: {
      eyebrow: 'Solare yaklaşımı',
      quote: 'Binaları çekmiyoruz. Işığı, gölgeyi ve orada olma hissini yakalıyoruz.',
      lede: 'Solare, Antalya merkezli bağımsız bir yaratıcı stüdyo.',
      body: [
        'Otellerin mimarisinden sofra detaylarına, atmosferinden misafir deneyimine kadar kendine özgü yanlarını keşfediyor; bunları film, fotoğraf ve sosyal medya içerikleriyle anlatıyoruz.',
        'Her otelin kendine özgü bir hikâyesi var. Bizim işimiz o hikâyeyi icat etmek değil; doğru ışıkta, doğru ritimde görünür kılmak.',
      ],
      pillarsTitle: 'Nasıl çalışıyoruz',
      pillars: [
        { title: 'Otel odaklı', text: 'Sektörün ritmini bilen, operasyonu aksatmadan çalışan bir üretim anlayışı.' },
        { title: 'Uçtan uca', text: 'Planlama, çekim ve post-prodüksiyon tek bir ekipte, tek bir sorumlulukta.' },
        { title: 'Tek görsel dil', text: 'Film, fotoğraf ve sosyal içerik aynı bakıştan, aynı kalitede çıkar.' },
      ],
      processTitle: 'Çalışma süreci',
      processLede: 'Projeyi ilk görüşmeden teslim aşamasına kadar planlı ve şeffaf şekilde yürütüyoruz.',
      process: [
        { title: 'Keşif', text: 'Hedef, misafir profili, sezon ve kullanılacak kanalları netleştiririz.' },
        { title: 'Plan', text: 'Senaryo, çekim akışı, mekân ve teslim listesini tek dokümanda toplarız.' },
        { title: 'Üretim', text: "Operasyonu aksatmadan çekimi, drone'u ve gerekli yönlendirmeyi yönetiriz." },
        { title: 'Teslim', text: 'İçerikleri kullanım alanlarına göre düzenler, revize eder ve arşivleriz.' },
      ],
      servicesTitle: 'Hizmetler',
      servicesLede: 'Otelinizin atmosferini, karakterini ve misafirlerine sunduğu deneyimi görünür kılıyoruz.',
      serviceCards: [
        { planet: 'films', title: 'Sinematik Otel Filmleri', text: 'Ana marka filmleri ve kampanya videoları.' },
        { planet: 'architecture', title: 'Mimari & FPV Drone', text: 'Mimari filmler, drone açılışları ve mekânsal anlatı.' },
        { planet: 'social', title: 'Fotoğraf & Sosyal İçerik', text: 'Kısa format filmler, seriler ve dijital kampanyalar.' },
        { planet: 'ai-motion', title: 'AI Destekli Prodüksiyon', text: 'Yaratıcı varyasyonlar, motion, VFX ve CGI.' },
      ],
      cta: 'Birlikte çalışalım',
    },
    contact: {
      eyebrow: 'İletişim',
      title: 'Otelinizin hikâyesini konuşalım.',
      lede: 'Kısa bir brief yeterli. İhtiyacı birlikte netleştirip uygun üretim kapsamını çıkaralım.',
      methodsTitle: 'Doğrudan ulaşın',
      emailLabel: 'E-posta',
      whatsappLabel: 'WhatsApp',
      whatsappCta: "WhatsApp'tan yaz",
      whatsappText: 'Merhaba Solare Creative, bir proje hakkında görüşmek istiyorum.',
      instagramLabel: 'Instagram',
      locationLabel: 'Konum',
      formTitle: 'Brief gönderin',
      formNote: 'Bu form, mesajınızı e-posta uygulamanızda hazır olarak açar; göndermek için e-posta uygulamanızda onaylamanız gerekir.',
      name: 'Adınız',
      email: 'E-posta adresiniz',
      company: 'Otel / şirket',
      interest: 'İlgilendiğiniz hizmet',
      interests: ['Sinematik otel filmi', 'Mimari & drone', 'Sosyal içerik', 'AI & motion', 'Henüz emin değilim'],
      message: 'Projeniz',
      messagePlaceholder: 'Oteliniz, hedefiniz ve düşündüğünüz takvim hakkında birkaç cümle…',
      send: 'Brief’i gönder',
      sendMail: 'E-posta uygulamasında aç',
      sending: 'Gönderiliyor…',
      sent: 'Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.',
      mailOpened: 'E-posta uygulamanız hazır mesajla açıldı. Mesaj, siz orada “Gönder”e bastığınızda iletilir. Açılmadıysa aşağıdaki adrese doğrudan yazabilirsiniz.',
      failed: 'Mesaj gönderilemedi. Lütfen e-posta ya da WhatsApp üzerinden doğrudan ulaşın.',
      required: 'Bu alan gerekli.',
      invalidEmail: 'Geçerli bir e-posta adresi girin.',
      mailSubject: 'Solare Creative Proje Talebi',
      copy: 'Kopyala',
      copied: 'Kopyalandı',
    },
    project: {
      demoBadge: 'Demo proje',
      still: 'Fotoğraf',
      filmSoon: 'Film yakında — poster karesi',
      demoVisual: 'Demo görsel — film yakında',
      demoExplain: 'Bu ekranda gerçek film yerine prosedürel bir ışık çalışması oynatılıyor. Film yayınlandığında burada yer alacak.',
      play: 'Oynat',
      pause: 'Duraklat',
      mute: 'Sesi kapat',
      unmute: 'Sesi aç',
      fullscreen: 'Tam ekran',
      seek: 'Zaman çizelgesi',
      scope: 'Kapsam',
      category: 'Kategori',
      location: 'Konum',
      destination: 'Destinasyon',
      prev: 'Önceki proje',
      next: 'Sonraki proje',
      close: 'Projeyi kapat',
      mediaError: 'Video yüklenemedi. Yerine demo görsel gösteriliyor.',
      gallery: 'Kareler',
      discuss: 'Benzer bir proje konuşalım',
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
            'Bu site, siz bir iletişim yöntemi kullanmadıkça kişisel veri toplamaz. İletişim formu, mesajınızı kendi e-posta uygulamanızda açar; site tarafında saklanmaz.',
            'Analitik araçları varsayılan olarak kapalıdır. Etkinleştirilirse yalnızca çerezsiz ve gizliliğe saygılı ölçüm kullanılacaktır.',
            'Dil ve ses tercihleriniz yalnızca tarayıcınızda saklanır.',
          ],
        },
        {
          title: 'Telif ve kullanım',
          text: [
            'Sitedeki görsel dil, metinler ve yazılım Solare Creative’e aittir.',
            'Gezegen dokuları: Solar System Scope (solarsystemscope.com), CC BY 4.0 lisansı ile; NASA verilerine dayanır.',
            '“Demo” olarak işaretlenen projeler yer tutucudur; anılan markalarla bir müşteri ilişkisi veya tamamlanmış iş anlamına gelmez. Tüm markalar sahiplerine aittir.',
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
      flare: 'Güneş püskürmesi',
      alignment: 'Büyük hizalanma',
      chime: 'Ay rezonansı',
      comet: 'Geçen kuyruklu yıldız',
    },
    ring: 'BİNALARI ÇEKMİYORUZ — IŞIĞI, GÖLGEYİ VE ORADA OLMA HİSSİNİ YAKALIYORUZ — ',
  },

  // ════════════════════════════════════════════════════════════ ENGLISH
  en: {
    meta: {
      title: 'Solare Creative — Cinematic Hospitality Production',
      description:
        'Solare Creative crafts luminous visual stories for the world’s most prestigious hotels, resorts and luxury destinations. Cinematic hotel films, FPV drone, social content and AI production from Antalya.',
    },
    ui: {
      skip: 'Skip to content',
      home: 'Home orbit',
      menu: 'Menu',
      close: 'Close',
      back: 'Return to orbit',
      backTo: 'Back',
      enter: 'Enter',
      scroll: 'Scroll to begin the journey',
      swipe: 'Swipe to travel',
      soundOn: 'Turn sound on',
      soundOff: 'Turn sound off',
      sound: 'Sound',
      language: 'Language',
      destinations: 'Destinations',
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
      discoveries: 'Discoveries',
      webglTitle: 'The 3D experience could not start on this device',
      webglText: 'All content and contact options remain available from the menu.',
      viewProject: 'View project',
      demo: 'Demo',
      studio: 'Cinematic Hospitality Production',
      explore: 'Explore',
      follow: 'Follow',
      write: 'Write',
    },
    home: {
      tagline: 'We capture atmosphere.',
      sub: 'Solare Creative crafts luminous visual stories for the world’s most prestigious hotels, resorts, and luxury destinations.',
      positioning: 'Cinematic Hospitality Production · Antalya',
      overviewTitle: 'A universe of creativity',
      overviewText: 'Six destinations, one source of light. Scroll, or choose a planet.',
    },
    services: {
      films: {
        eyebrow: 'Service',
        lede: 'Flagship brand films and campaign pieces that turn an experience into a story — from the light in a room to the rhythm of a restaurant.',
        body: [
          'A hotel film is not an inventory of spaces; it is the feeling of being there. We don’t film buildings. We capture light, shadow and the emotion of the moment.',
          'Every film is written around the guest, the season and the channels it will live on. From script to colour grade, the whole process follows a single visual language.',
        ],
        capabilitiesTitle: 'What we make',
        capabilities: [
          { title: 'Flagship brand film', text: 'The hero piece that gathers a hotel’s character and promise into one cinematic narrative.' },
          { title: 'Campaign & commercial films', text: 'Focused films for season openings, new concepts and special periods.' },
          { title: 'FPV & drone sequences', text: 'Aerial and FPV moves that let the scale and flow of a place be felt in a single take.' },
          { title: 'Experience films', text: 'Short films dedicated to gastronomy, spa, suites and event spaces.' },
        ],
        deliverablesTitle: 'Deliverables',
        deliverables: ['4K master film', '30" / 15" cut-downs', 'Landscape, square and vertical versions', 'Subtitled and sound-off edits'],
        workTitle: 'Selected films',
        workNote: 'The works below are placeholder demo projects and will be replaced as real films are released.',
      },
      architecture: {
        eyebrow: 'Service',
        lede: 'Architectural films and drone cinematography that reveal proportion, material and a building’s relationship with light — from façade to interior.',
        body: [
          'Architecture speaks when you look slowly. With controlled camera movement, the right hour and patient framing, we make a space’s own rhythm visible.',
          'From drone reveals to interior transitions, every shot is designed to draw a clear map in the mind of someone seeing the place for the first time.',
        ],
        capabilitiesTitle: 'What we make',
        capabilities: [
          { title: 'Architectural film', text: 'A material- and light-led narrative flowing between façade, courtyard, lobby and rooms.' },
          { title: 'Drone cinematography', text: 'Aerials that show location, landscape and how the building sits in its surroundings.' },
          { title: 'Interiors & rooms', text: 'A consistent visual selection of room types, shared spaces and details.' },
          { title: 'Spatial storytelling', text: 'Seamless transitions that follow a guest’s journey through the property.' },
        ],
        deliverablesTitle: 'Deliverables',
        deliverables: ['Architectural showcase film', 'Room- and space-specific clips', 'Visual selection for website and OTAs', 'Drone reveal sequences'],
        workTitle: 'Selected architectural work',
        workNote: 'The works below are placeholder demo projects and will be replaced as real films are released.',
      },
      social: {
        eyebrow: 'Service',
        lede: 'Premium short-form films, digital campaigns and content series for websites, paid media and social channels.',
        body: [
          'Social content is consumed quickly, but it never has to be made carelessly. We produce pieces conceived for the vertical screen that carry the same visual language as the hero film.',
          'To turn one shoot window into a season of content, we plan topics, formats and the publishing calendar from the very beginning.',
        ],
        capabilitiesTitle: 'What we make',
        capabilities: [
          { title: 'Short-form films', text: 'Cinematic vertical edits for Reels, TikTok and Shorts.' },
          { title: 'Content series', text: 'Repeatable formats across rooms, gastronomy and experiences.' },
          { title: 'Digital campaigns', text: 'Ad-ready campaign sets in multiple ratios and durations.' },
          { title: 'Photography selection', text: 'Architecture, room, gastronomy and experience photography.' },
        ],
        deliverablesTitle: 'Deliverables',
        deliverables: ['9:16, 4:5 and 1:1 edits', 'Monthly content packages', 'Paid-media variants', 'Archive organised by calendar'],
        workTitle: 'Selected social work',
        workNote: 'The works below are placeholder demo projects and will be replaced as real content is released.',
      },
      'ai-motion': {
        eyebrow: 'Service',
        lede: 'AI-assisted production, motion graphics, VFX and CGI that extend a real shoot. The idea leads, not the tool.',
        body: [
          'We place AI beside the shoot, not in place of it: for concept visuals, creative variations and campaign adaptations.',
          'Motion design and visual effects expand a film without breaking its language — from logo animation to in-film transitions, we build one grammar of movement.',
        ],
        capabilitiesTitle: 'What we make',
        capabilities: [
          { title: 'AI-assisted production', text: 'Concept visuals, mood films and creative variations from existing footage.' },
          { title: 'Motion graphics', text: 'Logo animation, title design and in-film typography.' },
          { title: 'VFX & compositing', text: 'Clean-up, sky replacement, screen inserts and visual corrections.' },
          { title: 'CGI & experimental content', text: 'Three-dimensional visualisation for spaces and campaigns not yet built.' },
        ],
        deliverablesTitle: 'Deliverables',
        deliverables: ['Concept and pre-visualisation', 'Animated logo and title packages', 'Final edits with VFX', 'Campaign variation sets'],
        workTitle: 'Studio experiments',
        workNote: 'The works below are in-house demo studies, not client projects.',
      },
    },
    about: {
      eyebrow: 'The Solare approach',
      quote: 'We don’t film buildings. We capture light, shadow, and the feeling of being there.',
      lede: 'Solare is an independent creative studio based in Antalya.',
      body: [
        'We look for what makes each hotel singular — from its architecture to the details of the table, from its atmosphere to the guest experience — and tell it through film, photography and social content.',
        'Every hotel has a story of its own. Our work is not to invent it, but to make it visible in the right light and at the right rhythm.',
      ],
      pillarsTitle: 'How we work',
      pillars: [
        { title: 'Hotel-focused', text: 'A production mindset that knows the rhythm of hospitality and never disrupts operations.' },
        { title: 'End to end', text: 'Planning, shooting and post-production within one team and one line of responsibility.' },
        { title: 'One visual language', text: 'Film, photography and social content from the same eye, at the same quality.' },
      ],
      processTitle: 'Creative process',
      processLede: 'We run every project in a planned, transparent way — from the first conversation to final delivery.',
      process: [
        { title: 'Discovery', text: 'We clarify the goal, guest profile, season and the channels to be used.' },
        { title: 'Plan', text: 'Script, shooting flow, locations and the delivery list gathered in a single document.' },
        { title: 'Production', text: 'We manage the shoot, the drone and on-set direction without disrupting operations.' },
        { title: 'Delivery', text: 'We organise, revise and archive the content according to where it will be used.' },
      ],
      servicesTitle: 'Services',
      servicesLede: 'We make your hotel’s atmosphere, character and guest experience visible.',
      serviceCards: [
        { planet: 'films', title: 'Cinematic Hotel Films', text: 'Flagship brand films and campaign videos.' },
        { planet: 'architecture', title: 'Architecture & FPV Drone', text: 'Architectural films, drone reveals and spatial storytelling.' },
        { planet: 'social', title: 'Photography & Social Content', text: 'Short-form films, series and digital campaigns.' },
        { planet: 'ai-motion', title: 'AI Production', text: 'Creative variations, motion, VFX and CGI.' },
      ],
      cta: 'Work with us',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Let’s talk about your hotel’s story.',
      lede: 'A short brief is enough. We’ll clarify the need together and shape the right production scope.',
      methodsTitle: 'Reach us directly',
      emailLabel: 'E-mail',
      whatsappLabel: 'WhatsApp',
      whatsappCta: 'Message on WhatsApp',
      whatsappText: 'Hello Solare Creative, I would like to talk about a project.',
      instagramLabel: 'Instagram',
      locationLabel: 'Location',
      formTitle: 'Send a brief',
      formNote: 'This form opens your message, ready to send, in your own e-mail app — you confirm sending there.',
      name: 'Your name',
      email: 'Your e-mail',
      company: 'Hotel / company',
      interest: 'Service of interest',
      interests: ['Cinematic hotel film', 'Architecture & drone', 'Social content', 'AI & motion', 'Not sure yet'],
      message: 'Your project',
      messagePlaceholder: 'A few lines about your property, your goal and the timing you have in mind…',
      send: 'Send brief',
      sendMail: 'Open in e-mail app',
      sending: 'Sending…',
      sent: 'Your message has reached us. We’ll be in touch shortly.',
      mailOpened: 'Your e-mail app has been opened with the message prepared. It is delivered once you press “Send” there. If nothing opened, write to the address below directly.',
      failed: 'The message could not be sent. Please reach us directly by e-mail or WhatsApp.',
      required: 'This field is required.',
      invalidEmail: 'Enter a valid e-mail address.',
      mailSubject: 'Solare Creative Project Enquiry',
      copy: 'Copy',
      copied: 'Copied',
    },
    project: {
      demoBadge: 'Demo project',
      still: 'Photography',
      filmSoon: 'Film coming soon — poster frame',
      demoVisual: 'Demo visual — film coming soon',
      demoExplain: 'A procedural light study is playing here in place of the film. The real film will appear once it is released.',
      play: 'Play',
      pause: 'Pause',
      mute: 'Mute',
      unmute: 'Unmute',
      fullscreen: 'Fullscreen',
      seek: 'Timeline',
      scope: 'Scope',
      category: 'Category',
      location: 'Location',
      destination: 'Destination',
      prev: 'Previous project',
      next: 'Next project',
      close: 'Close project',
      mediaError: 'The video could not be loaded. A demo visual is shown instead.',
      gallery: 'Stills',
      discuss: 'Discuss a similar project',
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
            'Analytics are disabled by default. If enabled, only cookieless, privacy-respecting measurement will be used.',
            'Your language and sound preferences are stored only in your browser.',
          ],
        },
        {
          title: 'Copyright & use',
          text: [
            'The visual language, texts and software of this site belong to Solare Creative.',
            'Planet textures: Solar System Scope (solarsystemscope.com), licensed CC BY 4.0; based on NASA data.',
            'Projects marked “Demo” are placeholders; they do not imply a client relationship or completed work with the brands named. All trademarks belong to their owners.',
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
      flare: 'Solar eruption',
      alignment: 'The grand alignment',
      chime: 'Lunar resonance',
      comet: 'A passing comet',
    },
    ring: 'WE DON’T FILM BUILDINGS — WE CAPTURE LIGHT, SHADOW, AND THE FEELING OF BEING THERE — ',
  },
};
