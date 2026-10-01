import React, { useState, useEffect } from 'react';
import {
  getLocalBookings,
  updateBookingCheckIn,
  updateBookingPaymentVerification,
  findBooking,
  subscribeToStore,
  getPaymentSettings,
  savePaymentSettings,
  getPassTiers,
  savePassTiers,
  updatePassTier,
  addPassTier,
  deletePassTier,
  updateBookingDetails,
  deleteBooking
} from '../lib/storage';
import {
  getFestivalContent,
  saveFestivalContent,
  resetFestivalContentToDefaults,
  subscribeToCms
} from '../lib/contentStore';
import {
  getAdminEmails,
  addAdminEmail,
  getCurrentUser,
  saveUserSession
} from '../lib/auth';
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  testFirebaseConnection,
  isFirebaseConfigured
} from '../lib/firebase';
import {
  ShieldCheck,
  ShieldAlert,
  Save,
  RotateCcw,
  CheckCircle2,
  QrCode,
  Download,
  Database,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  UserCheck,
  Edit3,
  LogIn,
  Layers,
  MapPin,
  Image as ImageIcon,
  Key,
  Clock,
  Eye,
  Mail,
  X,
  Check,
  AlertTriangle,
  Upload,
  Tag,
  CreditCard,
  Copy
} from 'lucide-react';

