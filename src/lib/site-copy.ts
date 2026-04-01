import type { SiteLanguage } from "@/lib/site-preferences";

type LocalizedValue<T> = Record<SiteLanguage, T>;

export type HeaderMenuItem = {
  href: string;
  label: string;
  description: string;
};

export type HeaderMenuGroup = {
  href: string;
  label: string;
  description: string;
  items: HeaderMenuItem[];
  panelClassName?: string;
};

function pick<T>(language: SiteLanguage, values: LocalizedValue<T>): T {
  return values[language] ?? values.TR;
}

export function siteHeaderNavigationCopy(language: SiteLanguage): {
  menuGroups: HeaderMenuGroup[];
  directLinks: Array<{ href: string; label: string }>;
  mobileTitle: string;
  mobileDescription: string;
} {
  const menuGroupsByLanguage: LocalizedValue<HeaderMenuGroup[]> = {
    TR: [
      {
        href: "/portfoyler",
        label: "EMLAK AL",
        description: "Satılık ilanları, yatırım odaklı portföyleri ve yaşam tarzına göre seçilmiş premium mülkleri keşfedin.",
        panelClassName: "w-[34rem]",
        items: [
          { href: "/portfoyler", label: "Tüm Satılık İlanlar", description: "Tüm aktif portföyleri tek ekranda listeleyin." },
          { href: "/portfoyler?type=Daire", label: "Daire", description: "Şehir merkezinde ve premium bölgelerde daire seçenekleri." },
          { href: "/portfoyler?type=Villa", label: "Villa", description: "Bahçeli, özel havuzlu ve yüksek metrekareli yaşam alanları." },
          { href: "/portfoyler?type=Rezidans", label: "Rezidans", description: "Servisli yaşam ve merkezi lokasyon odaklı rezidans portföyleri." },
          { href: "/portfoyler?type=Ofis", label: "Ticari Gayrimenkul", description: "Ofis ve ticari kullanım için seçili yatırımlık portföyler." },
          { href: "/portfoyler?type=Arsa", label: "Arsa", description: "İmarlı ve geleceğe dönük gelişim aksında arsa fırsatları." },
          { href: "/portfoyler?q=deniz", label: "Deniz Manzaralı", description: "Manzara odaklı yaşam ve yatırım portföyleri." },
          { href: "/blog", label: "Vatandaşlık Uygun Emlaklar", description: "Vatandaşlık sürecine uygun yatırım içerikleri ve portföy bakışı." },
          { href: "/portfoyler?q=yatirim", label: "Yatırımlık Fırsatlar", description: "Değer artışı ve kira potansiyeli güçlü ilan seçkileri." },
          { href: "/portfoyler?q=proje", label: "Projeden Satılık", description: "Yeni gelişen proje ve lansman odaklı satış seçenekleri." },
        ],
      },
      {
        href: "/emlak-sat",
        label: "EMLAK SAT",
        description: "Satış sürecini değerleme, pazarlama ve alıcı yönetimiyle uçtan uca profesyonel bir operasyona dönüştürün.",
        panelClassName: "w-[30rem]",
        items: [
          { href: "/emlak-sat?intent=degerleme", label: "Ücretsiz Değerleme", description: "Mülkünüz için hızlı ve stratejik fiyat aralığı değerlendirmesi." },
          { href: "/emlak-sat?intent=sat", label: "Portföyümü Sat", description: "Mülkünüzü uzman ekip eşliğinde satış operasyonuna alın." },
          { href: "/hizmetler", label: "Satış Süreci", description: "İlan girişinden kapanışa kadar tüm adımları planlayın." },
          { href: "/hizmetler", label: "Uluslararası Pazarlama", description: "Yurt dışı alıcı ağlarına uygun sunum ve pazarlama akışı." },
          { href: "/hizmetler", label: "Profesyonel Fotoğraf & Tanıtım", description: "Premium vitrin için görsel ve içerik hazırlık desteği." },
          { href: "/hizmetler", label: "Müşteri Ağı & Hızlı Satış", description: "Hazır alıcı havuzu ve doğru eşleşmeyle daha hızlı kapanış." },
        ],
      },
      {
        href: "/blog",
        label: "SATIN ALMA REHBERİ",
        description: "Türkiye’de gayrimenkul alım sürecini yatırım, mevzuat ve operasyon açısından adım adım inceleyin.",
        panelClassName: "w-[30rem]",
        items: [
          { href: "/blog", label: "Türkiye’de Ev Satın Alma Süreci", description: "İlk keşiften tapuya kadar temel satın alma akışı." },
          { href: "/blog", label: "Tapu İşlemleri", description: "Tapu devri, evrak ve işlem gününde dikkat edilmesi gerekenler." },
          { href: "/blog", label: "Vatandaşlık Süreci", description: "Yatırım karşılığı vatandaşlıkta öne çıkan işlem adımları." },
          { href: "/blog", label: "Oturum İzni", description: "Yabancı yatırımcılar için ikamet süreci ve temel başlıklar." },
          { href: "/blog", label: "Vergiler ve Masraflar", description: "Satın alma sürecindeki maliyet kalemlerine hızlı bakış." },
          { href: "/blog", label: "Yatırım Rehberi", description: "Lokasyon, kira getirisi ve çıkış planı odaklı yatırım yaklaşımı." },
          { href: "/blog", label: "Sıkça Sorulan Sorular", description: "Sürece başlamadan önce en çok sorulan temel konular." },
        ],
      },
      {
        href: "/hakkimizda",
        label: "KURUMSAL",
        description: "Marka yaklaşımımızı, ekibimizi ve yatırım odaklı emlak operasyon anlayışımızı keşfedin.",
        panelClassName: "w-[29rem]",
        items: [
          { href: "/hakkimizda", label: "Hakkımızda", description: "Markanın duruşu, yaklaşımı ve hikayesi." },
          { href: "/hakkimizda", label: "Vizyon & Misyon", description: "Uzun vadeli marka hedefleri ve hizmet yaklaşımı." },
          { href: "/hakkimizda", label: "Neden Rodina Invest", description: "Ayırt edici servis yaklaşımı ve yatırım bakışı." },
          { href: "/hizmetler", label: "Hizmetlerimiz", description: "Satış, yatırım ve premium portföy yönetimi başlıkları." },
          { href: "/danismanlar", label: "Referanslar", description: "Ekibin uzmanlık alanları ve bölgesel deneyim gücü." },
          { href: "/danismanlar", label: "İş Ortakları", description: "Satış sürecini destekleyen uzman ve çözüm ortakları." },
        ],
      },
    ],
    EN: [
      {
        href: "/portfoyler",
        label: "BUY",
        description: "Explore premium listings, investment-focused portfolios, and properties curated around different lifestyles.",
        panelClassName: "w-[34rem]",
        items: [
          { href: "/portfoyler", label: "All Listings", description: "View every active portfolio in a single screen." },
          { href: "/portfoyler?type=Daire", label: "Apartment", description: "Apartment options in prime city-center and premium districts." },
          { href: "/portfoyler?type=Villa", label: "Villa", description: "Garden villas, private pools, and large living spaces." },
          { href: "/portfoyler?type=Rezidans", label: "Residence", description: "Serviced residences with central locations and premium amenities." },
          { href: "/portfoyler?type=Ofis", label: "Commercial", description: "Selected office and commercial investment opportunities." },
          { href: "/portfoyler?type=Arsa", label: "Land", description: "Zoned plots in high-potential development corridors." },
          { href: "/portfoyler?q=deniz", label: "Sea View", description: "Lifestyle and investment portfolios focused on the view." },
          { href: "/blog", label: "Citizenship Eligible", description: "Investment content and listing perspectives suitable for citizenship programs." },
          { href: "/portfoyler?q=yatirim", label: "Investment Picks", description: "Selected listings with strong appreciation and rental potential." },
          { href: "/portfoyler?q=proje", label: "Off-plan Sales", description: "Launch-phase developments and early sales opportunities." },
        ],
      },
      {
        href: "/emlak-sat",
        label: "SELL",
        description: "Turn the sales journey into a fully managed operation with valuation, marketing, and buyer management.",
        panelClassName: "w-[30rem]",
        items: [
          { href: "/emlak-sat?intent=degerleme", label: "Free Valuation", description: "Get a fast and strategic price-range assessment for your property." },
          { href: "/emlak-sat?intent=sat", label: "Sell My Property", description: "Launch your asset into a guided sales operation with our expert team." },
          { href: "/hizmetler", label: "Sales Process", description: "Plan every step from listing creation to closing." },
          { href: "/hizmetler", label: "International Marketing", description: "Presentation and outreach tailored to overseas buyers." },
          { href: "/hizmetler", label: "Photo & Branding", description: "Visual production and content support for a premium showcase." },
          { href: "/hizmetler", label: "Buyer Network", description: "Reach the right audience faster with our ready buyer pool." },
        ],
      },
      {
        href: "/blog",
        label: "BUYER GUIDE",
        description: "Review the Turkish real estate purchase process step by step through an investment and operations lens.",
        panelClassName: "w-[30rem]",
        items: [
          { href: "/blog", label: "Buying a Home in Turkey", description: "The core purchase flow from first discovery to title deed." },
          { href: "/blog", label: "Title Deed Process", description: "Key documents and handover-day details to watch." },
          { href: "/blog", label: "Citizenship Process", description: "Main steps for citizenship-by-investment transactions." },
          { href: "/blog", label: "Residence Permit", description: "Core topics for foreign investors seeking residency." },
          { href: "/blog", label: "Taxes & Fees", description: "A quick view of the cost items involved in the transaction." },
          { href: "/blog", label: "Investment Guide", description: "A framework built around location, yield, and exit planning." },
          { href: "/blog", label: "FAQ", description: "The most common questions before you start the process." },
        ],
      },
      {
        href: "/hakkimizda",
        label: "CORPORATE",
        description: "Discover our brand approach, team, and investment-oriented real estate operations model.",
        panelClassName: "w-[29rem]",
        items: [
          { href: "/hakkimizda", label: "About Us", description: "The brand perspective, approach, and story." },
          { href: "/hakkimizda", label: "Vision & Mission", description: "Long-term goals and service philosophy." },
          { href: "/hakkimizda", label: "Why Rodina Invest", description: "Our differentiated service style and investment lens." },
          { href: "/hizmetler", label: "Services", description: "Sales, investment, and premium portfolio management." },
          { href: "/danismanlar", label: "References", description: "The team’s expertise and regional experience." },
          { href: "/danismanlar", label: "Partners", description: "Specialists and partners supporting the sales process." },
        ],
      },
    ],
    RU: [
      {
        href: "/portfoyler",
        label: "КУПИТЬ",
        description: "Изучайте премиальные объекты, инвестиционные подборки и недвижимость, подобранную под разные сценарии жизни.",
        panelClassName: "w-[34rem]",
        items: [
          { href: "/portfoyler", label: "Все объекты", description: "Просмотрите все активные предложения на одном экране." },
          { href: "/portfoyler?type=Daire", label: "Квартира", description: "Квартиры в центральных и премиальных районах." },
          { href: "/portfoyler?type=Villa", label: "Вилла", description: "Виллы с садом, бассейном и большой площадью." },
          { href: "/portfoyler?type=Rezidans", label: "Резиденция", description: "Сервисные резиденции в центральных локациях." },
          { href: "/portfoyler?type=Ofis", label: "Коммерческая недвижимость", description: "Избранные офисные и коммерческие инвестиции." },
          { href: "/portfoyler?type=Arsa", label: "Земля", description: "Участки в перспективных зонах развития." },
          { href: "/portfoyler?q=deniz", label: "С видом на море", description: "Подборка объектов с акцентом на вид и ценность." },
          { href: "/blog", label: "Под гражданство", description: "Контент и объекты, подходящие под инвестиционные программы гражданства." },
          { href: "/portfoyler?q=yatirim", label: "Инвестиционные варианты", description: "Объекты с сильным потенциалом роста и аренды." },
          { href: "/portfoyler?q=proje", label: "Продажи на этапе проекта", description: "Новые проекты и ранние предложения." },
        ],
      },
      {
        href: "/emlak-sat",
        label: "ПРОДАТЬ",
        description: "Превратите продажу в профессионально управляемую операцию с оценкой, маркетингом и работой с покупателями.",
        panelClassName: "w-[30rem]",
        items: [
          { href: "/emlak-sat?intent=degerleme", label: "Бесплатная оценка", description: "Быстрая и стратегическая оценка ценового диапазона." },
          { href: "/emlak-sat?intent=sat", label: "Продать мой объект", description: "Передайте объект в сопровождение нашей команды." },
          { href: "/hizmetler", label: "Процесс продажи", description: "Планируйте путь от публикации до закрытия сделки." },
          { href: "/hizmetler", label: "Международный маркетинг", description: "Подача и продвижение для зарубежных покупателей." },
          { href: "/hizmetler", label: "Фото и презентация", description: "Поддержка визуальной упаковки для премиальной витрины." },
          { href: "/hizmetler", label: "Сеть покупателей", description: "Быстрый доступ к готовой аудитории и инвесторам." },
        ],
      },
      {
        href: "/blog",
        label: "ГИД ПОКУПАТЕЛЯ",
        description: "Изучите процесс покупки недвижимости в Турции по шагам с точки зрения инвестиций и операций.",
        panelClassName: "w-[30rem]",
        items: [
          { href: "/blog", label: "Покупка жилья в Турции", description: "Базовый путь от первого интереса до оформления." },
          { href: "/blog", label: "Оформление тапу", description: "Документы и важные нюансы дня сделки." },
          { href: "/blog", label: "Процесс гражданства", description: "Ключевые шаги при инвестиционном гражданстве." },
          { href: "/blog", label: "ВНЖ", description: "Основные темы для иностранных инвесторов." },
          { href: "/blog", label: "Налоги и расходы", description: "Краткий обзор затрат при покупке." },
          { href: "/blog", label: "Инвестиционный гид", description: "Подход к выбору локации, доходности и выходу." },
          { href: "/blog", label: "Частые вопросы", description: "Самые популярные вопросы перед стартом процесса." },
        ],
      },
      {
        href: "/hakkimizda",
        label: "КОМПАНИЯ",
        description: "Узнайте о нашем бренде, команде и инвестиционном подходе к недвижимости.",
        panelClassName: "w-[29rem]",
        items: [
          { href: "/hakkimizda", label: "О нас", description: "Позиционирование, подход и история бренда." },
          { href: "/hakkimizda", label: "Видение и миссия", description: "Долгосрочные цели и философия сервиса." },
          { href: "/hakkimizda", label: "Почему Rodina Invest", description: "Наш отличительный сервис и инвестиционный взгляд." },
          { href: "/hizmetler", label: "Наши услуги", description: "Продажи, инвестиции и управление премиальными портфелями." },
          { href: "/danismanlar", label: "Рекомендации", description: "Экспертиза команды и опыт по регионам." },
          { href: "/danismanlar", label: "Партнеры", description: "Специалисты и партнеры, поддерживающие сделку." },
        ],
      },
    ],
    AR: [
      {
        href: "/portfoyler",
        label: "اشترِ",
        description: "اكتشف العقارات المميزة، والمحافظ الاستثمارية، والوحدات المختارة وفق أساليب الحياة المختلفة.",
        panelClassName: "w-[34rem]",
        items: [
          { href: "/portfoyler", label: "جميع العقارات", description: "اعرض جميع العقارات النشطة في شاشة واحدة." },
          { href: "/portfoyler?type=Daire", label: "شقة", description: "خيارات شقق في مركز المدينة والمناطق الراقية." },
          { href: "/portfoyler?type=Villa", label: "فيلا", description: "فلل بحدائق ومسابح خاصة ومساحات واسعة." },
          { href: "/portfoyler?type=Rezidans", label: "سكن فاخر", description: "وحدات سكنية مخدومة في مواقع مركزية." },
          { href: "/portfoyler?type=Ofis", label: "عقار تجاري", description: "فرص استثمارية مختارة للمكاتب والعقارات التجارية." },
          { href: "/portfoyler?type=Arsa", label: "أرض", description: "أراضٍ منظمة في محاور تطوير واعدة." },
          { href: "/portfoyler?q=deniz", label: "إطلالة بحرية", description: "عقارات تركز على الإطلالة والقيمة الاستثمارية." },
          { href: "/blog", label: "مناسب للجنسية", description: "محتوى وفرص استثمارية متوافقة مع برامج الجنسية." },
          { href: "/portfoyler?q=yatirim", label: "فرص استثمارية", description: "عقارات ذات نمو قوي وإمكانات إيجارية عالية." },
          { href: "/portfoyler?q=proje", label: "بيع على المخطط", description: "مشاريع جديدة وفرص إطلاق مبكرة." },
        ],
      },
      {
        href: "/emlak-sat",
        label: "بِع",
        description: "حوّل رحلة البيع إلى عملية احترافية متكاملة تشمل التقييم والتسويق وإدارة المشترين.",
        panelClassName: "w-[30rem]",
        items: [
          { href: "/emlak-sat?intent=degerleme", label: "تقييم مجاني", description: "احصل على تقييم سريع واستراتيجي لنطاق السعر." },
          { href: "/emlak-sat?intent=sat", label: "بع عقاري", description: "أطلق بيع عقارك بمرافقة فريقنا المتخصص." },
          { href: "/hizmetler", label: "عملية البيع", description: "خطط لكل خطوة من إدراج العقار حتى الإغلاق." },
          { href: "/hizmetler", label: "تسويق دولي", description: "عرض وتسويق مخصصان للمشترين الدوليين." },
          { href: "/hizmetler", label: "تصوير وتقديم", description: "دعم بصري ومحتوى لواجهة عرض مميزة." },
          { href: "/hizmetler", label: "شبكة المشترين", description: "وصول أسرع إلى المشترين الجاهزين والمستثمرين." },
        ],
      },
      {
        href: "/blog",
        label: "دليل الشراء",
        description: "تعرّف على خطوات شراء العقار في تركيا من منظور استثماري وتشغيلي.",
        panelClassName: "w-[30rem]",
        items: [
          { href: "/blog", label: "شراء منزل في تركيا", description: "المسار الأساسي من الاستكشاف الأول حتى سند الملكية." },
          { href: "/blog", label: "إجراءات الطابو", description: "المستندات والنقاط المهمة يوم نقل الملكية." },
          { href: "/blog", label: "إجراءات الجنسية", description: "الخطوات الأساسية في الجنسية عبر الاستثمار." },
          { href: "/blog", label: "الإقامة", description: "الموضوعات الرئيسية للمستثمرين الأجانب." },
          { href: "/blog", label: "الضرائب والتكاليف", description: "نظرة سريعة على التكاليف خلال عملية الشراء." },
          { href: "/blog", label: "دليل الاستثمار", description: "منهجية تركز على الموقع والعائد وخطة الخروج." },
          { href: "/blog", label: "الأسئلة الشائعة", description: "أكثر الأسئلة شيوعًا قبل بدء العملية." },
        ],
      },
      {
        href: "/hakkimizda",
        label: "الشركة",
        description: "اكتشف نهج علامتنا التجارية وفريقنا وطريقة عملنا الاستثمارية في العقارات.",
        panelClassName: "w-[29rem]",
        items: [
          { href: "/hakkimizda", label: "من نحن", description: "رؤية العلامة ونهجها وقصتها." },
          { href: "/hakkimizda", label: "الرؤية والرسالة", description: "الأهداف طويلة المدى وفلسفة الخدمة." },
          { href: "/hakkimizda", label: "لماذا Rodina Invest", description: "أسلوبنا المختلف في الخدمة والاستثمار." },
          { href: "/hizmetler", label: "خدماتنا", description: "المبيعات والاستثمار وإدارة المحافظ المميزة." },
          { href: "/danismanlar", label: "المرجعيات", description: "خبرات الفريق وقوته الإقليمية." },
          { href: "/danismanlar", label: "الشركاء", description: "الخبراء والشركاء الداعمون لعملية البيع." },
        ],
      },
    ],
  };

  const directLinksByLanguage: LocalizedValue<Array<{ href: string; label: string }>> = {
    TR: [
      { href: "/blog", label: "BLOG" },
      { href: "/iletisim", label: "İLETİŞİM" },
    ],
    EN: [
      { href: "/blog", label: "BLOG" },
      { href: "/iletisim", label: "CONTACT" },
    ],
    RU: [
      { href: "/blog", label: "БЛОГ" },
      { href: "/iletisim", label: "КОНТАКТЫ" },
    ],
    AR: [
      { href: "/blog", label: "المدونة" },
      { href: "/iletisim", label: "اتصل" },
    ],
  };

  return {
    menuGroups: pick(language, menuGroupsByLanguage),
    directLinks: pick(language, directLinksByLanguage),
    mobileTitle: pick(language, {
      TR: "Site Navigasyonu",
      EN: "Site Navigation",
      RU: "Навигация по сайту",
      AR: "تنقل الموقع",
    }),
    mobileDescription: pick(language, {
      TR: "Satılık portföyler, hizmet sayfaları ve kurumsal içerikler arasında hızlı geçiş yapın.",
      EN: "Move quickly between listings, services, and corporate pages.",
      RU: "Быстро переходите между объектами, услугами и корпоративными страницами.",
      AR: "انتقل بسرعة بين العقارات والخدمات والصفحات التعريفية.",
    }),
  };
}

