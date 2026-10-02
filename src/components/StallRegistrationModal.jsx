import React, { useState } from 'react';
import {
  X,
  Store,
  Phone,
  Mail,
  User,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { saveStallApplication } from '../lib/storage';

const STALL_CATEGORIES = [
  'Food & Street Snacks',
  'Beverages, Thandai & Desserts',
  'Ethnic Wear & Chaniya Choli',
  'Dandiya Sticks, Jewelry & Bangles',
  'Festive Games, Mehendi & Photobooth',
  'Brand Activation & Corporate Pavilion'
];

const BUDGET_RANGES = [
  { label: '₹15,000 – ₹25,000 (Small Craft / Jewelry Table)', value: '₹15,000 - ₹25,000', est: 20000 },
  { label: '₹25,000 – ₹45,000 (Standard Food or Retail Stall)', value: '₹25,000 - ₹45,000', est: 35000 },
  { label: '₹45,000 – ₹75,000 (Prime Food Court Corner Stall)', value: '₹45,000 - ₹75,000', est: 60000 },
  { label: '₹75,000 – ₹1,50,000+ (Anchor Brand / Large Pavilion)', value: '₹75,000 - ₹1,50,000+', est: 100000 }
];

export default function StallRegistrationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    brandName: '',
    contactPerson: '',
    phone: '',
    email: '',
    stallCategory: 'Food & Street Snacks',
    budgetRange: '₹25,000 - ₹45,000',
    estimatedBudget: 35000,
    productDescription: '',
    powerRequired: false,
    spaceRequired: '10x10 ft Standard Stall'
  });

  const [submittedStall, setSubmittedStall] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.brandName.trim()) {
      setErrorMsg('Please enter your business or brand name.');
      return;
    }
    if (!formData.contactPerson.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number for us to call you.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedBudgetObj = BUDGET_RANGES.find(b => b.value === formData.budgetRange);
      const newStall = saveStallApplication({
        ...formData,
        estimatedBudget: selectedBudgetObj ? selectedBudgetObj.est : 30000
      });

      setSubmittedStall(newStall);
    } catch (err) {
      console.error('Stall application error:', err);
      setErrorMsg('Something went wrong submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedStall(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0b1229] border-2 border-[#2a3656] text-[#dce1ff] p-5 sm:p-7 rounded-2xl shadow-2xl my-4 animate-fadeIn">
        {/* Modal Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white border border-[#2a3656] hover:border-[#f6c86a] p-1.5 rounded-lg transition-colors z-20"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedStall ? (
          /* ================= SUCCESS SUBMISSION VIEW ================= */
          <div className="text-center py-4 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-block bg-emerald-950 text-emerald-300 border border-emerald-500/80 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                APPLICATION SUBMITTED • REFERENCE: {submittedStall.id}
              </span>
              <h3 className="text-2xl font-headline-sm uppercase text-white font-bold">
                Stall Proposal Received!
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-md mx-auto">
                Thank you <strong className="text-white">{submittedStall.contactPerson}</strong>! We've received your stall registration for <strong className="text-[#f6c86a]">{submittedStall.brandName}</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#141a32] border border-[#2a3656] rounded-xl text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#2a3656]">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">CATEGORY</span>
                <span className="font-bold text-white uppercase">{submittedStall.stallCategory}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">BUDGET RANGE</span>
                <span className="font-bold text-[#f6c86a] font-mono">{submittedStall.budgetRange}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-label-stamp uppercase text-[10px]">CALLBACK PHONE</span>
                <span className="font-mono text-white font-bold">{submittedStall.phone}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl text-[11px] text-amber-200/90 text-left space-y-1">
              <span className="font-bold text-[#f6c86a] block font-label-stamp uppercase text-[10px]">NEXT STEPS:</span>
              <p className="leading-snug">
                Our festival vendor manager will review your product category and <strong>call you directly at {submittedStall.phone}</strong> within 24 hours to discuss stall location, dimensions, power requirements, and setup passes.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-[#141a32] hover:bg-[#1a2342] text-white py-3 rounded-xl font-headline-sm text-xs uppercase tracking-wider font-bold transition-all border border-[#2a3656]"
              >
                DONE
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = `Hi Dandiya Raat Organisers, I have submitted a stall application (${submittedStall.id}) for ${submittedStall.brandName} (${submittedStall.stallCategory}, Budget: ${submittedStall.budgetRange}). Looking forward to speaking with you!`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded-xl font-headline-sm text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <span>WHATSAPP COORDINATOR</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= STALL REGISTRATION FORM ================= */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Modal Header */}
            <div className="border-b border-[#2a3656] pb-3 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-950 border border-amber-500/70 rounded-full text-amber-300 font-label-stamp text-[10px] uppercase font-bold mb-1.5">
                <Store className="w-3.5 h-3.5 text-[#f6c86a]" />
                <span>OFFICIAL FESTIVAL STALL REGISTRATION</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-headline-sm uppercase text-white font-bold leading-tight">
                Partner with Dandiya Raat 2026
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Showcase your food, ethnic garments, handicrafts, or brand to 5,000+ attendees at Narapally Cricket Ground. Fill in the quick details below:
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-950/80 border border-red-500 rounded-lg text-xs text-red-200 font-mono">
                {errorMsg}
              </div>
            )}

            {/* Quick 2-Column Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <label className="block text-[11px] font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                  BRAND / STALL NAME *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Gujarati Sweets"
                    value={formData.brandName}
                    onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full bg-[#141a32] border border-[#2a3656] px-3 py-2 text-xs text-white rounded-lg focus:border-[#f6c86a] focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                  CONTACT PERSON NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jayesh Patel"
                  value={formData.contactPerson}
                  onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full bg-[#141a32] border border-[#2a3656] px-3 py-2 text-xs text-white rounded-lg focus:border-[#f6c86a] focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                  PHONE / WHATSAPP NUMBER *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9849021144"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#141a32] border border-[#2a3656] px-3 py-2 text-xs text-white rounded-lg focus:border-[#f6c86a] focus:outline-none font-mono placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="e.g. contact@brand.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#141a32] border border-[#2a3656] px-3 py-2 text-xs text-white rounded-lg focus:border-[#f6c86a] focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="text-left">
              <label className="block text-[11px] font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                STALL CATEGORY / TYPE *
              </label>
              <select
                value={formData.stallCategory}
                onChange={e => setFormData({ ...formData, stallCategory: e.target.value })}
                className="w-full bg-[#141a32] border border-[#2a3656] px-3 py-2 text-xs text-white rounded-lg focus:border-[#f6c86a] focus:outline-none font-medium"
              >
                {STALL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Budget / Investment Dropdown */}
            <div className="text-left">
              <label className="block text-[11px] font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                BUDGET OF INVESTMENT *
              </label>
              <select
                value={formData.budgetRange}
                onChange={e => {
                  const val = e.target.value;
                  const item = BUDGET_RANGES.find(b => b.value === val);
                  setFormData({
                    ...formData,
                    budgetRange: val,
                    estimatedBudget: item ? item.est : 30000
                  });
                }}
                className="w-full bg-[#141a32] border border-[#2a3656] px-3 py-2 text-xs text-[#ffe8c0] rounded-lg focus:border-[#f6c86a] focus:outline-none font-bold"
              >
                {BUDGET_RANGES.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            {/* Brief Items Description */}
            <div className="text-left">
              <label className="block text-[11px] font-label-stamp uppercase text-[#a5b4d4] mb-1 font-bold">
                WHAT ITEMS / PRODUCTS WILL YOU SELL?
              </label>
              <input
                type="text"
                placeholder="e.g. Khaman Dhokla, Jalebi, Chaat counters, or Chaniya Cholis"
                value={formData.productDescription}
                onChange={e => setFormData({ ...formData, productDescription: e.target.value })}
                className="w-full bg-[#141a32] border border-[#2a3656] px-3 py-2 text-xs text-white rounded-lg focus:border-[#f6c86a] focus:outline-none placeholder:text-slate-500"
              />
            </div>

            {/* Quick Electricity Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#141a32] border border-[#2a3656] rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#f6c86a]" />
                <span className="text-white font-medium">Electricity / Power Point Required?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, powerRequired: false })}
                  className={`px-3 py-1 rounded text-xs font-label-stamp uppercase font-bold transition-all ${
                    !formData.powerRequired
                      ? 'bg-[#1d4ed8] text-white border border-[#38bdf8]'
                      : 'bg-[#0b1229] text-slate-400 border border-[#2a3656]'
                  }`}
                >
                  NO
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, powerRequired: true })}
                  className={`px-3 py-1 rounded text-xs font-label-stamp uppercase font-bold transition-all ${
                    formData.powerRequired
                      ? 'bg-amber-600 text-white border border-amber-400'
                      : 'bg-[#0b1229] text-slate-400 border border-[#2a3656]'
                  }`}
                >
                  YES (15A/5A)
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] hover:from-[#2563eb] hover:to-[#3b82f6] text-white py-3 rounded-xl font-headline-sm text-sm uppercase tracking-wider font-bold transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>SUBMITTING PROPOSAL...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#f6c86a]" />
                  <span>SUBMIT STALL PROPOSAL</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              🔒 No advance payment required right now. The festival admin will review and call you to finalize stall allocation.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
