import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, Tag, Sparkles, User, AlertCircle, Lock, Upload, Image, Clock, CheckCircle2, Copy, FileText, ChevronDown, QrCode, Download } from 'lucide-react';
import { saveBooking, PROMO_CODES, getPaymentSettings, getPassTiers, subscribeToStore } from '../lib/storage';
import confetti from 'canvas-confetti';

export default function BookingDrawer({
  isOpen,
  onClose,
  initialPassTitle = 'SINGLE PASS',
  initialPrice = 349,
  onBookingComplete,
  currentUser,
  onOpenAuth
}) {
  if (!isOpen) return null;

  // STRICT RULE: Pass buying should only happen after logging in, until then there should be NO access to buy one.
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0b1229] border-2 border-[#2a3656] text-[#dce1ff] p-6 sm:p-8 rounded-2xl poster-shadow-dark text-center relative animate-fadeIn">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 border border-[#2a3656] text-[#dce1ff] hover:text-[#f6c86a] rounded"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-[#141a32] border border-[#f6c86a]/40 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-[#f6c86a]" />
          </div>

          <span className="font-label-stamp text-xs text-[#38bdf8] uppercase tracking-wider font-bold block mb-1">
            AUTHENTICATION REQUIRED
          </span>
          <h3 className="font-headline-sm text-2xl text-white uppercase mb-2">
            LOGIN REQUIRED TO BUY PASSES
          </h3>
          <p className="font-body-md text-xs text-[#a5b4d4] leading-relaxed mb-6">
            Pass buying is only permitted after logging in with your Google account. Every festival pass, QR gate access token, and wristband voucher is strictly tied to your authenticated profile.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full bg-white hover:bg-slate-100 text-[#0b1229] py-3.5 font-headline-sm text-base uppercase font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <span>SIGN IN WITH GOOGLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-[#a5b4d4] hover:text-white"
            >
              Cancel and Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [step, setStep] = useState(1);
  const [passTiers, setPassTiers] = useState(getPassTiers());
  const [passTitle, setPassTitle] = useState(initialPassTitle);
  const [unitPrice, setUnitPrice] = useState(initialPrice);
  const [quantity, setQuantity] = useState(1);

  // Sync pass tiers from storage & reactive store
  useEffect(() => {
    setPassTiers(getPassTiers());
    const unsub = subscribeToStore(() => {
      setPassTiers(getPassTiers());
    });
    return unsub;
  }, []);

  // Sync when drawer opens or initial pass props change
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const tiers = getPassTiers();
      const matched = tiers.find(t => 
        t.name.toLowerCase() === (initialPassTitle || '').toLowerCase()
      );
      if (matched) {
        setPassTitle(matched.name);
        setUnitPrice(matched.price);
      } else if (initialPassTitle) {
        setPassTitle(initialPassTitle);
        setUnitPrice(initialPrice);
      } else if (tiers.length > 0) {
        setPassTitle(tiers[0].name);
        setUnitPrice(tiers[0].price);
      }
    }
  }, [isOpen, initialPassTitle, initialPrice]);

  const currentTier = passTiers.find(
    t => t.name.toLowerCase() === (passTitle || '').toLowerCase()
  );

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Payment proof & verification screenshot state
  const [screenshotData, setScreenshotData] = useState(null);
  const [screenshotFileName, setScreenshotFileName] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Attendee info
  const [formData, setFormData] = useState({
    name: currentUser ? currentUser.displayName : '',
    phone: '',
    email: currentUser ? currentUser.email : '',
    city: 'Hyderabad'
  });

  // Keep form synced if user logs in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || currentUser.displayName,
        email: currentUser.email
      }));
    }
  }, [currentUser]);

  // Image compression to prevent localStorage QuotaExceededError
  const compressImage = (file, maxWidth = 900, maxHeight = 900, quality = 0.72) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(event.target.result);
        img.src = event.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB. Please upload a smaller screenshot.');
      return;
    }
    setUploadError('');
    setScreenshotFileName(file.name);
    try {
      const compressed = await compressImage(file);
      setScreenshotData(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => setScreenshotData(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Dynamic Admin Payment Settings
  const [paymentSettings, setPaymentSettings] = useState(getPaymentSettings());

  useEffect(() => {
    setPaymentSettings(getPaymentSettings());
    const unsub = subscribeToStore(() => {
      setPaymentSettings(getPaymentSettings());
    });
    return unsub;
  }, []);

  const copyUpiId = () => {
    const upi = paymentSettings.upiId || 'dandiya2026@upi';
    navigator.clipboard?.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Calculations
  const subtotal = unitPrice * quantity;
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discount = Math.round((subtotal * appliedPromo.value) / 100);
    } else {
      discount = appliedPromo.value;
    }
  }
  const totalAmount = Math.max(0, subtotal - discount);

  const qrImageSrc = paymentSettings.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `upi://pay?pa=${paymentSettings.upiId || 'dandiya2026@upi'}&pn=${encodeURIComponent(
      paymentSettings.accountName || 'Dandiya Raat Official'
    )}&am=${totalAmount}&cu=INR`
  )}`;

  const handleDownloadPaymentQr = async () => {
    try {
      if (qrImageSrc.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = qrImageSrc;
        link.download = `Dandiya_Payment_QR_${(paymentSettings.upiId || 'UPI').replace('@', '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const res = await fetch(qrImageSrc);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Dandiya_Payment_QR_${(paymentSettings.upiId || 'UPI').replace('@', '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(qrImageSrc, '_blank');
    }
  };

  // Payment (Only QR)
  const [paymentMethod, setPaymentMethod] = useState('UPI_QR');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(PROMO_CODES[code]);
    } else {
      setPromoError('Invalid coupon. Try GARBA2026 or EARLYBIRD');
    }
  };

  const handleCompleteOrder = () => {
    if (!currentUser) {
      alert('Authentication required: You must log in with your Google account to complete pass purchase.');
      onOpenAuth();
      return;
    }

    if (!formData.name || !formData.phone) {
      alert('Please enter your Name and Mobile Number.');
      setStep(2);
      return;
    }

    if (!screenshotData) {
      setUploadError('Payment confirmation screenshot is required. Please upload the screenshot of your payment receipt before submitting.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      try {
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const newBooking = {
          id: `DND-HYD-${randomNum}`,
          ref: `#DND-HYD-${randomNum}`,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          tierId: passTitle.toLowerCase().replace(/\s+/g, '-'),
          passTitle: passTitle,
          holderName: formData.name || currentUser.displayName,
          phone: formData.phone,
          email: currentUser.email,
          city: formData.city,
          quantity: quantity,
          unitPrice: unitPrice,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          paymentStatus: 'PENDING_VERIFICATION',
          verificationStatus: 'PENDING',
          mailSent: false,
          paymentScreenshot: screenshotData,
          screenshotFileName: screenshotFileName || 'payment_receipt.png',
          utrNumber: utrNumber.trim() || 'NOT_PROVIDED',
          paymentId: `PAY-${paymentMethod}-${Date.now().toString(36).toUpperCase()}`,
          dandiyaPreference: 'Standard',
          addons: [],
          garbaCircle: 'Ras Kendra (Inner)',
          timeSlot: '5:00 PM Onwards',
          createdAt: new Date().toISOString(),
          checkedIn: false,
          checkedInAt: null,
          gate: 'Gate 02 - Turnstile A'
        };

        saveBooking(newBooking);

        try {
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        } catch (confettiErr) {
          console.warn('Confetti launch skipped:', confettiErr);
        }

        onClose();
        if (onBookingComplete) {
          onBookingComplete(newBooking);
        }
      } catch (err) {
        console.error('Booking submission error:', err);
        alert('Payment verification details submitted! Refreshing your passes.');
        onClose();
      } finally {
        setIsProcessing(false);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#0b1229] border-t-2 sm:border-2 border-[#2a3656] p-5 sm:p-6 max-h-[92vh] overflow-y-auto poster-shadow-light text-[#dce1ff] rounded-t-2xl sm:rounded-xl relative animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a3656] pb-3 mb-4">
          <div>
            <span className="font-label-stamp text-xs text-[#38bdf8] uppercase tracking-wider font-bold">
              STEP {step} OF 3
            </span>
            <h3 className="font-headline-sm text-2xl text-white uppercase">
              {step === 1 && `TICKET: ${passTitle}`}
              {step === 2 && 'ATTENDEE DETAILS'}
              {step === 3 && 'PAYMENT VERIFICATION'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#2a3656] text-[#dce1ff] hover:text-[#f6c86a] rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: QUANTITY & PASS INFO */}
        {step === 1 && (
          <div className="space-y-4">
            {/* PASS SELECTION DROPDOWN */}
            <div>
              <label className="font-label-ticket text-xs uppercase text-[#a5b4d4] block mb-1.5 font-bold flex items-center justify-between">
                <span>SELECT FESTIVAL PASS TYPE *</span>
                {currentTier?.badge && (
                  <span className="px-2 py-0.5 bg-[#1d4ed8]/40 border border-[#38bdf8] text-[#38bdf8] text-[9px] font-label-stamp uppercase font-bold rounded">
                    {currentTier.badge}
                  </span>
                )}
              </label>
              <div className="relative">
                <select
                  value={passTitle}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    setPassTitle(selectedName);
                    const matched = passTiers.find(t => t.name.toLowerCase() === selectedName.toLowerCase());
                    if (matched) {
                      setUnitPrice(matched.price);
                    }
                  }}
                  className="w-full bg-[#141a32] border-2 border-[#38bdf8]/60 hover:border-[#38bdf8] focus:border-[#f6c86a] p-3 text-sm text-white font-bold rounded-xl outline-none transition-colors appearance-none cursor-pointer pr-10 shadow-md"
                >
                  {passTiers.map((tier) => (
                    <option key={tier.id} value={tier.name} className="bg-[#0b1229] text-white py-2">
                      {tier.name} — ₹{tier.price}/- {tier.badge ? `(${tier.badge})` : ''}
                    </option>
                  ))}
                  {!passTiers.some(t => t.name.toLowerCase() === (passTitle || '').toLowerCase()) && (
                    <option value={passTitle} className="bg-[#0b1229] text-white py-2">
                      {passTitle} — ₹{unitPrice}/-
                    </option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#38bdf8]">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>

              {currentTier?.description && (
                <p className="text-[11px] text-[#a5b4d4] mt-1.5 leading-relaxed px-1">
                  {currentTier.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#141a32] border border-[#2a3656] rounded-xl">
              <div>
                <span className="font-label-ticket text-xs uppercase text-[#a5b4d4] block font-bold">UNIT TICKET PRICE</span>
                {currentTier?.originalPrice && currentTier.originalPrice > unitPrice && (
                  <span className="text-[11px] text-slate-400 line-through font-mono">
                    ₹{currentTier.originalPrice}/-
                  </span>
                )}
              </div>
              <span className="font-headline-sm text-2xl text-[#f6c86a]">₹{unitPrice}/-</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#141a32] border border-[#2a3656] rounded">
              <span className="font-label-ticket text-xs uppercase text-[#a5b4d4]">SELECT NUMBER OF PASSES</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 border border-[#2a3656] bg-[#0b1229] text-white font-bold hover:bg-[#181e36] rounded active:scale-95 text-lg"
                >
                  -
                </button>
                <span className="font-headline-sm text-2xl text-[#ffe8c0] w-7 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="w-9 h-9 border border-[#2a3656] bg-[#0b1229] text-white font-bold hover:bg-[#181e36] rounded active:scale-95 text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="p-3.5 bg-[#141a32] border border-[#2a3656] rounded space-y-2">
              <span className="font-label-ticket text-xs uppercase text-[#a5b4d4] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>HAVE A FESTIVAL PROMO CODE?</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. GARBA2026"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 bg-[#070d1e] border border-[#2a3656] px-3 py-1.5 text-xs text-white uppercase rounded focus:border-[#f6c86a]"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-label-stamp text-xs uppercase font-bold rounded"
                >
                  APPLY
                </button>
              </div>
              {appliedPromo && (
                <div className="text-xs text-[#38bdf8] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{appliedPromo.label} Applied! (-₹{discount})</span>
                </div>
              )}
              {promoError && (
                <div className="text-xs text-red-400">{promoError}</div>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 bg-[#060d24] border border-[#2a3656] rounded flex justify-between items-center">
              <div>
                <span className="font-label-ticket text-xs uppercase text-[#a5b4d4] block">ESTIMATED TOTAL</span>
                <span className="font-body-sm text-[11px] text-[#38bdf8]">Includes 100% Weather Refund Guarantee</span>
              </div>
              <span className="font-headline-sm text-3xl text-[#38bdf8]">
                ₹{totalAmount}/-
              </span>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-3.5 font-headline-sm text-xl uppercase tracking-wider poster-shadow-dark flex items-center justify-center gap-2 rounded transition-all active:translate-y-0.5"
            >
              <span>CONTINUE TO DETAILS</span>
              <ArrowRight className="w-5 h-5 text-[#f6c86a]" />
            </button>
          </div>
        )}

        {/* STEP 2: ATTENDEE DETAILS */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Account binding status banner */}
            <div className="p-3 bg-[#0a153d] border border-[#38bdf8]/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full border border-[#38bdf8]/60 object-cover" />
                <div>
                  <span className="font-label-stamp text-[10px] text-[#38bdf8] block font-bold">
                    OFFICIAL PASS BOUND TO ACCOUNT
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs block">{currentUser.email}</span>
                </div>
              </div>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold tracking-wider shrink-0">
                ✓ VERIFIED
              </span>
            </div>

            <div>
              <label className="font-label-ticket text-xs uppercase text-[#a5b4d4] block mb-1 font-bold">
                ATTENDEE FULL NAME *
              </label>
              <input
                type="text"
                required
                placeholder="Enter attendee full name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#070d1e] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-label-ticket text-xs uppercase text-[#a5b4d4] block mb-1 font-bold">
                  MOBILE NUMBER *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#070d1e] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] outline-none"
                />
              </div>
              <div>
                <label className="font-label-ticket text-xs uppercase text-[#a5b4d4] block mb-1 font-bold">
                  CITY
                </label>
                <input
                  type="text"
                  placeholder="Hyderabad"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#070d1e] border border-[#2a3656] p-2.5 text-sm text-white rounded-lg focus:border-[#38bdf8] outline-none"
                />
              </div>
            </div>

            {/* Quick Order Summary */}
            <div className="p-3 bg-[#060d24] border border-[#2a3656] rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-400">Total for {quantity}x {passTitle}:</span>
              <span className="font-headline-sm text-lg text-[#38bdf8] font-bold">₹{totalAmount}/-</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-[#141a32] hover:bg-[#1f284d] text-white py-3 font-headline-sm text-sm uppercase rounded-xl border border-[#2a3656] font-bold transition-colors"
              >
                BACK
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!formData.name.trim()) {
                    alert('Please enter your Full Name.');
                    return;
                  }
                  if (!formData.phone.trim()) {
                    alert('Please enter your Mobile Number.');
                    return;
                  }
                  setStep(3);
                }}
                className="w-2/3 bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-3 font-headline-sm text-sm uppercase poster-shadow-dark rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all shadow-lg active:scale-[0.99]"
              >
                <span>PROCEED TO PAYMENT</span>
                <ArrowRight className="w-4 h-4 text-[#f6c86a]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT GATEWAY SIMULATION */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#060d24] border border-[#2a3656] rounded flex justify-between items-center">
              <div>
                <span className="font-label-ticket text-xs uppercase text-[#a5b4d4] block">AMOUNT TO PAY</span>
                <span className="font-label-stamp text-xs text-[#ffe8c0]">{quantity}x {passTitle}</span>
              </div>
              <span className="font-headline-sm text-3xl text-[#f6c86a]">
                ₹{totalAmount}/-
              </span>
            </div>

            {/* ONLY QR CODE PAYMENT BANNER */}
            <div className="flex items-center justify-between p-3 bg-[#0a153d] border border-[#38bdf8]/50 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1d4ed8]/30 border border-[#38bdf8] flex items-center justify-center text-[#f6c86a] shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-label-ticket text-xs uppercase text-white font-bold block leading-none mb-1">
                    OFFICIAL PAYMENT METHOD: UPI QR
                  </span>
                  <span className="text-[10px] text-[#a5b4d4] block">
                    Scan with any UPI app & upload screenshot proof
                  </span>
                </div>
              </div>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold tracking-wider shrink-0">
                ONLY QR
              </span>
            </div>

            {/* Payment Display - UPI QR & Bank Transfer */}
            <div className="p-4 bg-[#141a32] border border-[#2a3656] rounded-xl flex flex-col items-center text-center space-y-3">
              <span className="font-label-stamp text-[11px] uppercase text-[#38bdf8] font-bold tracking-wider">
                STEP 1: SCAN & PAY VIA ANY UPI APP
              </span>
              <div className="p-3 bg-white rounded-xl border-2 border-[#1d4ed8] shadow-md flex items-center justify-center">
                <img
                  src={qrImageSrc}
                  alt="UPI Payment QR Code"
                  className="w-44 h-44 object-contain rounded"
                />
              </div>

              {/* DOWNLOAD QR BUTTON */}
              <button
                type="button"
                onClick={handleDownloadPaymentQr}
                className="w-full sm:w-auto px-4 py-2 bg-[#1d4ed8]/20 hover:bg-[#1d4ed8] text-[#38bdf8] hover:text-white border border-[#38bdf8]/50 rounded-lg text-xs font-label-stamp uppercase flex items-center justify-center gap-1.5 transition-all shadow active:scale-95 font-bold"
                title="Download QR code image to pay via phone gallery"
              >
                <Download className="w-3.5 h-3.5 text-[#f6c86a]" />
                <span>DOWNLOAD PAYMENT QR CODE</span>
              </button>

              <div className="flex items-center gap-2 bg-[#070d1e] border border-[#2a3656] px-3.5 py-1.5 rounded-lg shadow-inner">
                <span className="font-mono text-xs text-[#ffe8c0] font-bold">
                  {paymentSettings.upiId || 'dandiya2026@upi'}
                </span>
                <button
                  type="button"
                  onClick={copyUpiId}
                  className="p-1 hover:text-[#38bdf8] text-[#a5b4d4] transition-colors"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-[#a5b4d4]">
                Scan & pay via Google Pay, PhonePe, Paytm, BHIM, Cred or any UPI QR scanner
              </span>
            </div>

            {/* MANDATORY PAYMENT CONFIRMATION SCREENSHOT UPLOAD */}
            <div className="p-4 bg-[#0a1228] border-2 border-dashed border-[#38bdf8]/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-ticket text-xs uppercase text-[#ffe8c0] font-bold flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#38bdf8]" />
                  <span>STEP 2: UPLOAD PAYMENT SCREENSHOT *</span>
                </span>
                <span className="bg-red-950 text-red-300 border border-red-500/60 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                  REQUIRED
                </span>
              </div>

              {!screenshotData ? (
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#2a3656] hover:border-[#38bdf8] bg-[#070d1e] rounded-lg cursor-pointer transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-[#141a32] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Image className="w-6 h-6 text-[#38bdf8]" />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                    Click to select payment screenshot
                  </span>
                  <span className="text-[10px] text-[#a5b4d4] mt-0.5">
                    PNG, JPG, or WEBP (Max 8MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-3 bg-[#070d1e] border border-emerald-500/50 rounded-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={screenshotData}
                      alt="Payment Receipt Preview"
                      className="w-14 h-14 object-cover rounded-md border border-[#38bdf8]/60 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Screenshot Uploaded</span>
                      </div>
                      <span className="text-[10px] text-[#a5b4d4] truncate block">
                        {screenshotFileName || 'receipt.png'}
                      </span>
                    </div>
                  </div>
                  <label className="shrink-0 text-[11px] text-[#38bdf8] hover:text-white underline cursor-pointer">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* UTR / UPI Transaction Reference Number */}
              <div>
                <label className="font-label-ticket text-[10px] text-[#a5b4d4] uppercase block mb-1">
                  12-DIGIT UPI REFERENCE / UTR NO. (RECOMMENDED)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 428190382910 or Google Pay Txn ID"
                  value={utrNumber}
                  onChange={e => setUtrNumber(e.target.value)}
                  className="w-full bg-[#070d1e] border border-[#2a3656] p-2 text-xs text-white rounded font-mono focus:border-[#f6c86a]"
                />
              </div>
            </div>

            {/* Prominent Verification Notice Callout */}
            <div className="p-3.5 bg-[#0a153d] border border-[#f6c86a]/70 rounded-xl text-left space-y-1.5 shadow-md">
              <div className="flex items-center gap-1.5 text-[#f6c86a] font-label-stamp text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4 shrink-0" />
                <span>PAYMENT VERIFICATION & PASS DISPATCH</span>
              </div>
              <p className="text-xs text-[#dce1ff] leading-relaxed">
                We will verify your payment in the admin panel and your passes will be sent to your registered Google email (<strong>{currentUser.email}</strong>).
              </p>
              <span className="text-[10px] text-[#a5b4d4] block">
                Turnstile QR code and entry vouchers unlock once the organizer accounts desk validates your screenshot.
              </span>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-950/80 border border-red-500 rounded-lg text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 bg-[#141a32] hover:bg-[#1f284d] text-white py-3 font-headline-sm text-base uppercase rounded border border-[#2a3656]"
              >
                BACK
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompleteOrder}
                className="w-2/3 bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-3.5 font-headline-sm text-base uppercase poster-shadow-dark rounded flex items-center justify-center gap-2 active:translate-y-0.5 transition-all disabled:opacity-75"
              >
                {isProcessing ? (
                  <span>SUBMITTING VERIFICATION...</span>
                ) : (
                  <>
                    <span>SUBMIT PAYMENT & REQUEST PASS</span>
                    <ArrowRight className="w-4 h-4 text-[#f6c86a]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
