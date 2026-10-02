import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';

// Pass tier definitions matching DESIGN.md & code.html
export const INITIAL_PASS_TIERS = [
  {
    id: 'kids',
    name: 'KIDS PASS',
    shortName: 'KIDS',
    category: 'individual',
    badge: 'KIDS',
    badgeColor: '#38bdf8',
    statusTag: 'EARLY BIRD',
    price: 199,
    originalPrice: 299,
    description: 'Ages 5-12 / Family entry pass with children festival wristband and kids fun arena pass.',
    perks: [
      'Free child festival wristband',
      'Dedicated kids garba circle section',
      'Complimentary fruit beverage',
      'Free wooden dandiya sticks (mini pair)'
    ],
    maxPerOrder: 6,
    availableCount: 42,
    popular: false
  },
  {
    id: 'single',
    name: 'SINGLE PASS',
    shortName: 'SINGLE',
    category: 'individual',
    badge: 'SOLO',
    badgeColor: '#1d4ed8',
    statusTag: 'AVAILABLE',
    price: 349,
    originalPrice: 499,
    description: 'General admission. Full evening access to live raas arena and 5,000 dancer garba circles.',
    perks: [
      'General turnstile admission',
      'Full raas arena & DJ stage access',
      '1 pair hand-crafted wooden dandiya sticks',
      'Access to Kathiawadi food court'
    ],
    maxPerOrder: 10,
    availableCount: 88,
    popular: true
  },
  {
    id: 'vip-single',
    name: 'VIP SINGLE PASS',
    shortName: 'VIP SINGLE',
    category: 'individual',
    badge: 'VIP',
    badgeColor: '#f6c86a',
    statusTag: 'LIMITED',
    price: 499,
    originalPrice: 699,
    description: 'VIP enclosure & inner ring access, priority turnstile entry, and dedicated air-cooled lounge.',
    perks: [
      'Express VIP Turnstile entry',
      'Inner circle Ras Kendra dance zone',
      'Premium polished Sheesham dandiya sticks',
      'VIP shaded lounge & complimentary welcome thandai'
    ],
    maxPerOrder: 6,
    availableCount: 24,
    popular: false
  },
  {
    id: 'couple',
    name: 'COUPLE PASS',
    shortName: 'COUPLE',
    category: 'group',
    badge: 'COUPLE',
    badgeColor: '#0b1229',
    statusTag: 'BESTSELLER',
    price: 649,
    originalPrice: 899,
    description: 'Admits 2 persons. Seamless dual entry with complimentary wooden dandiya sticks.',
    perks: [
      'Dual attendee QR scan',
      '2 pairs authentic Gujarati wooden sticks',
      'Couple photo-booth instant portrait token',
      'Full arena & midnight Aarti access'
    ],
    maxPerOrder: 4,
    availableCount: 36,
    popular: true
  },
  {
    id: 'vip-couple',
    name: 'VIP COUPLE PASS',
    shortName: 'VIP COUPLE',
    category: 'group',
    badge: 'VIP PAIR',
    badgeColor: '#f6c86a',
    statusTag: 'HIGH DEMAND',
    price: 899,
    originalPrice: 1199,
    description: 'VIP couple pass with front-stage privileges, fast-track entry and inner raas ring access.',
    perks: [
      'Fast-track VIP dual lane check-in',
      'Front-stage & inner circle privileges',
      '2 pairs carved Royal Bandhani sticks',
      'VIP lounge seating & refreshments'
    ],
    maxPerOrder: 4,
    availableCount: 18,
    popular: false
  },
  {
    id: 'group-4',
    name: 'GROUP OF 4 PASS',
    shortName: 'GROUP OF 4',
    category: 'squad',
    badge: 'SQUAD 4',
    badgeColor: '#f6c86a',
    statusTag: 'SAVE ₹97',
    price: 1299,
    originalPrice: 1599,
    description: 'Squad pass for 4 persons. One combined QR voucher with rapid turnstile scan.',
    perks: [
      'Admits 4 people together',
      '4 pairs handcrafted dandiya sticks',
      '1 complimentary Kathiawadi snack platter coupon',
      'Dedicated squad meetup locker token'
    ],
    maxPerOrder: 3,
    availableCount: 15,
    popular: false
  },
  {
    id: 'group-6',
    name: 'GROUP OF 6 PASS',
    shortName: 'GROUP OF 6',
    category: 'squad',
    badge: 'GROUP 6',
    badgeColor: '#f6c86a',
    statusTag: 'SAVE ₹195',
    price: 1899,
    originalPrice: 2299,
    description: 'Grand group for 6 persons. Maximum value ticket for big family and friend circles.',
    perks: [
      'Admits 6 people seamlessly',
      '6 pairs handcrafted dandiya sticks',
      '2 complimentary Kathiawadi snack platters',
      'Priority group turnstile queue lane'
    ],
    maxPerOrder: 2,
    availableCount: 11,
    popular: true
  }
];

