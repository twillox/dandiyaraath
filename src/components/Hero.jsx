import React, { useState, useEffect } from 'react';
import { MapPin, Ticket, Clock, Sparkles, Lock } from 'lucide-react';
import { getFestivalContent } from '../lib/contentStore';

export default function Hero({ onOpenBooking, heroData, currentUser }) {
  const content = heroData || getFestivalContent().hero;
  const targetDate = new Date(content.targetCountdown || '2026-10-15T17:00:00+05:30').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <section className="relative min-h-[88vh] flex flex-col justify-between p-4 sm:p-8 bg-[#070d1e] border-b border-[#1e294b] overflow-hidden" id="hero">
      {/* Dynamic Background Image with dark vignette */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity scale-105 pointer-events-none">
        <img
          className="w-full h-full object-cover object-center filter contrast-125 brightness-90"
          alt="Navratri Dandiya Raat background"
          src={content.bgImage}
        />
      </div>

      {/* Concentric Dandiya Rhythm Ring Motif */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 sm:w-[540px] sm:h-[540px] rounded-full border border-[#2563eb]/25 pointer-events-none flex items-center justify-center animate-pulse-glow">
        <div className="w-64 h-64 sm:w-[420px] sm:h-[420px] rounded-full border border-dashed border-[#38bdf8]/30 flex items-center justify-center">
          <div className="w-44 h-44 sm:w-[280px] sm:h-[280px] rounded-full border border-[#f6c86a]/30"></div>
        </div>
      </div>

      {/* Hero Content Lockup */}
      <div className="relative z-10 my-auto py-6 sm:py-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center">
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#38bdf8]/40 bg-[#0e1a40]/90 backdrop-blur-md mb-4 poster-shadow-dark">
          <span className="w-2 h-2 rounded-full bg-[#38bdf8] inline-block animate-ping"></span>
          <span className="font-title-editorial text-xs sm:text-sm font-bold uppercase tracking-wider text-[#ffe8c0]">
            {content.announcement}
          </span>
        </div>

        {/* Dynamic Festival Logo Image */}
        <div className="w-full flex flex-col items-center justify-center py-2">
          {content.logoUrl ? (
            <img
              alt="Dandiya Raat Logo"
              className="w-full max-w-[320px] sm:max-w-md mx-auto h-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)] my-2 hover:scale-[1.02] transition-transform duration-300"
              src={content.logoUrl}
            />
          ) : (
            <div className="flex items-baseline gap-2 my-4">
              <span className="font-['Syne',sans-serif] font-black text-5xl sm:text-7xl tracking-wider text-[#ffe8c0]">DANDIYA</span>
              <span className="font-['Rozha_One',serif] text-5xl sm:text-7xl text-[#f6c86a]">रात</span>
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#0b1229]/90 border border-[#38bdf8]/40 rounded-full mt-2 poster-shadow-dark">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#f6c86a] font-bold">
              {content.tagline}
            </span>
          </div>
        </div>

        {/* Location & Meta */}
        <div className="mt-4 flex flex-col items-center text-center px-4">
          <a
            href="https://maps.app.goo.gl/rGbMt2SFBYh7L5iE9"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-1.5 text-xs sm:text-sm uppercase tracking-widest text-[#dce1ff] hover:text-[#f6c86a] transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform" />
            <span className="font-semibold underline underline-offset-4 decoration-[#38bdf8]/50">
              {content.venueName}
            </span>
          </a>
          <p className="text-xs text-[#a5b4d4] font-body-sm mt-1 max-w-md">
            {content.venueAddress}
          </p>
        </div>

        {/* LIVE FESTIVAL COUNTDOWN TIMER */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-[#0a153d]/90 border border-[#38bdf8]/40 rounded-xl poster-shadow-dark max-w-lg w-full">
          <div className="flex items-center justify-center gap-1.5 mb-2 text-[#f6c86a] font-label-stamp text-[10px] sm:text-xs uppercase tracking-widest font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>COUNTDOWN TO FESTIVAL GATES OPEN</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-[#060d24] p-2 rounded border border-[#2a3656]">
              <span className="font-display-hero text-2xl sm:text-4xl text-white block leading-tight">{timeLeft.days}</span>
              <span className="font-label-stamp text-[9px] uppercase tracking-wider text-[#38bdf8]">DAYS</span>
            </div>
            <div className="bg-[#060d24] p-2 rounded border border-[#2a3656]">
              <span className="font-display-hero text-2xl sm:text-4xl text-white block leading-tight">{timeLeft.hours}</span>
              <span className="font-label-stamp text-[9px] uppercase tracking-wider text-[#38bdf8]">HOURS</span>
            </div>
            <div className="bg-[#060d24] p-2 rounded border border-[#2a3656]">
              <span className="font-display-hero text-2xl sm:text-4xl text-white block leading-tight">{timeLeft.minutes}</span>
              <span className="font-label-stamp text-[9px] uppercase tracking-wider text-[#38bdf8]">MINS</span>
            </div>
            <div className="bg-[#060d24] p-2 rounded border border-[#2a3656]">
              <span className="font-display-hero text-2xl sm:text-4xl text-[#f6c86a] block leading-tight">{timeLeft.seconds}</span>
              <span className="font-label-stamp text-[9px] uppercase tracking-wider text-[#f6c86a]">SECS</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onOpenBooking('SINGLE PASS', 349)}
            className="w-full sm:w-auto bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-headline-sm text-xl uppercase px-8 py-3.5 border border-[#38bdf8]/50 poster-shadow-sapphire active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 rounded"
          >
            {!currentUser ? (
              <>
                <Lock className="w-5 h-5 text-[#f6c86a]" />
                <span>SIGN IN TO BOOK PASS →</span>
              </>
            ) : (
              <>
                <Ticket className="w-5 h-5 text-[#f6c86a]" />
                <span>BOOK YOUR PASS →</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('experience');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto bg-[#141a32] hover:bg-[#181e36] text-[#dce1ff] hover:text-white font-headline-sm text-xl uppercase px-6 py-3.5 border border-[#2a3656] poster-shadow-dark transition-all flex items-center justify-center gap-2 rounded"
          >
            <Sparkles className="w-4 h-4 text-[#38bdf8]" />
            <span>EXPLORE REALMS</span>
          </button>
        </div>
      </div>

      {/* Hero Bottom Bar */}
      <div className="relative z-10 border-t border-[#1e294b] pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 max-w-lg text-left">
          <span className="text-2xl sm:text-3xl shrink-0">🪘</span>
          <p className="font-body-md text-xs sm:text-sm text-[#dce1ff]/90 leading-relaxed italic">
            {content.description}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#f6c86a]">
          <span className="w-2 h-2 rounded-full bg-[#f6c86a] animate-ping"></span>
          <span>STRICT GUEST CAP • 100% VERIFIED TURNSTILE ENTRY</span>
        </div>
      </div>
    </section>
  );
}
