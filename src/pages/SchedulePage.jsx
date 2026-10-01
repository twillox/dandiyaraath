import React, { useState, useEffect } from 'react';
import { FESTIVAL_SCHEDULE } from '../lib/storage';
import { Calendar, Clock, Bookmark, BookmarkCheck, MapPin, Sparkles, Flame, Volume2 } from 'lucide-react';

const BOOKMARK_KEY = 'dandiya_saved_schedule_items';

export default function SchedulePage() {
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(BOOKMARK_KEY);
    if (saved) {
      try {
        setSavedItems(JSON.parse(saved));
      } catch (e) {
        console.warn(e);
      }
    }
  }, []);

  const toggleBookmark = (title) => {
    let updated;
    if (savedItems.includes(title)) {
      updated = savedItems.filter(t => t !== title);
    } else {
      updated = [...savedItems, title];
    }
    setSavedItems(updated);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#070d1e] text-[#dce1ff] pb-16">
      {/* Header */}
      <div className="p-6 sm:p-12 border-b border-[#1e294b] bg-[#0a1228]">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1d4ed8]/30 border border-[#38bdf8]/40 rounded-full mb-3 text-[#38bdf8] font-label-stamp text-xs font-bold uppercase">
            <Calendar className="w-3.5 h-3.5" />
            <span>OFFICIAL FESTIVAL TIMETABLE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-headline-lg uppercase text-white tracking-wide">
            15 OCTOBER 2026 // RHYTHM TIMELINE
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-[#a5b4d4] max-w-xl mt-1">
            Hour-by-hour ceremonial itinerary from acoustic Shenhai warm-ups to the transcendent Midnight Maha Aarti and Sanedo surge.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="relative border-l-2 border-[#1d4ed8]/60 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8 my-6">
          {FESTIVAL_SCHEDULE.map((item, idx) => {
            const isBookmarked = savedItems.includes(item.title);
            return (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-[#0b1229] border-2 border-[#38bdf8] flex items-center justify-center text-[10px] text-[#f6c86a] font-bold group-hover:scale-125 transition-transform">
                  ★
                </div>

                <div className="bg-[#141a32] border-2 border-[#2a3656] hover:border-[#38bdf8] p-5 rounded-xl poster-shadow-dark transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-[#2a3656]">
                    <div className="flex items-center gap-3">
                      <span className="font-display-hero text-2xl text-[#f6c86a] tracking-wider leading-none">
                        {item.time}
                      </span>
                      <span className="bg-[#1d4ed8] text-white px-2 py-0.5 text-[9px] font-label-stamp uppercase font-bold rounded">
                        {item.tag}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleBookmark(item.title)}
                      className={`inline-flex items-center gap-1.5 text-xs font-label-stamp uppercase px-3 py-1 rounded border transition-colors ${
                        isBookmarked
                          ? 'bg-[#f6c86a] text-[#070d1e] border-[#f6c86a] font-bold'
                          : 'bg-[#0b1229] text-[#a5b4d4] border-[#2a3656] hover:text-white hover:border-[#f6c86a]'
                      }`}
                    >
                      {isBookmarked ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-[#070d1e]" />
                          <span>SAVED TO REMINDER</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-[#a5b4d4]" />
                          <span>REMIND ME</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="font-headline-sm text-xl sm:text-2xl text-white uppercase mb-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#38bdf8] mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.zone}</span>
                    <span>•</span>
                    <span className="text-[#ffe8c0]">{item.subtitle}</span>
                  </div>

                  <p className="font-body-md text-xs sm:text-sm text-[#dce1ff]/85 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
