import React, { createContext, useContext, useState, useEffect } from 'react';
import selassieImg from '../assets/selassieChurch.png';
import choirImg from '../assets/aboutRecap.png';
import youthImg from '../assets/AboutRecap2.png';

// -------------------------------------------------------------
// INITIAL REPOSITORY DATA
// -------------------------------------------------------------
const INITIAL_ABOUT_DATA = {
  title: 'Holy Trinity Cathedral Sanctuary (ቅድስት ሥላሴ ካቴድራል)',
  titleAm: 'በድሬዳዋ የቅድስት ሥላሴ ካቴድራል መቅደስ',
  caption: 'The historical sanctuary and spiritual lighthouse of Dire Dawa, established in 1945 E.C.',
  captionAm: 'በ1945 ዓ.ም የተመሰረተው የድሬዳዋና የምስራቅ ሐረርጌ ሀገረ ስብከት መንፈሳዊ ፋናና ታሪካዊ መቅደስ',
  sanctuaryImage: selassieImg,
  establishedYear: '1945 E.C. (1953 G.C.)',
  diocese: 'Dire Dawa & Eastern Hararghe Diocese',
  dioceseAm: 'የድሬዳዋና ምስራቅ ሐረርጌ ሀገረ ስብከት',
  studentsCount: '200+',
  teachersCount: '15+',
  yearsOfService: '10+',
  ageDivisionsCount: '4',
  mottoEn: 'United in faith, growing in spiritual wisdom, devoted to selfless service.',
  mottoAm: 'በሃይማኖት ጸንተን፤ በዕውቀት አድገን፤ በአገልግሎት እንተጋለን!',
  historyTextEn:
    'Under the archiepiscopal blessing of the Dire Dawa & Eastern Hararghe Diocese, the Holy Trinity Cathedral was established as a spiritual pillar for the historic railway city. For decades, the cathedral bells have resonated across Kebele 02, summoning generations to morning prayers and the Divine Liturgy. In its sacred grounds, Welude Birhan Sunday School was founded to safeguard the youth from worldly alienation. Operating through four age-segregated divisions (Nursery, Junior, Youth, and Graduates), the Sunday school educates over 200 registered students in Orthodox Dogma, classical Ge\'ez grammar, and the sacred chants of Saint Yared.',
  historyTextAm:
    'በድሬዳዋና ምስራቅ ሐረርጌ ሀገረ ስብከት ቡራኬ የተመሰረተው የድሬዳዋ ቅድስት ሥላሴ ካቴድራል፣ ለምድር ባቡር ከተማይቱ መንፈሳዊ መከታና የሰላም ወደብ ሆኖ ቆይቷል። በካቴድራሉ ጥላ ስር የተቋቋመው የወሉደ ብርሃን ሰንበት ትምህርት ቤት፣ ቀጣዩን ትውልድ በኦርቶዶክሳዊት ተዋሕዶ እምነትና ሥነ-ምግባር እያንፀ ይገኛል። በአራት የዕድሜ ክፍሎች (ህፃናት፣ ታዳጊዎች፣ ወጣቶችና ተመራቂዎች) የተዋቀረው ሰንበት ት/ቤት፣ ከ200 በላይ ተማሪዎችን በሃይማኖት፣ በቅዱስ ያሬድ ዜማና በጥንታዊው የግዕዝ ቋንቋ በማሰልጠን ላይ ነው።',
  visionEn:
    'To nurture a generation that knows, preserves, and protects the dogma, canon, and sacred tradition of the Ethiopian Orthodox Tewahedo Church; spiritually strong, well-versed in both spiritual and modern education, grounded in faith and practice.',
  visionAm:
    'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያንን ዶግማ፣ ቀኖና እና ትውፊት አውቆ የሚያሳውቅ፤ ጠብቆ የሚያስጠብቅ፤ በመንፈሳዊ ሕይወቱ ጠንካራ የሆነ፤ በዘመናዊና በመንፈሳዊ ትምህርት የበሰለ በሃይማኖት እና በምግባር የታነጸ ትውልድ ማፍራት።',
  missionEn:
    'To prepare a generation that thoroughly understands the Orthodox faith, canon, and ecclesiastical traditions; empowered with academic competence, liturgical discipline, and unwavering integrity in sacrificial service to the Church and community.',
  missionAm:
    'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን እምነት፣ ዶግማ፣ ቀኖናና ትውፊት ጠንቅቆ የሚያውቅና በመንፈሳዊ ሕይወት የተጠናከረ፣ የአብነት ትምህርት በማስተማር ለማዕረገ ክህነት የሚበቃና በአገልግሎቱ በሀገርና በቤተ ክርስቲያን ውስጥ ታማኝነት የሚያሳይ ትውልድ ማዘጋጀት።',
  coreValues: [
    { en: 'Devotion: Wholehearted love and submission to God with heart, soul, and strength', am: 'ተገዢነት፡ በፍጹም ልብ፣ ነፍስና ኃይል ለእግዚአብሔር መገዛት' },
    { en: 'Holiness: Living a pure, sacramental, and upright Christian life', am: 'ቅድስና፡ በንጽሕና እና በምስጢራተ ቤተክርስቲያን መመላለስ' },
    { en: 'Mutual Love: Deep brotherly love, unity, and self-sacrificing respect', am: 'ፍቅር፡ እርስ በርሳችን ፍጹም መዋደድ እና መከባበር' },
    { en: 'Testimony: Practical Christianity and active charitable witness', am: 'አርአያነት፡ ለተግባራዊ ክርስትና እና ለበጎ አድራጎት ምስክር መሆን' },
    { en: 'Church Order: Strict obedience to Holy Synod canons and apostolic fathers', am: 'ሥርዓት፡ የቤተክርስቲያን ቀኖናና ደንብ መጠበቅ፣ ማክበርና ማስከበር' },
    { en: 'Modesty: Modest Christian attire, reverence, and pure speech', am: 'ትህትና፡ ክርስቲያናዊ አለባበስ መልበስ እና አንደበትን ከክፉ ቃል መግታት' },
  ],
  objectives: [
    { en: 'Biblical Literacy: Deep instruction in Holy Scriptures, Dogmatics, and Patristics', am: 'የመጽሐፍ ቅዱስና የነገረ መለኮት ጥናት ማጠናከር' },
    { en: 'Saint Yared Zema: Choral chant mastery, Kebero drumming, and Tsenatsil rhythm', am: 'የቅዱስ ያሬድ ዜማ፣ ወረብ እና ማኅሌት ማስተማር' },
    { en: 'Ge\'ez Study: Classical language grammar, manuscript literacy, and liturgical prayers', am: 'የጥንታዊው የግዕዝ ቋንቋ ሰዋስውና የብራና ንባብን ማስፋፋት' },
    { en: 'Youth Leadership: Cultivating servant leaders, moral mentors, and future deacons', am: 'ወጣቶችን በመንፈሳዊ መሪነት እና በሥነ-ምግባር ማብቃት' },
    { en: 'Charity & Mercy: Organized support for the poor, sick pilgrims, and orphans in Dire Dawa', am: 'የተቸገሩትን መርዳትና የታመሙትን መጠየቅ' },
    { en: 'Accountable Administration: Transparent, loving, and coordinated church management', am: 'ግልጽ፣ ዘመናዊና መንፈሳዊ የሆነ የሰንበት ት/ቤት አስተዳደር' },
  ],
};

