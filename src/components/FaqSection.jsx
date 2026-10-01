import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown } from 'lucide-react';
import { getFestivalContent } from '../lib/contentStore';

export default function FaqSection({ faqsData }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = faqsData || getFestivalContent().faqs || [];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-[#F0F4FA] text-[#0b1229] p-4 sm:p-12 border-b border-[#0b1229]" id="faq">
      <div className="max-w-4xl mx-auto">
        <div className="border-b-2 border-[#0b1229] pb-3 mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#1d4ed8] mb-1">
              <HelpCircle className="w-4 h-4 text-[#1d4ed8]" />
              <span className="font-label-stamp text-xs uppercase font-bold tracking-widest">
                QUESTIONS & POLICIES
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-headline-lg uppercase text-[#0b1229]">
              FREQUENTLY ASKED
            </h2>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#0b1229] pl-9 pr-3 py-1.5 text-xs rounded focus:border-[#1d4ed8]"
            />
          </div>
        </div>

        <div className="divide-y-2 border-y-2 border-[#0b1229] divide-[#0b1229]">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-4 group">
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left font-headline-sm text-lg sm:text-xl uppercase text-[#0b1229] hover:text-[#1d4ed8] focus:outline-none transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1d4ed8]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="mt-3 font-body-md text-sm text-[#1e3a8a] leading-relaxed pl-3 border-l-2 border-[#1d4ed8] animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
