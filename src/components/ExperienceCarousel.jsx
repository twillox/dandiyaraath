import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles, Volume2, Flame, Users, Utensils } from 'lucide-react';
import { getFestivalContent } from '../lib/contentStore';

export default function ExperienceCarousel({ experiencesData }) {
  const scrollRef = useRef(null);
  const [activeModal, setActiveModal] = useState(null);

  const experiences = experiencesData || getFestivalContent().experiences || [];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#0b1229] py-8 sm:py-14 border-b border-[#1e294b] overflow-hidden" id="experience">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#1e294b] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#38bdf8] mb-1">
              <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              <span className="font-label-stamp text-xs uppercase tracking-widest font-bold">ATMOSPHERIC MASTER PLAN</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-headline-lg uppercase text-[#dce1ff] tracking-wide leading-none">
              ONE NIGHT. ONE RHYTHM. ONE CROWD.
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => scroll('left')}
              className="p-2 border border-[#2a3656] bg-[#141a32] text-[#dce1ff] hover:text-[#f6c86a] hover:border-[#f6c86a] rounded transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 border border-[#2a3656] bg-[#141a32] text-[#dce1ff] hover:text-[#f6c86a] hover:border-[#f6c86a] rounded transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-[#38bdf8] font-label-stamp text-xs uppercase tracking-widest bg-[#141a32] px-3 py-1.5 border border-[#2a3656] rounded">
              <span>SWIPE ➔</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Carousel Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 sm:gap-6 px-4 sm:px-8 pb-4 max-w-7xl mx-auto"
      >
        {experiences.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveModal(item)}
            className="carousel-item shrink-0 w-[84vw] sm:w-[360px] md:w-[400px] border-2 border-[#2a3656] bg-[#141a32] poster-shadow-dark group flex flex-col justify-between overflow-hidden cursor-pointer hover:border-[#38bdf8] transition-all rounded-lg"
          >
            <div className="relative h-64 sm:h-72 w-full overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                alt={item.title}
                src={item.img}
              />
              <div className="absolute top-3 left-3 bg-[#1d4ed8] text-white border border-[#38bdf8]/40 px-2.5 py-0.5 font-label-stamp text-[10px] uppercase font-bold tracking-wider rounded">
                {item.num}
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-gradient-to-t from-black/95 to-transparent p-2 rounded">
                <span className="font-label-ticket text-[11px] text-[#f6c86a] uppercase font-bold tracking-wide">
                  {item.tag}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#181e36] border-t border-[#2a3656]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-headline-sm text-xl text-[#dce1ff] uppercase group-hover:text-[#f6c86a] transition-colors">
                  {item.title}
                </h3>
                <span className="text-xs text-[#38bdf8] font-mono">EXPLORE ➔</span>
              </div>
              <p className="font-body-sm text-xs sm:text-sm text-[#a5b4d4] leading-relaxed line-clamp-2">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal View for Card Details */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1229] border-2 border-[#38bdf8] max-w-lg w-full rounded-xl overflow-hidden poster-shadow-light relative animate-fadeIn text-[#dce1ff]">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-3 right-3 z-10 p-1.5 bg-[#060d24] border border-[#2a3656] text-white hover:text-[#f6c86a] rounded"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-56 w-full">
              <img src={activeModal.img} alt={activeModal.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1229] via-transparent to-black/60"></div>
              <div className="absolute bottom-3 left-4">
                <span className="bg-[#1d4ed8] text-white px-2.5 py-0.5 font-label-stamp text-[10px] uppercase font-bold rounded">
                  {activeModal.num}
                </span>
                <h3 className="font-headline-sm text-2xl text-white uppercase mt-1">
                  {activeModal.title}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="font-body-md text-sm text-[#dce1ff]/90 leading-relaxed">
                {activeModal.longDesc || activeModal.desc}
              </p>

              {(activeModal.highlights || []).length > 0 && (
                <div className="border-t border-[#2a3656] pt-3">
                  <span className="font-label-stamp text-[10px] uppercase tracking-wider text-[#f6c86a] font-bold block mb-2">
                    KEY FESTIVAL HIGHLIGHTS:
                  </span>
                  <div className="space-y-1.5">
                    {activeModal.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#a5b4d4]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveModal(null)}
                className="w-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white font-headline-sm text-lg uppercase py-2.5 border border-[#38bdf8]/40 rounded poster-shadow-dark"
              >
                CLOSE REALM DETAILS
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