export default function AdminPage({ currentUser, onOpenAuth }) {
  // If not logged in, prompt to log in with Google
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#070d1e] text-[#dce1ff]">
        <div className="max-w-md w-full bg-[#141a32] border-2 border-[#2a3656] p-8 rounded-2xl poster-shadow-dark text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#0b1229] border border-[#f6c86a] flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <h2 className="font-headline-sm text-3xl text-white uppercase">
            ORGANISER ACCESS RESTRICTED
          </h2>
          <p className="font-body-sm text-xs text-[#a5b4d4] leading-relaxed">
            The festival command center is protected by role-based access control. Please sign in with your authorized Google Administrator account.
          </p>
          <button
            onClick={onOpenAuth}
            className="w-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-3 font-headline-sm text-base uppercase rounded-xl poster-shadow-dark flex items-center justify-center gap-2 font-bold"
          >
            <LogIn className="w-4 h-4 text-[#f6c86a]" />
            <span>SIGN IN WITH GOOGLE</span>
          </button>
        </div>
      </div>
    );
  }

  // If logged in, but role is NOT admin
  if (currentUser.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#070d1e] text-[#dce1ff]">
        <div className="max-w-md w-full bg-[#141a32] border-2 border-red-500/50 p-8 rounded-2xl poster-shadow-dark text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center mx-auto text-2xl text-red-300">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-headline-sm text-3xl text-white uppercase">
            ACCESS DENIED (403)
          </h2>
          <div className="p-3 bg-[#0b1229] rounded-lg border border-[#2a3656] text-xs text-left">
            <span className="text-[#a5b4d4] block">Logged In As:</span>
            <strong className="text-white block font-mono">{currentUser.displayName} ({currentUser.email})</strong>
            <span className="text-amber-400 font-bold block mt-1">Current Role: {currentUser.role.toUpperCase()}</span>
          </div>
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-left space-y-1">
            <span className="font-label-stamp text-[10px] text-red-300 uppercase font-bold block">
              DATABASE PERMISSION POLICY
            </span>
            <p className="font-body-sm text-xs text-[#dce1ff] leading-relaxed">
              Your Google account is registered with the general <strong>"user"</strong> role.
              Administrator privileges are strictly managed in the database (<code className="text-[#f6c86a]">users/{currentUser.uid}.role = 'admin'</code>). Client-side role modifications are disabled.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onOpenAuth}
              className="w-full bg-[#0b1229] border border-[#2a3656] text-[#a5b4d4] hover:text-white py-2.5 text-xs font-label-stamp uppercase rounded transition-colors"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHORIZED ADMIN USER DASHBOARD
  // ==========================================
  const [activeTab, setActiveTab] = useState('cms'); // 'cms' | 'bookings' | 'checkin' | 'admins' | 'firebase'
  const [cmsSection, setCmsSection] = useState('hero'); // 'hero' | 'date' | 'manifesto' | 'experiences' | 'venue' | 'gallery' | 'organisers' | 'faqs' | 'weather'

  // CMS Content State
  const [content, setContent] = useState(getFestivalContent());
  const [saveStatus, setSaveStatus] = useState('');

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedScreenshotModal, setSelectedScreenshotModal] = useState(null);
  const [adminToast, setAdminToast] = useState(null);

  // Scanner State
  const [scanInput, setScanInput] = useState('');
  const [scanMessage, setScanMessage] = useState(null);

  // Admin Emails State
  const [adminList, setAdminList] = useState(getAdminEmails());
  const [newAdminInput, setNewAdminInput] = useState('');

  // Firebase Config State
  const [firebaseConfig, setFirebaseConfig] = useState(getFirebaseConfig());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Payment Settings State (UPI & QR)
  const [paymentSettings, setPaymentSettings] = useState(getPaymentSettings());
  const [paymentUpiInput, setPaymentUpiInput] = useState(paymentSettings.upiId || 'dandiya2026@upi');
  const [paymentAccountInput, setPaymentAccountInput] = useState(paymentSettings.accountName || 'Dandiya Raat Official');
  const [paymentQrUrlInput, setPaymentQrUrlInput] = useState(paymentSettings.qrCodeUrl || '');
  const [paymentInstructionsInput, setPaymentInstructionsInput] = useState(paymentSettings.instructions || '');

  // Pass Tiers State
  const [passTiers, setPassTiers] = useState(getPassTiers());
  const [editingTier, setEditingTier] = useState(null); // null or tier object
  const [isAddingTier, setIsAddingTier] = useState(false);

  // Edit Attendee Pass Modal State
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState(null);

  useEffect(() => {
    setBookings(getLocalBookings());
    setPaymentSettings(getPaymentSettings());
    setPassTiers(getPassTiers());
    const unsubStore = subscribeToStore(() => {
      setBookings(getLocalBookings());
      setPaymentSettings(getPaymentSettings());
      setPassTiers(getPassTiers());
    });
    const unsubCms = subscribeToCms(() => setContent(getFestivalContent()));
    return () => {
      unsubStore();
      unsubCms();
    };
  }, []);

  useEffect(() => {
    setPaymentUpiInput(paymentSettings.upiId || 'dandiya2026@upi');
    setPaymentAccountInput(paymentSettings.accountName || 'Dandiya Raat Official');
    setPaymentQrUrlInput(paymentSettings.qrCodeUrl || '');
    setPaymentInstructionsInput(paymentSettings.instructions || '');
  }, [paymentSettings]);

  // Payment Settings Handlers
  const handleSavePaymentSettings = (e) => {
    if (e) e.preventDefault();
    if (!paymentUpiInput.trim()) {
      alert('Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }
    const updated = savePaymentSettings({
      upiId: paymentUpiInput.trim(),
      accountName: paymentAccountInput.trim(),
      qrCodeUrl: paymentQrUrlInput.trim(),
      instructions: paymentInstructionsInput.trim()
    });
    setPaymentSettings(updated);
    setAdminToast('✅ Payment UPI ID & QR Code settings saved! Live on checkout.');
    setTimeout(() => setAdminToast(null), 5000);
  };

  const handleQrFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentQrUrlInput(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Pass Tier Handlers
  const handleSavePassTier = (tierData) => {
    if (isAddingTier) {
      addPassTier(tierData);
      setAdminToast(`✅ New pass tier "${tierData.name}" created!`);
      setIsAddingTier(false);
    } else if (editingTier) {
      updatePassTier(editingTier.id, tierData);
      setAdminToast(`✅ Pass tier "${tierData.name}" updated!`);
      setEditingTier(null);
    }
    setPassTiers(getPassTiers());
    setTimeout(() => setAdminToast(null), 4000);
  };

  const handleDeletePassTier = (tierId, tierName) => {
    if (window.confirm(`Are you sure you want to remove the pass tier "${tierName}"?`)) {
      deletePassTier(tierId);
      setPassTiers(getPassTiers());
      setAdminToast(`🗑️ Pass tier "${tierName}" removed.`);
      setTimeout(() => setAdminToast(null), 4000);
    }
  };

  // Attendee Pass Edit Handler
  const handleSaveEditedBooking = (bookingId, updatedFields) => {
    const updated = updateBookingDetails(bookingId, updatedFields);
    if (updated) {
      setAdminToast(`✅ Pass details successfully updated for ${updated.holderName}!`);
      setTimeout(() => setAdminToast(null), 4000);
      setSelectedBookingForEdit(null);
    }
  };

  // Save CMS Content
  const handleSaveCms = (e) => {
    if (e) e.preventDefault();
    saveFestivalContent(content);
    setSaveStatus('✅ All content, images, and texts successfully updated live!');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  const handleResetCms = () => {
    if (window.confirm('Reset all festival content, texts, and images back to default specifications?')) {
      const def = resetFestivalContentToDefaults();
      setContent(def);
      setSaveStatus('🔄 Content reset to defaults.');
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  // Metrics
  const totalTickets = bookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const checkedInCount = bookings.filter(b => b.checkedIn).length;
  const pendingVerificationCount = bookings.filter(b => b.paymentStatus === 'PENDING_VERIFICATION').length;
  const verifiedCount = bookings.filter(b => b.paymentStatus === 'VERIFIED' || b.paymentStatus === 'PAID').length;

  // Payment Verification Actions
  const handleVerifyPayment = (bookingId) => {
    const updated = updateBookingPaymentVerification(bookingId, 'VERIFIED', currentUser?.email || 'admin@dandiyaraat.com');
    if (updated) {
      setBookings(getLocalBookings());
      setAdminToast(`✅ Payment Verified! Digital entry pass & turnstile QR dispatched to ${updated.email || updated.userEmail}`);
      setTimeout(() => setAdminToast(null), 5000);
      if (selectedScreenshotModal && selectedScreenshotModal.id === bookingId) {
        setSelectedScreenshotModal(null);
      }
    }
  };

  const handleRejectPayment = (bookingId) => {
    if (window.confirm('Are you sure you want to flag/reject this payment submission?')) {
      const updated = updateBookingPaymentVerification(bookingId, 'REJECTED', currentUser?.email || 'admin@dandiyaraat.com', 'Payment receipt could not be verified against bank records.');
      if (updated) {
        setBookings(getLocalBookings());
        setAdminToast(`⚠️ Payment marked as REJECTED for ${updated.holderName}.`);
        setTimeout(() => setAdminToast(null), 5000);
        if (selectedScreenshotModal && selectedScreenshotModal.id === bookingId) {
          setSelectedScreenshotModal(null);
        }
      }
    }
  };

  const handleDeleteBooking = (bookingId, holderName) => {
    const confirmed = window.confirm(
      `⚠️ PERMANENTLY DELETE TICKET REQUEST?\n\nAre you sure you want to completely delete the ticket request for "${holderName || 'this attendee'}"?\n\nThis will completely remove the pass from the database.`
    );
    if (!confirmed) return;
    const success = deleteBooking(bookingId);
    if (success) {
      setBookings(getLocalBookings());
      setAdminToast(`🗑️ Ticket request for "${holderName || bookingId}" has been completely deleted.`);
      setTimeout(() => setAdminToast(null), 4000);
      if (selectedScreenshotModal && selectedScreenshotModal.id === bookingId) {
        setSelectedScreenshotModal(null);
      }
      if (selectedBookingForEdit && selectedBookingForEdit.id === bookingId) {
        setSelectedBookingForEdit(null);
      }
    }
  };

  const handleResendEmail = (b) => {
    setAdminToast(`📨 Pass successfully resent to ${b.email || b.userEmail}!`);
    setTimeout(() => setAdminToast(null), 4000);
  };

  // Turnstile Scan
  const handleCheckInScan = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const matched = findBooking(scanInput);
    if (!matched) {
      setScanMessage({ success: false, text: `No ticket found for reference "${scanInput}"!` });
      return;
    }

    if (matched.checkedIn) {
      setScanMessage({
        success: false,
        text: `⚠️ Ticket ${matched.ref} for ${matched.holderName} was ALREADY CHECKED IN at ${new Date(matched.checkedInAt).toLocaleTimeString()}!`
      });
      return;
    }

    updateBookingCheckIn(matched.id, true, 'Main Entrance');
    setScanMessage({
      success: true,
      text: `✅ Verified! Welcome ${matched.holderName} (${matched.passTitle} x${matched.quantity}). Turnstile Main Entrance unlocked.`
    });
    setScanInput('');
  };

  // Filtered Bookings computation
  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || (
      (b.ref && b.ref.toLowerCase().includes(q)) ||
      (b.holderName && b.holderName.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.userEmail && b.userEmail.toLowerCase().includes(q)) ||
      (b.phone && b.phone.includes(q)) ||
      (b.utrNumber && b.utrNumber.toLowerCase().includes(q)) ||
      (b.passTitle && b.passTitle.toLowerCase().includes(q))
    );

    if (!matchQuery) return false;
    if (filterStatus === 'pending-verification') {
      return b.paymentStatus === 'PENDING_VERIFICATION';
    }
    if (filterStatus === 'verified') {
      return b.paymentStatus === 'VERIFIED' || b.paymentStatus === 'PAID';
    }
    if (filterStatus === 'rejected') {
      return b.paymentStatus === 'REJECTED';
    }
    if (filterStatus === 'checked-in') {
      return b.checkedIn;
    }
    if (filterStatus === 'pending-admission') {
      return !b.checkedIn;
    }
    return true;
  });

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Booking Ref', 'Holder Name', 'Google Email', 'Phone', 'Pass Title', 'Quantity', 'Amount', 'Payment Status', 'UTR Number', 'Checked In'];
    const rows = filteredBookings.map(b => [
      b.ref,
      `"${b.holderName}"`,
      `"${b.userEmail || b.email || ''}"`,
      b.phone,
      `"${b.passTitle}"`,
      b.quantity || 1,
      b.totalAmount,
      b.paymentStatus || 'PENDING',
      `"${b.utrNumber || ''}"`,
      b.checkedIn ? 'YES' : 'NO'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dandiya_Attendees_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-[#dce1ff] pb-16">
      {/* Top Header */}
      <div className="p-6 sm:p-10 border-b border-[#1e294b] bg-[#0a1228]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950 border border-amber-500 rounded-full mb-2 text-amber-300 font-label-stamp text-xs font-bold uppercase">
              <ShieldCheck className="w-4 h-4 text-[#f6c86a]" />
              <span>SUPER ADMINISTRATOR COMMAND CENTER</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-headline-lg uppercase text-white tracking-wide">
              FESTIVAL CMS, TICKETS & GATE SCANNER
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'cms', label: 'EDIT CONTENT & IMAGES' },
              { id: 'bookings', label: 'ATTENDEES & VERIFICATION', badge: pendingVerificationCount },
              { id: 'payment', label: 'PAYMENT & UPI QR' },
              { id: 'tiers', label: 'PASS TIERS & PRICING' },
              { id: 'checkin', label: 'TURNSTILE SCAN' },
              { id: 'firebase', label: 'FIREBASE SETUP' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 font-label-stamp text-xs uppercase rounded border transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#1d4ed8] text-white border-[#38bdf8] font-bold poster-shadow-dark'
                    : 'bg-[#141a32] text-[#a5b4d4] border-[#2a3656] hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className="bg-amber-500 text-[#070d1e] font-mono text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Admin Toast */}
      {adminToast && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="p-3 bg-emerald-950 border-2 border-emerald-400 text-emerald-100 rounded-xl text-xs font-bold font-mono flex items-center justify-between shadow-lg animate-fadeIn">
            <span>{adminToast}</span>
            <button onClick={() => setAdminToast(null)} className="text-emerald-300 hover:text-white">✕</button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Real-Time Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#141a32] border-2 border-[#2a3656] p-4 rounded-xl poster-shadow-dark">
            <span className="font-label-stamp text-[10px] uppercase text-[#a5b4d4] block">TOTAL PASSES SOLD</span>
            <span className="font-display-hero text-3xl text-white block mt-1">{totalTickets}</span>
            <span className="font-body-sm text-[11px] text-[#38bdf8]">Verified Turnstile Passes</span>
          </div>

          <div className={`p-4 rounded-xl poster-shadow-dark border-2 transition-colors ${
            pendingVerificationCount > 0 ? 'bg-[#1c1807] border-amber-500' : 'bg-[#141a32] border-[#2a3656]'
          }`}>
            <span className="font-label-stamp text-[10px] uppercase text-[#f6c86a] font-bold block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>PENDING PAYMENT VERIFICATION</span>
            </span>
            <span className="font-display-hero text-3xl text-[#f6c86a] block mt-1">
              {pendingVerificationCount}
            </span>
            <span className="font-body-sm text-[11px] text-amber-200">
              {pendingVerificationCount > 0 ? '⚠️ Action needed to email passes' : 'All payments verified'}
            </span>
          </div>

          <div className="bg-[#141a32] border-2 border-[#2a3656] p-4 rounded-xl poster-shadow-dark">
            <span className="font-label-stamp text-[10px] uppercase text-[#a5b4d4] block">GROSS REVENUE</span>
            <span className="font-display-hero text-3xl text-[#ffe8c0] block mt-1">₹{totalRevenue.toLocaleString()}/-</span>
            <span className="font-body-sm text-[11px] text-emerald-400">100% Escrow Protected</span>
          </div>

          <div className="bg-[#141a32] border-2 border-[#2a3656] p-4 rounded-xl poster-shadow-dark">
            <span className="font-label-stamp text-[10px] uppercase text-[#a5b4d4] block">CHECKED-IN GUESTS</span>
            <span className="font-display-hero text-3xl text-[#38bdf8] block mt-1">{checkedInCount}</span>
            <span className="font-body-sm text-[11px] text-[#a5b4d4]">Inside Ground Turnstiles</span>
          </div>

          <div className="bg-[#141a32] border-2 border-[#2a3656] p-4 rounded-xl poster-shadow-dark">
            <span className="font-label-stamp text-[10px] uppercase text-[#a5b4d4] block">DATABASE ENGINE</span>
            <span className="font-display-hero text-lg text-emerald-400 block mt-1">
              {isFirebaseConfigured() ? 'LIVE FIRESTORE' : 'MOCK LOCAL DB'}
            </span>
            <span className="font-body-sm text-[11px] text-[#ffe8c0]">
              {isFirebaseConfigured() ? 'Cloud Synced' : 'Ready for credentials'}
            </span>
          </div>
        </div>

        {/* TAB 1: FULL CONTENT & IMAGE CMS EDITOR */}
        {activeTab === 'cms' && (
          <div className="bg-[#141a32] border-2 border-[#2a3656] rounded-xl p-5 sm:p-6 poster-shadow-dark space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2a3656] gap-3">
              <div>
                <h3 className="font-headline-sm text-2xl text-white uppercase flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#f6c86a]" />
                  <span>EDIT ALL WEBSITE CONTENT, TEXT & IMAGES</span>
                </h3>
                <p className="font-body-sm text-xs text-[#a5b4d4]">
                  Modify any headline, image link, festival timing, FAQ, or organizer phone number live.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCms}
                  className="bg-[#0b1229] hover:bg-[#181e36] text-[#a5b4d4] border border-[#2a3656] px-3 py-2 text-xs uppercase font-label-stamp font-bold rounded flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET DEFAULTS</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveCms}
                  className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white px-5 py-2 text-xs uppercase font-label-stamp font-bold rounded poster-shadow-dark flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-[#f6c86a]" />
                  <span>SAVE LIVE CONTENT</span>
                </button>
              </div>
            </div>

            {saveStatus && (
              <div className="p-3 bg-emerald-950 border border-emerald-500 rounded text-xs text-emerald-200 font-mono">
                {saveStatus}
              </div>
            )}

            {/* CMS Section Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[#2a3656] pb-3">
              {[
                { id: 'hero', label: '1. HERO & LOGO' },
                { id: 'date', label: '2. 15 OCT DATE' },
                { id: 'manifesto', label: '3. FOLK MANIFESTO' },
                { id: 'experiences', label: '4. REALMS CAROUSEL' },
                { id: 'venue', label: '5. VENUE & GOOGLE MAP' },
                { id: 'weather', label: '6. WEATHER ADVISORY' },
                { id: 'organisers', label: '7. ORGANISERS CONTACT' },
                { id: 'faqs', label: '8. FAQ POLICIES' }
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setCmsSection(sec.id)}
                  className={`px-3 py-1.5 text-xs font-label-stamp uppercase rounded border transition-all ${
                    cmsSection === sec.id
                      ? 'bg-[#f6c86a] text-[#070d1e] border-[#f6c86a] font-bold'
                      : 'bg-[#0b1229] text-[#a5b4d4] border-[#2a3656] hover:text-white'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* SECTION 1: HERO */}
            {cmsSection === 'hero' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">
                      TOP ANNOUNCEMENT TAG
                    </label>
                    <input
                      type="text"
                      value={content.hero.announcement}
                      onChange={e => setContent({ ...content, hero: { ...content.hero, announcement: e.target.value } })}
                      className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                    />
                  </div>
                  <div>
                    <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">
                      CITY / YEAR BADGE
                    </label>
                    <input
                      type="text"
                      value={content.hero.tagline}
                      onChange={e => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })}
                      className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">
                    FESTIVAL LOGO IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={content.hero.logoUrl}
                    onChange={e => setContent({ ...content, hero: { ...content.hero, logoUrl: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded font-mono"
                  />
                  {content.hero.logoUrl && (
                    <div className="mt-2 p-2 bg-[#060d24] border border-[#2a3656] rounded inline-block">
                      <span className="text-[10px] text-[#a5b4d4] block mb-1">Preview:</span>
                      <img src={content.hero.logoUrl} alt="" className="h-12 w-auto object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">
                    HERO BACKGROUND IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={content.hero.bgImage}
                    onChange={e => setContent({ ...content, hero: { ...content.hero, bgImage: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded font-mono"
                  />
                </div>

                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">
                    COUNTDOWN TARGET DATE / TIME (ISO FORMAT)
                  </label>
                  <input
                    type="text"
                    value={content.hero.targetCountdown}
                    onChange={e => setContent({ ...content, hero: { ...content.hero, targetCountdown: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded font-mono"
                  />
                </div>

                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">
                    HERO INTRO DESCRIPTION
                  </label>
                  <textarea
                    rows="3"
                    value={content.hero.description}
                    onChange={e => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                  ></textarea>
                </div>
              </div>
            )}

            {/* SECTION 2: DATE */}
            {cmsSection === 'date' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">DAY NUMBER</label>
                    <input
                      type="text"
                      value={content.dateSection.day}
                      onChange={e => setContent({ ...content, dateSection: { ...content.dateSection, day: e.target.value } })}
                      className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                    />
                  </div>
                  <div>
                    <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">MONTH</label>
                    <input
                      type="text"
                      value={content.dateSection.month}
                      onChange={e => setContent({ ...content, dateSection: { ...content.dateSection, month: e.target.value } })}
                      className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                    />
                  </div>
                  <div>
                    <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">YEAR / MOON</label>
                    <input
                      type="text"
                      value={content.dateSection.yearSubtitle}
                      onChange={e => setContent({ ...content, dateSection: { ...content.dateSection, yearSubtitle: e.target.value } })}
                      className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">HOURS / TIMINGS</label>
                  <input
                    type="text"
                    value={content.dateSection.hours}
                    onChange={e => setContent({ ...content, dateSection: { ...content.dateSection, hours: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                  />
                </div>
              </div>
            )}

            {/* SECTION 3: MANIFESTO */}
            {cmsSection === 'manifesto' && (
              <div className="space-y-4">
                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">MAIN HEADING</label>
                  <input
                    type="text"
                    value={content.manifesto.heading}
                    onChange={e => setContent({ ...content, manifesto: { ...content.manifesto, heading: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                  />
                </div>
                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">SUBHEADING</label>
                  <textarea
                    rows="2"
                    value={content.manifesto.subheading}
                    onChange={e => setContent({ ...content, manifesto: { ...content.manifesto, subheading: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                  ></textarea>
                </div>
                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">FEATURE PHOTO IMAGE URL</label>
                  <input
                    type="text"
                    value={content.manifesto.image}
                    onChange={e => setContent({ ...content, manifesto: { ...content.manifesto, image: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded font-mono"
                  />
                </div>
              </div>
            )}

            {/* SECTION 4: REALMS CAROUSEL */}
            {cmsSection === 'experiences' && (
              <div className="space-y-4">
                {(content.experiences || []).map((exp, idx) => (
                  <div key={exp.id || idx} className="p-4 bg-[#0b1229] border border-[#2a3656] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-label-stamp text-xs text-[#38bdf8] font-bold">REALM CARD #{idx + 1}</span>
                      <span className="font-mono text-xs text-[#ffe8c0]">{exp.tag}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-[#a5b4d4] uppercase block mb-1">TITLE</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={e => {
                            const updated = [...content.experiences];
                            updated[idx].title = e.target.value;
                            setContent({ ...content, experiences: updated });
                          }}
                          className="w-full bg-[#070d1e] border border-[#2a3656] p-2 text-xs text-white rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#a5b4d4] uppercase block mb-1">SUBTITLE TAG</label>
                        <input
                          type="text"
                          value={exp.tag}
                          onChange={e => {
                            const updated = [...content.experiences];
                            updated[idx].tag = e.target.value;
                            setContent({ ...content, experiences: updated });
                          }}
                          className="w-full bg-[#070d1e] border border-[#2a3656] p-2 text-xs text-white rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#a5b4d4] uppercase block mb-1">CARD IMAGE URL</label>
                      <input
                        type="text"
                        value={exp.img}
                        onChange={e => {
                          const updated = [...content.experiences];
                          updated[idx].img = e.target.value;
                          setContent({ ...content, experiences: updated });
                        }}
                        className="w-full bg-[#070d1e] border border-[#2a3656] p-2 text-xs text-white rounded font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#a5b4d4] uppercase block mb-1">SHORT DESCRIPTION</label>
                      <textarea
                        rows="2"
                        value={exp.desc}
                        onChange={e => {
                          const updated = [...content.experiences];
                          updated[idx].desc = e.target.value;
                          setContent({ ...content, experiences: updated });
                        }}
                        className="w-full bg-[#070d1e] border border-[#2a3656] p-2 text-xs text-white rounded"
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 5: VENUE & GOOGLE MAPS */}
            {cmsSection === 'venue' && (
              <div className="space-y-4">
                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">VENUE NAME</label>
                  <input
                    type="text"
                    value={content.venue.locationName}
                    onChange={e => setContent({ ...content, venue: { ...content.venue, locationName: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                  />
                </div>

                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">FULL POSTAL ADDRESS</label>
                  <input
                    type="text"
                    value={content.venue.address}
                    onChange={e => setContent({ ...content, venue: { ...content.venue, address: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                  />
                </div>

                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">
                    GOOGLE MAPS LINK (e.g. https://maps.app.goo.gl/rGbMt2SFBYh7L5iE9)
                  </label>
                  <input
                    type="text"
                    value={content.venue.mapsLink}
                    onChange={e => setContent({ ...content, venue: { ...content.venue, mapsLink: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded font-mono"
                  />
                </div>
              </div>
            )}

            {/* SECTION 6: WEATHER GUARANTEE */}
            {cmsSection === 'weather' && (
              <div className="space-y-4">
                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">BANNER TITLE</label>
                  <input
                    type="text"
                    value={content.weather.badge}
                    onChange={e => setContent({ ...content, weather: { ...content.weather, badge: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                  />
                </div>
                <div>
                  <label className="font-label-stamp text-xs text-[#a5b4d4] uppercase block mb-1">REFUND POLICY GUARANTEE NOTICE</label>
                  <textarea
                    rows="3"
                    value={content.weather.text}
                    onChange={e => setContent({ ...content, weather: { ...content.weather, text: e.target.value } })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded"
                  ></textarea>
                </div>
              </div>
            )}

            {/* SECTION 7: ORGANISERS */}
            {cmsSection === 'organisers' && (
              <div className="space-y-4">
                {(content.organisers || []).map((org, idx) => (
                  <div key={idx} className="p-4 bg-[#0b1229] border border-[#2a3656] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[#a5b4d4] uppercase block mb-1">NAME</label>
                      <input
                        type="text"
                        value={org.name}
                        onChange={e => {
                          const updated = [...content.organisers];
                          updated[idx].name = e.target.value;
                          setContent({ ...content, organisers: updated });
                        }}
                        className="w-full bg-[#070d1e] border border-[#2a3656] p-2 text-xs text-white rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#a5b4d4] uppercase block mb-1">PHONE NUMBER</label>
                      <input
                        type="text"
                        value={org.phone}
                        onChange={e => {
                          const updated = [...content.organisers];
                          updated[idx].phone = e.target.value;
                          updated[idx].cleanPhone = e.target.value.replace(/\D/g, '');
                          setContent({ ...content, organisers: updated });
                        }}
                        className="w-full bg-[#070d1e] border border-[#2a3656] p-2 text-xs text-white rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#a5b4d4] uppercase block mb-1">DESIGNATION / ROLE</label>
                      <input
                        type="text"
                        value={org.role}
                        onChange={e => {
                          const updated = [...content.organisers];
                          updated[idx].role = e.target.value;
                          setContent({ ...content, organisers: updated });
                        }}
                        className="w-full bg-[#070d1e] border border-[#2a3656] p-2 text-xs text-white rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 8: FAQS */}
            {cmsSection === 'faqs' && (
              <div className="space-y-4">
                {(content.faqs || []).map((faq, idx) => (
                  <div key={idx} className="p-4 bg-[#0b1229] border border-[#2a3656] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-stamp text-xs text-[#f6c86a] font-bold">QUESTION #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = content.faqs.filter((_, i) => i !== idx);
                          setContent({ ...content, faqs: updated });
                        }}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={faq.q}
                      onChange={e => {
                        const updated = [...content.faqs];
                        updated[idx].q = e.target.value;
                        setContent({ ...content, faqs: updated });
                      }}
                      className="w-full bg-[#070d1e] border border-[#2a3656] p-2 text-xs text-white rounded font-bold"
                    />

                    <textarea
                      rows="2"
                      value={faq.a}
                      onChange={e => {
                        const updated = [...content.faqs];
                        updated[idx].a = e.target.value;
                        setContent({ ...content, faqs: updated });
                      }}
                      className="w-full bg-[#070d1e] border border-[#2a3656] p-2 text-xs text-white rounded"
                    ></textarea>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setContent({
                      ...content,
                      faqs: [
                        ...content.faqs,
                        { q: 'NEW QUESTION HERE?', a: 'Answer policy details here.' }
                      ]
                    });
                  }}
                  className="w-full py-2 bg-[#0b1229] hover:bg-[#181e36] text-[#38bdf8] border border-[#2a3656] rounded text-xs uppercase font-label-stamp flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD NEW FAQ ITEM</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ATTENDEES & PAYMENT VERIFICATION DESK */}
        {activeTab === 'bookings' && (
          <div className="bg-[#141a32] border-2 border-[#2a3656] rounded-xl p-5 poster-shadow-dark space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2a3656]">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, email, UTR, ref..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-[#0b1229] border border-[#2a3656] pl-9 pr-3 py-1.5 text-xs text-white rounded w-64 focus:border-[#f6c86a]"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-[#0b1229] border border-[#2a3656] px-3 py-1.5 text-xs text-white rounded font-mono"
                >
                  <option value="all">All Bookings ({bookings.length})</option>
                  <option value="pending-verification">
                    ⏳ Pending Verification ({pendingVerificationCount})
                  </option>
                  <option value="verified">
                    ✓ Verified & Mailed ({verifiedCount})
                  </option>
                  <option value="checked-in">Admitted ({checkedInCount})</option>
                  <option value="pending-admission">Pending Admission</option>
                  <option value="rejected">Rejected Payments</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportToCSV}
                  className="bg-[#0b1229] hover:bg-[#181e36] text-[#ffe8c0] border border-[#2a3656] px-4 py-1.5 text-xs uppercase font-label-stamp font-bold rounded flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>EXPORT CSV</span>
                </button>
              </div>
            </div>

            {/* Quick status message */}
            {pendingVerificationCount > 0 && (
              <div className="p-3 bg-amber-950/60 border border-amber-500/80 rounded-lg flex items-center justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>
                    <strong>{pendingVerificationCount} attendee payment(s) awaiting verification.</strong> Inspect the screenshot proof and verify to dispatch the official digital turnstile passes to their email.
                  </span>
                </div>
                <button
                  onClick={() => setFilterStatus('pending-verification')}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded font-label-stamp text-[10px] uppercase font-black"
                >
                  SHOW PENDING ONLY
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b1229] text-[#ffe8c0] font-label-stamp uppercase border-b border-[#2a3656]">
                  <tr>
                    <th className="p-3">REF #</th>
                    <th className="p-3">ATTENDEE & CONTACT</th>
                    <th className="p-3">PASS & QTY</th>
                    <th className="p-3">TOTAL</th>
                    <th className="p-3">PAYMENT PROOF</th>
                    <th className="p-3">VERIFICATION & MAIL</th>
                    <th className="p-3">GATE ADMISSION</th>
                    <th className="p-3 text-right">QUICK ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3656]/50">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400 font-mono">
                        No attendees match the selected search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const isPending = b.paymentStatus === 'PENDING_VERIFICATION';
                      const isVerified = b.paymentStatus === 'VERIFIED' || b.paymentStatus === 'PAID';
                      const isRejected = b.paymentStatus === 'REJECTED';

                      return (
                        <tr key={b.id} className="hover:bg-[#181e36] transition-colors">
                          {/* Ref */}
                          <td className="p-3">
                            <span className="font-mono font-bold text-[#f6c86a] block">{b.ref}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Today'}
                            </span>
                          </td>

                          {/* Attendee */}
                          <td className="p-3">
                            <div className="font-bold text-white text-sm">{b.holderName}</div>
                            <div className="text-[#38bdf8] font-mono text-[11px] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[#38bdf8]/70" />
                              <span>{b.userEmail || b.email || '—'}</span>
                            </div>
                            <div className="text-slate-400 font-mono text-[10px]">{b.phone}</div>
                          </td>

                          {/* Pass */}
                          <td className="p-3">
                            <span className="text-[#e2e8f0] font-bold block">{b.passTitle}</span>
                            <span className="text-[10px] font-mono text-[#38bdf8]">Qty: {b.quantity || 1} pass(es)</span>
                          </td>

                          {/* Total */}
                          <td className="p-3 font-mono font-bold text-white text-sm">
                            ₹{b.totalAmount}
                          </td>

                          {/* Payment Proof (Screenshot & UTR) */}
                          <td className="p-3">
                            {b.paymentScreenshot ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedScreenshotModal(b)}
                                  className="relative group block w-12 h-12 rounded-lg border-2 border-[#38bdf8]/60 overflow-hidden hover:border-[#f6c86a] transition-all bg-black shrink-0"
                                  title="Click to zoom screenshot"
                                >
                                  <img
                                    src={b.paymentScreenshot}
                                    alt="Payment receipt proof"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent flex items-center justify-center">
                                    <Eye className="w-3.5 h-3.5 text-white" />
                                  </div>
                                </button>
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedScreenshotModal(b)}
                                    className="text-[10px] font-label-stamp uppercase font-bold text-[#38bdf8] hover:text-[#f6c86a] flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>VIEW PROOF</span>
                                  </button>
                                  {b.utrNumber ? (
                                    <span className="text-[10px] font-mono text-[#f6c86a] block">
                                      UTR: {b.utrNumber}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono text-slate-500 block">
                                      No UTR attached
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-[10px] font-mono text-slate-500">
                                <span>No screenshot</span>
                                {b.utrNumber && <span className="block text-[#f6c86a]">UTR: {b.utrNumber}</span>}
                              </div>
                            )}
                          </td>

                          {/* Verification & Mail status */}
                          <td className="p-3">
                            {isPending && (
                              <div className="space-y-1">
                                <span className="bg-amber-950 text-amber-300 border border-amber-500 px-2 py-0.5 text-[9px] font-label-stamp uppercase font-bold rounded inline-flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '4s' }} />
                                  AWAITING VERIFICATION
                                </span>
                                <span className="block text-[10px] text-amber-300/80 font-mono">
                                  Passes will be mailed once verified
                                </span>
                              </div>
                            )}

                            {isVerified && (
                              <div className="space-y-1">
                                <span className="bg-emerald-950 text-emerald-300 border border-emerald-500 px-2 py-0.5 text-[9px] font-label-stamp uppercase font-bold rounded inline-flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" />
                                  VERIFIED & DISPATCHED
                                </span>
                                <span className="block text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  Pass sent to {b.email || b.userEmail}
                                </span>
                              </div>
                            )}

                            {isRejected && (
                              <div className="space-y-1">
                                <span className="bg-red-950 text-red-300 border border-red-500 px-2 py-0.5 text-[9px] font-label-stamp uppercase font-bold rounded inline-flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  REJECTED
                                </span>
                                <span className="block text-[10px] text-red-400 font-mono">
                                  Invalid payment proof
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Gate Admission */}
                          <td className="p-3">
                            {isPending ? (
                              <span className="text-[10px] font-mono text-amber-500/80 block">
                                🔒 LOCKED (UNVERIFIED)
                              </span>
                            ) : b.checkedIn ? (
                              <div>
                                <span className="bg-emerald-950 text-emerald-300 border border-emerald-500 px-2 py-0.5 text-[9px] font-label-stamp uppercase font-bold rounded block w-max">
                                  ADMITTED
                                </span>
                                <button
                                  onClick={() => updateBookingCheckIn(b.id, false, 'Admin Override')}
                                  className="text-[10px] text-slate-400 hover:text-red-300 underline mt-1 block font-mono"
                                >
                                  Undo Scan
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => updateBookingCheckIn(b.id, true, 'Main Entrance')}
                                className="px-2.5 py-1 text-[10px] font-label-stamp uppercase rounded border font-bold bg-emerald-950 text-emerald-300 border-emerald-500 hover:bg-emerald-900"
                              >
                                CHECK IN NOW
                              </button>
                            )}
                          </td>

                          {/* Quick Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setSelectedBookingForEdit(b)}
                                className="text-[10px] font-label-stamp uppercase text-[#38bdf8] hover:text-white px-2 py-1 rounded border border-[#2a3656] hover:bg-[#181e36] flex items-center gap-1 font-bold transition-colors"
                                title="Edit attendee pass details, ticket count, gate or status"
                              >
                                <Edit3 className="w-3 h-3 text-[#f6c86a]" />
                                <span>EDIT</span>
                              </button>

                              {isPending ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyPayment(b.id)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[10px] font-label-stamp uppercase rounded font-bold flex items-center gap-1 shadow"
                                    title="Verify payment and unlock/mail passes"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>VERIFY & SEND</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectPayment(b.id)}
                                    className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-700 px-2 py-1 text-[10px] font-label-stamp uppercase rounded"
                                    title="Reject invalid payment screenshot"
                                  >
                                    REJECT
                                  </button>
                                </>
                              ) : isVerified ? (
                                <button
                                  type="button"
                                  onClick={() => handleResendEmail(b)}
                                  className="text-[10px] font-label-stamp uppercase text-[#38bdf8] hover:text-white px-2 py-1 rounded border border-[#2a3656] hover:bg-[#181e36] flex items-center gap-1 font-bold"
                                  title="Resend entry ticket email"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>RESEND PASS</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyPayment(b.id)}
                                  className="text-[10px] font-label-stamp uppercase text-[#f6c86a] hover:underline"
                                >
                                  RE-VERIFY
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteBooking(b.id, b.holderName)}
                                className="text-[10px] font-label-stamp uppercase text-red-400 hover:text-white px-2 py-1 rounded border border-red-800/80 hover:bg-red-950 flex items-center gap-1 font-bold transition-colors ml-1"
                                title="Permanently delete this ticket request"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                                <span>DELETE</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PAYMENT & UPI QR CODE CONFIGURATION */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="bg-[#141a32] border-2 border-[#2a3656] rounded-xl p-6 poster-shadow-dark">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a3656] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1d4ed8]/30 border border-[#38bdf8] flex items-center justify-center text-[#38bdf8]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-2xl text-white uppercase leading-none">
                      UPI PAYMENT & QR CODE MANAGEMENT
                    </h3>
                    <span className="font-label-stamp text-[10px] text-[#38bdf8] uppercase">
                      CONFIGURE LIVE CHECKOUT UPI ID, RECEIVER NAME & PAYMENT QR CODE
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] px-3 py-1 rounded font-mono font-bold">
                    LIVE ON USER CHECKOUT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                {/* Form Controls Column */}
                <form onSubmit={handleSavePaymentSettings} className="lg:col-span-7 space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                        UPI ID FOR FESTIVAL PAYMENTS *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={paymentUpiInput}
                          onChange={(e) => setPaymentUpiInput(e.target.value)}
                          placeholder="e.g. yourfestival@upi or 9876543210@paytm"
                          className="w-full bg-[#0b1229] border border-[#2a3656] p-3 text-sm text-white font-mono rounded-lg focus:border-[#38bdf8] focus:outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        This UPI ID is copied by attendees and used for payment gateway QR codes.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                        ACCOUNT / PAYEE NAME DISPLAYED TO USERS
                      </label>
                      <input
                        type="text"
                        value={paymentAccountInput}
                        onChange={(e) => setPaymentAccountInput(e.target.value)}
                        placeholder="e.g. Dandiya Raat Official Festival 2026"
                        className="w-full bg-[#0b1229] border border-[#2a3656] p-3 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
                      />
                    </div>

                    {/* QR Code Configuration */}
                    <div className="bg-[#0b1229] p-4 rounded-xl border border-[#2a3656] space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-label-stamp uppercase text-[#f6c86a] font-bold flex items-center gap-1.5">
                          <QrCode className="w-4 h-4" />
                          <span>PAYMENT QR CODE SETTINGS</span>
                        </label>
                        {paymentQrUrlInput && (
                          <button
                            type="button"
                            onClick={() => setPaymentQrUrlInput('')}
                            className="text-[10px] text-red-400 hover:text-red-300 font-mono underline"
                          >
                            Reset to Auto-Generated UPI QR
                          </button>
                        )}
                      </div>

                      {/* Option 1: File Upload */}
                      <div>
                        <span className="text-xs text-slate-300 block mb-1 font-semibold">
                          Upload Custom QR Image (Google Pay, PhonePe, Paytm, Bank QR):
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#181e36] border border-[#38bdf8]/50 hover:border-[#38bdf8] text-white rounded-lg cursor-pointer text-xs font-label-stamp uppercase transition-all shadow">
                            <Upload className="w-4 h-4 text-[#38bdf8]" />
                            <span>CHOOSE QR IMAGE FILE</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleQrFileUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                            {paymentQrUrlInput ? 'QR Image Loaded' : 'No custom file selected'}
                          </span>
                        </div>
                      </div>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-[#1e294b]"></div>
                        <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-slate-500">OR ENTER IMAGE URL</span>
                        <div className="flex-grow border-t border-[#1e294b]"></div>
                      </div>

                      {/* Option 2: Image URL */}
                      <div>
                        <input
                          type="url"
                          value={paymentQrUrlInput}
                          onChange={(e) => setPaymentQrUrlInput(e.target.value)}
                          placeholder="https://yourdomain.com/path-to-payment-qr.png"
                          className="w-full bg-[#070d1e] border border-[#2a3656] p-2.5 text-xs text-white font-mono rounded-lg focus:border-[#38bdf8] focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Tip: Leave empty to automatically generate a dynamic scan-and-pay UPI QR code encoding your UPI ID.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                        CHECKOUT INSTRUCTIONS & NOTES
                      </label>
                      <textarea
                        rows={2}
                        value={paymentInstructionsInput}
                        onChange={(e) => setPaymentInstructionsInput(e.target.value)}
                        placeholder="Scan with any UPI app and upload the payment receipt screenshot below..."
                        className="w-full bg-[#0b1229] border border-[#2a3656] p-3 text-xs text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-headline-sm text-base uppercase rounded-xl poster-shadow-dark flex items-center justify-center gap-2 font-bold shadow-lg"
                    >
                      <Save className="w-4 h-4 text-[#f6c86a]" />
                      <span>SAVE PAYMENT SETTINGS & APPLY LIVE</span>
                    </button>
                  </div>
                </form>

                {/* Live Preview Column */}
                <div className="lg:col-span-5 bg-[#0b1229] border-2 border-[#2a3656] rounded-xl p-5 flex flex-col items-center text-center">
                  <div className="w-full flex items-center justify-between border-b border-[#2a3656] pb-3 mb-4">
                    <span className="font-label-stamp text-xs text-[#f6c86a] font-bold uppercase flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> LIVE ATTENDEE CHECKOUT PREVIEW
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">WHAT BUYERS SEE</span>
                  </div>

                  <div className="w-full max-w-[280px] bg-[#141a32] border border-[#2a3656] rounded-xl p-4 shadow-xl space-y-3">
                    <div className="p-2.5 bg-[#060d24] border border-[#2a3656] rounded flex justify-between items-center">
                      <span className="text-[10px] uppercase font-mono text-[#a5b4d4]">SAMPLE PASS (x1)</span>
                      <span className="font-headline-sm text-lg text-[#f6c86a]">₹349/-</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border-2 border-[#1d4ed8] shadow-md flex items-center justify-center">
                      {paymentQrUrlInput ? (
                        <img
                          src={paymentQrUrlInput}
                          alt="Configured Payment QR"
                          className="w-36 h-36 object-contain rounded"
                        />
                      ) : (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                            `upi://pay?pa=${paymentUpiInput || 'dandiya2026@upi'}&pn=${encodeURIComponent(
                              paymentAccountInput || 'Dandiya Raat Official'
                            )}&am=349&cu=INR`
                          )}`}
                          alt="Auto-generated Dynamic UPI QR"
                          className="w-36 h-36 object-contain rounded"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block">UPI Payee ID:</span>
                      <div className="flex items-center justify-center gap-1.5 bg-[#070d1e] border border-[#2a3656] py-1 px-2 rounded font-mono text-xs text-[#ffe8c0] font-bold">
                        <span>{paymentUpiInput || 'dandiya2026@upi'}</span>
                        <Copy className="w-3 h-3 text-[#38bdf8]" />
                      </div>
                      <span className="text-[10px] text-[#38bdf8] font-mono block">
                        {paymentAccountInput || 'Dandiya Raat Official'}
                      </span>
                    </div>

                    <div className="p-2 bg-[#0b1229] border border-[#2a3656] rounded text-[10px] text-slate-300">
                      {paymentInstructionsInput || 'Scan with any UPI app and upload the payment receipt screenshot.'}
                    </div>

                    <div className="text-[9px] text-slate-400 uppercase font-mono">
                      Accepts GPay • PhonePe • Paytm • BHIM • Cred
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PASS TIERS & PRICING INVENTORY */}
        {activeTab === 'tiers' && (
          <div className="space-y-6">
            <div className="bg-[#141a32] border-2 border-[#2a3656] rounded-xl p-6 poster-shadow-dark">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a3656] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1d4ed8]/30 border border-[#38bdf8] flex items-center justify-center text-[#38bdf8]">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-2xl text-white uppercase leading-none">
                      PASS TIERS & PRICING MANAGEMENT
                    </h3>
                    <span className="font-label-stamp text-[10px] text-[#38bdf8] uppercase">
                      MANAGE FESTIVAL TICKET CATEGORIES, PRICING, DISCOUNTS & REMAINING INVENTORY
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTier(null);
                      setIsAddingTier(true);
                    }}
                    className="px-4 py-2.5 bg-[#1d4ed8] hover:bg-[#2563eb] text-white rounded-lg text-xs font-label-stamp uppercase flex items-center gap-2 font-bold shadow-lg poster-shadow-dark"
                  >
                    <Plus className="w-4 h-4 text-[#f6c86a]" />
                    <span>ADD NEW PASS TIER</span>
                  </button>
                </div>
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {passTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="bg-[#0b1229] border-2 border-[#2a3656] hover:border-[#38bdf8]/60 transition-all rounded-xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 bg-[#1d4ed8]/40 border border-[#38bdf8] text-[#38bdf8] text-[9px] font-label-stamp uppercase font-bold rounded">
                          {tier.badge || 'GENERAL'}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                          {tier.statusTag || 'Available'}
                        </span>
                      </div>

                      <h4 className="font-headline-sm text-xl text-white uppercase leading-tight">
                        {tier.name}
                      </h4>

                      <div className="flex items-baseline gap-2">
                        <span className="font-headline-sm text-2xl text-[#f6c86a]">
                          ₹{tier.price}
                        </span>
                        {tier.originalPrice && (
                          <span className="text-xs text-slate-500 line-through font-mono">
                            ₹{tier.originalPrice}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">/ pass</span>
                      </div>

                      <p className="text-xs text-[#a5b4d4] line-clamp-3 leading-relaxed">
                        {tier.description}
                      </p>

                      <div className="pt-2 border-t border-[#2a3656] flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Inventory:</span>
                        <span className="text-white font-bold">{tier.availableCount || 500} passes</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Category:</span>
                        <span className="text-[#38bdf8] uppercase font-bold">{tier.category || 'all'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#2a3656]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingTier(false);
                          setEditingTier(tier);
                        }}
                        className="flex-1 py-2 bg-[#181e36] hover:bg-[#20294a] text-white border border-[#2a3656] hover:border-[#38bdf8] text-xs font-label-stamp uppercase rounded flex items-center justify-center gap-1.5 font-bold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#f6c86a]" />
                        <span>EDIT DETAILS</span>
                      </button>

                      {passTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeletePassTier(tier.id, tier.name)}
                          className="p-2 bg-red-950/40 hover:bg-red-900 border border-red-700/60 text-red-300 rounded hover:text-white transition-colors"
                          title="Delete pass tier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TURNSTILE SCANNER */}
        {activeTab === 'checkin' && (
          <div className="bg-[#141a32] border-2 border-[#2a3656] rounded-xl p-6 poster-shadow-dark max-w-xl mx-auto space-y-5">
            <div className="flex items-center gap-3 border-b border-[#2a3656] pb-3">
              <QrCode className="w-6 h-6 text-[#38bdf8]" />
              <div>
                <h3 className="font-headline-sm text-2xl text-white uppercase leading-none">
                  TURNSTILE SCANNER TERMINAL
                </h3>
                <span className="font-label-stamp text-[10px] text-[#a5b4d4] uppercase">MAIN ARENA ENTRANCE</span>
              </div>
            </div>

            <form onSubmit={handleCheckInScan} className="space-y-3">
              <input
                type="text"
                autoFocus
                placeholder="Scan QR or enter Booking Ref (e.g. #DND-HYD-84920)..."
                value={scanInput}
                onChange={e => setScanInput(e.target.value)}
                className="w-full bg-[#0b1229] border-2 border-[#38bdf8] p-3 text-sm text-white font-mono rounded-lg focus:outline-none focus:border-[#f6c86a]"
              />

              <button
                type="submit"
                className="w-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-3 font-headline-sm text-lg uppercase rounded poster-shadow-dark font-bold"
              >
                VERIFY & ADMIT GUEST
              </button>
            </form>

            {scanMessage && (
              <div className={`p-4 rounded-lg border text-xs font-mono ${
                scanMessage.success
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                  : 'bg-red-950 border-red-500 text-red-200'
              }`}>
                {scanMessage.text}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FIREBASE SETUP */}
        {activeTab === 'firebase' && (
          <div className="bg-[#141a32] border-2 border-[#2a3656] rounded-xl p-6 poster-shadow-dark max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#2a3656] pb-3">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-[#f6c86a]" />
                <div>
                  <h3 className="font-headline-sm text-2xl text-white uppercase leading-none">
                    FIREBASE FIRESTORE INTEGRATION
                  </h3>
                  <span className="font-label-stamp text-[10px] text-[#38bdf8] uppercase">
                    PLUG-AND-PLAY CREDENTIALS DESK
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-label-stamp uppercase font-bold rounded ${
                isFirebaseConfigured() ? 'bg-emerald-900 text-emerald-300 border border-emerald-400' : 'bg-amber-900 text-amber-300 border border-amber-400'
              }`}>
                {isFirebaseConfigured() ? 'CONNECTED' : 'LOCAL MOCK ACTIVE'}
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveFirebaseConfig(firebaseConfig);
                alert('Firebase configuration saved! Testing connection...');
                setTestingConnection(true);
                testFirebaseConnection(firebaseConfig).then(res => {
                  setTestingConnection(false);
                  setTestResult(res);
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-label-stamp text-[10px] text-[#a5b4d4] uppercase block mb-1">
                    API KEY (apiKey)
                  </label>
                  <input
                    type="text"
                    value={firebaseConfig.apiKey || ''}
                    onChange={e => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2 text-xs text-white rounded font-mono"
                  />
                </div>
                <div>
                  <label className="font-label-stamp text-[10px] text-[#a5b4d4] uppercase block mb-1">
                    AUTH DOMAIN (authDomain)
                  </label>
                  <input
                    type="text"
                    value={firebaseConfig.authDomain || ''}
                    onChange={e => setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2 text-xs text-white rounded font-mono"
                  />
                </div>
                <div>
                  <label className="font-label-stamp text-[10px] text-[#a5b4d4] uppercase block mb-1">
                    PROJECT ID (projectId)
                  </label>
                  <input
                    type="text"
                    value={firebaseConfig.projectId || ''}
                    onChange={e => setFirebaseConfig({ ...firebaseConfig, projectId: e.target.value })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2 text-xs text-white rounded font-mono"
                  />
                </div>
                <div>
                  <label className="font-label-stamp text-[10px] text-[#a5b4d4] uppercase block mb-1">
                    STORAGE BUCKET
                  </label>
                  <input
                    type="text"
                    value={firebaseConfig.storageBucket || ''}
                    onChange={e => setFirebaseConfig({ ...firebaseConfig, storageBucket: e.target.value })}
                    className="w-full bg-[#0b1229] border border-[#2a3656] p-2 text-xs text-white rounded font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-2.5 px-5 font-headline-sm text-base uppercase rounded poster-shadow-dark flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-[#f6c86a]" />
                  <span>SAVE & TEST FIREBASE</span>
                </button>
              </div>
            </form>

            {testResult && (
              <div className={`p-4 rounded-lg border text-xs font-mono ${
                testResult.success ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-red-950 border-red-500 text-red-200'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PAYMENT PROOF & VERIFICATION LIGHTBOX MODAL */}
      {selectedScreenshotModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#141a32] border-2 border-[#38bdf8] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden poster-shadow-dark shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#2a3656] flex items-center justify-between bg-[#0b1229]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1d4ed8]/30 border border-[#38bdf8] flex items-center justify-center text-[#38bdf8]">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-xl text-white uppercase tracking-wide">
                    PAYMENT SCREENSHOT VERIFICATION
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#a5b4d4]">
                    <span>REF: <strong className="text-[#f6c86a]">{selectedScreenshotModal.ref}</strong></span>
                    <span>•</span>
                    <span>ATTENDEE: <strong className="text-white">{selectedScreenshotModal.holderName}</strong></span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedScreenshotModal(null)}
                className="w-8 h-8 rounded-full bg-[#181e36] text-slate-400 hover:text-white flex items-center justify-center border border-[#2a3656]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Payment Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0b1229] p-3 rounded-lg border border-[#2a3656]">
                  <span className="text-[10px] font-label-stamp text-[#a5b4d4] uppercase block">AMOUNT PAID</span>
                  <span className="font-bold text-lg text-emerald-400">₹{selectedScreenshotModal.totalAmount}</span>
                </div>
                <div className="bg-[#0b1229] p-3 rounded-lg border border-[#2a3656]">
                  <span className="text-[10px] font-label-stamp text-[#a5b4d4] uppercase block">PASS & QTY</span>
                  <span className="font-bold text-sm text-white truncate block">{selectedScreenshotModal.passTitle}</span>
                  <span className="text-[11px] text-[#38bdf8] font-mono">Qty: {selectedScreenshotModal.quantity || 1}</span>
                </div>
                <div className="bg-[#0b1229] p-3 rounded-lg border border-[#2a3656]">
                  <span className="text-[10px] font-label-stamp text-[#a5b4d4] uppercase block">UTR / TXN ID</span>
                  <span className="font-mono font-bold text-xs text-[#f6c86a] truncate block">
                    {selectedScreenshotModal.utrNumber || 'Not Provided'}
                  </span>
                </div>
                <div className="bg-[#0b1229] p-3 rounded-lg border border-[#2a3656]">
                  <span className="text-[10px] font-label-stamp text-[#a5b4d4] uppercase block">STATUS</span>
                  <span className={`text-[10px] font-label-stamp uppercase font-bold px-2 py-0.5 rounded border inline-block ${
                    selectedScreenshotModal.paymentStatus === 'VERIFIED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                      : selectedScreenshotModal.paymentStatus === 'REJECTED'
                      ? 'bg-red-950 text-red-300 border-red-500'
                      : 'bg-amber-950 text-amber-300 border-amber-500'
                  }`}>
                    {selectedScreenshotModal.paymentStatus || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Attendee Contact Bar */}
              <div className="bg-[#0b1229] p-3 rounded-lg border border-[#2a3656] text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400">Google Email for Pass Dispatch:</span>{' '}
                  <strong className="text-[#38bdf8] font-mono">{selectedScreenshotModal.email || selectedScreenshotModal.userEmail}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Phone:</span>{' '}
                  <strong className="text-white font-mono">{selectedScreenshotModal.phone}</strong>
                </div>
              </div>

              {/* Screenshot Display Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-stamp text-xs text-[#a5b4d4] uppercase">
                    SUBMITTED PAYMENT RECEIPT SCREENSHOT:
                  </span>
                  {selectedScreenshotModal.paymentScreenshot && (
                    <a
                      href={selectedScreenshotModal.paymentScreenshot}
                      download={`Payment_Proof_${selectedScreenshotModal.ref}.png`}
                      className="text-[11px] text-[#38bdf8] hover:underline flex items-center gap-1 font-mono"
                    >
                      <Download className="w-3 h-3" /> Download High-Res
                    </a>
                  )}
                </div>

                <div className="bg-[#070d1e] border-2 border-dashed border-[#2a3656] rounded-xl p-3 flex items-center justify-center min-h-[300px] max-h-[460px] overflow-auto">
                  {selectedScreenshotModal.paymentScreenshot ? (
                    <img
                      src={selectedScreenshotModal.paymentScreenshot}
                      alt={`Payment Receipt Proof for ${selectedScreenshotModal.ref}`}
                      className="max-h-[420px] w-auto max-w-full rounded-lg object-contain border border-[#2a3656] shadow-xl"
                    />
                  ) : (
                    <div className="text-center p-8 space-y-2">
                      <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                      <p className="text-sm text-slate-300 font-bold">No Screenshot Uploaded</p>
                      <p className="text-xs text-slate-400">This attendee checked out without an image receipt attachment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-[#2a3656] bg-[#0b1229] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedScreenshotModal(null)}
                  className="px-4 py-2 border border-[#2a3656] text-[#a5b4d4] hover:text-white rounded text-xs uppercase font-label-stamp"
                >
                  Close Window
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBooking(selectedScreenshotModal.id, selectedScreenshotModal.holderName)}
                  className="px-3 py-2 border border-red-800 bg-red-950/70 hover:bg-red-900 text-red-300 hover:text-white rounded text-xs uppercase font-label-stamp font-bold flex items-center gap-1.5 transition-colors"
                  title="Completely delete this ticket request"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>DELETE REQUEST</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedScreenshotModal.paymentStatus === 'PENDING_VERIFICATION' && (
                  <button
                    type="button"
                    onClick={() => handleRejectPayment(selectedScreenshotModal.id)}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 rounded text-xs uppercase font-label-stamp font-bold"
                  >
                    Reject Payment
                  </button>
                )}

                {selectedScreenshotModal.paymentStatus !== 'VERIFIED' ? (
                  <button
                    type="button"
                    onClick={() => handleVerifyPayment(selectedScreenshotModal.id)}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded text-xs uppercase font-label-stamp font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50"
                  >
                    <Check className="w-4 h-4" />
                    <span>✓ VERIFY PAYMENT & SEND PASS TO EMAIL</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-label-stamp text-xs flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> VERIFIED & PASS DISPATCHED
                    </span>
                    <button
                      type="button"
                      onClick={() => handleResendEmail(selectedScreenshotModal)}
                      className="px-3 py-1.5 bg-[#1d4ed8] hover:bg-[#2563eb] text-white rounded text-xs font-label-stamp uppercase flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" /> Resend Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* EDIT ATTENDEE PASS MODAL */}
      {selectedBookingForEdit && (
        <EditAttendeePassModal
          booking={selectedBookingForEdit}
          passTiers={passTiers}
          onClose={() => setSelectedBookingForEdit(null)}
          onSave={handleSaveEditedBooking}
        />
      )}

      {/* EDIT / CREATE PASS TIER MODAL */}
      {(editingTier || isAddingTier) && (
        <EditPassTierModal
          tier={editingTier}
          isNew={isAddingTier}
          onClose={() => {
            setEditingTier(null);
            setIsAddingTier(false);
          }}
          onSave={handleSavePassTier}
        />
      )}
    </div>
  );
}

// ==========================================
// SUBCOMPONENT: EDIT ATTENDEE PASS MODAL
// ==========================================
function EditAttendeePassModal({ booking, passTiers, onClose, onSave }) {
  const [formData, setFormData] = useState({
    holderName: booking.holderName || '',
    phone: booking.phone || '',
    email: booking.email || booking.userEmail || '',
    city: booking.city || 'Hyderabad',
    passTitle: booking.passTitle || 'SINGLE PASS',
    quantity: booking.quantity || 1,
    totalAmount: booking.totalAmount || 0,
    gate: booking.gate || 'Main Entrance',
    paymentStatus: booking.paymentStatus || 'PENDING_VERIFICATION',
    checkedIn: Boolean(booking.checkedIn),
    utrNumber: booking.utrNumber || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(booking.id, {
      ...formData,
      quantity: Number(formData.quantity),
      totalAmount: Number(formData.totalAmount)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#141a32] border-2 border-[#38bdf8] rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden poster-shadow-dark shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2a3656] flex items-center justify-between bg-[#0b1229]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1d4ed8]/30 border border-[#38bdf8] flex items-center justify-center text-[#38bdf8]">
              <Edit3 className="w-5 h-5 text-[#f6c86a]" />
            </div>
            <div>
              <h3 className="font-headline-sm text-xl text-white uppercase tracking-wide">
                EDIT ATTENDEE PASS DETAILS
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono text-[#a5b4d4]">
                <span>REF: <strong className="text-[#f6c86a]">{booking.ref}</strong></span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181e36] text-slate-400 hover:text-white flex items-center justify-center border border-[#2a3656]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                ATTENDEE FULL NAME *
              </label>
              <input
                type="text"
                required
                value={formData.holderName}
                onChange={e => setFormData({ ...formData, holderName: e.target.value })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                PHONE NUMBER *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white font-mono rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                DISPATCH EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white font-mono rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                CITY / LOCATION
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                PASS TYPE
              </label>
              <select
                value={formData.passTitle}
                onChange={e => setFormData({ ...formData, passTitle: e.target.value })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
              >
                {passTiers.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
                {!passTiers.some(t => t.name === formData.passTitle) && (
                  <option value={formData.passTitle}>{formData.passTitle}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                QUANTITY
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white font-mono rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                TOTAL AMOUNT (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalAmount}
                onChange={e => setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-[#f6c86a] font-mono font-bold rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                PAYMENT STATUS
              </label>
              <select
                value={formData.paymentStatus}
                onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
              >
                <option value="PENDING_VERIFICATION">Awaiting Verification</option>
                <option value="VERIFIED">Verified & Dispatched</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                GATE ADMISSION / CHECK-IN
              </label>
              <select
                value={formData.checkedIn ? 'yes' : 'no'}
                onChange={e => setFormData({ ...formData, checkedIn: e.target.value === 'yes' })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
              >
                <option value="no">Not Checked In</option>
                <option value="yes">Checked In (Admitted)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                ASSIGNED ENTRY GATE
              </label>
              <input
                type="text"
                value={formData.gate}
                onChange={e => setFormData({ ...formData, gate: e.target.value })}
                placeholder="Main Entrance"
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                UTR / TXN ID
              </label>
              <input
                type="text"
                value={formData.utrNumber}
                onChange={e => setFormData({ ...formData, utrNumber: e.target.value })}
                placeholder="Bank UTR Number"
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white font-mono rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#2a3656] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#2a3656] text-[#a5b4d4] hover:text-white rounded text-xs uppercase font-label-stamp"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1d4ed8] hover:bg-[#2563eb] text-white rounded text-xs font-headline-sm uppercase font-bold flex items-center gap-1.5 shadow-lg poster-shadow-dark"
            >
              <Save className="w-4 h-4 text-[#f6c86a]" />
              <span>SAVE PASS DETAILS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// SUBCOMPONENT: EDIT PASS TIER MODAL
// ==========================================
function EditPassTierModal({ tier, isNew, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: tier?.name || '',
    price: tier?.price || 349,
    originalPrice: tier?.originalPrice || 699,
    badge: tier?.badge || 'GENERAL',
    statusTag: tier?.statusTag || 'Available',
    availableCount: tier?.availableCount || 500,
    category: tier?.category || 'individual',
    description: tier?.description || 'Full festival arena admission, access to live Garba dance orchestra and food court.'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a tier name.');
      return;
    }
    onSave({
      ...formData,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      availableCount: Number(formData.availableCount)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#141a32] border-2 border-[#38bdf8] rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden poster-shadow-dark shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2a3656] flex items-center justify-between bg-[#0b1229]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1d4ed8]/30 border border-[#38bdf8] flex items-center justify-center text-[#38bdf8]">
              <Tag className="w-5 h-5 text-[#f6c86a]" />
            </div>
            <div>
              <h3 className="font-headline-sm text-xl text-white uppercase tracking-wide">
                {isNew ? 'CREATE NEW PASS TIER' : 'EDIT PASS TIER & PRICING'}
              </h3>
              <span className="font-label-stamp text-[10px] text-[#38bdf8] uppercase">
                UPDATES LIVE ON TICKETING PORTAL
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181e36] text-slate-400 hover:text-white flex items-center justify-center border border-[#2a3656]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
              PASS TIER NAME *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. VIP Front-Row Stage Pass"
              className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                TICKET PRICE (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-[#f6c86a] font-mono font-bold rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                ORIGINAL STRIKE-THROUGH PRICE (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.originalPrice}
                onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-slate-400 font-mono rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                BADGE
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={e => setFormData({ ...formData, badge: e.target.value })}
                placeholder="EARLY BIRD"
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                STATUS TAG
              </label>
              <input
                type="text"
                value={formData.statusTag}
                onChange={e => setFormData({ ...formData, statusTag: e.target.value })}
                placeholder="Selling Fast"
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                INVENTORY COUNT
              </label>
              <input
                type="number"
                min="0"
                value={formData.availableCount}
                onChange={e => setFormData({ ...formData, availableCount: e.target.value })}
                className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white font-mono rounded-lg focus:border-[#38bdf8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
              FILTER CATEGORY
            </label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
            >
              <option value="individual">Solo & VIP (individual)</option>
              <option value="couples">Couples Entry (couples)</option>
              <option value="group">Group & Family (group)</option>
              <option value="season">Season 3-Day Pass (season)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
              PASS DESCRIPTION & INCLUSIONS
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what attendee receives with this pass tier..."
              className="w-full bg-[#0b1229] border border-[#2a3656] p-2.5 text-xs text-white rounded-lg focus:border-[#38bdf8] focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#2a3656] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#2a3656] text-[#a5b4d4] hover:text-white rounded text-xs uppercase font-label-stamp"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1d4ed8] hover:bg-[#2563eb] text-white rounded text-xs font-headline-sm uppercase font-bold flex items-center gap-1.5 shadow-lg poster-shadow-dark"
            >
              <Save className="w-4 h-4 text-[#f6c86a]" />
              <span>{isNew ? 'CREATE PASS TIER' : 'SAVE TIER DETAILS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
