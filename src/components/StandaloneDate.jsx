import React from 'react';
import { Calendar, ArrowRight, Download, Lock } from 'lucide-react';
import { getFestivalContent } from '../lib/contentStore';

export default function StandaloneDate({ onOpenBooking, dateData, currentUser }) {
  const content = dateData || getFestivalContent().dateSection;

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Dandiya+Raat+2026+-+Hyderabad&dates=20261015T113000Z/20261015T213000Z&details=Navratri+Dandiya+Raat+2026+at+Narapally+Cricket+Ground,+Hyderabad.&location=Narapally+Cricket+Ground,+Hyderabad`;

  const downloadIcs = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dandiya Raat//Festival 2026//EN',
      'BEGIN:VEVENT',
      'SUMMARY:Dandiya Raat 2026 - Hyderabad',
      'DESCRIPTION:Over 5,000 dancers, live Kathiawadi dhol orchestra, and midnight Maha Aarti at Narapally Cricket Ground.',
      'LOCATION:Narapally Cricket Ground, Korremula Rd, Chowdhariguda, Hyderabad',
      'DTSTART:20261015T113000Z',
      'DTEND:20261015T213000Z',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Dandiya_Raat_2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="bg-[#0f2167] text-[#dce1ff] p-4 sm:p-12 border-b border-[#2a3656] overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-baseline justify-between border-4 border-[#38bdf8]/50 p-6 sm:p-10 relative bg-[#0a153d] rounded-xl poster-shadow-dark">
        {/* Rubber stamp badge */}
        <div className="absolute -top-3.5 right-4 bg-[#060d24] text-[#f6c86a] px-3.5 py-1 rubber-stamp font-label-stamp text-xs uppercase tracking-widest border border-[#f6c86a]">
          {content.stamp || 'OFFICIAL FESTIVAL DATE'}
        </div>

        <div className="flex items-baseline gap-4">
          <span className="text-7xl sm:text-[160px] font-display-hero leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {content.day || '15'}
          </span>
          <div className="flex flex-col">
            <span className="text-3xl sm:text-6xl font-headline-lg tracking-widest text-[#f6c86a] leading-none">
              {content.month || 'OCTOBER'}
            </span>
            <span className="font-title-editorial text-sm sm:text-lg text-[#c6f2ff] tracking-wider mt-1">
              {content.yearSubtitle || '2026 // AUTUMN MOON'}
            </span>
          </div>
        </div>

        <div className="mt-6 md:mt-0 text-left md:text-right border-t md:border-t-0 md:border-l border-[#2a3656] pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
          <div className="font-headline-sm text-2xl sm:text-3xl text-white uppercase mb-1">
            {content.hours || '5:00 PM TILL LATE NIGHT'}
          </div>
          <div className="font-label-ticket text-xs uppercase tracking-widest text-[#38bdf8] mb-4">
            {content.subtext || 'NON-STOP PERCUSSION & SANEDO CIRCLE'}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              onClick={() => onOpenBooking('SINGLE PASS', 349)}
              className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white border border-[#38bdf8]/60 font-label-ticket text-xs uppercase px-4 py-2.5 poster-shadow-dark transition-all flex items-center gap-1.5 rounded active:translate-y-0.5"
            >
              {!currentUser ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>SIGN IN TO RESERVE</span>
                </>
              ) : (
                <>
                  <span>RESERVE PASS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#141a32] hover:bg-[#1f284d] text-[#ffe8c0] border border-[#2a3656] font-label-ticket text-xs uppercase px-3 py-2.5 transition-colors flex items-center gap-1.5 rounded"
            >
              <Calendar className="w-3.5 h-3.5 text-[#f6c86a]" />
              <span>GOOGLE CALENDAR</span>
            </a>

            <button
              onClick={downloadIcs}
              title="Download iCal (.ics) for Apple/Outlook"
              className="p-2.5 border border-[#2a3656] bg-[#141a32] text-[#dce1ff] hover:text-[#38bdf8] rounded"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