export function footerCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      links: {
        home: "Anasayfa",
        listings: "Portföyler",
        blog: "Blog",
        map: "Harita",
        services: "Hizmetler",
        advisors: "Danışmanlar",
        about: "Hakkımızda",
        contact: "İletişim",
      },
      tagline: "Premium vitrin, danışman destekli satış akışı.",
      copyright: "Tüm hakları saklıdır.",
      login: "Yetkili Girişi",
    },
    EN: {
      links: {
        home: "Home",
        listings: "Listings",
        blog: "Blog",
        map: "Map",
        services: "Services",
        advisors: "Advisors",
        about: "About",
        contact: "Contact",
      },
      tagline: "A premium showcase with advisor-led sales flow.",
      copyright: "All rights reserved.",
      login: "Agency Login",
    },
    RU: {
      links: {
        home: "Главная",
        listings: "Объекты",
        blog: "Блог",
        map: "Карта",
        services: "Услуги",
        advisors: "Консультанты",
        about: "О нас",
        contact: "Контакты",
      },
      tagline: "Премиальная витрина и продажи при поддержке консультантов.",
      copyright: "Все права защищены.",
      login: "Вход для агентов",
    },
    AR: {
      links: {
        home: "الرئيسية",
        listings: "العقارات",
        blog: "المدونة",
        map: "الخريطة",
        services: "الخدمات",
        advisors: "المستشارون",
        about: "من نحن",
        contact: "اتصل",
      },
      tagline: "واجهة مميزة مع مسار بيع يقوده المستشارون.",
      copyright: "جميع الحقوق محفوظة.",
      login: "دخول الوكلاء",
    },
  });
}