// Seed initial bookings so ticket verification & admin dashboard work out of the box
export const INITIAL_BOOKINGS = [
  {
    id: 'DND-HYD-84920',
    ref: '#DND-HYD-84920',
    tierId: 'single',
    passTitle: 'SINGLE PASS',
    holderName: 'Aarav Patel',
    phone: '+91 98765 43210',
    email: 'aarav.patel@example.com',
    city: 'Hyderabad',
    quantity: 1,
    unitPrice: 349,
    totalAmount: 349,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    paymentId: 'PAY-UPI-994028',
    dandiyaPreference: 'Classic Teak Wood',
    addons: ['Complimentary Wooden Sticks'],
    garbaCircle: 'Ras Kendra (Inner)',
    timeSlot: '8:00 PM - 10:30 PM',
    createdAt: '2026-09-28T14:30:00.000Z',
    checkedIn: false,
    checkedInAt: null,
    gate: 'Main Entrance'
  },
  {
    id: 'DND-HYD-51204',
    ref: '#DND-HYD-51204',
    tierId: 'vip-couple',
    passTitle: 'VIP COUPLE PASS',
    holderName: 'Pooja Shah & Rohan Mehta',
    phone: '+91 99887 76655',
    email: 'pooja.shah@example.com',
    city: 'Secunderabad',
    quantity: 1,
    unitPrice: 899,
    totalAmount: 899,
    paymentMethod: 'Credit Card',
    paymentStatus: 'PAID',
    paymentId: 'PAY-CARD-441092',
    dandiyaPreference: 'Royal Bandhani Wrap',
    addons: ['VIP Lounge Access', 'Snack Platter Voucher'],
    garbaCircle: 'Ras Kendra (Inner)',
    timeSlot: 'All Night Access',
    createdAt: '2026-09-29T10:15:00.000Z',
    checkedIn: true,
    checkedInAt: '2026-10-01T14:45:00.000Z',
    gate: 'Main Entrance'
  },
  {
    id: 'DND-HYD-77319',
    ref: '#DND-HYD-77319',
    tierId: 'group-4',
    passTitle: 'GROUP OF 4 PASS',
    holderName: 'Vikram Joshi & Friends',
    phone: '+91 91234 56789',
    email: 'vikram.j@example.com',
    city: 'Nalgonda',
    quantity: 1,
    unitPrice: 1299,
    totalAmount: 1299,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    paymentId: 'PAY-UPI-183920',
    dandiyaPreference: 'Carved Sheesham',
    addons: ['Snack Platter Voucher'],
    garbaCircle: 'Prangan Ring (Mid)',
    timeSlot: '7:30 PM - 12:00 AM',
    createdAt: '2026-09-30T18:20:00.000Z',
    checkedIn: false,
    checkedInAt: null,
    gate: 'Main Entrance'
  }
];

// Schedule timeline
export const FESTIVAL_SCHEDULE = [
  {
    time: '5:00 PM',
    title: 'GATES OPEN & TURNSTILE ACCESS',
    subtitle: 'Narapally Cricket Ground',
    desc: 'Turnstile QR scanning, wristband collection, and complimentary wooden dandiya stick distribution.',
    tag: 'ARRIVAL',
    zone: 'Main Entrance Turnstiles'
  },
  {
    time: '6:00 PM',
    title: 'ACOUSTIC SHENHAI & WELCOME DANDIYA',
    subtitle: 'Prangan Outer Arena',
    desc: 'Opening melodies welcoming early festival arrivals with slow, graceful warm-up Garba steps.',
    tag: 'WARM-UP',
    zone: 'All Rings'
  },
  {
    time: '7:30 PM',
    title: 'KATHIAWADI DHOL TASHA THUNDER',
    subtitle: '12-Piece Master Dhol Ensemble',
    desc: 'Heart-thumping authentic Kathiawadi rhythms, double-sided dholak thunder, and synchronization crescendo.',
    tag: 'PERCUSSION',
    zone: 'Center Stage'
  },
  {
    time: '9:00 PM',
    title: '5,000 CONCENTRIC CIRCLE RAAS',
    subtitle: 'Peak Energy Folk Movement',
    desc: 'Massive multi-tiered spinning Garba rings clacking in unbroken rhythm across the cricket ground.',
    tag: 'MAIN EVENT',
    zone: 'Ras Kendra & Prangan'
  },
  {
    time: '11:30 PM',
    title: 'SACRED MIDNIGHT MAHA AARTI',
    subtitle: '500+ Brass Diyas Illuminated',
    desc: 'Solemn, breathtaking devotional ceremony under the open autumn skies with sacred conch blowing.',
    tag: 'DEVOTION',
    zone: 'Maha Mandap'
  },
  {
    time: '12:15 AM',
    title: 'MIDNIGHT SANEDO SURGE & JALEBI FEAST',
    subtitle: 'Folk Fusion Finale',
    desc: 'High-tempo Sanedo rounds followed by steaming kadhai jalebi, fafda, and masala chai feast.',
    tag: 'FINALE',
    zone: 'Food Street & Arena'
  }
];

// ==========================================
// Active Coupons & Promo Code Store
// ==========================================
export const COUPONS_KEY = 'dandiya_coupons_list';

export const INITIAL_COUPONS = [
  {
    id: 'coup-garba2026',
    code: 'GARBA2026',
    label: '15% Off Festival Special',
    description: 'Flat 15% discount on all festival passes (up to ₹500 cap).',
    discountType: 'percent', // 'percent' | 'flat'
    discountValue: 15,
    minSpend: 0,
    maxDiscount: 500,
    usageLimit: 500,
    usedCount: 48,
    expiryDate: '2026-10-31',
    isActive: true,
    createdAt: '2026-09-20T10:00:00.000Z'
  },
  {
    id: 'coup-earlybird',
    code: 'EARLYBIRD',
    label: '₹100 Off Early Bird',
    description: 'Flat ₹100 instant savings on pass bookings above ₹300.',
    discountType: 'flat',
    discountValue: 100,
    minSpend: 300,
    maxDiscount: 100,
    usageLimit: 250,
    usedCount: 92,
    expiryDate: '2026-10-15',
    isActive: true,
    createdAt: '2026-09-22T12:00:00.000Z'
  },
  {
    id: 'coup-hyd10',
    code: 'HYD10',
    label: '10% Hyderabad Resident Special',
    description: '10% discount for Hyderabad twin cities garba lovers.',
    discountType: 'percent',
    discountValue: 10,
    minSpend: 0,
    maxDiscount: 350,
    usageLimit: 1000,
    usedCount: 31,
    expiryDate: '2026-10-25',
    isActive: true,
    createdAt: '2026-09-25T14:30:00.000Z'
  },
  {
    id: 'coup-vipfest',
    code: 'VIPFEST',
    label: '₹250 Off Premium Passes',
    description: 'Instant ₹250 discount on VIP Couple and Group of 4 bookings.',
    discountType: 'flat',
    discountValue: 250,
    minSpend: 800,
    maxDiscount: 250,
    usageLimit: 100,
    usedCount: 14,
    expiryDate: '2026-10-20',
    isActive: true,
    createdAt: '2026-09-28T09:15:00.000Z'
  },
  {
    id: 'coup-dandiya50',
    code: 'DANDIYA50',
    label: '₹50 Off Student Special',
    description: 'Instant ₹50 savings on any single pass checkout.',
    discountType: 'flat',
    discountValue: 50,
    minSpend: 300,
    maxDiscount: 50,
    usageLimit: 300,
    usedCount: 65,
    expiryDate: '2026-10-30',
    isActive: true,
    createdAt: '2026-09-29T16:00:00.000Z'
  }
];

