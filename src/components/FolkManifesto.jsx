import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { getFestivalContent } from '../lib/contentStore';

export default function FolkManifesto({ manifestoData }) {
  const content = manifestoData || getFestivalContent().manifesto;
  const [selectedPillar, setSelectedPillar] = useState(null);

  const pillars = content.pillars || [];

  return (
    <section className="bg-[#F0F4FA] text-[#0b1229] border-b border-[#0b1229] overflow-hidden" id="manifesto">
      {/* Animated Horizontal Marquee Ticker */}
      <div className="w-full bg-[#070d1e] text-[#dce1ff] py-2 border-b border-[#1e294b] overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-label-stamp text-[11px] tracking-widest text-[#38bdf8] uppercase font-bold">
          <span className="flex items-center gap-3">
            <span>•</span> CHOGADA TARA <span>•</span> SANEDO SANEDO <span>•</span> DHOLIDA NA DHOL VAGE <span>•</span> KHALASI <span>•</span> DANDIYA <span className="font-['Rozha_One'] text-sm text-[#f6c86a]">रात</span> 2026 <span>•</span> 5,000 CIRCLE RAAS <span>•</span> 15 OCT 2026 <span>•</span> NON-STOP PERCUSSION
          </span>
          <span aria-hidden="true" className="flex items-center gap-3">
            <span>•</span> CHOGADA TARA <span>•</span> SANEDO SANEDO <span>•</span> DHOLIDA NA DHOL VAGE <span>•</span> KHALASI <span>•</span> DANDIYA <span className="font-['Rozha_One'] text-sm text-[#f6c86a]">रात</span> 2026 <span>•</span> 5,000 CIRCLE RAAS <span>•</span> 15 OCT 2026 <span>•</span> NON-STOP PERCUSSION
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-12">
        <div className="max-w-6xl mx-auto">
          {/* Tag row */}
          <div className="flex items-center justify-between border-b border-[#0b1229] pb-3 mb-8">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-live-ping absolute inline-flex h-full w-full rounded-full bg-[#2563eb] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1d4ed8]"></span>
              </span>
              <span className="font-label-stamp text-xs text-[#1d4ed8] uppercase tracking-widest font-bold">
                {content.tag || 'MANIFESTO & SPIRIT'}
              </span>
            </div>
            <span className="font-label-stamp text-xs text-[#0b1229] uppercase font-mono">
              {content.sectionTag || 'SEC. 03 // FOLK RHYTHM'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6">
              <h2 className="text-4xl sm:text-6xl font-headline-lg uppercase text-[#0e1a40] leading-none mb-4">
                {content.heading || 'THIS IS DANDIYA.'}
              </h2>
              <p className="font-title-editorial text-base sm:text-lg leading-relaxed text-[#0b1229] mb-3 border-l-4 border-[#1d4ed8] pl-3">
                {content.subheading}
              </p>
              <p className="font-body-md text-sm text-[#1e3a8a] font-bold tracking-wide uppercase">
                {content.quote}
              </p>

              {/* 4 Interactive Pillars Grid */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {pillars.map((pillar) => (
                  <button
                    key={pillar.id}
                    onClick={() => setSelectedPillar(pillar)}
                    className="bg-white border-2 border-[#0b1229] p-3 poster-shadow-dark flex items-center gap-2.5 text-left hover:border-[#1d4ed8] hover:translate-x-0.5 hover:translate-y-0.5 transition-all group rounded"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center text-lg shrink-0 group-hover:bg-[#2563eb] transition-colors">
                      {pillar.icon}
                    </div>
                    <div>
                      <span className="font-headline-sm text-lg text-[#0e1a40] block leading-none">
                        {pillar.name}
                      </span>
                      <span className="font-label-stamp text-[9px] uppercase tracking-wider text-[#2563eb]">
                        {pillar.sub}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Photo Card */}
            <div className="lg:col-span-6 border-2 border-[#0b1229] poster-shadow-dark bg-[#0b1229] overflow-hidden rounded-lg">
              <div className="relative h-72 sm:h-96 w-full overflow-hidden">
                <img
                  alt="Authentic vibrant Navratri Dandiya Raas celebration"
                  className="w-full h-full object-cover object-center filter contrast-125 hover:scale-105 transition-transform duration-500"
                  src={content.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="bg-[#1d4ed8] text-white border border-[#38bdf8]/40 px-2.5 py-1 font-label-stamp text-[10px] uppercase font-bold tracking-wider rounded">
                    LIVE FOLK RAAS ARENA
                  </span>
                  <span className="font-label-ticket text-xs uppercase text-[#f6c86a] font-bold bg-[#060d24]/90 px-2.5 py-1 border border-[#38bdf8]/40 rounded-full">
                    ★ 5,000 DANCERS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Pillar details */}
      {selectedPillar && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1229] border-2 border-[#f6c86a] p-6 max-w-md w-full rounded-xl poster-shadow-dark text-[#dce1ff] relative animate-fadeIn">
            <button
              onClick={() => setSelectedPillar(null)}
              className="absolute top-3 right-3 text-[#dce1ff] hover:text-[#f6c86a] p-1 border border-[#2a3656] rounded"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedPillar.icon}</span>
              <div>
                <span className="font-label-stamp text-xs text-[#38bdf8] uppercase">{selectedPillar.sub}</span>
                <h3 className="font-headline-sm text-2xl text-[#ffe8c0]">{selectedPillar.name}</h3>
              </div>
            </div>
            <p className="font-body-md text-sm text-[#dce1ff]/90 leading-relaxed mb-4">
              {selectedPillar.desc}
            </p>
            <div className="space-y-2 border-t border-[#2a3656] pt-3">
              <span className="font-label-stamp text-[10px] uppercase text-[#f6c86a] font-bold block">
                FESTIVAL SPECIFICATIONS:
              </span>
              {(selectedPillar.details || []).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#a5b4d4]">
                  <span className="text-[#38bdf8] font-bold">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