export function homePageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      heroKicker: "Signature Real Estate Platform",
      heroTitle: "Premium emlak deneyimi artık çok sayfalı kurumsal yapıda",
      heroBody: "Portföyler, harita, danışman ekibi, hizmetler ve iletişim bölümleri ile satışa odaklı tam web sitesi altyapısı.",
      ctaListings: "Portföyleri Gör",
      ctaMap: "Haritada Keşfet",
      ctaContact: "Danışmana Ulaş",
      stats: {
        activeListings: "Aktif Portföy",
        premiumAdvisors: "Premium Danışman",
        averageClose: "Ortalama Kapanış",
      },
      averageCloseValue: "21 Gün",
      featuredKicker: "Featured Listings",
      featuredTitle: "Öne Çıkan Portföyler",
      viewAll: "Tümünü Gör",
      locationsKicker: "Popular Locations",
      locationsTitle: "Popüler Lokasyonlar",
      locationsBody: "Sayfanın alt vitrininde en çok ilgi gören şehir ve bölge başlıklarını, güçlü görseller ve premium geçişlerle öne çıkarıyoruz.",
      allLocations: "Tüm lokasyonları gör",
      startingBand: "Başlangıç Bandı",
      newSelection: "Yeni proje seçkisi",
      exploreRegion: "Bölgeyi keşfet",
      locationCards: {
        zekeriyakoy: {
          title: "Zekeriyaköy",
          subtitle: "İstanbul / Sarıyer",
          badge: "Villa Rotaları",
          blurb: "Orman çizgisi, geniş metrekare ve sakin yaşam beklentisiyle en çok talep gören premium bölgelerden biri.",
        },
        nisantasi: {
          title: "Nişantaşı",
          subtitle: "İstanbul / Şişli",
          badge: "Şehir İkonu",
          blurb: "Butik rezidans çizgisi, prestijli cadde yaşamı ve merkezde konumlanan seçkin projeler için güçlü bir vitrin.",
        },
        "istanbul-prime": {
          title: "İstanbul Prime",
          subtitle: "Merkez ilçelerde premium seçki",
          badge: "Yüksek Talep",
          blurb: "Şehir içinde yatırım değeri yüksek ve hızlı geri dönüş potansiyeli taşıyan premium ilan havuzu.",
        },
        urla: {
          title: "Urla",
          subtitle: "İzmir / Ege kıyı hattı",
          badge: "Yatırım Odağı",
          blurb: "Ege yaşamı, arsa yatırımı ve uzun vadeli değer artışı arayan yatırımcıların radarındaki rota.",
        },
        "signature-selection": {
          title: "İstanbul & Ege",
          subtitle: "Signature seçki koleksiyonu",
          badge: "Sezonun Seçimi",
          blurb: "Şehir dinamizmi ile sahil yaşamını aynı vitrinde bir araya getiren satış odaklı premium portföy seçkisi.",
        },
      },
    },
    EN: {
      heroKicker: "Signature Real Estate Platform",
      heroTitle: "A premium real estate experience, now in a multi-page corporate format",
      heroBody: "A complete sales-focused website with listings, map, advisors, services, and contact sections.",
      ctaListings: "View Listings",
      ctaMap: "Explore on Map",
      ctaContact: "Contact an Advisor",
      stats: {
        activeListings: "Active Listings",
        premiumAdvisors: "Premium Advisors",
        averageClose: "Average Closing",
      },
      averageCloseValue: "21 Days",
      featuredKicker: "Featured Listings",
      featuredTitle: "Featured Listings",
      viewAll: "View All",
      locationsKicker: "Popular Locations",
      locationsTitle: "Popular Locations",
      locationsBody: "We highlight the most in-demand cities and neighborhoods with strong imagery and premium transitions.",
      allLocations: "See all locations",
      startingBand: "Starting Range",
      newSelection: "New project collection",
      exploreRegion: "Explore area",
      locationCards: {
        zekeriyakoy: {
          title: "Zekeriyakoy",
          subtitle: "Istanbul / Sariyer",
          badge: "Villa Routes",
          blurb: "One of the most requested premium districts thanks to forest surroundings, large floor plans, and a calm lifestyle.",
        },
        nisantasi: {
          title: "Nisantasi",
          subtitle: "Istanbul / Sisli",
          badge: "City Icon",
          blurb: "A strong showcase for boutique residences, prestigious street life, and select centrally located projects.",
        },
        "istanbul-prime": {
          title: "Istanbul Prime",
          subtitle: "Premium selection in central districts",
          badge: "High Demand",
          blurb: "A premium pool of listings inside the city with strong investment value and quick-return potential.",
        },
        urla: {
          title: "Urla",
          subtitle: "Izmir / Aegean coast",
          badge: "Investment Focus",
          blurb: "A destination on the radar of investors looking for Aegean lifestyle, land plays, and long-term value growth.",
        },
        "signature-selection": {
          title: "Istanbul & Aegean",
          subtitle: "Signature selection",
          badge: "Season Pick",
          blurb: "A curated premium portfolio combining city energy with coastal living in one storefront.",
        },
      },
    },
    RU: {
      heroKicker: "Signature Real Estate Platform",
      heroTitle: "Премиальный опыт в недвижимости теперь представлен в многостраничном корпоративном формате",
      heroBody: "Полноценный сайт для продаж с объектами, картой, консультантами, услугами и контактами.",
      ctaListings: "Смотреть объекты",
      ctaMap: "Открыть карту",
      ctaContact: "Связаться с консультантом",
      stats: {
        activeListings: "Активные объекты",
        premiumAdvisors: "Премиум-консультанты",
        averageClose: "Среднее закрытие",
      },
      averageCloseValue: "21 день",
      featuredKicker: "Featured Listings",
      featuredTitle: "Избранные объекты",
      viewAll: "Смотреть все",
      locationsKicker: "Popular Locations",
      locationsTitle: "Популярные локации",
      locationsBody: "Мы выделяем самые востребованные города и районы с сильной визуальной подачей и премиальной навигацией.",
      allLocations: "Все локации",
      startingBand: "Стартовый диапазон",
      newSelection: "Подборка новых проектов",
      exploreRegion: "Изучить район",
      locationCards: {
        zekeriyakoy: {
          title: "Зекериякёй",
          subtitle: "Стамбул / Сарыер",
          badge: "Маршруты вилл",
          blurb: "Один из самых востребованных премиальных районов благодаря лесному окружению, большим площадям и спокойному ритму жизни.",
        },
        nisantasi: {
          title: "Нишанташы",
          subtitle: "Стамбул / Шишли",
          badge: "Икона города",
          blurb: "Сильная витрина для бутиковых резиденций, престижных улиц и избранных центральных проектов.",
        },
        "istanbul-prime": {
          title: "Istanbul Prime",
          subtitle: "Премиальная подборка в центре города",
          badge: "Высокий спрос",
          blurb: "Премиальный пул объектов в городе с высокой инвестиционной ценностью и быстрой окупаемостью.",
        },
        urla: {
          title: "Урла",
          subtitle: "Измир / Эгейское побережье",
          badge: "Инвестиционный фокус",
          blurb: "Локация для инвесторов, которые ищут эгейский стиль жизни, земельные активы и долгосрочный рост стоимости.",
        },
        "signature-selection": {
          title: "Стамбул и Эгейский регион",
          subtitle: "Коллекция Signature",
          badge: "Выбор сезона",
          blurb: "Кураторская подборка, объединяющая энергию города и прибрежный стиль жизни.",
        },
      },
    },
    AR: {
      heroKicker: "Signature Real Estate Platform",
      heroTitle: "تجربة عقارية مميزة الآن ضمن موقع مؤسسي متعدد الصفحات",
      heroBody: "موقع متكامل يركز على المبيعات ويضم العقارات والخريطة والمستشارين والخدمات والتواصل.",
      ctaListings: "عرض العقارات",
      ctaMap: "استكشف على الخريطة",
      ctaContact: "تواصل مع مستشار",
      stats: {
        activeListings: "عقارات نشطة",
        premiumAdvisors: "مستشارون مميزون",
        averageClose: "متوسط الإغلاق",
      },
      averageCloseValue: "21 يومًا",
      featuredKicker: "Featured Listings",
      featuredTitle: "العقارات المميزة",
      viewAll: "عرض الكل",
      locationsKicker: "Popular Locations",
      locationsTitle: "المواقع الأكثر طلبًا",
      locationsBody: "نبرز المدن والمناطق الأكثر جذبًا مع صور قوية وانتقالات بصرية مميزة.",
      allLocations: "عرض جميع المواقع",
      startingBand: "نطاق البداية",
      newSelection: "مجموعة مشاريع جديدة",
      exploreRegion: "استكشف المنطقة",
      locationCards: {
        zekeriyakoy: {
          title: "زكريا كوي",
          subtitle: "إسطنبول / ساريير",
          badge: "مسارات الفلل",
          blurb: "من أكثر المناطق الراقية طلبًا بفضل الطابع الهادئ، والمساحات الكبيرة، والامتداد الأخضر.",
        },
        nisantasi: {
          title: "نيشانتاشي",
          subtitle: "إسطنبول / شيشلي",
          badge: "أيقونة المدينة",
          blurb: "واجهة قوية للمشاريع السكنية البوتيكية والحياة الراقية في مركز المدينة.",
        },
        "istanbul-prime": {
          title: "إسطنبول برايم",
          subtitle: "اختيار فاخر في المناطق المركزية",
          badge: "طلب مرتفع",
          blurb: "مجموعة عقارات مميزة داخل المدينة بقيمة استثمارية مرتفعة وإمكانات عائد سريعة.",
        },
        urla: {
          title: "أورلا",
          subtitle: "إزمير / ساحل إيجه",
          badge: "تركيز استثماري",
          blurb: "وجهة يراقبها المستثمرون الباحثون عن أسلوب حياة إيجي ونمو طويل الأمد في القيمة.",
        },
        "signature-selection": {
          title: "إسطنبول وإيجه",
          subtitle: "مجموعة Signature",
          badge: "اختيار الموسم",
          blurb: "مجموعة عقارية منسقة تجمع بين حيوية المدينة وهدوء الساحل في واجهة واحدة.",
        },
      },
    },
  });
}