const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: 'Annual Feast of the Holy Trinity (በዓለ ሥላሴ)',
    titleAm: 'የቅድስት ሥላሴ ዓመታዊ ክብረ በዓል',
    category: 'Spiritual Feast',
    date: '2026-10-07',
    time: '6:00 AM - 1:00 PM',
    location: 'Holy Trinity Cathedral Sanctuary, Dire Dawa',
    locationAm: 'ቅድስት ሥላሴ ካቴድራል መቅደስ፣ ድሬዳዋ',
    placement: 'Upcoming Events Grid',
    description: 'Annual patronal celebration featuring Divine Liturgy, solemn procession with the holy Tabot, and spiritual hymns sung by all Sunday school divisions.',
    descriptionAm: 'የካቴድራሉ ዓመታዊ የንግሥ በዓል ከቅዳሴ፣ ከታቦተ ሕጉ አጀብና ከሰንበት ት/ቤቱ አራት የዕድሜ ክፍሎች ያማረ የዝማሬ አገልግሎት ጋር በድምቀት ይከበራል።',
    status: 'published',
    author: 'Deacon Kidanewold',
  },
  {
    id: 'evt-2',
    title: 'Spiritual Mezmur & Hymn Workshop (የዝማሬ አውደ ጥናት)',
    titleAm: 'የቅዱስ ያሬድ ዜማ እና የዝማሬ አውደ ጥናት',
    category: 'Mezmur',
    date: '2026-10-15',
    time: '3:00 PM - 6:30 PM',
    location: 'Sunday School Main Auditorium',
    locationAm: 'የሰንበት ት/ቤት ዋና አዳራሽ',
    placement: 'Upcoming Events Grid',
    description: 'An intensive vocal training, Saint Yared notation mastery, and traditional sacred drum (Kebero) practice for all youth choir members.',
    descriptionAm: 'ለሁሉም የሰንበት ትምህርት ቤት ዘማሪያን የተዘጋጀ ጥልቅ የድምፅ ስልጠና፣ የቅዱስ ያሬድ ዜማ ምልክቶችና የከበሮ አመታት አውደ ጥናት።',
    status: 'published',
    author: 'Choir Leader Deacon Amanuel',
  },
  {
    id: 'evt-3',
    title: 'Urgent Notice: Saturday Morning Youth Choir Liturgy Rehearsal',
    titleAm: 'አስቸኳይ ማስታወቂያ፡ የቅዳሜ ጠዋት የወጣቶች ዝማሬ ልምምድ',
    category: 'General',
    date: '2026-10-04',
    time: '8:30 AM Prompt',
    location: 'Cathedral Choir Hall',
    locationAm: 'የካቴድራሉ የዝማሬ አዳራሽ',
    placement: 'Urgent Notice Banner',
    description: 'All senior choir vocalists and deacons must attend Saturday morning preparation ahead of the episcopal visit from the Diocesan Bishop.',
    descriptionAm: 'የሀገረ ስብከቱ ሊቀ ጳጳስ ጉብኝት ምክንያት ሁሉም የወጣቶች ዝማሬ አባላትና ዲያቆናት ቅዳሜ ጠዋት 2:30 ላይ በአዳራሹ እንዲገኙ በጥብቅ እናሳስባለን።',
    status: 'published',
    author: 'Deacon Kidanewold',
  },
  {
    id: 'evt-4',
    title: 'Autumn Orthodox Faith & Ge\'ez Literacy Registration',
    titleAm: 'የመጸው ወቅት የሃይማኖት እና የግዕዝ ቋንቋ ምዝገባ',
    category: 'Academic',
    date: '2026-10-24',
    time: '9:00 AM - 1:00 PM',
    location: 'Cathedral Educational Center, Room 3',
    locationAm: 'የካቴድራሉ የትምህርት ማዕከል፣ ክፍል 3',
    placement: 'Upcoming Events Grid',
    description: 'Semester enrollment for new and returning students in foundational Ge\'ez grammar, church canon, and Patristic biblical commentary.',
    descriptionAm: 'ለአዳዲስና ነባር ተማሪዎች የመሠረታዊ ግዕዝ ቋንቋ ሰዋስው፣ የቤተክርስቲያን ቀኖና እና የሊቃውንት ትርጓሜ ምዝገባ ተጀምሯል።',
    status: 'draft',
    author: 'Education Department',
  },
];