export function getCoupons() {
  const data = localStorage.getItem(COUPONS_KEY);
  if (!data) {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(INITIAL_COUPONS));
    return INITIAL_COUPONS;
  }
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COUPONS;
  } catch {
    return INITIAL_COUPONS;
  }
}

export function saveCoupons(coupons) {
  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'coupons');
      setDoc(docRef, { coupons }, { merge: true }).catch(console.warn);
    } catch (e) {
      console.warn('Firebase error on saveCoupons:', e);
    }
  }

  notifyListeners();
  return coupons;
}

export function addCoupon(newCoupon) {
  const coupons = getCoupons();
  const rawCode = (newCoupon.code || '').trim().toUpperCase();
  if (!rawCode) throw new Error('Coupon code is required.');

  // Check code uniqueness
  const existing = coupons.find(c => c.code.toUpperCase() === rawCode);
  if (existing) {
    throw new Error(`A coupon with code "${rawCode}" already exists.`);
  }

  const id = newCoupon.id || `coup-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const created = {
    id,
    code: rawCode,
    label: newCoupon.label?.trim() || `${rawCode} Coupon`,
    description: newCoupon.description?.trim() || '',
    discountType: newCoupon.discountType === 'percent' ? 'percent' : 'flat',
    discountValue: Number(newCoupon.discountValue) || 0,
    minSpend: Number(newCoupon.minSpend) || 0,
    maxDiscount: newCoupon.maxDiscount ? Number(newCoupon.maxDiscount) : null,
    usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : null,
    usedCount: Number(newCoupon.usedCount) || 0,
    expiryDate: newCoupon.expiryDate || '',
    isActive: newCoupon.isActive !== false,
    createdAt: new Date().toISOString()
  };

  const updated = [created, ...coupons];
  saveCoupons(updated);
  return created;
}

export function updateCoupon(couponId, updatedFields) {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.id === couponId);
  if (index === -1) return null;

  if (updatedFields.code) {
    const rawCode = updatedFields.code.trim().toUpperCase();
    const duplicate = coupons.find(c => c.id !== couponId && c.code.toUpperCase() === rawCode);
    if (duplicate) {
      throw new Error(`Another coupon with code "${rawCode}" already exists.`);
    }
    updatedFields.code = rawCode;
  }

  coupons[index] = {
    ...coupons[index],
    ...updatedFields,
    discountValue: updatedFields.discountValue !== undefined ? Number(updatedFields.discountValue) : coupons[index].discountValue,
    minSpend: updatedFields.minSpend !== undefined ? Number(updatedFields.minSpend) : coupons[index].minSpend,
    maxDiscount: updatedFields.maxDiscount !== undefined ? (updatedFields.maxDiscount ? Number(updatedFields.maxDiscount) : null) : coupons[index].maxDiscount,
    usageLimit: updatedFields.usageLimit !== undefined ? (updatedFields.usageLimit ? Number(updatedFields.usageLimit) : null) : coupons[index].usageLimit,
    updatedAt: new Date().toISOString()
  };

  saveCoupons(coupons);
  return coupons[index];
}

export function deleteCoupon(couponId) {
  const coupons = getCoupons();
  const updated = coupons.filter(c => c.id !== couponId);
  saveCoupons(updated);
  return updated;
}

export function toggleCouponActive(couponId) {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.id === couponId);
  if (index === -1) return null;
  coupons[index].isActive = !coupons[index].isActive;
  coupons[index].updatedAt = new Date().toISOString();
  saveCoupons(coupons);
  return coupons[index];
}

export function incrementCouponUsage(codeOrId) {
  if (!codeOrId) return;
  const coupons = getCoupons();
  const clean = String(codeOrId).trim().toUpperCase();
  const index = coupons.findIndex(c => c.id === codeOrId || c.code.toUpperCase() === clean);
  if (index === -1) return;
  coupons[index].usedCount = (coupons[index].usedCount || 0) + 1;
  saveCoupons(coupons);
}

export function validateAndApplyCoupon(codeQuery, subtotal = 0) {
  if (!codeQuery || !String(codeQuery).trim()) {
    return { valid: false, error: 'Please enter a coupon code.' };
  }

  const cleanCode = String(codeQuery).trim().toUpperCase();
  const coupons = getCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return {
      valid: false,
      error: `Coupon "${cleanCode}" does not exist. Please check the code.`
    };
  }

  if (coupon.isActive === false) {
    return {
      valid: false,
      error: `Coupon "${cleanCode}" is currently paused or inactive.`
    };
  }

  // Check expiration
  if (coupon.expiryDate) {
    const expiry = new Date(coupon.expiryDate + 'T23:59:59');
    if (new Date() > expiry) {
      return {
        valid: false,
        error: `Coupon "${cleanCode}" expired on ${new Date(coupon.expiryDate).toLocaleDateString()}.`
      };
    }
  }

  // Check usage limit
  if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
    return {
      valid: false,
      error: `Coupon "${cleanCode}" has reached its maximum redemptions limit.`
    };
  }

  // Check minimum spend
  const minSpend = Number(coupon.minSpend) || 0;
  if (subtotal < minSpend) {
    return {
      valid: false,
      error: `Coupon requires a minimum order value of ₹${minSpend}. (Current cart: ₹${subtotal})`
    };
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percent') {
    discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = Number(coupon.discountValue) || 0;
  }

  // Ensure discount does not exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return {
    valid: true,
    coupon,
    discountAmount,
    finalTotal,
    message: `Coupon "${coupon.code}" applied! You save ₹${discountAmount}.`
  };
}

// Backwards compatibility export for PROMO_CODES
export const PROMO_CODES = new Proxy({}, {
  get(target, prop) {
    if (typeof prop !== 'string') return undefined;
    const coupons = getCoupons();
    const found = coupons.find(c => c.code.toUpperCase() === prop.toUpperCase() && c.isActive !== false);
    if (!found) return undefined;
    return {
      id: found.id,
      code: found.code,
      type: found.discountType,
      value: found.discountValue,
      label: found.label,
      description: found.description,
      minSpend: found.minSpend,
      maxDiscount: found.maxDiscount
    };
  },
  has(target, prop) {
    if (typeof prop !== 'string') return false;
    const coupons = getCoupons();
    return coupons.some(c => c.code.toUpperCase() === prop.toUpperCase() && c.isActive !== false);
  }
});

// Storage helper functions
const BOOKINGS_KEY = 'dandiya_bookings_list';
const INQUIRIES_KEY = 'dandiya_inquiries_list';
const SCHEDULE_KEY = 'dandiya_bookmarked_schedule';

export function getLocalBookings() {
  const data = localStorage.getItem(BOOKINGS_KEY);
  if (!data) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
    return INITIAL_BOOKINGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBooking(newBooking) {
  const bookings = getLocalBookings();
  const updated = [newBooking, ...bookings];

  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage quota warning in saveBooking, recovering space:', err);
    // Graceful degradation: strip large screenshots from older bookings (keep only latest 3)
    try {
      const sanitized = updated.map((b, idx) => {
        if (idx > 3 && b.paymentScreenshot) {
          return { ...b, paymentScreenshot: null };
        }
        return b;
      });
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(sanitized));
    } catch (err2) {
      console.warn('Storage still full, storing recent bookings without older screenshots:', err2);
      try {
        const minimal = updated.slice(0, 15).map((b, idx) => {
          if (idx > 1) return { ...b, paymentScreenshot: null };
          return b;
        });
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(minimal));
      } catch (err3) {
        console.error('LocalStorage completely exhausted:', err3);
      }
    }
  }

  // Sync to Firebase if configured
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', newBooking.id);
      setDoc(docRef, newBooking).catch(err => console.warn('Firestore sync warning:', err));
    } catch (e) {
      console.warn('Firebase error on saveBooking:', e);
    }
  }

  notifyListeners();
  return newBooking;
}

export function findBooking(query) {
  if (!query) return null;
  let raw = String(query).trim();

  // Try parsing JSON if QR payload is JSON
  let parsedPayload = null;
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      parsedPayload = JSON.parse(raw);
      if (parsedPayload.ref || parsedPayload.id) {
        raw = parsedPayload.ref || parsedPayload.id;
      }
    } catch {}
  } else if (raw.includes('{') && raw.includes('}')) {
    try {
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      parsedPayload = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));
      if (parsedPayload.ref || parsedPayload.id) {
        raw = parsedPayload.ref || parsedPayload.id;
      }
    } catch {}
  }

  // Extract reference pattern like DND-HYD-12345 if embedded in URL or string
  const match = raw.match(/DND-HYD-[A-Z0-9]+/i);
  const q = (match ? match[0] : raw).toUpperCase().replace(/#/g, '').trim();
  const phoneClean = raw.replace(/\D/g, '');
  const bookings = getLocalBookings();

  const found = bookings.find(b => {
    const bId = (b.id || '').toUpperCase().replace(/#/g, '').trim();
    const bRef = (b.ref || '').toUpperCase().replace(/#/g, '').trim();
    const bPhone = (b.phone || '').replace(/\D/g, '');
    const bEmail = (b.email || b.userEmail || '').toLowerCase();

    return (
      bId === q ||
      bRef === q ||
      (q.length >= 6 && (bId.includes(q) || bRef.includes(q))) ||
      (phoneClean.length >= 10 && bPhone.endsWith(phoneClean)) ||
      (bEmail && bEmail === raw.toLowerCase())
    );
  });

  if (found) return found;

  // Fallback: If not found in local array, but the QR payload itself is an authentic Dandiya Raat ticket JSON
  if (parsedPayload && (parsedPayload.ref || parsedPayload.id) && parsedPayload.holder) {
    const cleanRef = (parsedPayload.ref || parsedPayload.id).replace(/#/g, '').trim().toUpperCase();
    const recovered = {
      id: cleanRef,
      ref: `#${cleanRef}`,
      holderName: parsedPayload.holder,
      passTitle: parsedPayload.pass || 'FESTIVAL PASS',
      quantity: Number(parsedPayload.qty) || 1,
      paymentStatus: parsedPayload.status || 'VERIFIED',
      verificationStatus: parsedPayload.status || 'VERIFIED',
      checkedIn: false,
      checkedInAt: null,
      gate: 'Main Entrance',
      venue: parsedPayload.venue || 'Narapally Cricket Ground',
      createdAt: new Date().toISOString(),
      recoveredFromQR: true
    };
    // Save to local cache
    bookings.unshift(recovered);
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch {}
    notifyListeners();
    return recovered;
  }

  return null;
}

