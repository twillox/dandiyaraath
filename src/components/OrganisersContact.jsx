import React, { useState } from 'react';
import { Phone, MessageSquare, Send, CheckCircle2, ArrowUpRight, Headphones } from 'lucide-react';
import { saveInquiry } from '../lib/storage';
import { getFestivalContent } from '../lib/contentStore';

export default function OrganisersContact({ organisersData }) {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '', type: 'General Inquiry' });
  const [submitted, setSubmitted] = useState(false);

  const organisers = organisersData || getFestivalContent().organisers || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    saveInquiry(formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', phone: '', message: '', type: 'General Inquiry' });
      setSubmitted(false);
    }, 3500);
  };

  return (
    <section className="bg-[#0b1229] text-[#dce1ff] p-4 sm:p-12 border-b border-[#1e294b]" id="contact">
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-[#2a3656] pb-3 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-[#38bdf8] mb-1">
              <Headphones className="w-4 h-4 text-[#38bdf8]" />
              <span className="font-label-stamp text-xs uppercase tracking-widest font-bold">
                DIRECT EVENT SUPPORT
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-headline-lg uppercase text-white">
              ORGANISERS / ANY QUERIES CONTACT
            </h2>
          </div>
          <span className="font-label-ticket text-xs uppercase text-[#f6c86a] font-bold bg-[#141a32] px-3 py-1 border border-[#2a3656] rounded-full self-start sm:self-auto">
            AVAILABLE 24/7 FOR CALLS & WHATSAPP
          </span>
        </div>

        {/* Organiser Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {organisers.map((org, i) => (
            <div
              key={org.name || i}
              className="bg-[#141a32] border-2 border-[#2a3656] hover:border-[#38bdf8] p-4 flex flex-col justify-between poster-shadow-dark group transition-all rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://api.whatsapp.com/send?phone=${org.cleanPhone || org.phone.replace(/\D/g, '')}&text=Hi%20${org.name},%20I%20have%20an%20inquiry%20regarding%20Dandiya%20Raat%202026%20at%20Narapally.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Chat on WhatsApp"
                    className="p-1.5 bg-[#0b1229] border border-[#2a3656] hover:border-emerald-400 text-emerald-400 rounded transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`tel:${org.phone.replace(/[^0-9+]/g, '')}`}
                    title="Direct Call"
                    className="p-1.5 bg-[#0b1229] border border-[#2a3656] hover:border-[#38bdf8] text-[#38bdf8] rounded transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div>
                <span className="font-label-stamp text-[10px] uppercase tracking-widest text-[#38bdf8] font-bold block mb-1">
                  {org.role}
                </span>
                <h3 className="font-headline-sm text-xl text-white uppercase mb-1">
                  {org.name}
                </h3>
                <a
                  href={`tel:${org.phone.replace(/[^0-9+]/g, '')}`}
                  className="font-mono text-sm text-[#ffe8c0] font-bold hover:underline block"
                >
                  {org.phone}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Message / Group Booking Inquiry Form */}
        <div className="bg-[#0a153d] border-2 border-[#2a3656] p-5 sm:p-6 rounded-xl poster-shadow-dark">
          <h3 className="font-headline-sm text-xl text-[#f6c86a] uppercase mb-2">
            SEND A DIRECT INQUIRY / BULK BOOKING REQUEST
          </h3>
          <p className="text-xs text-[#a5b4d4] mb-4">
            For group bookings over 20 passes, corporate stalls, or sponsorship queries, leave your message below.
          </p>

          {submitted ? (
            <div className="p-4 bg-emerald-950 border border-emerald-500 rounded-lg text-emerald-300 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block">Inquiry Submitted Successfully!</span>
                <span className="text-xs">Our team will reach out to you via call / WhatsApp within 30 minutes.</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-label-stamp text-[10px] uppercase text-[#a5b4d4] block mb-1">YOUR NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#060d24] border border-[#2a3656] p-2 text-xs text-white rounded focus:border-[#f6c86a]"
                  />
                </div>
                <div>
                  <label className="font-label-stamp text-[10px] uppercase text-[#a5b4d4] block mb-1">MOBILE NUMBER</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 Mobile Number"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#060d24] border border-[#2a3656] p-2 text-xs text-white rounded focus:border-[#f6c86a]"
                  />
                </div>
                <div>
                  <label className="font-label-stamp text-[10px] uppercase text-[#a5b4d4] block mb-1">INQUIRY TYPE</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#060d24] border border-[#2a3656] p-2 text-xs text-white rounded focus:border-[#f6c86a]"
                  >
                    <option value="General Inquiry">General Festival Inquiry</option>
                    <option value="Bulk Tickets (15+)">Bulk Tickets (15+ passes)</option>
                    <option value="Food Stall Booking">Food Stall / Flea Stall</option>
                    <option value="Sponsorship">Sponsorship & Brand Partner</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-label-stamp text-[10px] uppercase text-[#a5b4d4] block mb-1">MESSAGE / SPECIAL REQUIREMENTS</label>
                <textarea
                  rows="2"
                  placeholder="How can our organizers assist you?"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#060d24] border border-[#2a3656] p-2 text-xs text-white rounded focus:border-[#f6c86a]"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white px-5 py-2.5 font-headline-sm text-base uppercase rounded poster-shadow-dark flex items-center gap-1.5 active:translate-y-0.5 transition-all"
              >
                <span>TRANSMIT INQUIRY</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