const INITIAL_GALLERY_ITEMS = [
  {
    id: 'med-1',
    title: 'Cathedral Liturgy & Procession',
    titleAm: 'የካቴድራሉ የንግሥ ቅዳሴና የጸሎት ሥነ-ሥርዓት',
    type: 'image',
    url: selassieImg,
    category: 'Liturgy',
    date: '2026-07-12',
    description: 'Holy Trinity Cathedral sanctuary on the annual patronal feast day in Dire Dawa.',
  },
  {
    id: 'med-2',
    title: 'Sunday School Senior Choir in Traditional Netela',
    titleAm: 'የወሉደ ብርሃን ሰንበት ት/ቤት ከፍተኛ ዘማሪዎች',
    type: 'image',
    url: choirImg,
    category: 'Choral & Zema',
    date: '2026-08-19',
    description: 'Youth vocalists chanting solemn hymns in honour of the Holy Trinity.',
  },
  {
    id: 'med-3',
    title: 'Timkat (Epiphany) Celebration in Dire Dawa',
    titleAm: 'የጥምቀት በዓል አከባበር በድሬዳዋ አደባባይ',
    type: 'video',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Video embed or fallback
    category: 'Feasts & Celebrations',
    date: '2026-01-19',
    description: 'Joyous ceremonial procession of the Tabot with sacred song and liturgical drumming.',
  },
  {
    id: 'med-4',
    title: 'Youth Fellowship & Scripture Reading',
    titleAm: 'የወጣቶች መንፈሳዊ ጉባኤ እና የውይይት መድረክ',
    type: 'image',
    url: youthImg,
    category: 'Youth Service',
    date: '2026-08-30',
    description: 'Sunday school youth studying church history and patristic commentaries together.',
  },
  {
    id: 'med-5',
    title: 'Saint Yared Kebero & Choral Hymn Rehearsal',
    titleAm: 'የከበሮ አመታት እና የመዝሙር ልምምድ',
    type: 'image',
    url: choirImg,
    category: 'Choral & Zema',
    date: '2026-09-05',
    description: 'Vocalists perfecting the three sacred melodic modes of Saint Yared: Geez, Ezil, and Araray.',
  },
  {
    id: 'med-6',
    title: 'Charity & Saint Stephen Bread Sharing',
    titleAm: 'የቅዱስ እስጢፋኖስ የበጎ አድራጎት ማዕድ ማጋራት',
    type: 'image',
    url: youthImg,
    category: 'Youth Service',
    date: '2026-09-15',
    description: 'Sunday school members distributing bread and essentials to vulnerable community elders.',
  },
];

