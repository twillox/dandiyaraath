import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Download,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  Sparkles,
  Ticket,
  Calendar,
  MapPin,
  Check
} from 'lucide-react';
import TicketQR from './TicketQR';
import { getFestivalContent } from '../lib/contentStore';
import { exportPassToPdf } from '../lib/pdfGenerator';

export default function DigitalPassModal({ booking, onClose }) {
  if (!booking) return null;

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const festivalLogo = getFestivalContent()?.hero?.logoUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAI00QCRrCHNCzAlVp_VDwHI08h9CQNITKgSW79HORvT2-eYnY3tZAnfm1BhASPONdVvjuxGKTPnIkFiJpsOSSWrIGWMPOS2CLzsEnLFmtgRKSHuZJcSziCZJ-n4Kr_GnOOoPtgz4kv-aoXkb6yP8Vm3yPvzEyNDIiK2puAYzCpz2XpeY1sAbyPlmRKSf9UfUdXXQEJLoeOdOak3ts0VWXPiGiUuJbo1JohJVulkU7hEl3hhhFENScMR55NsVGFQCkrQoI';

  const isPending = booking.paymentStatus === 'PENDING_VERIFICATION';
  const isCheckedIn = booking.checkedIn === true;

  const qrPayload = JSON.stringify({
    ref: booking.ref || booking.id,
    holder: booking.holderName,
    pass: booking.passTitle,
    qty: booking.quantity || 1,
    status: booking.paymentStatus,
    venue: 'Narapally Cricket Ground'
  });

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await exportPassToPdf(booking, booking.ref || booking.id, booking.holderName);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = isPending
      ? `⏳ My Dandiya Raat 2026 Pass Booking (${booking.ref}) is currently pending payment verification. Passes will be sent to my email upon admin approval!`
      : `🎟️ My Official Dandiya Raat 2026 Entry Pass!\nBooking Ref: ${booking.ref}\nTier: ${booking.passTitle}\nAttendee: ${booking.holderName}\nVenue: Narapally Cricket Ground, Hyderabad\nDate: 15 Oct 2026, 5 PM Onwards`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#070d1e] text-[#dce1ff] border-2 border-[#d4af37]/60 p-4 sm:p-5 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.2)] my-4 animate-fadeIn">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white border border-[#2a3656] hover:border-[#f6c86a] p-1.5 rounded-full transition-colors z-20 bg-[#0b1229]/80"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isPending ? (
          /* ================= PAYMENT PENDING / UNDER REVIEW VIEW ================= */
          <div className="text-center py-2 space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Clock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase font-headline-sm">
                Payment Under Review
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                We'll verify your payment and send your official entry pass to:
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141a32] border border-[#2a3656] rounded-lg text-xs font-mono text-[#38bdf8] font-semibold max-w-full">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{booking.email || booking.userEmail}</span>
              </div>
            </div>

            <div className="p-4 bg-[#0e1633] border border-[#2a3656] rounded-2xl text-left space-y-2.5 text-xs shadow-inner">
              <div className="flex justify-between items-center pb-2 border-b border-[#2a3656]/50">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">BOOKING REF</span>
                <span className="font-mono font-bold text-[#f6c86a] text-sm">{booking.ref || booking.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">ATTENDEE</span>
                <span className="font-bold text-white uppercase">{booking.holderName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">PASS TIER</span>
                <span className="text-white font-medium">{booking.passTitle} × {booking.quantity || 1}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#2a3656]/50">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">TOTAL AMOUNT</span>
                <span className="font-bold text-base text-white font-mono">₹{booking.totalAmount}/-</span>
              </div>
              {booking.paymentScreenshot && (
                <div className="flex items-center justify-between text-[11px] pt-1 text-emerald-400 font-mono">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Screenshot Uploaded
                  </span>
                  {booking.utrNumber && (
                    <span className="text-slate-400">UTR: {booking.utrNumber}</span>
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Once approved by admin, your verified royal pass and scannable turnstile QR will unlock here instantly.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-3 rounded-xl font-headline-sm text-sm uppercase tracking-wider font-bold transition-all shadow-lg active:scale-[0.99]"
            >
              GOT IT
            </button>
          </div>
        ) : (
          /* ================= ROYAL COLLECTIBLE FESTIVAL PASS ================= */
          <div className="space-y-3.5">
            {/* Downloadable / Printable Pass Container */}
            <div
              id="royal-festival-pass"
              className="relative bg-gradient-to-b from-[#0b1430] via-[#070d22] to-[#040816] text-[#dce1ff] rounded-2xl border-2 border-[#d4af37] p-4 sm:p-5 shadow-2xl overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(ellipse at top center, rgba(212,175,55,0.12) 0%, transparent 70%)'
              }}
            >
              {/* Left and Right Perforated Ticket Notches */}
              <div className="absolute top-[52%] -left-3.5 w-7 h-7 rounded-full bg-[#070d1e] border-r-2 border-[#d4af37] shadow-inner pointer-events-none"></div>
              <div className="absolute top-[52%] -right-3.5 w-7 h-7 rounded-full bg-[#070d1e] border-l-2 border-[#d4af37] shadow-inner pointer-events-none"></div>

              {/* 4 Corner Ornaments */}
              <div className="absolute top-2 left-2 text-[#f6c86a]/40 text-xs font-mono select-none">✦</div>
              <div className="absolute top-2 right-2 text-[#f6c86a]/40 text-xs font-mono select-none">✦</div>
              <div className="absolute bottom-2 left-2 text-[#f6c86a]/40 text-xs font-mono select-none">✦</div>
              <div className="absolute bottom-2 right-2 text-[#f6c86a]/40 text-xs font-mono select-none">✦</div>

              {/* Header: Royal Band & Logo */}
              <div className="text-center pb-3 border-b-2 border-dashed border-[#d4af37]/40 relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-gradient-to-r from-[#d4af37]/20 via-[#f6c86a]/30 to-[#d4af37]/20 border border-[#f6c86a]/60 rounded-full text-[9px] font-mono text-[#f6c86a] font-bold tracking-widest uppercase mb-2">
                  <Sparkles className="w-2.5 h-2.5 text-[#f6c86a]" />
                  <span>OFFICIAL ROYAL FESTIVAL PASS</span>
                  <Sparkles className="w-2.5 h-2.5 text-[#f6c86a]" />
                </div>

                <div className="flex items-center justify-center my-1.5">
                  <img
                    src={festivalLogo}
                    alt="Dandiya Raat Logo"
                    className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_2px_12px_rgba(246,200,106,0.3)]"
                  />
                </div>

                <p className="font-label-ticket text-[11px] text-[#38bdf8] uppercase font-bold tracking-wider mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-[#f6c86a]" />
                  <span>NARAPALLY CRICKET GROUND • HYDERABAD</span>
                </p>

                {/* Shimmering Holographic Security Ribbon */}
                <div
                  className="h-1.5 w-full mt-2.5 rounded-full border border-white/20"
                  style={{
                    background: 'linear-gradient(90deg, #38bdf8 0%, #ec4899 25%, #f6c86a 50%, #10b981 75%, #38bdf8 100%)',
                    backgroundSize: '200% 100%'
                  }}
                ></div>
              </div>

              {/* Attendee Details Grid */}
              <div className="grid grid-cols-2 gap-2.5 py-3 border-b-2 border-dashed border-[#d4af37]/40 text-left relative">
                <div>
                  <span className="font-label-stamp text-[9px] text-[#f6c86a] uppercase block tracking-wider font-bold">
                    PASS HOLDER
                  </span>
                  <span className="font-headline-sm text-sm sm:text-base font-bold uppercase text-white truncate block leading-tight mt-0.5">
                    {booking.holderName}
                  </span>
                </div>

                <div>
                  <span className="font-label-stamp text-[9px] text-[#f6c86a] uppercase block tracking-wider font-bold">
                    BOOKING REFERENCE
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold uppercase text-[#38bdf8] block tracking-wide mt-0.5">
                    {booking.ref || booking.id}
                  </span>
                </div>

                <div>
                  <span className="font-label-stamp text-[9px] text-[#f6c86a] uppercase block tracking-wider font-bold">
                    PASS TIER & ADMISSION
                  </span>
                  <span className="font-headline-sm text-xs sm:text-sm uppercase text-white block font-bold mt-0.5">
                    {booking.passTitle}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">
                    Admits: {booking.quantity || 1} Person{(booking.quantity || 1) > 1 ? 's' : ''}
                  </span>
                </div>

                <div>
                  <span className="font-label-stamp text-[9px] text-[#f6c86a] uppercase block tracking-wider font-bold">
                    TURNSTILE GATE & DATE
                  </span>
                  <span className="font-headline-sm text-xs sm:text-sm uppercase text-[#f6c86a] block font-bold mt-0.5">
                    {booking.gate || 'GATE 02'} • 5 PM
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">
                    15 October 2026
                  </span>
                </div>
              </div>

              {/* Turnstile Admission Stamp Banner */}
              <div className="py-2 flex items-center justify-between">
                {isCheckedIn ? (
                  <div className="w-full bg-red-950/70 border-2 border-red-600 rounded-xl p-2 text-center shadow-lg">
                    <span className="text-red-400 font-mono text-[11px] font-black uppercase tracking-widest block">
                      ⚠ ALREADY CHECKED IN / USED
                    </span>
                    <span className="text-[10px] text-red-200/90 font-mono block mt-0.5">
                      Admitted at: {booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleTimeString() : 'Turnstile'}
                    </span>
                  </div>
                ) : (
                  <div className="w-full bg-emerald-950/60 border border-emerald-500/70 rounded-xl p-2 flex items-center justify-between text-xs shadow">
                    <span className="text-emerald-300 font-label-stamp uppercase text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>OFFICIAL VERIFIED TICKET</span>
                    </span>
                    <span className="font-mono text-[9px] text-emerald-300 font-bold bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500/60">
                      ✓ READY FOR SCAN
                    </span>
                  </div>
                )}
              </div>

              {/* Scannable Dynamic Turnstile QR Code with Gold Corner Brackets */}
              <div className="pt-2 flex flex-col items-center justify-center">
                <div className="relative p-2.5 bg-white rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.15)] border-2 border-[#d4af37]">
                  {/* Corner accents inside QR card */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]"></div>
                  <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]"></div>
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]"></div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]"></div>

                  <TicketQR data={qrPayload} size={155} />
                </div>

                <span className="font-mono text-[9px] tracking-widest text-[#f6c86a] mt-2 font-bold uppercase">
                  TOKEN: {booking.id}-TURNSTILE
                </span>
              </div>

              {/* Security Barcode */}
              <div className="pt-2.5 flex flex-col items-center justify-center">
                <div className="w-full h-7 bg-[#0b1430] border border-[#2a3656] flex items-center justify-around px-2 text-[#dce1ff] font-mono text-[8px] tracking-widest rounded">
                  ||| | ||||| || |||| ||||| | || |||| | ||| ||||| ||
                </div>
                <span className="font-label-stamp text-[9px] text-slate-400 uppercase mt-1">
                  PRESENT THIS PASS ON PHONE OR PRINT AT TURNSTILES
                </span>
              </div>
            </div>

            {/* User Action Buttons: Download PDF, Print, Share */}
            <div className="space-y-2 pt-1">
              {/* Primary PDF Download Button */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="w-full bg-gradient-to-r from-[#d4af37] via-[#f6c86a] to-[#d4af37] hover:brightness-110 text-[#070d1e] py-3 px-4 rounded-xl font-headline-sm text-sm uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {downloadingPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#070d1e] border-t-transparent rounded-full animate-spin"></div>
                    <span>GENERATING HIGH-RES PDF...</span>
                  </>
                ) : pdfSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-900" />
                    <span>PDF DOWNLOADED SUCCESSFULLY!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD PASS AS PDF</span>
                  </>
                )}
              </button>

              {/* Secondary Action Row: Print & Share WhatsApp */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#141a32] border border-[#2a3656] hover:border-[#38bdf8] text-xs uppercase font-label-stamp font-bold text-white rounded-xl transition-colors shadow"
                >
                  <Printer className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>PRINT TICKET</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#0d3b24] hover:bg-[#124d2f] border border-emerald-600/70 text-emerald-200 hover:text-white text-xs uppercase font-label-stamp font-bold rounded-xl transition-colors shadow"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHARE PASS</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