export function summarizeLocationStockLabel(language: SiteLanguage, count: number): string {
  if (language === "TR") {
    if (count === 0) return "Editoryal Seçki";
    return count === 1 ? "1 aktif portföy" : `${count} aktif portföy`;
  }

  if (language === "EN") {
    if (count === 0) return "Editorial Selection";
    return count === 1 ? "1 active listing" : `${count} active listings`;
  }

  if (language === "RU") {
    if (count === 0) return "Редакционная подборка";
    return count === 1 ? "1 активный объект" : `${count} активных объектов`;
  }

  if (count === 0) return "اختيار تحريري";
  return count === 1 ? "عقار نشط واحد" : `${count} عقارات نشطة`;
}

export function portfolioPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      heroKicker: "Portfolio Collection",
      heroTitle: "Premium Portföyler",
      heroBody: "Kriterlerinize göre filtreleyin, detayları inceleyin ve doğrudan danışmana ulaşın.",
      filterKicker: "Portfolio Filter",
      filterTitle: "Portföy Filtrele",
      filterBody: "Bölge, tip, oda ve bütçe kriterlerine göre ideal ilanları hızlıca daraltın.",
      searchPlaceholder: "İlan, bölge veya kod",
      cityPlaceholder: "Şehir",
      typePlaceholder: "Tip",
      roomPlaceholder: "Oda",
      minPricePlaceholder: "Min fiyat",
      maxPricePlaceholder: "Max fiyat",
      submit: "Filtrele",
      activeResults: "Aktif sonuç",
      mapView: "Harita görünümüne geç",
      noResults: "Filtreye uygun ilan bulunamadı. Arama kriterlerini genişletip tekrar deneyin.",
    },
    EN: {
      heroKicker: "Portfolio Collection",
      heroTitle: "Premium Listings",
      heroBody: "Filter by your criteria, review the details, and contact the advisor directly.",
      filterKicker: "Portfolio Filter",
      filterTitle: "Filter Listings",
      filterBody: "Narrow down the right listings quickly by area, type, rooms, and budget.",
      searchPlaceholder: "Listing, area, or code",
      cityPlaceholder: "City",
      typePlaceholder: "Type",
      roomPlaceholder: "Rooms",
      minPricePlaceholder: "Min price",
      maxPricePlaceholder: "Max price",
      submit: "Filter",
      activeResults: "Active results",
      mapView: "Switch to map view",
      noResults: "No listings matched your filter. Broaden your criteria and try again.",
    },
    RU: {
      heroKicker: "Portfolio Collection",
      heroTitle: "Премиальные объекты",
      heroBody: "Фильтруйте по вашим критериям, изучайте детали и связывайтесь с консультантом напрямую.",
      filterKicker: "Portfolio Filter",
      filterTitle: "Фильтр объектов",
      filterBody: "Быстро сузьте выбор по району, типу, комнатности и бюджету.",
      searchPlaceholder: "Объект, район или код",
      cityPlaceholder: "Город",
      typePlaceholder: "Тип",
      roomPlaceholder: "Комнаты",
      minPricePlaceholder: "Мин. цена",
      maxPricePlaceholder: "Макс. цена",
      submit: "Фильтровать",
      activeResults: "Активные результаты",
      mapView: "Перейти к карте",
      noResults: "Подходящих объектов не найдено. Расширьте критерии и попробуйте снова.",
    },
    AR: {
      heroKicker: "Portfolio Collection",
      heroTitle: "العقارات المميزة",
      heroBody: "قم بالتصفية حسب معاييرك، وراجع التفاصيل، وتواصل مباشرة مع المستشار.",
      filterKicker: "Portfolio Filter",
      filterTitle: "تصفية العقارات",
      filterBody: "ضيّق النتائج بسرعة حسب المنطقة والنوع وعدد الغرف والميزانية.",
      searchPlaceholder: "عقار أو منطقة أو رمز",
      cityPlaceholder: "المدينة",
      typePlaceholder: "النوع",
      roomPlaceholder: "الغرف",
      minPricePlaceholder: "أدنى سعر",
      maxPricePlaceholder: "أعلى سعر",
      submit: "تصفية",
      activeResults: "النتائج النشطة",
      mapView: "الانتقال إلى الخريطة",
      noResults: "لم يتم العثور على عقارات مطابقة. وسّع معايير البحث وحاول مرة أخرى.",
    },
  });
}

export function contactPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      heroKicker: "Contact",
      heroTitle: "İletişim ve Talep Formu",
      heroBody: "İlgi duyduğunuz portföyü seçip talebinizi bırakın; danışman ekibimiz en kısa sürede dönüş sağlasın.",
      infoKicker: "İletişim Bilgileri",
      infoTitle: "Signature Desk",
      infoBody: "Hafta içi 09:00 - 19:00 arasında tüm talepleri operasyon ekibi karşılar.",
      phone: "Telefon",
      email: "E-posta",
      address: "Adres",
      call: "Hemen Ara",
      advisors: "Danışman Ekibi",
    },
    EN: {
      heroKicker: "Contact",
      heroTitle: "Contact & Inquiry Form",
      heroBody: "Select the listing you are interested in and leave your request so our advisory team can get back to you quickly.",
      infoKicker: "Contact Details",
      infoTitle: "Signature Desk",
      infoBody: "Our operations team handles all inquiries on weekdays between 09:00 and 19:00.",
      phone: "Phone",
      email: "Email",
      address: "Address",
      call: "Call Now",
      advisors: "Advisor Team",
    },
    RU: {
      heroKicker: "Contact",
      heroTitle: "Форма связи и запроса",
      heroBody: "Выберите интересующий объект и оставьте запрос, чтобы наша команда быстро с вами связалась.",
      infoKicker: "Контактные данные",
      infoTitle: "Signature Desk",
      infoBody: "Наша операционная команда обрабатывает все запросы по будням с 09:00 до 19:00.",
      phone: "Телефон",
      email: "Эл. почта",
      address: "Адрес",
      call: "Позвонить",
      advisors: "Команда консультантов",
    },
    AR: {
      heroKicker: "Contact",
      heroTitle: "نموذج التواصل والطلب",
      heroBody: "اختر العقار الذي يهمك واترك طلبك ليعود إليك فريقنا الاستشاري بسرعة.",
      infoKicker: "معلومات التواصل",
      infoTitle: "Signature Desk",
      infoBody: "يتولى فريق العمليات جميع الطلبات في أيام الأسبوع بين 09:00 و19:00.",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      address: "العنوان",
      call: "اتصل الآن",
      advisors: "فريق المستشارين",
    },
  });
}

export function servicesPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      heroKicker: "Services",
      heroTitle: "Hizmetlerimiz",
      heroBody: "PortföySatış ekibi, emlak satışını sadece ilan değil bir operasyon olarak yönetir.",
      serviceLabel: "Hizmet",
      items: [
        {
          title: "Satış Stratejisi",
          text: "Doğru fiyatlandırma, görsel vitrin ve hedef alıcı iletişimi ile hızlı kapanış odaklı süreç.",
        },
        {
          title: "Yatırım Danışmanlığı",
          text: "Kira çarpanı, lokasyon trendi ve çıkış senaryosuna göre yatırım odaklı portföy seçimi.",
        },
        {
          title: "VIP Portföy Turu",
          text: "Kısa liste oluşturma, randevu planlama ve aynı gün çoklu portföy gezisi organizasyonu.",
        },
        {
          title: "Pazarlama ve Vitrin",
          text: "Premium içerik dili, video/sunum akışı ve dijital vitrin optimizasyonu.",
        },
        {
          title: "Müzakere Yönetimi",
          text: "Teklif süreci, pazarlık yönetimi ve alıcı-satıcı dengesini koruyan profesyonel yaklaşım.",
        },
        {
          title: "Evrak ve Süreç Takibi",
          text: "Tekliften devir aşamasına kadar tüm operasyon adımlarının uçtan uca kontrolü.",
        },
      ],
    },
    EN: {
      heroKicker: "Services",
      heroTitle: "Our Services",
      heroBody: "The PortfoySatis team manages real estate sales not just as listings, but as an operation.",
      serviceLabel: "Service",
      items: [
        {
          title: "Sales Strategy",
          text: "A fast-closing process built on accurate pricing, strong visuals, and targeted buyer communication.",
        },
        {
          title: "Investment Advisory",
          text: "Portfolio selection shaped around yield multiplier, location trends, and exit scenarios.",
        },
        {
          title: "VIP Property Tour",
          text: "Shortlist building, appointment planning, and multi-property touring in a single day.",
        },
        {
          title: "Marketing & Showcase",
          text: "Premium content tone, video/presentation flow, and digital showcase optimization.",
        },
        {
          title: "Negotiation Management",
          text: "A professional approach that balances the offer process and protects both buyer and seller.",
        },
        {
          title: "Documentation & Process",
          text: "End-to-end control of every operational step from offer to transfer.",
        },
      ],
    },
    RU: {
      heroKicker: "Services",
      heroTitle: "Наши услуги",
      heroBody: "Команда PortfoySatis управляет продажей недвижимости как полноценной операцией, а не просто публикацией объектов.",
      serviceLabel: "Услуга",
      items: [
        {
          title: "Стратегия продаж",
          text: "Быстрый выход на сделку через правильную цену, сильную витрину и точную коммуникацию с покупателем.",
        },
        {
          title: "Инвестиционный консалтинг",
          text: "Подборка портфеля по доходности, трендам локации и сценарию выхода.",
        },
        {
          title: "VIP-тур по объектам",
          text: "Формирование шорт-листа, планирование встреч и просмотр нескольких объектов за один день.",
        },
        {
          title: "Маркетинг и витрина",
          text: "Премиальный язык контента, видео-презентации и оптимизация цифровой витрины.",
        },
        {
          title: "Управление переговорами",
          text: "Профессиональный подход к офферу и переговорам с балансом интересов обеих сторон.",
        },
        {
          title: "Документы и процесс",
          text: "Контроль всех этапов от предложения до переоформления.",
        },
      ],
    },
    AR: {
      heroKicker: "Services",
      heroTitle: "خدماتنا",
      heroBody: "يدير فريق PortfoySatis مبيعات العقارات كعملية متكاملة وليس مجرد إعلان.",
      serviceLabel: "خدمة",
      items: [
        {
          title: "استراتيجية البيع",
          text: "عملية تركز على الإغلاق السريع من خلال التسعير الصحيح والعرض البصري والتواصل مع المشتري المناسب.",
        },
        {
          title: "الاستشارات الاستثمارية",
          text: "اختيار العقار وفق مضاعف الإيجار واتجاهات الموقع وخطة الخروج الاستثمارية.",
        },
        {
          title: "جولة عقارية VIP",
          text: "إعداد قائمة مختصرة وجدولة المواعيد وتنظيم جولات متعددة في اليوم نفسه.",
        },
        {
          title: "التسويق والواجهة",
          text: "لغة محتوى مميزة وتدفق عرض مرئي وتحسين الواجهة الرقمية.",
        },
        {
          title: "إدارة التفاوض",
          text: "مقاربة احترافية تدير العروض وتحافظ على توازن المشتري والبائع.",
        },
        {
          title: "الوثائق والمتابعة",
          text: "متابعة تشغيلية شاملة من العرض حتى نقل الملكية.",
        },
      ],
    },
  });
}