const INITIAL_TESTIMONIALS = [
  {
    id: 'tst-1',
    name: 'Deacon Yared Tadesse',
    christianName: 'ወልደ ያሬድ (Wolde Yared)',
    role: 'Alumnus & Cathedral Deacon',
    roleAm: 'የሰንበት ት/ቤቱ ተመራቂና የካቴድራሉ ዲያቆን',
    quote: 'Welude Birhan was where my spiritual identity was forged. The teachers taught us not just how to chant Mezmur, but how to live with holiness and Christian love. Today, as a serving deacon at Holy Trinity Cathedral, every step I take is rooted in the foundation built here.',
    quoteAm: 'ወሉደ ብርሃን መንፈሳዊ ማንነቴ የታነፀበት የተቀደሰ ስፍራ ነው። መምህራኖቻችን መዝሙር መዘመርን ብቻ ሳይሆን በቅድስናና በፍቅር መኖርን አስተምረውናል። ዛሬ በካቴድራሉ በዲቁና ሳገለግል መሰረቴ ይኸው ሰንበት ትምህርት ቤት ነው።',
    avatarUrl: null,
    avatarInitial: 'ዲ',
    yearJoined: '2016',
    status: 'published',
  },
  {
    id: 'tst-2',
    name: 'Hanna Gebremariam',
    christianName: 'ወለተ ማርያም (Welete Maryam)',
    role: 'Choir Leader & University Graduate',
    roleAm: 'የዝማሬ ክፍል መሪና የዩኒቨርሲቲ ተመራቂ',
    quote: 'Balancing university studies with Sunday school was made possible because of the supportive brotherhood at Welude Birhan. Learning Ge\'ez and church history gave me deep cultural grounding that shields our youth in the modern world.',
    quoteAm: 'የዩኒቨርሲቲ ትምህርቴን ከሰንበት ት/ቤት ጋር አስማምቼ ለመጨረስ የወሉደ ብርሃን ወንድማማችነት ብርታት ሆኖኛል። የግዕዝ ቋንቋና የቤተክርስቲያን ታሪክ መማሬ በዘመናዊው ዓለም ውስጥ ማንነቴን ጠብቄ እንድጓዝ ረድቶኛል።',
    avatarUrl: null,
    avatarInitial: 'ሐ',
    yearJoined: '2018',
    status: 'published',
  },
  {
    id: 'tst-3',
    name: 'Abel Solomon',
    christianName: 'ገብረ ሥላሴ (Gebre Selassie)',
    role: 'Junior Division Instructor & Former Student',
    roleAm: 'የታዳጊዎች ክፍል መምህርና የቀድሞ ተማሪ',
    quote: 'I entered the nursery division when I was 7 years old. Today, having grown up under the bells of Holy Trinity Dire Dawa, it is an indescribable joy to pass the torch to the next generation of children.',
    quoteAm: 'በ7 ዓመቴ በህፃናት ክፍል ነበር የገባሁት። ዛሬ በድሬዳዋ ቅድስት ሥላሴ ደወል ስር አድጌ ለቀጣዩ የህፃናት ትውልድ የእምነቱን ችቦ የማስረከብ ዕድል ማግኘቴ ደስታዬ ወደር የለውም።',
    avatarUrl: null,
    avatarInitial: 'አ',
    yearJoined: '2015',
    status: 'published',
  },
  {
    id: 'tst-4',
    name: 'Meron Assefa',
    christianName: 'ወለተ ኪዳን (Welete Kidan)',
    role: 'Charity Department Coordinator',
    roleAm: 'የበጎ አድራጎት ክፍል አስተባባሪ',
    quote: 'The emphasis on practical Christianity transformed how I view faith. Welude Birhan showed us that loving God means serving the vulnerable, visiting the sick, and honoring our cathedral heritage.',
    quoteAm: 'በተግባራዊ ክርስትና ላይ የተሰጠው ትኩረት እምነትን የምረዳበትን መንገድ ቀይሮታል። እግዚአብሔርን መውደድ ማለት የተቸገሩትን ማገልገልና የታመሙትን መጠየቅ መሆኑን በተግባር የተማርነው እዚህ ነው።',
    avatarUrl: null,
    avatarInitial: 'ሜ',
    yearJoined: '2019',
    status: 'published',
  },
];

