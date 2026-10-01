import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc, updateDoc } from 'firebase/firestore';

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
      'Express VIP Gate 01 Turnstile entry',
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
      'Dual attendee barcode scan',
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
    description: 'Squad pass for 4 persons. One combined barcode voucher with rapid turnstile scan.',
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
    gate: 'Gate 02 - Turnstile A'
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
    gate: 'Gate 01 - VIP Fast-track'
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
    gate: 'Gate 03 - Group Entrance'
  }
];

// Schedule timeline
export const FESTIVAL_SCHEDULE = [
  {
    time: '5:00 PM',
    title: 'GATES OPEN & TURNSTILE ACCESS',
    subtitle: 'Narapally Cricket Ground',
    desc: 'Turnstile barcode scanning, wristband collection, and complimentary wooden dandiya stick distribution.',
    tag: 'ARRIVAL',
    zone: 'Gate 01, 02, 03'
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

// Active Promo Codes
export const PROMO_CODES = {
  'GARBA2026': { type: 'percent', value: 15, label: '15% Off Festival Special' },
  'EARLYBIRD': { type: 'flat', value: 100, label: '₹100 Off Early Bird' },
  'HYD10': { type: 'percent', value: 10, label: '10% Hyderabad Resident Special' }
};

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
  const q = query.trim().toUpperCase().replace('#', '');
  const phoneClean = query.replace(/\D/g, '');
  const bookings = getLocalBookings();

  return bookings.find(b => {
    const bId = b.id.toUpperCase().replace('#', '');
    const bRef = b.ref.toUpperCase().replace('#', '');
    const bPhone = (b.phone || '').replace(/\D/g, '');
    const bEmail = (b.email || '').toLowerCase();

    return bId === q || bRef === q || (phoneClean && bPhone.endsWith(phoneClean)) || bEmail === query.trim().toLowerCase();
  }) || null;
}

export function updateBookingCheckIn(bookingId, isCheckedIn = true, gate = 'Gate 02') {
  const bookings = getLocalBookings();
  const index = bookings.findIndex(b => b.id === bookingId || b.ref === bookingId);
  if (index === -1) return null;

  bookings[index].checkedIn = isCheckedIn;
  bookings[index].checkedInAt = isCheckedIn ? new Date().toISOString() : null;
  if (gate) bookings[index].gate = gate;

  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', bookings[index].id);
      updateDoc(docRef, { checkedIn: isCheckedIn, checkedInAt: bookings[index].checkedInAt, gate }).catch(console.warn);
    } catch (e) {
      console.warn('Firebase update error:', e);
    }
  }

  notifyListeners();
  return bookings[index];
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
  bookings[index].adminNotes = notes;
  bookings[index].mailSent = status === 'VERIFIED';
  bookings[index].mailSentAt = status === 'VERIFIED' ? now : null;

  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'bookings', bookings[index].id);
      updateDoc(docRef, {
        paymentStatus: status,
        verificationStatus: status,
        verifiedAt: bookings[index].verifiedAt,
        verifiedBy: adminEmail,
        adminNotes: notes,
        mailSent: bookings[index].mailSent,
        mailSentAt: bookings[index].mailSentAt
      }).catch(console.warn);
    } catch (e) {
      console.warn('Firebase update verification error:', e);
    }
  }

  notifyListeners();
  return bookings[index];
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

// Pull latest bookings and settings from Firestore if online
export async function syncBookingsFromFirestore() {
  if (!isFirebaseConfigured() || !db) return;
  try {
    const querySnapshot = await getDocs(collection(db, 'bookings'));
    if (!querySnapshot.empty) {
      const remoteBookings = [];
      querySnapshot.forEach(docSnap => {
        remoteBookings.push(docSnap.data());
      });
      if (remoteBookings.length > 0) {
        const local = getLocalBookings();
        const mergedMap = new Map();
        local.forEach(b => mergedMap.set(b.id, b));
        remoteBookings.forEach(b => mergedMap.set(b.id, { ...(mergedMap.get(b.id) || {}), ...b }));
        const mergedList = Array.from(mergedMap.values());
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(mergedList));
        notifyListeners();
      }
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
    notifyListeners();
  } catch (err) {
    console.warn('Firestore initial fetch warning:', err);
  }
}

// Automatically sync on startup if connected
if (typeof window !== 'undefined' && isFirebaseConfigured() && db) {
  setTimeout(() => {
    syncBookingsFromFirestore().catch(() => {});
  }, 1200);
}