export function aboutPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      heroKicker: "About PortföySatış",
      heroTitle: "Satış Odaklı Emlak Operasyonu",
      heroBody: "PortföySatış, premium portföyleri doğru alıcı ile buluşturan, veri ve danışman odağını birleştiren dijital emlak platformudur.",
      metrics: {
        activeListings: "Aktif Portföy",
        advisors: "Danışman",
        cities: "Şehir",
        leads: "Lead Kaydı",
      },
      visionKicker: "Vizyon",
      visionTitle: "Güven Veren Premium Deneyim",
      visionBody: "Emlakta premium deneyim; hızlı bilgi, doğru danışman ve şeffaf süreç yönetimiyle oluşur. Tüm dijital akışı bu üç temel üzerine kuruyoruz.",
      approachKicker: "Yaklaşım",
      approachTitle: "Portföy + Danışman Eşleşmesi",
      approachBody: "Her portföy sisteme ilgili uzman danışman ile yüklenir. Bu model, hem satış hızını artırır hem de alıcı tarafında güveni güçlendirir.",
    },
    EN: {
      heroKicker: "About PortfoySatis",
      heroTitle: "A Sales-Focused Real Estate Operation",
      heroBody: "PortfoySatis is a digital property platform that matches premium portfolios with the right buyers through data and advisor expertise.",
      metrics: {
        activeListings: "Active Listings",
        advisors: "Advisors",
        cities: "Cities",
        leads: "Lead Records",
      },
      visionKicker: "Vision",
      visionTitle: "A Premium Experience You Can Trust",
      visionBody: "A premium property experience is built on fast information, the right advisor, and transparent process management. We build the entire digital flow on these three pillars.",
      approachKicker: "Approach",
      approachTitle: "Portfolio + Advisor Match",
      approachBody: "Every listing is uploaded with its specialist advisor. This model improves sales speed while strengthening buyer confidence.",
    },
    RU: {
      heroKicker: "About PortfoySatis",
      heroTitle: "Операция по продаже недвижимости с фокусом на результат",
      heroBody: "PortfoySatis — это цифровая платформа, которая соединяет премиальные объекты с нужным покупателем, объединяя данные и экспертизу консультантов.",
      metrics: {
        activeListings: "Активные объекты",
        advisors: "Консультанты",
        cities: "Города",
        leads: "Лиды",
      },
      visionKicker: "Видение",
      visionTitle: "Премиальный опыт, которому доверяют",
      visionBody: "Премиальный опыт в недвижимости строится на быстрой информации, правильном консультанте и прозрачном процессе. Вся цифровая экосистема строится на этих трех принципах.",
      approachKicker: "Подход",
      approachTitle: "Объект + консультант",
      approachBody: "Каждый объект публикуется вместе с профильным консультантом. Эта модель ускоряет продажи и усиливает доверие со стороны покупателя.",
    },
    AR: {
      heroKicker: "About PortfoySatis",
      heroTitle: "عملية عقارية تركز على البيع",
      heroBody: "PortfoySatis منصة عقارية رقمية تربط العقارات المميزة بالمشتري المناسب عبر البيانات وخبرة المستشارين.",
      metrics: {
        activeListings: "عقارات نشطة",
        advisors: "مستشارون",
        cities: "مدن",
        leads: "سجلات العملاء",
      },
      visionKicker: "الرؤية",
      visionTitle: "تجربة مميزة تبعث على الثقة",
      visionBody: "التجربة العقارية المميزة تُبنى على سرعة المعلومة، والمستشار المناسب، وإدارة شفافة للعملية. نبني كامل المسار الرقمي على هذه الركائز الثلاث.",
      approachKicker: "النهج",
      approachTitle: "مطابقة العقار مع المستشار",
      approachBody: "يُرفع كل عقار إلى النظام مع المستشار المتخصص به. هذا النموذج يسرّع المبيعات ويعزز ثقة المشتري.",
    },
  });
}

export function advisorsPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      heroKicker: "Advisory Desk",
      heroTitle: "Satış Danışmanlarımız",
      heroBody: "Her portföy danışman eşleşmesiyle yüklenir. Böylece doğru uzmanla hızlı iletişim sağlanır.",
      advisorLabel: "Portföy Danışmanı",
      specialty: "Uzmanlık",
      activeListings: "Aktif portföy",
      call: "Ara",
      email: "E-posta",
    },
    EN: {
      heroKicker: "Advisory Desk",
      heroTitle: "Our Sales Advisors",
      heroBody: "Every listing is published with an advisor match, making it easy to reach the right specialist quickly.",
      advisorLabel: "Portfolio Advisor",
      specialty: "Focus",
      activeListings: "Active listings",
      call: "Call",
      email: "Email",
    },
    RU: {
      heroKicker: "Advisory Desk",
      heroTitle: "Наши консультанты по продажам",
      heroBody: "Каждый объект публикуется вместе с консультантом, чтобы вы быстро выходили на нужного специалиста.",
      advisorLabel: "Консультант по объекту",
      specialty: "Специализация",
      activeListings: "Активные объекты",
      call: "Позвонить",
      email: "Эл. почта",
    },
    AR: {
      heroKicker: "Advisory Desk",
      heroTitle: "مستشارو المبيعات لدينا",
      heroBody: "يتم نشر كل عقار مع المستشار المناسب، ما يتيح الوصول السريع إلى الخبير الصحيح.",
      advisorLabel: "مستشار العقار",
      specialty: "التخصص",
      activeListings: "عقارات نشطة",
      call: "اتصل",
      email: "البريد الإلكتروني",
    },
  });
}

export function sellPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      heroKicker: "Sell With Signature",
      heroTitle: "Premium satış operasyonu için ilk adımı şimdi atın",
      heroBody: "Ücretsiz ön değerleme, profesyonel sunum ve doğru alıcı ağıyla mülkünüzü satışa hazır hale getirelim.",
      planKicker: "Satış Planı",
      planTitle: "Mülkünüzü sadece listelemiyoruz",
      planBody: "Talebiniz geldikten sonra fiyat bandı, hedef alıcı profili ve premium tanıtım akışı birlikte planlanır.",
      planItems: [
        "Ücretsiz ön değerleme ve satış stratejisi görüşmesi",
        "Profesyonel vitrin dili, görsel yönlendirme ve ilan planı",
        "Hazır alıcı havuzu ve yatırımcı ağına hızlı dağıtım",
      ],
      accessKicker: "Hızlı Erişim",
      accessTitle: "Ekibimizle hemen konuşun",
      phone: "Telefon",
      whatsapp: "WhatsApp",
      email: "E-posta",
      call: "Hemen Ara",
      advisors: "Danışman Ekibi",
    },
    EN: {
      heroKicker: "Sell With Signature",
      heroTitle: "Take the first step toward a premium sales operation today",
      heroBody: "Let us prepare your property for sale with a free valuation, professional presentation, and the right buyer network.",
      planKicker: "Sales Plan",
      planTitle: "We do more than list your property",
      planBody: "After your request arrives, we plan the pricing band, buyer profile, and premium launch flow together.",
      planItems: [
        "Free pre-valuation and sales strategy consultation",
        "Professional showcase language, visual direction, and listing plan",
        "Fast distribution to our ready buyer pool and investor network",
      ],
      accessKicker: "Quick Access",
      accessTitle: "Talk to our team now",
      phone: "Phone",
      whatsapp: "WhatsApp",
      email: "Email",
      call: "Call Now",
      advisors: "Advisor Team",
    },
    RU: {
      heroKicker: "Sell With Signature",
      heroTitle: "Сделайте первый шаг к премиальной продаже уже сейчас",
      heroBody: "Подготовим ваш объект к продаже через бесплатную оценку, профессиональную подачу и нужную сеть покупателей.",
      planKicker: "План продажи",
      planTitle: "Мы не просто публикуем объект",
      planBody: "После получения заявки мы вместе планируем ценовой диапазон, профиль покупателя и премиальный запуск.",
      planItems: [
        "Бесплатная предварительная оценка и консультация по стратегии продажи",
        "Профессиональная подача, визуальное направление и план публикации",
        "Быстрое распределение по базе покупателей и сети инвесторов",
      ],
      accessKicker: "Быстрый доступ",
      accessTitle: "Свяжитесь с нашей командой",
      phone: "Телефон",
      whatsapp: "WhatsApp",
      email: "Эл. почта",
      call: "Позвонить",
      advisors: "Команда консультантов",
    },
    AR: {
      heroKicker: "Sell With Signature",
      heroTitle: "ابدأ الآن أول خطوة نحو عملية بيع مميزة",
      heroBody: "دعنا نجهز عقارك للبيع من خلال تقييم مجاني وعرض احترافي وشبكة المشترين المناسبة.",
      planKicker: "خطة البيع",
      planTitle: "نحن لا نكتفي بإدراج العقار",
      planBody: "بعد استلام طلبك نخطط معًا لنطاق السعر، وملف المشتري المستهدف، ومسار التقديم المميز.",
      planItems: [
        "تقييم أولي مجاني واستشارة استراتيجية للبيع",
        "لغة عرض احترافية وتوجيه بصري وخطة إدراج",
        "توزيع سريع على شبكة المشترين والمستثمرين",
      ],
      accessKicker: "وصول سريع",
      accessTitle: "تحدث مع فريقنا الآن",
      phone: "الهاتف",
      whatsapp: "واتساب",
      email: "البريد الإلكتروني",
      call: "اتصل الآن",
      advisors: "فريق المستشارين",
    },
  });
}

export function mapPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      heroKicker: "Map Discovery",
      heroTitle: "Harita Üzerinden Keşfet",
      heroBody: "Konum bazlı arama yapın, ilanları pin üzerinden inceleyin ve detay sayfasına geçin.",
      resultsTitle: "Öne Çıkan Harita Sonuçları",
      switchToList: "Listeye geç",
      detail: "İlan Detayı",
    },
    EN: {
      heroKicker: "Map Discovery",
      heroTitle: "Explore on the Map",
      heroBody: "Search by location, review listings through map pins, and move to the detail page.",
      resultsTitle: "Highlighted Map Results",
      switchToList: "Go to list",
      detail: "Listing Detail",
    },
    RU: {
      heroKicker: "Map Discovery",
      heroTitle: "Изучайте через карту",
      heroBody: "Ищите по локации, просматривайте объекты через пины и переходите на страницу деталей.",
      resultsTitle: "Выбранные результаты на карте",
      switchToList: "Перейти к списку",
      detail: "Детали объекта",
    },
    AR: {
      heroKicker: "Map Discovery",
      heroTitle: "استكشف عبر الخريطة",
      heroBody: "ابحث حسب الموقع، وراجع العقارات عبر العلامات، ثم انتقل إلى صفحة التفاصيل.",
      resultsTitle: "نتائج الخريطة المميزة",
      switchToList: "الانتقال إلى القائمة",
      detail: "تفاصيل العقار",
    },
  });
}