// Cloud-Aware Async Booking Finder (Queries Firestore when not cached locally)
export async function findBookingAsync(query) {
  if (!query) return null;
  let raw = String(query).trim();

  // 1. Try local synchronous lookup first (0ms latency if already cached)
  const localMatch = findBooking(query);
  if (localMatch) {
    // Check if Firestore has a newer status (e.g. checked in from another gate scanner)
    if (isFirebaseConfigured() && db && localMatch.id) {
      try {
        const docSnap = await getDoc(doc(db, 'bookings', localMatch.id));
        if (docSnap.exists()) {
          const remoteData = { id: docSnap.id, ...docSnap.data() };
          if (remoteData.checkedIn !== localMatch.checkedIn || remoteData.paymentStatus !== localMatch.paymentStatus) {
            const bookings = getLocalBookings();
            const idx = bookings.findIndex(b => b.id === localMatch.id);
            if (idx >= 0) {
              bookings[idx] = { ...bookings[idx], ...remoteData };
              localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
              notifyListeners();
              return bookings[idx];
            }
          }
        }
      } catch (err) {
        console.warn('Background remote status check failed, using local:', err);
      }
    }
    return localMatch;
  }

  // 2. Extract clean reference code
  let parsedPayload = null;
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      parsedPayload = JSON.parse(raw);
    } catch {}
  } else if (raw.includes('{') && raw.includes('}')) {
    try {
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      parsedPayload = JSON.parse(raw.substring(jsonStart, jsonEnd + 1));
    } catch {}
  }

  let extractedCode = '';
  if (parsedPayload && (parsedPayload.ref || parsedPayload.id)) {
    extractedCode = parsedPayload.ref || parsedPayload.id;
  } else {
    const match = raw.match(/DND-HYD-[A-Z0-9]+/i);
    extractedCode = match ? match[0] : raw;
  }

  const cleanId = extractedCode.replace(/#/g, '').trim().toUpperCase();

  // 3. Query Firestore directly if configured and online
  if (isFirebaseConfigured() && db && cleanId) {
    try {
      // Direct doc lookup by ID (e.g. 'DND-HYD-53104')
      const docRef = doc(db, 'bookings', cleanId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const remoteData = { id: docSnap.id, ...docSnap.data() };
        const bookings = getLocalBookings();
        const existingIdx = bookings.findIndex(b => b.id === cleanId || (b.ref && b.ref.replace(/#/g, '') === cleanId));
        if (existingIdx >= 0) {
          bookings[existingIdx] = { ...bookings[existingIdx], ...remoteData };
        } else {
          bookings.unshift(remoteData);
        }
        try {
          localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        } catch {}
        notifyListeners();
        return remoteData;
      }

      // Query by 'ref' field (e.g. '#DND-HYD-53104')
      const qRef = query(collection(db, 'bookings'), where('ref', 'in', [cleanId, `#${cleanId}`]));
      const qSnap = await getDocs(qRef);
      if (!qSnap.empty) {
        const firstDoc = qSnap.docs[0];
        const remoteData = { id: firstDoc.id, ...firstDoc.data() };
        const bookings = getLocalBookings();
        const existingIdx = bookings.findIndex(b => b.id === remoteData.id);
        if (existingIdx >= 0) {
          bookings[existingIdx] = { ...bookings[existingIdx], ...remoteData };
        } else {
          bookings.unshift(remoteData);
        }
        try {
          localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        } catch {}
        notifyListeners();
        return remoteData;
      }
    } catch (err) {
      console.warn('Firestore query error in findBookingAsync:', err);
    }
  }

  // 4. Fallback: Parse authentic Dandiya Raat ticket JSON payload
  if (parsedPayload && (parsedPayload.ref || parsedPayload.id) && parsedPayload.holder) {
    const recovered = {
      id: cleanId,
      ref: parsedPayload.ref || `#${cleanId}`,
      holderName: parsedPayload.holder,
      passTitle: parsedPayload.pass || 'FESTIVAL PASS',
      quantity: Number(parsedPayload.qty) || 1,
      paymentStatus: parsedPayload.status || 'VERIFIED',
      verificationStatus: parsedPayload.status || 'VERIFIED',
      checkedIn: false,
      checkedInAt: null,
      gate: 'Main Entrance',
      venue: parsedPayload.venue || 'Narapally Cricket Ground',
      createdAt: new Date().toISOString(),
      recoveredFromQR: true
    };

    const bookings = getLocalBookings();
    bookings.unshift(recovered);
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch {}

    if (isFirebaseConfigured() && db) {
      try {
        setDoc(doc(db, 'bookings', cleanId), recovered, { merge: true }).catch(console.warn);
      } catch {}
    }

    notifyListeners();
    return recovered;
  }

  return null;
}

export function updateBookingCheckIn(bookingIdOrRef, isCheckedIn = true, gate = 'Main Entrance') {
  const bookings = getLocalBookings();
  const b = findBooking(bookingIdOrRef);
  if (!b) return null;

  const index = bookings.findIndex(item => item.id === b.id);
  if (index === -1) return null;

  // If rejected, reject admission attempt
  if (isCheckedIn && bookings[index].paymentStatus === 'REJECTED') {
    return {
      ...bookings[index],
      success: false,
      alreadyUsed: false,
      booking: bookings[index],
      message: 'Booking has been REJECTED by admin! Admission denied.'
    };
  }

  // If already used and we are attempting to check in again
  if (isCheckedIn && bookings[index].checkedIn) {
    return {
      ...bookings[index],
      success: false,
      alreadyUsed: true,
      booking: bookings[index],
      message: 'Pass has ALREADY BEEN USED!'
    };
  }

  const now = new Date().toISOString();
  bookings[index].checkedIn = isCheckedIn;
  bookings[index].checkedInAt = isCheckedIn ? now : null;
  if (gate) {
    bookings[index].gate = gate;
    bookings[index].checkedInGate = gate;
  }

  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (err) {
    console.warn('Quota warning in updateBookingCheckIn:', err);
  }

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', bookings[index].id);
      updateDoc(docRef, {
        checkedIn: isCheckedIn,
        checkedInAt: bookings[index].checkedInAt,
        gate: bookings[index].gate,
        checkedInGate: bookings[index].checkedInGate
      }).catch(console.warn);
    } catch (e) {
      console.warn('Firebase update error:', e);
    }
  }

  notifyListeners();
  return {
    ...bookings[index],
    success: true,
    alreadyUsed: false,
    booking: bookings[index]
  };
}

export async function updateBookingCheckInAsync(bookingIdOrRef, isCheckedIn = true, gate = 'Main Entrance') {
  const result = updateBookingCheckIn(bookingIdOrRef, isCheckedIn, gate);

  if (result && result.success && isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', result.id);
      await updateDoc(docRef, {
        checkedIn: isCheckedIn,
        checkedInAt: result.checkedInAt,
        gate: result.gate,
        checkedInGate: result.checkedInGate
      });
    } catch (e) {
      console.warn('Firebase direct updateCheckIn warning:', e);
    }
  }

  return result;
}

