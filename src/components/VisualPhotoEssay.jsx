import React, { useState } from 'react';
import { Camera, X, Maximize2 } from 'lucide-react';
import { getFestivalContent } from '../lib/contentStore';

export default function VisualPhotoEssay({ galleryData }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const photos = galleryData || getFestivalContent().gallery || [];

  return (
    <section className="bg-[#0b1229] p-4 sm:p-12 border-b border-[#1e294b]" id="gallery">
      <div className="max-w-6xl mx-auto">
        <div className="border-b border-[#1e294b] pb-3 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#38bdf8]" />
            <span className="font-label-stamp text-xs text-[#38bdf8] uppercase tracking-widest font-bold">
              ARCHIVE // VISUAL ESSAY
            </span>
          </div>
          <span className="font-label-stamp text-xs text-[#a5b4d4] uppercase font-mono">
            PHOTO STORY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {photos.map((p, idx) => (
            <div
              key={p.id || idx}
              onClick={() => setActivePhoto(p)}
              className={`${p.colSpan || 'md:col-span-6'} border border-[#2a3656] p-2 bg-[#141a32] rounded-lg group cursor-pointer hover:border-[#38bdf8] transition-all`}
            >
              <div className="relative overflow-hidden rounded">
                <img
                  className="w-full h-72 sm:h-96 object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  alt={p.fig}
                  src={p.img}
                />
                <div className="absolute top-3 right-3 bg-[#060d24]/90 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[#a5b4d4] font-label-stamp text-[10px] gap-1">
                <span className="text-[#ffe8c0] font-bold">{p.fig}</span>
                <span className="text-[#38bdf8]">{p.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#0b1229] border border-[#2a3656] rounded-xl overflow-hidden text-[#dce1ff]">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-[#060d24] text-white hover:text-[#f6c86a] border border-[#2a3656] rounded"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={activePhoto.img} alt={activePhoto.fig} className="w-full max-h-[70vh] object-contain bg-black" />
            <div className="p-4 sm:p-6 bg-[#060d24]">
              <span className="font-label-stamp text-xs text-[#f6c86a] block mb-1">{activePhoto.fig}</span>
              <p className="font-body-md text-sm text-[#dce1ff]/90">{activePhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