export function mapComponentCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      kicker: "Harita Üzerinden Keşfet",
      title: "Portföy Lokasyon Haritası",
      body: "Haritada ilanları görün, konum araması yapın ve ilgili portföye doğrudan gidin.",
      results: "sonuç",
      mapStyle: "Harita Görünümü",
      styles: { minimal: "Minimal", koyu: "Koyu", uydu: "Uydu" },
      listingSearch: "Portföy ara (başlık, ilçe, kod)",
      clear: "Temizle",
      locationSearch: "Haritada konum ara (örn. Nişantaşı, İstanbul)",
      searchLocation: "Konum Ara",
      enterLocation: "Lütfen bir konum girin.",
      searchError: "Konum aranırken hata oluştu.",
      locationNotFound: "Konum bulunamadı. Daha net arayın.",
      serviceUnavailable: "Konum servisine ulaşılamadı.",
      mapResults: "Harita Sonuçları",
      openListing: "Portföyü Aç",
      noMapResults: "Haritada gösterilecek sonuç yok.",
      advisor: "Danışman",
      detail: "İlan Detayı",
    },
    EN: {
      kicker: "Explore on the Map",
      title: "Listing Location Map",
      body: "See the listings on the map, search by location, and jump directly to the selected property.",
      results: "results",
      mapStyle: "Map Style",
      styles: { minimal: "Minimal", koyu: "Dark", uydu: "Satellite" },
      listingSearch: "Search listings (title, district, code)",
      clear: "Clear",
      locationSearch: "Search a location on the map (e.g. Nisantasi, Istanbul)",
      searchLocation: "Search Location",
      enterLocation: "Please enter a location.",
      searchError: "There was a problem searching the location.",
      locationNotFound: "Location not found. Try a more specific query.",
      serviceUnavailable: "Location service could not be reached.",
      mapResults: "Map Results",
      openListing: "Open Listing",
      noMapResults: "No results to display on the map.",
      advisor: "Advisor",
      detail: "Listing Detail",
    },
    RU: {
      kicker: "Изучайте через карту",
      title: "Карта расположения объектов",
      body: "Смотрите объекты на карте, ищите по локации и переходите к выбранному объекту напрямую.",
      results: "результатов",
      mapStyle: "Стиль карты",
      styles: { minimal: "Минимальный", koyu: "Темный", uydu: "Спутник" },
      listingSearch: "Поиск объектов (название, район, код)",
      clear: "Очистить",
      locationSearch: "Найти локацию на карте (например, Nisantasi, Istanbul)",
      searchLocation: "Найти локацию",
      enterLocation: "Пожалуйста, укажите локацию.",
      searchError: "Ошибка при поиске локации.",
      locationNotFound: "Локация не найдена. Попробуйте точнее.",
      serviceUnavailable: "Сервис геолокации недоступен.",
      mapResults: "Результаты на карте",
      openListing: "Открыть объект",
      noMapResults: "Нет результатов для отображения на карте.",
      advisor: "Консультант",
      detail: "Детали объекта",
    },
    AR: {
      kicker: "استكشف عبر الخريطة",
      title: "خريطة مواقع العقارات",
      body: "اعرض العقارات على الخريطة، وابحث حسب الموقع، وانتقل مباشرة إلى العقار المطلوب.",
      results: "نتائج",
      mapStyle: "نمط الخريطة",
      styles: { minimal: "مبسّط", koyu: "داكن", uydu: "أقمار صناعية" },
      listingSearch: "ابحث في العقارات (العنوان، المنطقة، الرمز)",
      clear: "مسح",
      locationSearch: "ابحث عن موقع على الخريطة (مثال: Nisantasi, Istanbul)",
      searchLocation: "بحث عن موقع",
      enterLocation: "يرجى إدخال موقع.",
      searchError: "حدث خطأ أثناء البحث عن الموقع.",
      locationNotFound: "لم يتم العثور على الموقع. حاول بشكل أكثر تحديدًا.",
      serviceUnavailable: "تعذر الوصول إلى خدمة الموقع.",
      mapResults: "نتائج الخريطة",
      openListing: "فتح العقار",
      noMapResults: "لا توجد نتائج لعرضها على الخريطة.",
      advisor: "المستشار",
      detail: "تفاصيل العقار",
    },
  });
}

export function blogListPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      heroKicker: "Insights & SEO Content",
      heroTitle: "PortföySatış Blog",
      heroBody: "Emlak satış operasyonu, yatırım kararları ve lokasyon trendleri üzerine yayınlanan uzman içerikler.",
      read: "Yazıyı Oku",
    },
    EN: {
      heroKicker: "Insights & SEO Content",
      heroTitle: "PortfoySatis Blog",
      heroBody: "Expert content on real estate sales operations, investment decisions, and location trends.",
      read: "Read Article",
    },
    RU: {
      heroKicker: "Insights & SEO Content",
      heroTitle: "Блог PortfoySatis",
      heroBody: "Экспертные материалы о продажах недвижимости, инвестиционных решениях и трендах локаций.",
      read: "Читать статью",
    },
    AR: {
      heroKicker: "Insights & SEO Content",
      heroTitle: "مدونة PortfoySatis",
      heroBody: "محتوى متخصص حول عمليات بيع العقارات وقرارات الاستثمار واتجاهات المواقع.",
      read: "اقرأ المقال",
    },
  });
}

export function blogDetailPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      back: "← Blog listesine dön",
      contents: "İçindekiler",
      tags: "Etiketler",
      related: "İlgili Yazılar",
      read: "Oku",
    },
    EN: {
      back: "← Back to blog",
      contents: "Contents",
      tags: "Tags",
      related: "Related Articles",
      read: "Read",
    },
    RU: {
      back: "← Назад к блогу",
      contents: "Содержание",
      tags: "Теги",
      related: "Похожие статьи",
      read: "Читать",
    },
    AR: {
      back: "← العودة إلى المدونة",
      contents: "المحتويات",
      tags: "الوسوم",
      related: "مقالات ذات صلة",
      read: "اقرأ",
    },
  });
}

export function propertyDetailPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      back: "← İlan listesine dön",
      labels: {
        price: "Fiyat",
        type: "Tip",
        rooms: "Oda",
        area: "Brüt m²",
        floor: "Kat",
        heating: "Isıtma",
        launch: "Lansman",
        paymentPlan: "Ödeme Planı",
        delivery: "Teslim",
      },
      highlights: "Öne Çıkanlar",
      features: "Özellikler",
      advisorTitle: "Portföy Danışmanı",
      specialty: "Uzmanlık",
      call: "Ara",
    },
    EN: {
      back: "← Back to listings",
      labels: {
        price: "Price",
        type: "Type",
        rooms: "Rooms",
        area: "Gross m²",
        floor: "Floor",
        heating: "Heating",
        launch: "Launch",
        paymentPlan: "Payment Plan",
        delivery: "Delivery",
      },
      highlights: "Highlights",
      features: "Features",
      advisorTitle: "Listing Advisor",
      specialty: "Focus",
      call: "Call",
    },
    RU: {
      back: "← Назад к объектам",
      labels: {
        price: "Цена",
        type: "Тип",
        rooms: "Комнаты",
        area: "Площадь м²",
        floor: "Этаж",
        heating: "Отопление",
        launch: "Формат",
        paymentPlan: "План оплаты",
        delivery: "Сдача",
      },
      highlights: "Ключевые преимущества",
      features: "Особенности",
      advisorTitle: "Консультант объекта",
      specialty: "Специализация",
      call: "Позвонить",
    },
    AR: {
      back: "← العودة إلى العقارات",
      labels: {
        price: "السعر",
        type: "النوع",
        rooms: "الغرف",
        area: "المساحة م²",
        floor: "الطابق",
        heating: "التدفئة",
        launch: "الحالة",
        paymentPlan: "خطة الدفع",
        delivery: "التسليم",
      },
      highlights: "أبرز المزايا",
      features: "المواصفات",
      advisorTitle: "مستشار العقار",
      specialty: "التخصص",
      call: "اتصل",
    },
  });
}

export function notFoundPageCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      title: "Aradığınız ilan bulunamadı",
      body: "İlan kaldırılmış olabilir ya da bağlantı hatalı olabilir. Aktif portföylere dönüp tekrar filtreleme yapabilirsiniz.",
      cta: "Portföylere dön",
    },
    EN: {
      title: "The listing you are looking for could not be found",
      body: "The listing may have been removed or the link may be incorrect. You can return to the active portfolio and filter again.",
      cta: "Back to listings",
    },
    RU: {
      title: "Искомый объект не найден",
      body: "Объект мог быть снят с публикации или ссылка может быть неверной. Вернитесь к активным предложениям и попробуйте снова.",
      cta: "Вернуться к объектам",
    },
    AR: {
      title: "لم يتم العثور على العقار المطلوب",
      body: "قد يكون العقار قد أزيل أو أن الرابط غير صحيح. يمكنك العودة إلى العقارات النشطة والمحاولة مجددًا.",
      cta: "العودة إلى العقارات",
    },
  });
}

export function loginFormCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      title: "Yönetim Paneli Girişi",
      body: "Yetkili hesabınızın e-posta adresi ve şifresi ile giriş yapın.",
      email: "E-posta adresi",
      password: "Şifre",
      submitting: "Giriş yapılıyor...",
      submit: "Panel Girişi",
      fallbackError: "Giriş başarısız.",
    },
    EN: {
      title: "Management Panel Login",
      body: "Sign in with the email address and password of your authorized account.",
      email: "Email address",
      password: "Password",
      submitting: "Signing in...",
      submit: "Panel Login",
      fallbackError: "Login failed.",
    },
    RU: {
      title: "Вход в панель управления",
      body: "Войдите с адресом электронной почты и паролем вашей учетной записи.",
      email: "Эл. почта",
      password: "Пароль",
      submitting: "Выполняется вход...",
      submit: "Войти",
      fallbackError: "Ошибка входа.",
    },
    AR: {
      title: "تسجيل الدخول إلى لوحة الإدارة",
      body: "سجّل الدخول باستخدام البريد الإلكتروني وكلمة المرور لحسابك المصرح به.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      submitting: "جارٍ تسجيل الدخول...",
      submit: "دخول اللوحة",
      fallbackError: "فشل تسجيل الدخول.",
    },
  });
}

