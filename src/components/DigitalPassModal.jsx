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
  Check,
  MapPin,
  Calendar,
  AlertTriangle,
  XCircle
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
  const isRejected = booking.paymentStatus === 'REJECTED';
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
    if (isRejected) {
      alert('This booking has been rejected. Entry pass cannot be downloaded.');
      return;
    }
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
    if (isRejected) {
      alert('Rejected passes cannot be printed.');
      return;
    }
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = isRejected
      ? `⚠️ My Dandiya Raat booking (${booking.ref || booking.id}) was marked as REJECTED.`
      : isPending
      ? `⏳ My Dandiya Raat 2026 Pass Booking (${booking.ref}) is currently pending payment verification. Passes will be sent to my email upon admin approval!`
      : `🎟️ My Official Dandiya Raat 2026 Entry Pass!\nBooking Ref: ${booking.ref}\nTier: ${booking.passTitle}\nAttendee: ${booking.holderName}\nVenue: Narapally Cricket Ground, Hyderabad\nDate: 15 Oct 2026, 5 PM Onwards`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0b1229] border border-[#2a3656] text-[#dce1ff] p-4 sm:p-5 rounded-2xl shadow-2xl my-4 animate-fadeIn">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white border border-[#2a3656] hover:border-[#f6c86a] p-1.5 rounded-lg transition-colors z-20"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isRejected ? (
          /* ================= PAYMENT REJECTED / VOID VIEW ================= */
          <div className="text-center py-2 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-red-500/15 border-2 border-red-500/60 flex items-center justify-center mx-auto text-red-500 shadow-lg">
              <XCircle className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-block bg-red-950 text-red-300 border border-red-500/80 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                ⛔ PAYMENT REJECTED • PASS VOID
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase font-headline-sm">
                Pass Not Approved
              </h3>
              <p className="text-xs text-red-300 mt-1 leading-relaxed">
                This booking has been rejected by the festival administrator. The turnstile entry pass and QR code have been revoked.
              </p>
            </div>

            <div className="p-4 bg-[#140b0e] border border-red-900/60 rounded-xl text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-red-900/40">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">BOOKING REF</span>
                <span className="font-mono font-bold text-red-400 text-sm">{booking.ref || booking.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">ATTENDEE</span>
                <span className="font-bold text-white uppercase">{booking.holderName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">PASS TIER</span>
                <span className="text-white font-medium">{booking.passTitle} × {booking.quantity || 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">TOTAL AMOUNT</span>
                <span className="font-bold text-white font-mono">₹{booking.totalAmount}/-</span>
              </div>
              <div className="pt-2 border-t border-red-900/40">
                <span className="text-red-400 font-label-stamp uppercase text-[10px] block font-bold">REASON</span>
                <span className="text-xs text-red-200 mt-0.5 block leading-snug">
                  {booking.adminNotes || 'Payment receipt/UTR could not be verified against festival bank records.'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-[11px] text-red-300/90 text-left">
              ⛔ <strong>Notice:</strong> Turnstiles at Narapally Cricket Ground will strictly reject this reference. No physical wristband will be issued.
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#141a32] hover:bg-[#1a2342] text-white py-2.5 rounded-xl font-headline-sm text-xs uppercase tracking-wider font-bold transition-all border border-[#2a3656]"
              >
                CLOSE
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = `Hi Dandiya Raat Support, my booking ref ${booking.ref || booking.id} for ${booking.holderName} was marked rejected. Can you please review my transaction receipt?`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-headline-sm text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <span>CONTACT SUPPORT</span>
              </button>
            </div>
          </div>
        ) : isPending ? (
          /* ================= PAYMENT PENDING / UNDER REVIEW VIEW ================= */
          <div className="text-center py-2 space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow">
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

            <div className="p-4 bg-[#141a32] border border-[#2a3656] rounded-xl text-left space-y-2 text-xs">
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
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              The official original pass will also be sent to your registered email upon approval.
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
          /* ================= BASIC WHITE THEMED PASS (AS REQUESTED) ================= */
          <div className="space-y-3.5">
            {/* Clean White Card Pass */}
            <div
              id="printable-pass"
              className="bg-white text-[#0b1229] rounded-2xl p-4 sm:p-5 border-2 border-slate-200 shadow-xl"
            >
              {/* Header Banner */}
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                <span className="bg-[#1d4ed8] text-white px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-widest rounded inline-block mb-2">
                  OFFICIAL DIGITAL ENTRY VOUCHER • VERIFIED
                </span>

                <div className="flex items-center justify-center my-1.5">
                  {festivalLogo ? (
                    <img
                      src={festivalLogo}
                      alt="Dandiya Raat Logo"
                      className="h-12 sm:h-14 w-auto object-contain"
                    />
                  ) : (
                    <div className="text-2xl font-bold uppercase tracking-wider text-[#0b1229]">
                      DANDIYA <span className="text-[#f6c86a]">रात</span> 2026
                    </div>
                  )}
                </div>

                <p className="font-label-ticket text-xs text-[#1d4ed8] uppercase font-bold tracking-wide mt-1">
                  NARAPALLY CRICKET GROUND • HYDERABAD
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  15 OCTOBER 2026 • 5:00 PM ONWARDS • SINGLE MAIN ENTRANCE
                </p>
              </div>

              {/* Notice that Original Pass is Sent to Email */}
              <div className="my-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <p className="text-[11px] text-blue-900 font-medium leading-snug">
                  📌 <strong>Note:</strong> This is your digital entry pass for gate turnstile scanning. The official original pass with wristband coupons has also been sent to your registered email.
                </p>
                {(booking.email || booking.userEmail) && (
                  <p className="text-[10px] text-blue-700 font-mono mt-0.5 font-bold">
                    Sent to: {booking.email || booking.userEmail}
                  </p>
                )}
              </div>

              {/* Attendee Details Grid (2 Columns, NO gate references!) */}
              <div className="grid grid-cols-2 gap-3 py-2.5 border-t border-b border-dashed border-slate-300 text-left text-xs">
                <div>
                  <span className="font-label-stamp text-[10px] text-slate-500 uppercase block font-bold">
                    PASS HOLDER
                  </span>
                  <span className="font-headline-sm text-sm sm:text-base font-bold uppercase text-[#0b1229] truncate block mt-0.5">
                    {booking.holderName}
                  </span>
                </div>

                <div>
                  <span className="font-label-stamp text-[10px] text-slate-500 uppercase block font-bold">
                    BOOKING REFERENCE
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold uppercase text-[#1d4ed8] block mt-0.5">
                    {booking.ref || booking.id}
                  </span>
                </div>

                <div>
                  <span className="font-label-stamp text-[10px] text-slate-500 uppercase block font-bold">
                    PASS TIER
                  </span>
                  <span className="font-headline-sm text-xs sm:text-sm uppercase text-[#0b1229] block font-bold mt-0.5">
                    {booking.passTitle}
                  </span>
                </div>

                <div>
                  <span className="font-label-stamp text-[10px] text-slate-500 uppercase block font-bold">
                    ADMISSION COUNT
                  </span>
                  <span className="font-headline-sm text-xs sm:text-sm uppercase text-[#1d4ed8] block font-bold mt-0.5">
                    {booking.quantity || 1} PERSON{(booking.quantity || 1) > 1 ? 'S' : ''}
                  </span>
                </div>
              </div>

              {/* Entry Status */}
              <div className="py-2.5 flex items-center justify-between text-xs">
                {isCheckedIn ? (
                  <div className="w-full bg-red-50 border border-red-300 rounded-lg p-2 text-center text-red-700 font-mono font-bold text-xs">
                    ⚠ ALREADY CHECKED IN • ADMITTED
                  </div>
                ) : (
                  <div className="w-full bg-emerald-50 border border-emerald-300 rounded-lg p-1.5 flex items-center justify-between text-emerald-800 text-[11px] font-bold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>VERIFIED FESTIVAL PASS</span>
                    </span>
                    <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono text-[10px]">
                      READY FOR SCAN
                    </span>
                  </div>
                )}
              </div>

              {/* Large Scannable Turnstile QR Code (Guaranteed Base64 image, NO barcode!) */}
              <div className="pt-2 flex flex-col items-center justify-center">
                <TicketQR data={qrPayload} size={165} darkColor="#0b1229" lightColor="#ffffff" />
                <span className="font-mono text-[10px] tracking-widest text-[#0b1229] mt-2 font-bold uppercase">
                  TOKEN: {booking.ref || booking.id}-TURNSTILE
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wide">
                  SCAN THIS QR CODE AT ENTRY TURNSTILES UPON ARRIVAL
                </span>
              </div>
            </div>

            {/* Action Buttons: Download PDF, Print, Share */}
            <div className="space-y-2 pt-1">
              {/* Primary PDF Download Button */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="w-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-3 px-4 rounded-xl font-headline-sm text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-75"
              >
                {downloadingPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>CREATING YOUR PDF PASS...</span>
                  </>
                ) : pdfSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>PDF DOWNLOADED SUCCESSFULLY!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#f6c86a]" />
                    <span>DOWNLOAD PASS AS PDF</span>
                  </>
                )}
              </button>

              {/* Print & Share WhatsApp */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#141a32] border border-[#2a3656] hover:border-[#38bdf8] text-xs uppercase font-label-stamp font-bold text-white rounded-xl transition-colors shadow"
                >
                  <Printer className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>PRINT PASS</span>
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
