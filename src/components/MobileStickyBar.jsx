import React from 'react';
import { ArrowRight, Ticket, Lock } from 'lucide-react';

export default function MobileStickyBar({ onOpenBooking, currentUser }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-[#0a1026] text-[#dce1ff] border-t-2 border-[#2563eb] px-4 py-2.5 flex items-center justify-between shadow-2xl backdrop-blur-md">
      <div>
        <span className="font-label-stamp text-[10px] uppercase block text-[#38bdf8] font-bold">
          {currentUser ? 'AUTHENTICATED • READY' : 'LOGIN TO PURCHASE'}
        </span>
        <span className="font-headline-sm text-lg uppercase text-white font-bold">
          FROM ₹199/-
        </span>
      </div>
      <button
        onClick={() => onOpenBooking('KIDS PASS', 199)}
        className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-headline-sm text-xs sm:text-sm uppercase px-4 sm:px-5 py-2.5 border border-[#38bdf8]/60 poster-shadow-dark active:translate-y-0.5 transition-transform flex items-center gap-1.5 rounded"
      >
        {!currentUser ? (
          <>
            <Lock className="w-3.5 h-3.5 text-[#f6c86a]" />
            <span>LOGIN TO BOOK</span>
          </>
        ) : (
          <>
            <Ticket className="w-3.5 h-3.5 text-[#f6c86a]" />
            <span>BOOK PASS</span>
          </>
        )}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