export function updateBookingPaymentVerification(bookingId, status = 'VERIFIED', adminEmail = 'admin@dandiyaraat.com', notes = '') {
  const bookings = getLocalBookings();
  const index = bookings.findIndex(b => b.id === bookingId || b.ref === bookingId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  bookings[index].paymentStatus = status;
  bookings[index].verificationStatus = status;
  bookings[index].verifiedAt = status === 'VERIFIED' ? now : null;
  bookings[index].verifiedBy = adminEmail;
  bookings[index].adminNotes = notes || (status === 'REJECTED' ? 'Payment rejected by festival administrator.' : '');
  bookings[index].mailSent = status === 'VERIFIED';
  bookings[index].mailSentAt = status === 'VERIFIED' ? now : null;
  if (status === 'REJECTED') {
    bookings[index].checkedIn = false;
    bookings[index].checkedInAt = null;
  }

  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', bookings[index].id);
      updateDoc(docRef, {
        paymentStatus: status,
        verificationStatus: status,
        verifiedAt: bookings[index].verifiedAt,
        verifiedBy: adminEmail,
        adminNotes: bookings[index].adminNotes,
        mailSent: bookings[index].mailSent,
        mailSentAt: bookings[index].mailSentAt,
        checkedIn: bookings[index].checkedIn,
        checkedInAt: bookings[index].checkedInAt
      }).catch(console.warn);
    } catch (e) {
      console.warn('Firebase update verification error:', e);
    }
  }

  notifyListeners();
  return bookings[index];
}