export function propertyCardCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      previousImage: "Önceki görsel",
      nextImage: "Sonraki görsel",
      openDetail: "detay sayfasını aç",
      saleBadge: "Satılık Portföy",
      rooms: "Oda",
      area: "Alan",
      floor: "Kat",
      advisor: "Danışman",
      portfolioType: "Isıtma",
      startingPrice: "Başlangıç Fiyatı",
      quickContact: "Hızlı İletişim",
      callNow: "Hemen Ara",
      detailedInfo: "Detaylı Bilgi",
      whatsappMessage: "ilanı hakkında hızlı bilgi almak istiyorum.",
    },
    EN: {
      previousImage: "Previous image",
      nextImage: "Next image",
      openDetail: "open detail page",
      saleBadge: "Listing For Sale",
      rooms: "Rooms",
      area: "Area",
      floor: "Floor",
      advisor: "Advisor",
      portfolioType: "Heating",
      startingPrice: "Starting Price",
      quickContact: "Quick Contact",
      callNow: "Call Now",
      detailedInfo: "Detailed Info",
      whatsappMessage: "listing.",
    },
    RU: {
      previousImage: "Предыдущее фото",
      nextImage: "Следующее фото",
      openDetail: "открыть страницу объекта",
      saleBadge: "Объект на продажу",
      rooms: "Комнаты",
      area: "Площадь",
      floor: "Этаж",
      advisor: "Консультант",
      portfolioType: "Отопление",
      startingPrice: "Стартовая цена",
      quickContact: "Быстрый контакт",
      callNow: "Позвонить",
      detailedInfo: "Подробнее",
      whatsappMessage: "об этом объекте.",
    },
    AR: {
      previousImage: "الصورة السابقة",
      nextImage: "الصورة التالية",
      openDetail: "فتح صفحة التفاصيل",
      saleBadge: "عقار للبيع",
      rooms: "الغرف",
      area: "المساحة",
      floor: "الطابق",
      advisor: "المستشار",
      portfolioType: "التدفئة",
      startingPrice: "سعر البداية",
      quickContact: "تواصل سريع",
      callNow: "اتصل الآن",
      detailedInfo: "معلومات تفصيلية",
      whatsappMessage: "المعروض.",
    },
  });
}

export function generalContactFormCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      kicker: "İletişim",
      title: "Size Uygun Portföyü Birlikte Bulalım",
      body: "Talebinizi bırakın, danışman ekibimiz kısa sürede sizinle iletişime geçsin.",
      name: "Ad Soyad",
      email: "E-posta",
      phone: "Telefon",
      message: "Talebinizi kısaca yazın",
      submitting: "Gönderiliyor...",
      submit: "Talep Gönder",
      fallbackError: "Form gönderilemedi. Lütfen tekrar deneyin.",
    },
    EN: {
      kicker: "Contact",
      title: "Let’s Find the Right Listing Together",
      body: "Leave your request and our advisory team will contact you shortly.",
      name: "Full name",
      email: "Email",
      phone: "Phone",
      message: "Briefly describe your request",
      submitting: "Sending...",
      submit: "Send Inquiry",
      fallbackError: "The form could not be sent. Please try again.",
    },
    RU: {
      kicker: "Контакт",
      title: "Давайте подберем подходящий объект вместе",
      body: "Оставьте заявку, и наша команда консультантов свяжется с вами в ближайшее время.",
      name: "Имя и фамилия",
      email: "Эл. почта",
      phone: "Телефон",
      message: "Кратко опишите ваш запрос",
      submitting: "Отправка...",
      submit: "Отправить запрос",
      fallbackError: "Не удалось отправить форму. Попробуйте еще раз.",
    },
    AR: {
      kicker: "تواصل",
      title: "دعنا نجد العقار المناسب معًا",
      body: "اترك طلبك وسيتواصل معك فريقنا الاستشاري قريبًا.",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      message: "اكتب طلبك باختصار",
      submitting: "جارٍ الإرسال...",
      submit: "إرسال الطلب",
      fallbackError: "تعذر إرسال النموذج. يرجى المحاولة مرة أخرى.",
    },
  });
}

export function contactFormCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      kicker: "Özel Talep",
      title: "Bu İlan İçin Bilgi Al",
      descriptionPrefix: "için formu doldurun, talebiniz ekibe e-posta ile iletilsin.",
      descriptionSuffix: "",
      name: "Ad Soyad",
      email: "E-posta",
      phone: "Telefon",
      message: "Talebinizi kısaca yazın",
      submitting: "Gönderiliyor...",
      submit: "Talep Gönder",
      fallbackError: "Talep iletilirken hata oluştu. Lütfen tekrar deneyin.",
    },
    EN: {
      kicker: "Private Inquiry",
      title: "Get Information About This Listing",
      descriptionPrefix: "Fill out the form for",
      descriptionSuffix: "and we will email your inquiry to the team.",
      name: "Full name",
      email: "Email",
      phone: "Phone",
      message: "Briefly describe your request",
      submitting: "Sending...",
      submit: "Send Inquiry",
      fallbackError: "There was a problem sending your inquiry. Please try again.",
    },
    RU: {
      kicker: "Индивидуальный запрос",
      title: "Получить информацию по этому объекту",
      descriptionPrefix: "Заполните форму по объекту",
      descriptionSuffix: "и мы передадим ваш запрос команде по электронной почте.",
      name: "Имя и фамилия",
      email: "Эл. почта",
      phone: "Телефон",
      message: "Кратко опишите ваш запрос",
      submitting: "Отправка...",
      submit: "Отправить запрос",
      fallbackError: "Произошла ошибка при отправке запроса. Попробуйте еще раз.",
    },
    AR: {
      kicker: "طلب خاص",
      title: "احصل على معلومات عن هذا العقار",
      descriptionPrefix: "املأ النموذج بخصوص",
      descriptionSuffix: "وسنرسل طلبك إلى الفريق عبر البريد الإلكتروني.",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      message: "اكتب طلبك باختصار",
      submitting: "جارٍ الإرسال...",
      submit: "إرسال الطلب",
      fallbackError: "حدثت مشكلة أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
    },
  });
}

export function appointmentFormCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      kicker: "Randevu Planla",
      title: "Ziyaret Talebi Oluştur",
      bodyPrefix: "",
      bodySuffix: "için tarih/saat seçip danışmanla hızlı randevu oluşturabilirsiniz.",
      name: "Ad Soyad",
      email: "E-posta",
      phone: "Telefon",
      message: "Randevu notunuz",
      visitTypes: ["Yerinde ziyaret", "Video görüşme", "Ofiste toplantı"],
      submitting: "Gönderiliyor...",
      submit: "Randevu Talebi Gönder",
      fallbackError: "Randevu gönderilirken bir sorun oluştu.",
    },
    EN: {
      kicker: "Schedule Appointment",
      title: "Create a Visit Request",
      bodyPrefix: "Choose a date and time for",
      bodySuffix: "and create a quick appointment with the advisor.",
      name: "Full name",
      email: "Email",
      phone: "Phone",
      message: "Appointment note",
      visitTypes: ["On-site visit", "Video call", "Office meeting"],
      submitting: "Sending...",
      submit: "Send Appointment Request",
      fallbackError: "There was a problem sending the appointment request.",
    },
    RU: {
      kicker: "Запланировать встречу",
      title: "Создать заявку на визит",
      bodyPrefix: "Выберите дату и время для объекта",
      bodySuffix: "и быстро назначьте встречу с консультантом.",
      name: "Имя и фамилия",
      email: "Эл. почта",
      phone: "Телефон",
      message: "Комментарий к встрече",
      visitTypes: ["Очный визит", "Видеозвонок", "Встреча в офисе"],
      submitting: "Отправка...",
      submit: "Отправить заявку",
      fallbackError: "Произошла проблема при отправке заявки на встречу.",
    },
    AR: {
      kicker: "جدولة موعد",
      title: "إنشاء طلب زيارة",
      bodyPrefix: "اختر التاريخ والوقت للعقار",
      bodySuffix: "وأنشئ موعدًا سريعًا مع المستشار.",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      message: "ملاحظتك على الموعد",
      visitTypes: ["زيارة ميدانية", "مكالمة فيديو", "اجتماع في المكتب"],
      submitting: "جارٍ الإرسال...",
      submit: "إرسال طلب الموعد",
      fallbackError: "حدثت مشكلة أثناء إرسال طلب الموعد.",
    },
  });
}

export function propertyDetailGalleryCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      cover: "Kapak Görseli",
      image: "Görsel",
      previous: "Önceki görsel",
      next: "Sonraki görsel",
      thumbAlt: "küçük galeri",
    },
    EN: {
      cover: "Cover Image",
      image: "Image",
      previous: "Previous image",
      next: "Next image",
      thumbAlt: "thumbnail gallery",
    },
    RU: {
      cover: "Обложка",
      image: "Изображение",
      previous: "Предыдущее фото",
      next: "Следующее фото",
      thumbAlt: "мини-галерея",
    },
    AR: {
      cover: "صورة الغلاف",
      image: "صورة",
      previous: "الصورة السابقة",
      next: "الصورة التالية",
      thumbAlt: "معرض مصغر",
    },
  });
}

