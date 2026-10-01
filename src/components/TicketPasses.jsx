import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, Check, ArrowRight, ChevronLeft, ChevronRight, Ticket, Lock, UserCheck } from 'lucide-react';
import { INITIAL_PASS_TIERS, getPassTiers, subscribeToStore } from '../lib/storage';
import { getFestivalContent } from '../lib/contentStore';

export default function TicketPasses({ onSelectPass, passesData, weatherData, currentUser, showHeading = true }) {
  const [filter, setFilter] = useState('all');
  const scrollRef = useRef(null);

  const [passes, setPasses] = useState(passesData || getPassTiers());

  useEffect(() => {
    if (!passesData) {
      setPasses(getPassTiers());
      const unsub = subscribeToStore(() => {
        setPasses(getPassTiers());
      });
      return unsub;
    }
  }, [passesData]);

  const weather = weatherData || getFestivalContent().weather;

  const filteredPasses = filter === 'all'
    ? passes
    : passes.filter(p => p.category === filter);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleFilterClick = (filterId) => {
    setFilter(filterId);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#F0F4FA] text-[#0b1229] p-4 sm:p-12 border-b border-[#0b1229] overflow-hidden" id="passes">
      <div className="max-w-6xl mx-auto">
        {/* Compact Guarantee & Auth Status Bar */}
        <div className="mb-5 p-3 bg-[#0b1229] border border-[#2a3656] text-[#dce1ff] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <CloudRain className="w-4 h-4 text-[#f6c86a] shrink-0" />
            <span className="text-xs text-[#ffe8c0] font-medium">
              100% Weather Refund Guarantee if rain occurs
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!currentUser ? (
              <span className="text-[11px] text-[#38bdf8] font-mono">
                🔒 Sign in to purchase & save tickets
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                ✓ Ready to book as {currentUser.displayName?.split(' ')[0] || currentUser.email}
              </span>
            )}
          </div>
        </div>

        {/* Section Header with Horizontal Scroll Controls */}
        {showHeading && (
          <div className="flex items-center justify-between border-b-2 border-[#0b1229] pb-3 mb-4 gap-2">
            <div>
              <h2 className="text-2xl sm:text-4xl font-headline-lg uppercase text-[#0b1229] leading-none">
                FESTIVAL PASSES
              </h2>
            </div>

            {/* Slide Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-1.5 border border-[#0b1229] bg-white text-[#0b1229] hover:bg-[#1d4ed8] hover:text-white rounded transition-all active:scale-95 shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-1.5 border border-[#0b1229] bg-white text-[#0b1229] hover:bg-[#1d4ed8] hover:text-white rounded transition-all active:scale-95 shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filter Pills - Smooth Horizontal Scroll on Mobile */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
            {[
              { id: 'all', label: 'ALL PASSES' },
              { id: 'individual', label: 'SOLO & VIP' },
              { id: 'group', label: 'COUPLE' },
              { id: 'squad', label: 'SQUAD (4 & 6)' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => handleFilterClick(btn.id)}
                className={`whitespace-nowrap px-3 py-1.5 font-label-stamp text-xs uppercase tracking-wider rounded border transition-all shrink-0 ${
                  filter === btn.id
                    ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] font-bold'
                    : 'bg-white text-[#0b1229] border-[#0b1229] hover:bg-slate-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {!showHeading && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => scroll('left')}
                className="p-1.5 border border-[#0b1229] bg-white text-[#0b1229] hover:bg-[#1d4ed8] hover:text-white rounded transition-all active:scale-95 shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-1.5 border border-[#0b1229] bg-white text-[#0b1229] hover:bg-[#1d4ed8] hover:text-white rounded transition-all active:scale-95 shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* SIDE-SCROLLING HORIZONTAL SLIDING PASSES SECTION */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 sm:gap-5 pb-6 pt-1 px-1"
        >
          {filteredPasses.map((pass) => {
            const isDark = (pass.id || '').includes('vip');
            return (
              <div
                key={pass.id}
                onClick={() => onSelectPass(pass.name, pass.price)}
                className={`carousel-item shrink-0 w-[84vw] sm:w-[320px] md:w-[340px] snap-start flex flex-col justify-between p-5 border-2 border-[#0b1229] rounded-xl poster-shadow-dark cursor-pointer transition-all hover:-translate-y-1 hover:border-[#1d4ed8] group ${
                  isDark ? 'bg-[#0e1a40] text-white' : 'bg-white text-[#0b1229]'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-0.5 font-label-stamp text-[10px] uppercase font-bold tracking-widest rounded"
                      style={{
                        backgroundColor: pass.badgeColor || '#1d4ed8',
                        color: pass.badgeColor === '#f6c86a' || pass.badgeColor === '#38bdf8' ? '#0b1229' : '#ffffff'
                      }}
                    >
                      {pass.badge || 'PASS'}
                    </span>
                    <span className="font-label-stamp text-[10px] uppercase font-bold tracking-wider text-[#2563eb]">
                      {pass.statusTag || 'AVAILABLE'}
                    </span>
                  </div>

                  <h3 className={`font-headline-sm text-2xl uppercase mb-1.5 ${isDark ? 'text-[#f6c86a]' : 'text-[#0b1229]'}`}>
                    {pass.name}
                  </h3>

                  <p className={`font-body-sm text-xs leading-relaxed mb-4 min-h-[40px] ${isDark ? 'text-[#dce1ff]/80' : 'text-[#475569]'}`}>
                    {pass.description}
                  </p>

                  {/* Perks list */}
                  <div className="space-y-1.5 mb-4">
                    {(pass.perks || []).map((perk, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 mt-0.5" />
                        <span className={isDark ? 'text-[#dce1ff]/90' : 'text-[#334155]'}>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                  isDark ? 'border-white/20' : 'border-[#0b1229]/20'
                }`}>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`font-headline-sm text-2xl leading-none ${isDark ? 'text-[#f6c86a]' : 'text-[#1d4ed8]'}`}>
                        ₹{pass.price}/-
                      </span>
                      {pass.originalPrice && (
                        <span className="text-xs line-through text-slate-400 font-mono">
                          ₹{pass.originalPrice}
                        </span>
                      )}
                    </div>
                    {pass.availableCount && (
                      <span className="font-label-stamp text-[9px] uppercase text-[#38bdf8] font-bold block mt-0.5">
                        ★ {pass.availableCount} PASSES REMAINING
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPass(pass.name, pass.price);
                    }}
                    className={`px-3.5 py-2 font-label-ticket text-xs uppercase tracking-wider flex items-center gap-1.5 rounded font-bold transition-all shadow-sm ${
                      isDark
                        ? 'bg-[#f6c86a] text-[#0b1229] hover:bg-white'
                        : 'bg-[#1d4ed8] text-white hover:bg-[#2563eb]'
                    }`}
                  >
                    {!currentUser ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-300" />
                        <span>LOGIN TO BUY</span>
                      </>
                    ) : (
                      <>
                        <span>BUY PASS</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