const STORAGE_KEYS = {
  ABOUT: 'wb_about_v3',
  EVENTS: 'wb_events_v3',
  GALLERY: 'wb_gallery_v3',
  TESTIMONIALS: 'wb_testimonials_v3',
  AUTH: 'wb_auth_v3',
  LANG: 'wb_lang_v3',
};

export const CmsContext = createContext(null);

export function CmsProvider({ children }) {
  // Navigation & View state
  const [activeNavSection, setActiveNavSection] = useState('home');
  const [currentView, setCurrentView] = useState('public'); // 'public' | 'cms'
  const [activeCmsTab, setActiveCmsTab] = useState('overview'); // 'overview' | 'about' | 'media' | 'events' | 'testimonials'
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Language state: 'am' | 'en'
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LANG) || 'en';
    } catch {
      return 'en';
    }
  });

  // Authentication state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // About Data state
  const [aboutData, setAboutData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ABOUT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...INITIAL_ABOUT_DATA, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Error reading about data:', e);
    }
    return INITIAL_ABOUT_DATA;
  });

  // Events state
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading events:', e);
    }
    return INITIAL_EVENTS;
  });

  // Gallery items state
  const [galleryItems, setGalleryItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading gallery items:', e);
    }
    return INITIAL_GALLERY_ITEMS;
  });

  // Testimonials state
  const [testimonials, setTestimonials] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading testimonials:', e);
    }
    return INITIAL_TESTIMONIALS;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, language);
    } catch {}
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ABOUT, JSON.stringify(aboutData));
    } catch {}
  }, [aboutData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch {}
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(galleryItems));
    } catch {}
  }, [galleryItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
    } catch {}
  }, [testimonials]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch {}
  }, [user]);

  // Actions
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'am' : 'en'));
  };

  const login = (credentials = {}) => {
    const coordinator = {
      name: credentials.name || 'Deacon Kidanewold',
      email: credentials.email || 'coordinator@weludebirhan.org',
      role: 'Senior Content Coordinator',
      church: 'Holy Trinity Cathedral, Dire Dawa',
    };
    setUser(coordinator);
    setIsLoginModalOpen(false);
    setCurrentView('cms');
    return true;
  };

  const logout = () => {
    setUser(null);
    setCurrentView('public');
  };

  // About CRUD
  const updateAboutData = (updatedFields) => {
    setAboutData((prev) => ({ ...prev, ...updatedFields }));
  };

  // Events CRUD
  const addEvent = (eventData) => {
    const newEvent = {
      id: `evt-${Date.now()}`,
      title: eventData.title?.trim() || 'Untitled Announcement',
      titleAm: eventData.titleAm?.trim() || eventData.title?.trim() || '',
      category: eventData.category || 'General',
      date: eventData.date || new Date().toISOString().split('T')[0],
      time: eventData.time || 'TBD',
      location: eventData.location || 'Holy Trinity Cathedral, Dire Dawa',
      locationAm: eventData.locationAm || 'ቅድስት ሥላሴ ካቴድራል፣ ድሬዳዋ',
      placement: eventData.placement || 'Upcoming Events Grid',
      description: eventData.description?.trim() || '',
      descriptionAm: eventData.descriptionAm?.trim() || '',
      status: eventData.status || 'published',
      author: user?.name || 'Senior Content Coordinator',
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const updateEvent = (id, updatedFields) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    );
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleEventStatus = (id) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: e.status === 'published' ? 'draft' : 'published' } : e
      )
    );
  };

  // Media CRUD
  const addMediaItem = (item) => {
    const newMedia = {
      id: `med-${Date.now()}`,
      title: item.title?.trim() || 'Church Media',
      titleAm: item.titleAm?.trim() || item.title?.trim() || '',
      type: item.type || 'image', // 'image' | 'video'
      url: item.url || selassieImg,
      category: item.category || 'Feasts & Celebrations',
      date: item.date || new Date().toISOString().split('T')[0],
      description: item.description?.trim() || '',
    };
    setGalleryItems((prev) => [newMedia, ...prev]);
    return newMedia;
  };

  const deleteMediaItem = (id) => {
    setGalleryItems((prev) => prev.filter((m) => m.id !== id));
  };

  // Testimonials CRUD
  const addTestimonial = (data) => {
    const newTestimonial = {
      id: `tst-${Date.now()}`,
      name: data.name?.trim() || 'Student Alumnus',
      christianName: data.christianName?.trim() || '',
      role: data.role?.trim() || 'Sunday School Member',
      roleAm: data.roleAm?.trim() || data.role?.trim() || '',
      quote: data.quote?.trim() || '',
      quoteAm: data.quoteAm?.trim() || data.quote?.trim() || '',
      avatarUrl: data.avatarUrl || null,
      avatarInitial: data.name ? data.name.charAt(0) : '✝',
      yearJoined: data.yearJoined || '2020',
      status: data.status || 'published',
    };
    setTestimonials((prev) => [newTestimonial, ...prev]);
    return newTestimonial;
  };

  const deleteTestimonial = (id) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTestimonialStatus = (id) => {
    setTestimonials((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'published' ? 'draft' : 'published' } : e
      )
    );
  };

  // Factory Reset
  const resetAllData = () => {
    setAboutData(INITIAL_ABOUT_DATA);
    setEvents(INITIAL_EVENTS);
    setGalleryItems(INITIAL_GALLERY_ITEMS);
    setTestimonials(INITIAL_TESTIMONIALS);
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  };

  // Computed collections
  const publishedEvents = events.filter((e) => e.status === 'published');
  const publishedGridEvents = publishedEvents.filter((e) => e.placement === 'Upcoming Events Grid');
  const urgentNotices = publishedEvents.filter((e) => e.placement === 'Urgent Notice Banner');
  const publishedTestimonials = testimonials.filter((t) => t.status === 'published');

  const stats = {
    totalEvents: events.length,
    publishedEventsCount: publishedEvents.length,
    draftEventsCount: events.filter((e) => e.status === 'draft').length,
    urgentCount: urgentNotices.length,
    totalMedia: galleryItems.length,
    totalTestimonials: testimonials.length,
  };

  return (
    <CmsContext.Provider
      value={{
        // Nav & View
        activeNavSection,
        setActiveNavSection,
        currentView,
        setCurrentView,
        activeCmsTab,
        setActiveCmsTab,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        language,
        toggleLanguage,

        // Auth
        user,
        isAuthenticated: !!user,
        login,
        logout,

        // About Data
        aboutData: aboutData || INITIAL_ABOUT_DATA,
        aboutInfo: aboutData || INITIAL_ABOUT_DATA,
        updateAboutData,

        // Events
        events,
        publishedEvents,
        publishedGridEvents,
        urgentNotices,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleEventStatus,

        // Gallery
        galleryItems,
        addMediaItem,
        deleteMediaItem,

        // Testimonials
        testimonials,
        publishedTestimonials,
        addTestimonial,
        deleteTestimonial,
        toggleTestimonialStatus,

        // Stats & Reset
        stats,
        resetAllData,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within CmsProvider');
  }
  return context;
}
