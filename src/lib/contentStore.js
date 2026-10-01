import { db, isFirebaseConfigured } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CONTENT_STORAGE_KEY = 'dandiya_festival_cms_content';

export const DEFAULT_FESTIVAL_CONTENT = {
  hero: {
    announcement: 'THURSDAY, 15 OCT 2026 • 5:00 PM ONWARDS',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAI00QCRrCHNCzAlVp_VDwHI08h9CQNITKgSW79HORvT2-eYnY3tZAnfm1BhASPONdVvjuxGKTPnIkFiJpsOSSWrIGWMPOS2CLzsEnLFmtgRKSHuZJcSziCZJ-n4Kr_GnOOoPtgz4kv-aoXkb6yP8Vm3yPvzEyNDIiK2puAYzCpz2XpeY1sAbyPlmRKSf9UfUdXXQEJLoeOdOak3ts0VWXPiGiUuJbo1JohJVulkU7hEl3hhhFENScMR55NsVGFQCkrQoI',
    tagline: "HYDERABAD '26",
    venueName: 'Narapally Cricket Ground',
    venueAddress: 'Korremula Rd, Chowdhariguda, Hyderabad, Telangana 500088',
    description: 'Over 5,000 raas dancers, live Kathiawadi dhol orchestra, and pure unadulterated midnight folk energy under the autumn skies.',
    bgImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA1e54wCVj0BW3rSLWhj3hCJXuZ6MSH_Alp7XVs4fr9CqFZrps9-0x7Y9BoxX3Q5cN5GBPNUsMDk_d1oRoH7iQCnUi20c-oDZYntNYVlqI-n-wFLhU_Joq9btC5SyTmGkzvLVZktEZ39D2FulLQTvZihPAAbbFAu04VTrMNa1ROP4LW2cWMdzxNmjBH85DBELAvYPdB0Wi5qZMPMmIzFWsTAna7-TpcEja6W7mVPKn2fibH9D93jzYag',
    targetCountdown: '2026-10-15T17:00:00+05:30'
  },
  weather: {
    badge: 'WEATHER ADVISORY & 100% MONEY-BACK GUARANTEE',
    text: 'Notice: If unseasonal rain occurs, the festival will be cancelled and a full 100% refund will be processed immediately to your original payment method within 24 hours.',
    buttonText: '100% REFUND POLICY'
  },
  dateSection: {
    stamp: 'OFFICIAL FESTIVAL DATE',
    day: '15',
    month: 'OCTOBER',
    yearSubtitle: '2026 // AUTUMN MOON',
    hours: '5:00 PM TILL LATE NIGHT',
    subtext: 'NON-STOP PERCUSSION & SANEDO CIRCLE'
  },
  manifesto: {
    tag: 'MANIFESTO & SPIRIT',
    sectionTag: 'SEC. 03 // FOLK RHYTHM',
    heading: 'THIS IS DANDIYA.',
    subheading: 'Pure acoustic rhythm. Swirling chaniya cholis. Unfiltered celebration under the autumn moon.',
    quote: 'Zero synthetic cordons. 100% authentic folk energy.',
    image: 'https://lh3.googleusercontent.com/aida/AEtjO1UlknhEGONJ9q22Hhxv5wiEECJZJclWFRwR_6EBtNc4A9xo8nd3kGs9LVHiZV06XUYVOxL5IqDTnigXfpt7wgRoywwqr2PLhI8pC4iKUQc5COtIAM7JGpEI0xXjDyJjcOI9V8CC24vtEFoHLpkPxU3Zf3MaBS22k4gwOHN2ozAEmrbrfAZVHy2AjhHsRssW91dEa5a_irUU-HsKQospWc-Db1QQo45FF3IoK6CjLK7_-iYLdTrHsQlxZE46',
    pillars: [
      {
        id: 'dandiya',
        name: 'DANDIYA',
        sub: 'RAW WOODEN BEAT',
        icon: '🥢',
        desc: 'The sacred, clacking cadence of polished Sheesham and Teak wood sticks. Every strike syncs five thousand hearts into a solitary pulsing heartbeat.',
        details: [
          'Complimentary handcrafted pair provided with every pass',
          'Strictly wooden sticks only (metal/fiber prohibited)',
          'Traditional double-strike & 4-beat synchronized step patterns'
        ]
      },
      {
        id: 'garba',
        name: 'GARBA',
        sub: 'SWIRLING CIRCLE',
        icon: '🌀',
        desc: 'Concentric rings rotating counter-clockwise around the illuminated central deepa lamp. Symbolizing the infinite cycle of time and life.',
        details: [
          'Concentric rings ranging from intimate inner circle to massive outer orbit',
          'Traditional Gujarati 3-clapi (Tran Tali) and 2-step (Be Tali) rhythms',
          'Open to all dance skill levels from novices to masters'
        ]
      },
      {
        id: 'dhol',
        name: 'DHOL',
        sub: 'HEAVY PERCUSSION',
        icon: '🪘',
        desc: 'Authentic 12-piece Kathiawadi master percussionists playing double-headed dholaks, nagadas, and dhol tasha.',
        details: [
          'Acoustic bass frequencies engineered specifically for open-ground reverb',
          'Live master musicians from Saurashtra & Kutch regions',
          'Progressive tempo spikes culminating in midnight Sanedo ecstasy'
        ]
      },
      {
        id: 'rasoi',
        name: 'RASOI',
        sub: 'MIDNIGHT JALEBI',
        icon: '🥘',
        desc: 'Authentic Kathiawadi street food court operating all night with streaming hot jalebi, fafda, and spiced masala chai.',
        details: [
          'Hygienic multi-vendor festival street with certified quality',
          'Live cooking stations for hot jalebi & fafda combos',
          'Herbal thandai, coolers, and pure vegetarian feast counters'
        ]
      }
    ]
  },
  experiences: [
    {
      id: 'dhol',
      num: '01 // MUSIC',
      title: 'LIVE DHOL & ORCHESTRA',
      tag: '12-PIECE FOLK ENSEMBLE',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAezS_dZKO6zC1i-I6ZSdWCBduIAITQIxSuE35Tu2kpwV0Sytk70TAz6aNDX4GJKSmQQg3gYp-w-9pzCfEshEjp3IGslTjFYMxbXwIOBzbFGfJBrLGPPrXxh3m1OVyhFoxgXgjW_3v69Gzx48U4xRwaJeuYAJgV2aaEtHdgnNTODJ701xkajTWiVqFZv3Vf-Kx6CZmENa-SO8X3926Gd7eiJbPB3-saz0UclC9eLmvGvzo9_QrpUKvHog',
      desc: 'Resonant beats of authentic Kathiawadi dholaks, nagadas, and acoustic bass reverberating under open skies.',
      longDesc: 'Our headlining 12-piece master percussion troupe brings centuries-old rhythmic traditions straight from the heart of Gujarat. Feel acoustic shockwaves as the dhol transitions into high-octane 140 BPM Sanedo crescendos.',
      highlights: ['12 master percussionists', 'Live shenhai & acoustic bass', 'Dynamic tempo accelerations']
    },
    {
      id: 'raas',
      num: '02 // MOVEMENT',
      title: 'TRADITIONAL RAAS',
      tag: '5,000 SYNCHRONIZED SOULS',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7l3lF4vI1aSRsMFZKfNpqp-XijNdBDeVin4M03fVP0TE-Jecp2DymzG4U8T38Mr3RavrdHpj-bGcQPxP6ahZcnwAaOo2GWWklhcXB3Odn17Ns7GpmM86ua9K98G5WQIv7pT1Q5GCJohOHSI4IPCekPFDG5q1Xt18DSKNJXlK3EtFps_UkqM2gE5z5HsXsaF6zTFy4gcioj6P4kF_YnC6h6Tgy3F5w68rYH9qx_kZST0K758V5CtS6dg',
      desc: 'Multi-ring concentric Garba swirls. Clacking polished wooden dandiya sticks moving in unbroken collective unison.',
      longDesc: 'Step onto the manicured festival ground turf and become part of Hyderabad’s largest dance circle. From first-timers learning basic two-clap rhythms to veteran raas champions executing complex spin sequences.',
      highlights: ['3 tiered concentric circular tracks', 'Free tutorial warm-up rounds at 6 PM', 'Photographers capturing spinning chaniya cholis']
    },
    {
      id: 'aarti',
      num: '03 // DEVOTION',
      title: 'MIDNIGHT MAHA AARTI',
      tag: 'MIDNIGHT FLAME RITUAL',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI99mDcjvs0_QbZnXoaStCVIxoXjSsUQjXWF92WakVJVJz_BuEE_CN7IBhuU8kkJrB_PoSg6VRvFy-a7SMsTKiuKhoT_Kr0aF1PxzbsLIKYviKfGh-iN4FxFb5WdLqJ5P_6y3nBATAysB3Uig5GLj-ClmnQgVZ8p-GQfYwhcnM-JY8yA5UK5GAewwsjhDrlHpIzse5R_VhlI-jg516AD93ysi631EKHQJ-kEbHDxLPA7GW2aAvnSqZlA',
      desc: 'Hundreds of brass diyas illuminated collectively under the midnight autumn sky, creating a breathtaking sacred aura.',
      longDesc: 'At 11:30 PM, the drums pause into reverent silence. Over five hundred brass thalis catch sacred fire as thousands of attendees join in unison to chant traditional Gujarati stutis and the iconic Ambe Maa Aarti in divine harmony.',
      highlights: ['Over 500 lit oil lamps', 'Soul-stirring conch horns & mantras', 'Complimentary Prasad distribution']
    },
    {
      id: 'food',
      num: '04 // CUISINE',
      title: 'GUJARATI STREET FEAST',
      tag: 'ALL-NIGHT CATERING',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe5Mn8kMRU7cK7q98CYahEwE2zkgJj88CzVEGikGD6dezBGkzTluYnCR27WAxBtbjIM9YmA3jOuzjLobtBcdeNBxu22moFlkGaw2R1Z_cF2OH2sghGDUqd7vgdFHTDuxUFphvxS3g_TfFEDDAPCVkghYgBhmLWvmdAr5esfyvqaPpxXwtfgZSy04Fm3JDIBUnIcMsAgNSoUpcC1IpS0P9k_emeGPzSsXMtCHlkRY8D2Fa5qnE7hntsLw',
      desc: 'Steaming kadhai jalebis, freshly pressed fafda, wood-fired handvo, and midnight masala chai counters.',
      longDesc: 'Dandiya dancing builds a roaring appetite. Our culinary alley brings true street flavors: live boiling kadhais with golden spirals of pure ghee jalebis, spicy papaya sambharo chutney, crunchy fafda, and hot masala chai.',
      highlights: ['Authentic Saurashtra chefs', 'Pure vegetarian certified stalls', 'Digital UPI payment at all counters']
    }
  ],
  venue: {
    title: 'VENUE & LOCATION',
    capacityText: '★ GUEST CAPACITY: 5,000+ DANCERS',
    locationName: 'Narapally Cricket Ground',
    address: 'Korremula Rd, Chowdhariguda, Hyderabad, Telangana 500088',
    mapsLink: 'https://maps.app.goo.gl/rGbMt2SFBYh7L5iE9',
    rating: '4.6',
    reviewCount: '840+ reviews',
    amenities: [
      {
        id: 'parking',
        icon: '🅿️',
        title: 'Dedicated Parking',
        desc: 'Spacious 2-wheeler & 4-wheeler secure parking lots managed by uniformed marshals with floodlit lanes.'
      },
      {
        id: 'transit',
        icon: '🚇',
        title: 'Nearest Metro / Transit',
        desc: 'Convenient transit from Uppal Metro Station and continuous direct Ghatkesar road cab and bus connectivity.'
      },
      {
        id: 'food',
        icon: '🍔',
        title: 'Kathiawadi Food Street',
        desc: 'Hygienic traditional live food counters, piping-hot jalebis, fafda, beverages, and drinking water stations.'
      },
      {
        id: 'security',
        icon: '🛡️',
        title: '24/7 Security & First Aid',
        desc: 'High-definition CCTV coverage across the ground, female security stewards, bouncers & on-site medical paramedic booth.'
      }
    ]
  },
  gallery: [
    {
      id: 'fig-a',
      fig: 'FIG. A — 5,000 SOULS UNDER THE AUTUMN MOON',
      sub: 'NARAPALLY CRICKET GROUND',
      colSpan: 'md:col-span-8',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwOV_pRO97rzgqk_YVxkE42oMgVookYSFgtIGL5TvfykqnmLUvNPahj9M_5cXj049n13UFc1AyBZjGzhD85eButSJcB4IXNQUxuyd89yVVzm2ly5Lb_gvbMeQDE-ke6XyYPPfyLg-QwcK3hVXF_VeXBcg8G_ByGP6dFeEdYltYIC9Y0wbZpgU_LEdzEgY_CtQUU-uFYFtA_fQCjOAeTJLF3Q96coSwjcyJsKqw-G50JTZM_HtwCC8UQw',
      caption: 'A sweeping aerial vantage across Narapally Cricket Ground as thousands of participants twirl in synchronized circular raas orbits, surrounded by illuminated stage lights.'
    },
    {
      id: 'fig-b',
      fig: 'FIG. B — AUTHENTIC SILVER ORNAMENTATION & TRADITIONAL EMBROIDERY',
      sub: 'TRADITIONAL ATTIRE ARCHIVE',
      colSpan: 'md:col-span-4',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsaneG-kTQDpN4wAkrQdA81utdLHSKitAjW3lCgwKPkGTNatOHKPhc9CO4z06VjibMlx6xFw1e5x2-oqFMeFMAJd9lYm1wjMHcQFo37kE6BbER296mfTxyvlV8uIWM71RI7EWAK0wGrYJHggxhiyCU-HyUmHGOjmugNkitjGROBhTXJ1m8buZGtS8zwDGHuwJUFPv9iGrRJ7tEkJYAiNQZVOZpz5BJG15yOA8Fugp8ZlkhQ7ckkxt0Ng',
      caption: 'Editorial portrait showcasing intricate Gujarati threadwork, oxidized silver neckpieces, and hand-painted wooden dandiya sticks held in ready cadence.'
    }
  ],
  organisers: [
    {
      name: 'PRASHANTH',
      phone: '+91 6304-526415',
      cleanPhone: '916304526415',
      role: 'HEAD ORGANISER'
    },
    {
      name: 'RAM',
      phone: '+91 93914 78757',
      cleanPhone: '919391478757',
      role: 'VIP & CORPORATE BOOKINGS'
    },
    {
      name: 'MADHU',
      phone: '+91 97048 65160',
      cleanPhone: '919704865160',
      role: 'ENTRY & STALL MANAGEMENT'
    }
  ],
  faqs: [
    {
      q: 'ARE DANDIYA STICKS PROVIDED AT THE VENUE?',
      a: 'Yes. Every pass includes a complimentary pair of authentic, hand-turned Gujarati wooden dandiya sticks at entry Turnstiles. You are also welcome to bring your own personal sets provided they are wooden (fiber/metallic sticks are strictly prohibited for safety).'
    },
    {
      q: 'WHAT HAPPENS IF IT RAINS? (WEATHER REFUND POLICY)',
      a: 'We operate under a 100% unconditional weather refund policy. If rain causes the festival to be cancelled, full 100% refunds are automatically initiated within 24 hours back to your original payment method without any cancellation deductions.'
    },
    {
      q: 'WHAT IS THE DRESS CODE FOR ARENA ENTRY?',
      a: 'Traditional Indian / Gujarati festive attire is recommended for arena entry. For women: Chaniya Choli, Kurti-lehenga, or ethnic fusion. For men: Kedia-dhoti, Kurta-pajama, or Nehru jacket sets. Casual western sneakers with ethnic wear are welcomed for dancing comfort.'
    },
    {
      q: 'IS RE-ENTRY PERMITTED ONCE SCANNED?',
      a: 'Due to security regulations and capacity control, re-entry is not allowed once your digital wristband is scanned, unless accompanied by an official gate supervisor in emergency circumstances.'
    },
    {
      q: 'CAN I TRANSFER MY PASS TO A FRIEND?',
      a: 'Yes! Digital passes can be transferred up to 24 hours prior to the festival start directly via the "TRANSFER" button on your Digital Pass voucher or through our My Passes wallet portal.'
    },
    {
      q: 'WHAT IS THE PARKING & SECURITY PROTOCOL?',
      a: 'We provide dedicated, floodlit car and two-wheeler parking zones at Narapally Cricket Ground with 100% CCTV surveillance and security marshals. Active on-site medical first-response units and ambulances are stationed near Main Entrance.'
    },
    {
      q: 'ARE FOOD & DRINK ITEMS INCLUDED WITH TICKETS?',
      a: 'Regular passes grant entry and complimentary dandiya sticks. Food and beverages can be purchased at our all-night Kathiawadi Street Food court, or pre-booked as an add-on coupon during checkout to save 20%.'
    }
  ]
};