// =========================================================================
// STALL REGISTRATION SYSTEM (Vendors, Food, Clothing, Dandiya, Brand Booths)
// =========================================================================
export const STALLS_KEY = 'dandiya_stall_applications_2026';

export const INITIAL_STALLS = [
  {
    id: 'STL-HYD-10492',
    brandName: 'Amdavadi Swad Farsan & Jalebi',
    contactPerson: 'Jayesh Patel',
    phone: '+919849021144',
    email: 'jayesh.amdavadi@gmail.com',
    stallCategory: 'Food & Snacks',
    budgetRange: '₹35,000 - ₹50,000',
    estimatedBudget: 45000,
    productDescription: 'Authentic Gujarati Fafda, Jalebi, Khaman Dhokla, Handvo and live Sev Usal counter.',
    powerRequired: true,
    spaceRequired: '15x10 ft Food Stall',
    status: 'CONTACTED',
    callNotes: 'Spoke with Jayesh. Interested in corner spot near food court entrance. Needs 15A power connection.',
    adminNotes: 'Tentative stall FC-04. Waiting for advance token.',
    assignedStallNumber: 'FC-04',
    createdAt: '2026-09-29T11:20:00.000Z',
    updatedAt: '2026-10-01T15:30:00.000Z'
  },
  {
    id: 'STL-HYD-10831',
    brandName: 'Rangilo Raas Chaniya Choli Hub',
    contactPerson: 'Kavita Dave',
    phone: '+919988776655',
    email: 'kavita.chaniyacholi@yahoo.com',
    stallCategory: 'Traditional Wear & Costumes',
    budgetRange: '₹25,000 - ₹35,000',
    estimatedBudget: 30000,
    productDescription: 'Designer Kutchi mirror-work Chaniya Cholis, Bandhani dupattas, Kediyu, and instant rental wear.',
    powerRequired: false,
    spaceRequired: '10x10 ft Retail Canopy',
    status: 'PENDING_REVIEW',
    callNotes: '',
    adminNotes: '',
    assignedStallNumber: '',
    createdAt: '2026-10-01T09:40:00.000Z',
    updatedAt: null
  },
  {
    id: 'STL-HYD-11205',
    brandName: 'Surat Handcrafted Wooden Dandiyas & Jewelry',
    contactPerson: 'Bhavin Shah',
    phone: '+919876543210',
    email: 'bhavin.dandiya@gmail.com',
    stallCategory: 'Dandiya Sticks & Jewelry',
    budgetRange: '₹15,000 - ₹25,000',
    estimatedBudget: 20000,
    productDescription: 'LED light Dandiyas, Sheesham carved sticks, Oxidized silver jewelry, Ghunghroo bangles.',
    powerRequired: false,
    spaceRequired: '10x10 ft Retail Stall',
    status: 'APPROVED',
    callNotes: 'Called Bhavin. Token received. Assigned stall near main festival entrance.',
    adminNotes: 'Confirmed Stall R-02. Entry passes for 3 stall staff issued.',
    assignedStallNumber: 'R-02',
    createdAt: '2026-09-28T16:15:00.000Z',
    updatedAt: '2026-09-30T14:10:00.000Z'
  }
];

export function getLocalStalls() {
  const data = localStorage.getItem(STALLS_KEY);
  if (!data) {
    localStorage.setItem(STALLS_KEY, JSON.stringify(INITIAL_STALLS));
    return INITIAL_STALLS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_STALLS;
  }
}

