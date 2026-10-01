import React from 'react';
import TicketPasses from '../components/TicketPasses';
import { Ticket, Check, X, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import FaqSection from '../components/FaqSection';

export default function PassesPage({ onOpenBooking, currentUser }) {
  const comparisonTiers = [
    {
      feature: 'Arena & Garba Ring Access',
      kids: 'Family Ring',
      single: 'Full Arena',
      couple: 'Full Arena',
      vip: 'Ras Kendra Inner VIP',
      squad: 'Full Arena'
    },
    {
      feature: 'Hand-crafted Wooden Dandiya Sticks',
      kids: '1 Mini Pair',
      single: '1 Pair Teak Wood',
      couple: '2 Pairs Teak Wood',
      vip: '2 Pairs Sheesham/Bandhani',
      squad: '4 to 6 Pairs'
    },
    {
      feature: 'Fast-Track Turnstile Lane',
      kids: 'No',
      single: 'No',
      couple: 'No',
      vip: 'Yes (VIP Fast-Track)',
      squad: 'Priority Squad Lane'
    },
    {
      feature: 'Kathiawadi Food Platter Voucher',
      kids: 'No',
      single: 'No',
      couple: 'Add-on Optional',
      vip: 'Complimentary Beverage',
      squad: '1 to 2 Platters Included'
    },
    {
      feature: '100% Weather Refund Guarantee',
      kids: 'Yes',
      single: 'Yes',
      couple: 'Yes',
      vip: 'Yes',
      squad: 'Yes'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070d1e] text-[#dce1ff] pb-24 sm:pb-12">
      {/* Page Header */}
      <div className="p-4 sm:p-8 border-b border-[#1e294b] bg-[#0a1228]">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#1d4ed8]/30 border border-[#38bdf8]/40 rounded-full mb-2 text-[#38bdf8] font-label-stamp text-[10px] font-bold uppercase">
            <Ticket className="w-3 h-3" />
            <span>OFFICIAL TICKETING</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-headline-lg uppercase text-white tracking-wide">
            FESTIVAL PASSES
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-[#a5b4d4] max-w-xl mt-1">
            Turnstile entry, wooden dandiya sticks & 100% weather refund included with all passes.
          </p>
        </div>
      </div>

      {/* Main Ticket Grid */}
      <TicketPasses
        currentUser={currentUser}
        showHeading={false}
        onSelectPass={(title, price) => onOpenBooking(title, price)}
      />

      {/* Perks Comparison Matrix */}
      <section className="p-4 sm:p-8 border-b border-[#1e294b] max-w-6xl mx-auto">
        <div className="border-b border-[#2a3656] pb-2.5 mb-4 flex items-center justify-between">
          <div>
            <span className="font-label-stamp text-[10px] text-[#38bdf8] uppercase tracking-widest font-bold">
              ADMISSION TIERS
            </span>
            <h2 className="text-xl sm:text-3xl font-headline-lg uppercase text-white">
              PERKS COMPARISON
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono sm:hidden">
            Swipe ➔
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="min-w-[620px] w-full text-left text-xs border border-[#2a3656] rounded-lg overflow-hidden bg-[#141a32]">
            <thead className="bg-[#0b1229] text-[#ffe8c0] font-label-stamp uppercase border-b border-[#2a3656]">
              <tr>
                <th className="p-3 sm:p-4">FEATURE</th>
                <th className="p-3 sm:p-4">KIDS (₹199)</th>
                <th className="p-3 sm:p-4">SINGLE (₹349)</th>
                <th className="p-3 sm:p-4">COUPLE (₹649)</th>
                <th className="p-3 sm:p-4 text-[#f6c86a]">VIP (FROM ₹499)</th>
                <th className="p-3 sm:p-4">SQUADS (FROM ₹1,299)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3656]">
              {comparisonTiers.map((row, i) => (
                <tr key={i} className="hover:bg-[#181e36] transition-colors">
                  <td className="p-3 sm:p-4 font-bold text-white">{row.feature}</td>
                  <td className="p-3 sm:p-4 text-[#a5b4d4]">{row.kids}</td>
                  <td className="p-3 sm:p-4 text-[#a5b4d4]">{row.single}</td>
                  <td className="p-3 sm:p-4 text-[#a5b4d4]">{row.couple}</td>
                  <td className="p-3 sm:p-4 font-bold text-[#f6c86a]">{row.vip}</td>
                  <td className="p-3 sm:p-4 text-[#38bdf8]">{row.squad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently Asked Section */}
      <FaqSection />
    </div>
  );
}
