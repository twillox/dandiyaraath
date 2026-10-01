import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { getFestivalContent } from '../lib/contentStore';

export default function VenueMap({ venueData }) {
  const content = venueData || getFestivalContent().venue;
  const targetMapUrl = content.mapsLink || 'https://maps.app.goo.gl/rGbMt2SFBYh7L5iE9';

  return (
    <section className="bg-[#070d1e] text-[#dce1ff] p-4 sm:p-12 border-b border-[#1e294b]" id="venue">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-[#2a3656] pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#38bdf8] mb-1">
              <MapPin className="w-4 h-4 text-[#38bdf8]" />
              <span className="font-label-stamp text-xs uppercase tracking-widest font-bold">
                THE FESTIVAL GROUND
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-headline-lg uppercase text-white leading-none">
              {content.title || 'VENUE & LOCATION'}
            </h2>
          </div>
          <span className="font-label-ticket text-xs uppercase text-[#f6c86a] font-bold bg-[#141a32] px-3.5 py-1.5 border border-[#2a3656] rounded-full self-start sm:self-auto">
            {content.capacityText || '★ GUEST CAPACITY: 5,000+ DANCERS'}
          </span>
        </div>

        {/* Venue Address Banner */}
        <div className="bg-[#0b1536] border-2 border-[#2563eb]/50 p-5 sm:p-7 rounded-xl poster-shadow-sapphire mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <span className="font-label-stamp text-xs uppercase tracking-widest text-[#38bdf8] font-bold">
              OFFICIAL LOCATION
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-['Syne',sans-serif] text-[#ffe8c0] tracking-wide">
              {content.locationName || 'Narapally Cricket Ground'}
            </h3>
            <p className="font-body-md text-xs sm:text-sm text-[#dce1ff]/90 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#f6c86a] shrink-0" />
              <span>{content.address || 'Korremula Rd, Chowdhariguda, Hyderabad, Telangana 500088'}</span>
            </p>
          </div>
          <a
            href={targetMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-2 bg-[#1d4ed8] hover:bg-[#2563eb] text-white px-6 py-3.5 font-headline-sm text-lg uppercase tracking-wider border border-[#38bdf8]/60 poster-shadow-dark transition-all rounded active:translate-y-0.5"
          >
            <span>GET TURN-BY-TURN DIRECTIONS</span>
            <Navigation className="w-4 h-4" />
          </a>
        </div>

        {/* ORIGINAL INTERACTIVE GOOGLE MAPS EMBED */}
        <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border-2 border-[#2a3656] poster-shadow-dark bg-[#0a1224]">
          <iframe
            title="Narapally Cricket Ground Map Location"
            src="https://maps.google.com/maps?q=Narapally+Cricket+Ground+Chowdhariguda+Hyderabad&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 filter contrast-105"
            loading="lazy"
            allowFullScreen
          ></iframe>

          {/* Floating Google Maps Card Overlay */}
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 bg-[#0b1229]/95 backdrop-blur-md border border-[#38bdf8]/40 p-3.5 sm:p-4 rounded-lg shadow-2xl max-w-xs sm:max-w-sm pointer-events-auto">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="text-lg">🏟️</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-white font-['Syne',sans-serif]">
                  {content.locationName || 'Narapally Cricket Ground'}
                </h4>
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-bold text-[#f6c86a]">{content.rating || '4.6'}</span>
                  <span className="text-[#f6c86a]">★★★★★</span>
                  <span className="text-[#a5b4d4]">({content.reviewCount || '840+ reviews'})</span>
                </div>
                <p className="text-[10px] text-[#a5b4d4] leading-tight">{content.address}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-[#2a3656] flex items-center justify-between">
              <span className="font-label-stamp text-[9px] uppercase text-[#38bdf8] font-bold">VENUE OPEN • 5 PM</span>
              <a
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f6c86a] hover:text-white uppercase tracking-wider"
                href={targetMapUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>OPEN IN GOOGLE MAPS</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
        {/* The 4 amenity cards (Parking, Transit, Food, Security) have been completely removed as requested */}
      </div>
    </section>
  );
}