export function saveStallApplication(applicationData) {
  const stalls = getLocalStalls();
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const newStall = {
    id: `STL-HYD-${randomCode}`,
    brandName: (applicationData.brandName || '').trim(),
    contactPerson: (applicationData.contactPerson || '').trim(),
    phone: (applicationData.phone || '').trim(),
    email: (applicationData.email || '').trim().toLowerCase(),
    stallCategory: applicationData.stallCategory || 'Food & Snacks',
    budgetRange: applicationData.budgetRange || '₹25,000 - ₹45,000',
    estimatedBudget: Number(applicationData.estimatedBudget) || 25000,
    productDescription: (applicationData.productDescription || '').trim(),
    powerRequired: Boolean(applicationData.powerRequired),
    spaceRequired: applicationData.spaceRequired || '10x10 ft Standard Booth',
    status: 'PENDING_REVIEW', // PENDING_REVIEW | CONTACTED | APPROVED | REJECTED
    callNotes: '',
    adminNotes: '',
    assignedStallNumber: '',
    createdAt: new Date().toISOString(),
    updatedAt: null
  };

  stalls.unshift(newStall);
  localStorage.setItem(STALLS_KEY, JSON.stringify(stalls));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'stalls', newStall.id);
      setDoc(docRef, newStall).catch(console.warn);
    } catch (e) {
      console.warn('Firebase stall save warning:', e);
    }
  }

  notifyListeners();
  return newStall;
}

export function updateStallDetails(stallId, updatedFields) {
  const stalls = getLocalStalls();
  const index = stalls.findIndex(s => s.id === stallId);
  if (index === -1) return null;

  stalls[index] = {
    ...stalls[index],
    ...updatedFields,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(STALLS_KEY, JSON.stringify(stalls));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'stalls', stalls[index].id);
      updateDoc(docRef, stalls[index]).catch(console.warn);
    } catch (e) {
      console.warn('Firebase stall update warning:', e);
    }
  }

  notifyListeners();
  return stalls[index];
}

export function deleteStallApplication(stallId) {
  const stalls = getLocalStalls();
  const updated = stalls.filter(s => s.id !== stallId);
  localStorage.setItem(STALLS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'stalls', stallId);
      deleteDoc(docRef).catch(console.warn);
    } catch (e) {
      console.warn('Firebase stall delete warning:', e);
    }
  }

  notifyListeners();
  return true;
}

// Inquiries / Messages
export function getLocalInquiries() {
  const data = localStorage.getItem(INQUIRIES_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveInquiry(inquiry) {
  const inquiries = getLocalInquiries();
  const item = {
    id: 'INQ-' + Date.now().toString(36).toUpperCase(),
    ...inquiry,
    createdAt: new Date().toISOString()
  };
  const updated = [item, ...inquiries];
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'inquiries', item.id);
      setDoc(docRef, item).catch(console.warn);
    } catch (e) {
      console.warn('Firebase error on inquiry:', e);
    }
  }

  notifyListeners();
  return item;
}

// Event Listeners for Live Reactive Updates
const listeners = new Set();

export function subscribeToStore(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners() {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (err) {
      console.error('Store subscriber error', err);
    }
  });
}

// ==========================================
// Payment Settings (UPI ID & Custom QR Code)
// ==========================================
const PAYMENT_SETTINGS_KEY = 'dandiya_payment_settings';
export const DEFAULT_PAYMENT_SETTINGS = {
  upiId: 'dandiya2026@upi',
  accountName: 'Dandiya Raat Official',
  qrCodeUrl: '',
  merchantName: 'DANDIYA RAAT 2026',
  instructions: 'Scan with any UPI app (GPay, PhonePe, Paytm, BHIM, Cred) and upload payment screenshot.'
};

export function getPaymentSettings() {
  const data = localStorage.getItem(PAYMENT_SETTINGS_KEY);
  if (!data) return DEFAULT_PAYMENT_SETTINGS;
  try {
    return { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

export function savePaymentSettings(newSettings) {
  const merged = { ...getPaymentSettings(), ...newSettings };
  localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(merged));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'payment');
      setDoc(docRef, merged, { merge: true }).catch(console.warn);
    } catch (e) {
      console.warn('Firebase error on savePaymentSettings:', e);
    }
  }

  notifyListeners();
  return merged;
}

// ==========================================
// Pass Tiers Management
// ==========================================
const PASS_TIERS_KEY = 'dandiya_pass_tiers_list';

export function getPassTiers() {
  const data = localStorage.getItem(PASS_TIERS_KEY);
  if (!data) {
    localStorage.setItem(PASS_TIERS_KEY, JSON.stringify(INITIAL_PASS_TIERS));
    return INITIAL_PASS_TIERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PASS_TIERS;
  }
}

export function savePassTiers(tiers) {
  localStorage.setItem(PASS_TIERS_KEY, JSON.stringify(tiers));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'pass_tiers');
      setDoc(docRef, { tiers }, { merge: true }).catch(console.warn);
    } catch (e) {
      console.warn('Firebase error on savePassTiers:', e);
    }
  }

  notifyListeners();
  return tiers;
}

export function updatePassTier(tierId, updatedFields) {
  const tiers = getPassTiers();
  const index = tiers.findIndex(t => t.id === tierId);
  if (index === -1) return null;

  tiers[index] = { ...tiers[index], ...updatedFields };
  return savePassTiers(tiers);
}

export function addPassTier(newTier) {
  const tiers = getPassTiers();
  const id = newTier.id || 'tier-' + Date.now().toString(36);
  const tier = { ...newTier, id };
  const updated = [...tiers, tier];
  savePassTiers(updated);
  return tier;
}

export function deletePassTier(tierId) {
  const tiers = getPassTiers();
  const updated = tiers.filter(t => t.id !== tierId);
  savePassTiers(updated);
  return updated;
}