export function sellPropertyFormCopy(language: SiteLanguage) {
  return pick(language, {
    TR: {
      kicker: "Emlak Sat",
      title: "Türkiye'de mülkünüzü mü satmak istiyorsunuz?",
      valuationBody: "Ücretsiz ön değerleme için mülk detaylarınızı paylaşın; ekibimiz size fiyat bandı ve satış stratejisiyle dönüş yapsın.",
      saleBody: "Mülkünüzün tüm temel detaylarını iletin; satış ekibimiz sizi arayıp profesyonel pazarlama ve fiyatlandırma planını oluştursun.",
      name: "Ad Soyad",
      phone: "Telefon",
      email: "E-posta",
      message: "Emlak Detayları ve Mesajınız",
      defaultValuationMessage: "Mülküm için ücretsiz değerleme istiyorum. Detaylı dönüş rica ederim.",
      cityLabel: "Şehir Seçimi",
      cityPlaceholder: "Lütfen bir şehir seçin",
      districtLabel: "İlçe Seçimi",
      districtPlaceholder: "Lütfen bir ilçe seçin",
      neighborhoodLabel: "Mahalle",
      neighborhoodPlaceholder: "Lütfen mahallenizi yazınız.",
      propertyTypeLabel: "Satmak istediğiniz mülk tipi nedir?",
      propertyTypePlaceholder: "Lütfen bir tip seçin",
      subTypeLabel: "Alt tip",
      areaLabel: "Mülk Genişliği (Brüt m²)",
      areaPlaceholder: "Örn. 185",
      roomsLabel: "Oda Sayısı",
      roomsPlaceholder: "Lütfen bir oda sayısı seçin",
      buildingAgeLabel: "Bina Yaşı",
      buildingAgePlaceholder: "Lütfen seçin",
      floorLabel: "Kat",
      floorPlaceholder: "Lütfen bir kat seçin",
      compoundLabel: "Site İçinde",
      compoundPlaceholder: "Lütfen seçiniz",
      dateTimeLabel: "Görüşme için uygun saatiniz nedir?",
      idleMessage: "Talebiniz satış ekibine iletilir ve sistemde kayıt altına alınır.",
      submitting: "Gönderiliyor...",
      submit: "Gönder",
      fallbackError: "Talep gönderilemedi. Lütfen tekrar deneyin.",
    },
    EN: {
      kicker: "Sell Property",
      title: "Do you want to sell your property in Turkey?",
      valuationBody: "Share your property details for a free pre-valuation and our team will reply with a price band and sales strategy.",
      saleBody: "Send the key details of your property and our sales team will call you to shape a professional pricing and marketing plan.",
      name: "Full name",
      phone: "Phone",
      email: "Email",
      message: "Property Details and Your Message",
      defaultValuationMessage: "I would like a free valuation for my property. Please contact me with details.",
      cityLabel: "City",
      cityPlaceholder: "Please choose a city",
      districtLabel: "District",
      districtPlaceholder: "Please choose a district",
      neighborhoodLabel: "Neighborhood",
      neighborhoodPlaceholder: "Please enter your neighborhood.",
      propertyTypeLabel: "What type of property do you want to sell?",
      propertyTypePlaceholder: "Please choose a type",
      subTypeLabel: "Subtype",
      areaLabel: "Property Size (Gross m²)",
      areaPlaceholder: "Example: 185",
      roomsLabel: "Number of Rooms",
      roomsPlaceholder: "Please choose a room count",
      buildingAgeLabel: "Building Age",
      buildingAgePlaceholder: "Please choose",
      floorLabel: "Floor",
      floorPlaceholder: "Please choose a floor",
      compoundLabel: "Inside a Compound",
      compoundPlaceholder: "Please choose",
      dateTimeLabel: "What time works best for a call?",
      idleMessage: "Your request is forwarded to the sales team and stored in the system.",
      submitting: "Sending...",
      submit: "Send",
      fallbackError: "The request could not be sent. Please try again.",
    },
    RU: {
      kicker: "Продать недвижимость",
      title: "Хотите продать свою недвижимость в Турции?",
      valuationBody: "Поделитесь деталями объекта для бесплатной предварительной оценки, и наша команда ответит с ценовым диапазоном и стратегией продажи.",
      saleBody: "Передайте ключевые параметры объекта, и наша команда свяжется с вами для формирования стратегии маркетинга и цены.",
      name: "Имя и фамилия",
      phone: "Телефон",
      email: "Эл. почта",
      message: "Детали объекта и сообщение",
      defaultValuationMessage: "Хочу получить бесплатную оценку моего объекта. Прошу связаться со мной с подробностями.",
      cityLabel: "Город",
      cityPlaceholder: "Выберите город",
      districtLabel: "Район",
      districtPlaceholder: "Выберите район",
      neighborhoodLabel: "Микрорайон",
      neighborhoodPlaceholder: "Укажите микрорайон.",
      propertyTypeLabel: "Какой тип недвижимости вы хотите продать?",
      propertyTypePlaceholder: "Выберите тип",
      subTypeLabel: "Подтип",
      areaLabel: "Площадь объекта (брутто, м²)",
      areaPlaceholder: "Например: 185",
      roomsLabel: "Количество комнат",
      roomsPlaceholder: "Выберите количество комнат",
      buildingAgeLabel: "Возраст здания",
      buildingAgePlaceholder: "Выберите",
      floorLabel: "Этаж",
      floorPlaceholder: "Выберите этаж",
      compoundLabel: "В жилом комплексе",
      compoundPlaceholder: "Выберите",
      dateTimeLabel: "Когда вам удобно созвониться?",
      idleMessage: "Ваш запрос будет передан команде продаж и сохранен в системе.",
      submitting: "Отправка...",
      submit: "Отправить",
      fallbackError: "Не удалось отправить запрос. Попробуйте еще раз.",
    },
    AR: {
      kicker: "بيع عقار",
      title: "هل تريد بيع عقارك في تركيا؟",
      valuationBody: "شارك تفاصيل عقارك للحصول على تقييم أولي مجاني، وسيرد فريقنا بنطاق سعري واستراتيجية بيع.",
      saleBody: "أرسل التفاصيل الأساسية لعقارك، وسيتواصل معك فريق المبيعات لوضع خطة تسعير وتسويق احترافية.",
      name: "الاسم الكامل",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      message: "تفاصيل العقار ورسالتك",
      defaultValuationMessage: "أرغب في تقييم مجاني لعقاري. يرجى التواصل معي بالتفاصيل.",
      cityLabel: "المدينة",
      cityPlaceholder: "يرجى اختيار مدينة",
      districtLabel: "المنطقة",
      districtPlaceholder: "يرجى اختيار منطقة",
      neighborhoodLabel: "الحي",
      neighborhoodPlaceholder: "يرجى كتابة الحي.",
      propertyTypeLabel: "ما نوع العقار الذي تريد بيعه؟",
      propertyTypePlaceholder: "يرجى اختيار النوع",
      subTypeLabel: "النوع الفرعي",
      areaLabel: "مساحة العقار (إجمالي م²)",
      areaPlaceholder: "مثال: 185",
      roomsLabel: "عدد الغرف",
      roomsPlaceholder: "يرجى اختيار عدد الغرف",
      buildingAgeLabel: "عمر البناء",
      buildingAgePlaceholder: "يرجى الاختيار",
      floorLabel: "الطابق",
      floorPlaceholder: "يرجى اختيار الطابق",
      compoundLabel: "داخل مجمع",
      compoundPlaceholder: "يرجى الاختيار",
      dateTimeLabel: "ما الوقت المناسب للتواصل؟",
      idleMessage: "سيتم تحويل طلبك إلى فريق المبيعات وتسجيله في النظام.",
      submitting: "جارٍ الإرسال...",
      submit: "إرسال",
      fallbackError: "تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.",
    },
  });
}

export function translatePropertyType(value: string, language: SiteLanguage): string {
  const labels: Record<string, LocalizedValue<string>> = {
    Daire: { TR: "Daire", EN: "Apartment", RU: "Квартира", AR: "شقة" },
    Villa: { TR: "Villa", EN: "Villa", RU: "Вилла", AR: "فيلا" },
    Rezidans: { TR: "Rezidans", EN: "Residence", RU: "Резиденция", AR: "سكن فاخر" },
    Arsa: { TR: "Arsa", EN: "Land", RU: "Земля", AR: "أرض" },
    Ofis: { TR: "Ofis", EN: "Office", RU: "Офис", AR: "مكتب" },
    "Ticari Gayrimenkul": { TR: "Ticari Gayrimenkul", EN: "Commercial Property", RU: "Коммерческая недвижимость", AR: "عقار تجاري" },
  };

  return labels[value]?.[language] ?? value;
}

export function translateRoomLabel(value: string, language: SiteLanguage): string {
  if (value === "Açık Plan") {
    return pick(language, {
      TR: "Açık Plan",
      EN: "Open Plan",
      RU: "Открытая планировка",
      AR: "مخطط مفتوح",
    });
  }

  if (value === "Stüdyo") {
    return pick(language, {
      TR: "Stüdyo",
      EN: "Studio",
      RU: "Студия",
      AR: "استوديو",
    });
  }

  return value;
}

export function translateFloorLabel(value: string, language: SiteLanguage): string {
  if (value === "Giriş") {
    return pick(language, {
      TR: "Giriş",
      EN: "Ground",
      RU: "Первый уровень",
      AR: "الطابق الأرضي",
    });
  }

  if (value === "Müstakil") {
    return pick(language, {
      TR: "Müstakil",
      EN: "Detached",
      RU: "Отдельностоящий",
      AR: "مستقل",
    });
  }

  if (value === "7+") {
    return pick(language, {
      TR: "7+",
      EN: "7+",
      RU: "7+",
      AR: "7+",
    });
  }

  return value;
}

export function translateHeatingLabel(value: string, language: SiteLanguage): string {
  const map: Record<string, LocalizedValue<string>> = {
    Kombi: { TR: "Kombi", EN: "Combi Boiler", RU: "Комбинированный котел", AR: "غلاية منفصلة" },
    Merkezi: { TR: "Merkezi", EN: "Central", RU: "Центральное", AR: "مركزي" },
    "Yerden Isıtma": { TR: "Yerden Isıtma", EN: "Underfloor Heating", RU: "Теплый пол", AR: "تدفئة أرضية" },
  };

  return map[value]?.[language] ?? value;
}

export function translateSellerSubType(value: string, language: SiteLanguage): string {
  const map: Record<string, LocalizedValue<string>> = {
    "Lüks": { TR: "Lüks", EN: "Luxury", RU: "Премиум", AR: "فاخر" },
    "Yeni Proje": { TR: "Yeni Proje", EN: "New Project", RU: "Новый проект", AR: "مشروع جديد" },
    "Müstakil": { TR: "Müstakil", EN: "Detached", RU: "Отдельный", AR: "مستقل" },
    "Dublex": { TR: "Dublex", EN: "Duplex", RU: "Дуплекс", AR: "دوبلكس" },
    "Bahçeli": { TR: "Bahçeli", EN: "With Garden", RU: "С садом", AR: "مع حديقة" },
    "Yatırımlık": { TR: "Yatırımlık", EN: "Investment", RU: "Инвестиционный", AR: "استثماري" },
  };

  return map[value]?.[language] ?? value;
}

export function translateCompoundOption(value: string, language: SiteLanguage): string {
  const map: Record<string, LocalizedValue<string>> = {
    "Evet": { TR: "Evet", EN: "Yes", RU: "Да", AR: "نعم" },
    "Hayır": { TR: "Hayır", EN: "No", RU: "Нет", AR: "لا" },
    "Kısmen": { TR: "Kısmen", EN: "Partly", RU: "Частично", AR: "جزئيًا" },
  };

  return map[value]?.[language] ?? value;
}

export function translateProjectLaunchType(value: string, language: SiteLanguage): string {
  const map: Record<string, LocalizedValue<string>> = {
    "Proje": { TR: "Proje", EN: "Project", RU: "Проект", AR: "مشروع" },
    "Hazır Tapu": { TR: "Hazır Tapu", EN: "Ready Title", RU: "Готовый тапу", AR: "سند جاهز" },
  };

  return map[value]?.[language] ?? value;
}

export function translatePaymentPlan(value: string, language: SiteLanguage): string {
  if (value === "Peşin + Kredi") {
    return pick(language, {
      TR: "Peşin + Kredi",
      EN: "Cash + Mortgage",
      RU: "Наличные + кредит",
      AR: "نقدًا + تمويل",
    });
  }

  return value;
}

export function translateDeliveryDate(value: string, language: SiteLanguage): string {
  if (value === "Hemen Teslim") {
    return pick(language, {
      TR: "Hemen Teslim",
      EN: "Ready to Move",
      RU: "Немедленная передача",
      AR: "جاهز للتسليم",
    });
  }

  return value;
}

export function propertyWhatsAppInquiry(language: SiteLanguage, title: string): string {
  return pick(language, {
    TR: `${title} ilanı hakkında hızlı bilgi almak istiyorum.`,
    EN: `Hello, I would like quick information about the listing "${title}".`,
    RU: `Здравствуйте, хотел(а) бы быстро получить информацию об объекте "${title}".`,
    AR: `مرحبًا، أود الحصول على معلومات سريعة عن العقار "${title}".`,
  });
}

export function propertyDetailWhatsAppInquiry(language: SiteLanguage, title: string, listingRef: string): string {
  return pick(language, {
    TR: `${title} (${listingRef}) için bilgi almak istiyorum.`,
    EN: `Hello, I would like information about "${title}" (${listingRef}).`,
    RU: `Здравствуйте, хочу получить информацию об объекте "${title}" (${listingRef}).`,
    AR: `مرحبًا، أود الحصول على معلومات عن العقار "${title}" (${listingRef}).`,
  });
}
