import React from 'react';
import { MapPin, Phone, ShieldCheck, Ticket } from 'lucide-react';
import { getFestivalContent } from '../lib/contentStore';

export default function Footer({ onNavigate, onOpenBooking, onOpenStallRegistration }) {
  const festivalLogo = getFestivalContent()?.hero?.logoUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAI00QCRrCHNCzAlVp_VDwHI08h9CQNITKgSW79HORvT2-eYnY3tZAnfm1BhASPONdVvjuxGKTPnIkFiJpsOSSWrIGWMPOS2CLzsEnLFmtgRKSHuZJcSziCZJ-n4Kr_GnOOoPtgz4kv-aoXkb6yP8Vm3yPvzEyNDIiK2puAYzCpz2XpeY1sAbyPlmRKSf9UfUdXXQEJLoeOdOak3ts0VWXPiGiUuJbo1JohJVulkU7hEl3hhhFENScMR55NsVGFQCkrQoI';

  return (
    <footer className="bg-[#060d24] text-on-surface p-6 sm:p-12 border-t border-[#1e294b]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-baseline justify-between gap-6">
        <div>
          {/* Festival Logo in Footer */}
          <div className="mb-3">
            {festivalLogo ? (
              <img
                src={festivalLogo}
                alt="Dandiya Raat Logo"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            ) : (
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-['Syne',sans-serif] font-black text-2xl tracking-wider text-[#ffe8c0]">DANDIYA</span>
                <span className="font-['Rozha_One',serif] text-2xl text-[#f6c86a] leading-none">रात</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-[#2a3656] text-[#a5b4d4] rounded">2026</span>
              </div>
            )}
          </div>
          <p className="font-body-sm text-xs sm:text-sm text-[#a5b4d4] font-medium">Narapally Cricket Ground</p>
          <p className="text-xs text-[#a5b4d4]/70">Korremula Rd, Chowdhariguda, Hyderabad, Telangana 500088</p>
        </div>

        <div className="flex flex-wrap items-center gap-5 font-label-ticket text-xs text-[#a5b4d4] uppercase">
          <button onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-[#f6c86a]">
            HOME
          </button>
          <button onClick={() => onNavigate('passes')} className="hover:text-[#f6c86a]">
            PASSES
          </button>
          <button onClick={() => onNavigate('schedule')} className="hover:text-[#f6c86a]">
            SCHEDULE
          </button>
          <button onClick={() => onNavigate('my-passes')} className="hover:text-[#f6c86a]">
            MY WALLET
          </button>
          {onOpenStallRegistration && (
            <button
              onClick={onOpenStallRegistration}
              className="text-[#f6c86a] hover:text-white font-bold flex items-center gap-1 border border-[#f6c86a]/40 bg-[#f6c86a]/10 px-2.5 py-1 rounded"
            >
              🎪 STALL REGISTRATION
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-[#1e294b]/60 flex flex-col sm:flex-row justify-between text-[#a5b4d4] font-label-stamp text-[10px] uppercase gap-2">
        <span>COPYRIGHT © 2026 DANDIYA RAAT. ALL RIGHTS RESERVED.</span>
        <span>BOUTIQUE INDIE FOLK FESTIVAL • HYDERABAD</span>
      </div>
    </footer>
  );
}