// ==========================================
// Edit Attendee Pass Details (Admin Action)
// ==========================================
export function updateBookingDetails(bookingId, updatedFields) {
  const bookings = getLocalBookings();
  const index = bookings.findIndex(b => b.id === bookingId || b.ref === bookingId);
  if (index === -1) return null;

  bookings[index] = { ...bookings[index], ...updatedFields };
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', bookings[index].id);
      updateDoc(docRef, updatedFields).catch(console.warn);
    } catch (e) {
      console.warn('Firebase error on updateBookingDetails:', e);
    }
  }

  notifyListeners();
  return bookings[index];
}

// ==========================================
// Delete Booking (Admin Verification Action)
// ==========================================
export function deleteBooking(bookingId) {
  const bookings = getLocalBookings();
  const index = bookings.findIndex(b => b.id === bookingId || b.ref === bookingId);
  if (index === -1) return false;

  const targetId = bookings[index].id;
  const updated = bookings.filter(b => b.id !== targetId);

  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage save error in deleteBooking:', err);
  }

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', targetId);
      deleteDoc(docRef).catch(console.warn);
    } catch (e) {
      console.warn('Firebase deleteDoc error on deleteBooking:', e);
    }
  }

  notifyListeners();
  return true;
}



// Pull latest bookings, stalls and settings from Firestore if online
export async function syncBookingsFromFirestore() {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    if (!querySnapshot.empty) {
      const remoteBookings = [];
      querySnapshot.forEach(docSnap => {
        remoteBookings.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (remoteBookings.length > 0) {
        const local = getLocalBookings();
        const mergedMap = new Map();
        local.forEach(b => mergedMap.set(b.id, b));
        remoteBookings.forEach(b => {
          const existing = mergedMap.get(b.id) || {};
          mergedMap.set(b.id, { ...existing, ...b });
        });
        const mergedList = Array.from(mergedMap.values());
        try {
          localStorage.setItem(BOOKINGS_KEY, JSON.stringify(mergedList));
        } catch {}
        notifyListeners();
      }
    }

    // Sync stalls from Firestore
    try {
      const stallsSnap = await getDocs(collection(db, 'stalls'));
      if (!stallsSnap.empty) {
        const remoteStalls = [];
        stallsSnap.forEach(docSnap => {
          remoteStalls.push({ id: docSnap.id, ...docSnap.data() });
        });
        if (remoteStalls.length > 0) {
          const localStalls = getLocalStalls();
          const mergedStallsMap = new Map();
          localStalls.forEach(s => mergedStallsMap.set(s.id, s));
          remoteStalls.forEach(s => {
            const existing = mergedStallsMap.get(s.id) || {};
            mergedStallsMap.set(s.id, { ...existing, ...s });
          });
          const mergedStalls = Array.from(mergedStallsMap.values());
          try {
            localStorage.setItem(STALLS_KEY, JSON.stringify(mergedStalls));
          } catch {}
          notifyListeners();
        }
      }
    } catch (e) {
      console.warn('Stalls sync error:', e);
    }

    // Sync payment settings
    const paymentDoc = await getDoc(doc(db, 'settings', 'payment'));
    if (paymentDoc.exists()) {
      const remotePayment = paymentDoc.data();
      localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify({ ...DEFAULT_PAYMENT_SETTINGS, ...remotePayment }));
    }

    // Sync pass tiers
    const tiersDoc = await getDoc(doc(db, 'settings', 'pass_tiers'));
    if (tiersDoc.exists() && tiersDoc.data().tiers) {
      localStorage.setItem(PASS_TIERS_KEY, JSON.stringify(tiersDoc.data().tiers));
    }

    // Sync coupons & promo codes
    const couponsDoc = await getDoc(doc(db, 'settings', 'coupons'));
    if (couponsDoc.exists() && couponsDoc.data()?.coupons) {
      localStorage.setItem(COUPONS_KEY, JSON.stringify(couponsDoc.data().coupons));
    }
    notifyListeners();
  } catch (err) {
    console.warn('Firestore initial fetch warning:', err);
  }
}

// Live real-time Firestore synchronization across all devices and scanner gates
export function initRealtimeFirestoreSync() {
  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      if (!snapshot || snapshot.empty) return;
      const remoteBookings = [];
      snapshot.forEach(docSnap => {
        remoteBookings.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (remoteBookings.length > 0) {
        const local = getLocalBookings();
        const mergedMap = new Map();
        local.forEach(b => mergedMap.set(b.id, b));
        remoteBookings.forEach(b => {
          const existing = mergedMap.get(b.id) || {};
          mergedMap.set(b.id, { ...existing, ...b });
        });
        const mergedList = Array.from(mergedMap.values());
        try {
          localStorage.setItem(BOOKINGS_KEY, JSON.stringify(mergedList));
        } catch {}
        notifyListeners();
      }
    }, (err) => {
      console.warn('Firestore onSnapshot bookings error:', err);
    });

    const unsubStalls = onSnapshot(collection(db, 'stalls'), (snapshot) => {
      if (!snapshot || snapshot.empty) return;
      const remoteStalls = [];
      snapshot.forEach(docSnap => {
        remoteStalls.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (remoteStalls.length > 0) {
        const local = getLocalStalls();
        const mergedMap = new Map();
        local.forEach(s => mergedMap.set(s.id, s));
        remoteStalls.forEach(s => {
          const existing = mergedMap.get(s.id) || {};
          mergedMap.set(s.id, { ...existing, ...s });
        });
        const mergedList = Array.from(mergedMap.values());
        try {
          localStorage.setItem(STALLS_KEY, JSON.stringify(mergedList));
        } catch {}
        notifyListeners();
      }
    }, (err) => {
      console.warn('Firestore onSnapshot stalls error:', err);
    });

    return () => {
      try {
        unsubBookings();
        unsubStalls();
      } catch {}
    };
  } catch (err) {
    console.warn('Failed to attach Firestore real-time listener:', err);
    return () => {};
  }
}

// Automatically sync immediately on startup if connected
if (typeof window !== 'undefined' && isFirebaseConfigured() && db) {
  syncBookingsFromFirestore().catch(() => {});
  initRealtimeFirestoreSync();
}
