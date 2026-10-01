import React, { useState, useEffect } from 'react';
import { getLocalBookings, subscribeToStore } from '../lib/storage';
import { Ticket, ArrowRight, Share2, CheckCircle2, AlertCircle, Clock, Mail, LogIn, Plus, Download } from 'lucide-react';
import DigitalPassModal from '../components/DigitalPassModal';
import { exportPassToPdf } from '../lib/pdfGenerator';

export default function MyPassesPage({ onOpenBooking, currentUser, onOpenAuth }) {
  const [allBookings, setAllBookings] = useState([]);
  const [displayedBookings, setDisplayedBookings] = useState([]);
  const [selectedPassForModal, setSelectedPassForModal] = useState(null);

  const refreshPasses = () => {
    const list = getLocalBookings();
    setAllBookings(list);

    if (currentUser) {
      const userEmail = (currentUser.email || '').toLowerCase();
      const userUid = currentUser.uid;

      const userPasses = list.filter(b => {
        const bEmail = (b.userEmail || b.email || '').toLowerCase();
        const bUid = b.userId;
        return (bUid && bUid === userUid) || (userEmail && bEmail === userEmail);
      });

      // If user has personal passes, show only them; if newly registered with zero passes, empty state
      setDisplayedBookings(userPasses);
    } else {
      setDisplayedBookings([]);
    }
  };

  useEffect(() => {
    refreshPasses();
    const unsub = subscribeToStore(() => {
      refreshPasses();
    });
    return unsub;
  }, [currentUser]);

  return (
    <div className="min-h-[85vh] bg-[#070d1e] text-[#dce1ff] px-4 py-5 sm:p-8">
      <div className="max-w-xl mx-auto space-y-5">

        {/* Minimal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e294b]">
          <div>
            <h1 className="text-xl sm:text-2xl font-headline-sm uppercase text-white tracking-wide">
              MY PASSES
            </h1>
            {currentUser && (
              <p className="text-xs text-[#a5b4d4] truncate max-w-[220px] sm:max-w-sm mt-0.5">
                {currentUser.displayName || currentUser.email}
              </p>
            )}
          </div>

          {currentUser && (
            <button
              onClick={() => onOpenBooking('SINGLE PASS', 349)}
              className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs font-headline-sm uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold shadow transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>BOOK PASS</span>
            </button>
          )}
        </div>

        {/* Not Logged In State */}
        {!currentUser && (
          <div className="text-center py-10 px-5 rounded-2xl bg-[#0b1229] border border-[#2a3656] space-y-3.5">
            <div className="w-12 h-12 rounded-full bg-[#1d4ed8]/20 border border-[#38bdf8]/30 flex items-center justify-center mx-auto text-[#38bdf8]">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-headline-sm uppercase text-white">SIGN IN TO ACCESS TICKETS</h3>
              <p className="text-xs text-[#a5b4d4] max-w-xs mx-auto mt-1">
                Your booked tickets and entry QR codes are linked to your Google account.
              </p>
            </div>
            <button
              onClick={onOpenAuth}
              className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs font-headline-sm uppercase px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 shadow-lg"
            >
              <LogIn className="w-4 h-4" />
              <span>SIGN IN WITH GOOGLE</span>
            </button>
          </div>
        )}

        {/* Logged in with 0 Passes */}
        {currentUser && displayedBookings.length === 0 && (
          <div className="text-center py-10 px-5 rounded-2xl bg-[#0b1229] border border-[#2a3656] space-y-3.5">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-headline-sm uppercase text-white">NO PASSES YET</h3>
              <p className="text-xs text-[#a5b4d4] max-w-xs mx-auto mt-1">
                You haven't booked any festival passes under this account yet.
              </p>
            </div>
            <button
              onClick={() => onOpenBooking('SINGLE PASS', 349)}
              className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs font-headline-sm uppercase px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-1.5 shadow-lg"
            >
              <span>EXPLORE & BOOK PASSES</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Logged In with Passes List */}
        {currentUser && displayedBookings.length > 0 && (
          <div className="space-y-3.5">
            {displayedBookings.map((b) => {
              const isPending = b.paymentStatus === 'PENDING_VERIFICATION';

              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border transition-all overflow-hidden shadow-lg ${
                    isPending
                      ? 'bg-gradient-to-b from-[#111833] to-[#090e21] border-amber-500/40'
                      : 'bg-gradient-to-b from-[#131d3d] to-[#0a1024] border-[#2a3656]'
                  }`}
                >
                  {/* Card Top Row: Tier badge + Status Pill */}
                  <div className="p-4 pb-2.5 flex items-center justify-between border-b border-[#2a3656]/40">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#1d4ed8] text-white text-[10px] font-label-stamp uppercase font-bold px-2 py-0.5 rounded">
                        {b.passTitle} {b.quantity > 1 ? `× ${b.quantity}` : ''}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#f6c86a]">
                        {b.ref || b.id}
                      </span>
                    </div>

                    <div>
                      {isPending ? (
                        <span className="bg-amber-950/80 text-amber-300 border border-amber-500/60 px-2 py-0.5 text-[10px] font-label-stamp uppercase font-bold rounded-full flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-amber-400" />
                          <span>IN REVIEW</span>
                        </span>
                      ) : b.checkedIn ? (
                        <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 text-[10px] font-label-stamp uppercase font-bold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>ADMITTED</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 text-[10px] font-label-stamp uppercase font-bold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>VERIFIED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Attendee Name & Key Info */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-label-stamp block">ATTENDEE</span>
                      <h3 className="text-base sm:text-lg font-headline-sm uppercase text-white font-bold leading-tight">
                        {b.holderName}
                      </h3>
                    </div>

                    {/* Concise 3-column metadata */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2a3656]/30 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-label-stamp block">GATE</span>
                        <span className="font-medium text-white truncate block">{b.gate || 'Gate 02'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-label-stamp block">PASSES</span>
                        <span className="font-medium text-white truncate block">{b.quantity || 1} {b.quantity > 1 ? 'Passes' : 'Pass'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-label-stamp block">AMOUNT</span>
                        <span className="font-bold text-white font-mono">₹{b.totalAmount}/-</span>
                      </div>
                    </div>

                    {/* Short reassurance notice for pending status */}
                    {isPending && (
                      <div className="p-2 bg-amber-950/20 border border-amber-500/25 rounded-lg flex items-center gap-2 text-left">
                        <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="text-[10px] text-amber-200/90 leading-tight">
                          Verification in progress. Pass will be emailed to {b.email || b.userEmail}.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPassForModal(b)}
                      className="flex-1 bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-2 px-3 text-xs uppercase font-label-stamp font-bold rounded-lg flex items-center justify-center gap-1.5 shadow transition-all active:scale-[0.99]"
                    >
                      <Ticket className="w-3.5 h-3.5 text-[#f6c86a]" />
                      <span>{isPending ? 'VIEW PASS DETAILS' : 'VIEW TICKET & QR'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {!isPending && (
                      <button
                        onClick={() => exportPassToPdf(b)}
                        className="p-2 bg-[#141a32] border border-[#2a3656] hover:border-[#f6c86a] text-[#f6c86a] hover:text-white rounded-lg transition-colors shrink-0"
                        title="Download Pass as PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const text = `🎟️ Dandiya Raat 2026 Ticket\nHolder: ${b.holderName}\nRef: ${b.ref || b.id}\nTier: ${b.passTitle}\nVenue: Narapally Cricket Ground`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="p-2 bg-[#0b1229] border border-[#2a3656] hover:border-emerald-500 text-emerald-400 rounded-lg transition-colors shrink-0"
                      title="Share Pass on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {selectedPassForModal && (
        <DigitalPassModal
          booking={selectedPassForModal}
          onClose={() => setSelectedPassForModal(null)}
        />
      )}
    </div>
  );
}
