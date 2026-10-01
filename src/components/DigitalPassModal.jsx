import React, { useState } from 'react';
import { X, Printer, Share2, ArrowRight, Clock, ShieldCheck, CheckCircle2, Lock, Image, Mail } from 'lucide-react';
import TicketQR from './TicketQR';
import { getFestivalContent } from '../lib/contentStore';

export default function DigitalPassModal({ booking, onClose, onNavigateToWallet }) {
  if (!booking) return null;

  const festivalLogo = getFestivalContent()?.hero?.logoUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAI00QCRrCHNCzAlVp_VDwHI08h9CQNITKgSW79HORvT2-eYnY3tZAnfm1BhASPONdVvjuxGKTPnIkFiJpsOSSWrIGWMPOS2CLzsEnLFmtgRKSHuZJcSziCZJ-n4Kr_GnOOoPtgz4kv-aoXkb6yP8Vm3yPvzEyNDIiK2puAYzCpz2XpeY1sAbyPlmRKSf9UfUdXXQEJLoeOdOak3ts0VWXPiGiUuJbo1JohJVulkU7hEl3hhhFENScMR55NsVGFQCkrQoI';

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferPhone, setTransferPhone] = useState('');
  const [transferredSuccess, setTransferredSuccess] = useState(false);

  const isPending = booking.paymentStatus === 'PENDING_VERIFICATION';

  const qrPayload = JSON.stringify({
    ref: booking.ref || booking.id,
    holder: booking.holderName,
    pass: booking.passTitle,
    qty: booking.quantity,
    status: booking.paymentStatus,
    venue: 'Narapally Cricket Ground'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = isPending
      ? `⏳ My Dandiya Raat 2026 Pass Booking (${booking.ref}) is currently pending payment verification. Passes will be sent to my email upon admin approval!`
      : `🎟️ My Official Dandiya Raat 2026 Entry Pass!\nBooking Ref: ${booking.ref}\nTier: ${booking.passTitle}\nAttendee: ${booking.holderName}\nVenue: Narapally Cricket Ground, Hyderabad\nDate: 15 Oct 2026, 5 PM Onwards`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!transferPhone) return;
    setTransferredSuccess(true);
    setTimeout(() => {
      setTransferOpen(false);
      setTransferredSuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0b1229] text-[#dce1ff] border-2 border-[#2a3656] p-5 sm:p-6 poster-shadow-dark rounded-2xl my-4 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-[#a5b4d4] hover:text-white border border-[#2a3656] hover:border-[#f6c86a] p-1.5 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isPending ? (
          /* ================= CLEAN & STREAMLINED VERIFICATION VIEW ================= */
          <div className="text-center py-2 space-y-4">
            {/* Minimal Icon */}
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Clock className="w-7 h-7" />
            </div>

            {/* Headline & Core Message */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Payment Under Review
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                We'll verify your payment and send your pass to:
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141a32] border border-[#2a3656] rounded-lg text-xs font-mono text-[#38bdf8] font-semibold max-w-full">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{booking.email || booking.userEmail}</span>
              </div>
            </div>

            {/* Single Clean Summary Card */}
            <div className="p-4 bg-[#141a32]/70 border border-[#2a3656] rounded-xl text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#2a3656]/50">
                <span className="text-slate-400">Booking Ref</span>
                <span className="font-mono font-bold text-[#f6c86a]">{booking.ref || booking.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Attendee</span>
                <span className="font-medium text-white">{booking.holderName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pass</span>
                <span className="text-white font-medium">{booking.passTitle} × {booking.quantity || 1}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#2a3656]/50">
                <span className="text-slate-400">Amount</span>
                <span className="font-bold text-sm text-white font-mono">₹{booking.totalAmount}/-</span>
              </div>
              {booking.paymentScreenshot && (
                <div className="flex items-center justify-between text-[11px] pt-1 text-emerald-400 font-mono">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Screenshot Attached
                  </span>
                  {booking.utrNumber && (
                    <span className="text-slate-400">UTR: {booking.utrNumber}</span>
                  )}
                </div>
              )}
            </div>

            {/* Short note */}
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your turnstile QR ticket will unlock here and be emailed once approved by the organizer.
            </p>

            {/* Primary Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-3 rounded-xl font-headline-sm text-sm uppercase tracking-wider font-bold transition-all shadow-lg active:scale-[0.99]"
              >
                GOT IT
              </button>
            </div>
          </div>
        ) : (
          /* ================= VERIFIED ACTIVE PASS VIEW ================= */
          <div id="printable-pass" className="text-[#0b1229] bg-[#F0F4FA] p-4 rounded-xl">
            {/* Header */}
            <div className="border-b-2 border-dashed border-[#0b1229] pb-4 mb-4 text-center">
              <span className="bg-[#1d4ed8] text-white px-3 py-0.5 font-label-stamp text-xs uppercase tracking-widest rounded">
                OFFICIAL ENTRY VOUCHER • VERIFIED
              </span>
              <div className="flex items-center justify-center my-3">
                {festivalLogo ? (
                  <img
                    src={festivalLogo}
                    alt="Dandiya Raat Logo"
                    className="h-14 sm:h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="flex items-baseline justify-center gap-2 whitespace-nowrap">
                    <span className="font-['Syne',sans-serif] font-black text-2xl uppercase text-[#0b1229]">DANDIYA</span>
                    <span className="font-['Rozha_One'] text-2xl text-[#f6c86a]">रात</span>
                    <span className="text-xs uppercase font-mono border border-[#0b1229] px-1.5 py-0.5 rounded font-bold">2026</span>
                  </div>
                )}
              </div>
              <p className="font-label-ticket text-xs text-[#1e3a8a] uppercase mt-0.5 font-bold">
                NARAPALLY CRICKET GROUND • HYDERABAD '26
              </p>
              <div className="hologram-strip h-2 w-full mt-2.5 rounded-full border border-[#0b1229]/20"></div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 py-2 border-b border-[#0b1229] text-left">
              <div>
                <span className="font-label-stamp text-[10px] text-[#475569] uppercase block">HOLDER</span>
                <span className="font-title-editorial text-sm font-bold uppercase text-[#0b1229] truncate block">
                  {booking.holderName}
                </span>
              </div>
              <div>
                <span className="font-label-stamp text-[10px] text-[#475569] uppercase block">BOOKING REF</span>
                <span className="font-mono text-xs font-bold uppercase text-[#1d4ed8]">
                  {booking.ref || booking.id}
                </span>
              </div>
              <div>
                <span className="font-label-stamp text-[10px] text-[#475569] uppercase block">PASS TIER & QTY</span>
                <span className="font-headline-sm text-base uppercase text-[#0b1229]">
                  {booking.passTitle} (x{booking.quantity || 1})
                </span>
              </div>
              <div>
                <span className="font-label-stamp text-[10px] text-[#475569] uppercase block">GATE & TIMING</span>
                <span className="font-headline-sm text-base uppercase text-[#1d4ed8]">
                  {booking.gate || 'GATE 02'} • 5 PM
                </span>
              </div>
            </div>

            {/* Entry Status */}
            <div className="py-2.5 border-b border-dashed border-[#0b1229] text-xs flex justify-between items-center">
              <span className="text-[#475569]">Entry Status: <strong className="text-emerald-700 font-bold">VERIFIED TICKET</strong></span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-500 rounded">
                ✓ EMAIL DISPATCHED
              </span>
            </div>

            {/* Scannable Dynamic QR Code */}
            <div className="pt-4 flex flex-col items-center justify-center">
              <TicketQR data={qrPayload} size={150} />
              <span className="font-mono text-[10px] tracking-widest text-[#0b1229] mt-2 font-bold">
                TOKEN: {booking.id}-SECURE-TOKEN
              </span>
            </div>

            {/* Barcode */}
            <div className="pt-3 flex flex-col items-center justify-center">
              <div className="w-full h-8 bg-[#0b1229] flex items-center justify-around px-2 text-[#dce1ff] font-mono text-[8px] tracking-widest rounded-sm">
                ||| | ||||| || |||| ||||| | || |||| | ||| ||||| ||
              </div>
              <span className="font-label-stamp text-[9px] text-[#1d4ed8] uppercase font-bold mt-1.5">
                SCAN QR AT ENTRY TURNSTILES UPON ARRIVAL
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 pt-3 border-t-2 border-[#0b1229] grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-white border border-[#0b1229] text-xs uppercase font-label-stamp font-bold hover:bg-slate-100 rounded"
              >
                <Printer className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span>PRINT TICKET</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-emerald-600 text-white border border-[#0b1229] text-xs uppercase font-label-stamp font-bold hover:bg-emerald-700 rounded"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SHARE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