// Retrieve CMS content from local storage or defaults
export function getFestivalContent() {
  const local = localStorage.getItem(CONTENT_STORAGE_KEY);
  if (!local) {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(DEFAULT_FESTIVAL_CONTENT));
    return DEFAULT_FESTIVAL_CONTENT;
  }
  try {
    const parsed = JSON.parse(local);
    return { ...DEFAULT_FESTIVAL_CONTENT, ...parsed };
  } catch (e) {
    return DEFAULT_FESTIVAL_CONTENT;
  }
}

// Update specific section or full content
export function saveFestivalContent(newContent) {
  localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(newContent));

  // Sync to Firebase if configured
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'cms_content');
      setDoc(docRef, newContent).catch(err => console.warn('Firestore CMS sync error:', err));
    } catch (e) {
      console.warn('Firebase error saving CMS content:', e);
    }
  }

  notifyCmsListeners();
  return newContent;
}

export function resetFestivalContentToDefaults() {
  localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(DEFAULT_FESTIVAL_CONTENT));
  notifyCmsListeners();
  return DEFAULT_FESTIVAL_CONTENT;
}

// Event Listeners for Live Reactive Updates across all components
const cmsListeners = new Set();

export function subscribeToCms(callback) {
  cmsListeners.add(callback);
  return () => cmsListeners.delete(callback);
}

function notifyCmsListeners() {
  cmsListeners.forEach(cb => {
    try {
      cb();
    } catch (err) {
      console.error('CMS listener error:', err);
    }
  });
}

// Pull latest CMS content from Firestore if available
export async function syncCmsFromFirestore() {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const docRef = doc(db, 'settings', 'cms_content');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const remoteContent = docSnap.data();
      const local = getFestivalContent();
      const merged = { ...local, ...remoteContent };
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(merged));
      notifyCmsListeners();
    }
  } catch (err) {
    console.warn('Firestore CMS initial sync warning:', err);
  }
}

// Automatically sync CMS on startup if connected
if (typeof window !== 'undefined' && isFirebaseConfigured() && db) {
  setTimeout(() => {
    syncCmsFromFirestore().catch(() => {});
  }, 1500);
}
