import React, { useState } from 'react';
import { Menu, X, Ticket, Calendar, ShieldCheck, MapPin, Sparkles, User, LogOut, ChevronDown, Lock } from 'lucide-react';
import { logout } from '../lib/auth';
import { getFestivalContent } from '../lib/contentStore';

export default function Navbar({
  activeRoute,
  onNavigate,
  onOpenBooking,
  currentUser,
  onOpenAuth
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const festivalLogo = getFestivalContent().hero.logoUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAI00QCRrCHNCzAlVp_VDwHI08h9CQNITKgSW79HORvT2-eYnY3tZAnfm1BhASPONdVvjuxGKTPnIkFiJpsOSSWrIGWMPOS2CLzsEnLFmtgRKSHuZJcSziCZJ-n4Kr_GnOOoPtgz4kv-aoXkb6yP8Vm3yPvzEyNDIiK2puAYzCpz2XpeY1sAbyPlmRKSf9UfUdXXQEJLoeOdOak3ts0VWXPiGiUuJbo1JohJVulkU7hEl3hhhFENScMR55NsVGFQCkrQoI';

  const navLinks = [
    { id: 'home', label: 'EXPERIENCE', sectionId: 'experience' },
    { id: 'passes', label: 'PASSES', isRoute: true },
    { id: 'schedule', label: 'TIMETABLE', isRoute: true },
    { id: 'venue', label: 'VENUE', sectionId: 'venue' },
    { id: 'my-passes', label: 'MY PASSES', isRoute: true }
  ];

  const handleLinkClick = (link) => {
    setMobileDrawerOpen(false);
    if (link.isRoute) {
      onNavigate(link.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (activeRoute !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          const el = document.getElementById(link.sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(link.sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSignOut = () => {
    logout();
    setProfileDropdownOpen(false);
    if (activeRoute === 'admin') {
      onNavigate('home');
    }
  };

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-40 bg-[#0b1229]/95 backdrop-blur-md border-b border-[#1e294b] px-4 sm:px-8 py-2.5 flex items-center justify-between">
        {/* Left: Real Festival Logo as requested */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 text-left group"
          >
            <img
              src={festivalLogo}
              alt="Dandiya Raat Logo"
              className="h-7 sm:h-9 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform"
            />
            <span className="hidden md:inline font-mono text-[10px] uppercase tracking-widest text-[#38bdf8] font-bold border border-[#38bdf8]/30 px-2 py-0.5 rounded-full">
              2026
            </span>
          </button>
        </div>

        {/* Center: Clean Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className={`font-label-ticket text-xs uppercase tracking-wider transition-all py-1 border-b-2 ${
                activeRoute === link.id
                  ? 'text-[#f6c86a] border-[#f6c86a] font-bold'
                  : 'text-[#a5b4d4] border-transparent hover:text-white hover:border-[#38bdf8]/50'
              }`}
            >
              {link.label}
            </button>
          ))}
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`font-label-ticket text-xs uppercase tracking-wider transition-all py-1 border-b-2 flex items-center gap-1 ${
                activeRoute === 'admin'
                  ? 'text-[#38bdf8] border-[#38bdf8] font-bold'
                  : 'text-[#38bdf8]/80 border-transparent hover:text-[#38bdf8]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN</span>
            </button>
          )}
        </nav>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-3">
          {/* User Profile / Google Sign-in */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 bg-[#141a32] border border-[#2a3656] hover:border-[#38bdf8] rounded-full transition-all"
              >
                <span className="font-label-stamp text-xs text-[#ffe8c0] font-bold hidden sm:inline max-w-[100px] truncate">
                  {currentUser.displayName.split(' ')[0]}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="bg-[#f6c86a] text-[#070d1e] text-[9px] font-bold px-1.5 py-0.2 rounded font-mono hidden sm:inline">
                    ADMIN
                  </span>
                )}
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-7 h-7 rounded-full border border-[#38bdf8]/50 object-cover"
                />
                <ChevronDown className="w-3 h-3 text-[#a5b4d4] mr-1" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0b1229] border-2 border-[#2a3656] rounded-xl p-3 shadow-2xl z-50 animate-fadeIn text-[#dce1ff]">
                  <div className="pb-2.5 mb-2 border-b border-[#2a3656]">
                    <span className="font-headline-sm text-sm text-white block truncate">
                      {currentUser.displayName}
                    </span>
                    <span className="font-mono text-[10px] text-[#a5b4d4] block truncate">
                      {currentUser.email}
                    </span>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                      currentUser.role === 'admin' ? 'bg-amber-950 text-amber-300 border border-amber-500' : 'bg-blue-950 text-blue-300 border border-blue-500'
                    }`}>
                      ROLE: {currentUser.role.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('my-passes');
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-[#141a32] rounded flex items-center gap-2 text-[#dce1ff]"
                    >
                      <Ticket className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>My Digital Passes</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-2 py-1.5 hover:bg-[#141a32] rounded flex items-center gap-2 text-[#f6c86a] font-bold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Command Center</span>
                      </button>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-2 py-1.5 hover:bg-red-950/40 text-red-300 rounded flex items-center gap-2 border-t border-[#2a3656] mt-1 pt-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#141a32] hover:bg-[#181e36] border border-[#2a3656] hover:border-[#38bdf8] text-[11px] sm:text-xs font-label-stamp uppercase font-bold text-[#dce1ff] rounded-lg transition-all"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>SIGN IN</span>
            </button>
          )}

          {/* Primary Book Pass Action (Visible on tablet & desktop, mobile uses sticky bottom bar) */}
          <button
            onClick={() => onOpenBooking('SINGLE PASS', 349)}
            className="hidden sm:flex bg-[#1d4ed8] hover:bg-[#2563eb] text-white border border-[#38bdf8]/50 px-3.5 sm:px-4 py-1.5 font-label-ticket text-xs uppercase tracking-wider items-center gap-1.5 poster-shadow-dark active:translate-x-0.5 active:translate-y-0.5 transition-all rounded"
          >
            {!currentUser ? (
              <>
                <Lock className="w-3.5 h-3.5 text-[#f6c86a]" />
                <span className="font-bold">LOGIN TO BOOK</span>
              </>
            ) : (
              <>
                <Ticket className="w-3.5 h-3.5 text-[#f6c86a]" />
                <span className="font-bold">BOOK PASS</span>
              </>
            )}
          </button>

          {/* Clean, Compact Mobile Drawer Toggle */}
          <button
            aria-label="Open Navigation Menu"
            className="lg:hidden p-1.5 border border-[#2a3656] text-[#dce1ff] hover:text-[#f6c86a] rounded transition-colors"
            onClick={() => setMobileDrawerOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* COMPACT & NEAT MOBILE DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={() => setMobileDrawerOpen(false)}
          ></div>

          {/* Slide Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#060d24] border-l-2 border-[#2a3656] p-5 flex flex-col justify-between z-10 shadow-2xl animate-slideLeft">
            <div>
              {/* Drawer Top with Real Logo */}
              <div className="flex items-center justify-between border-b border-[#2a3656] pb-3 mb-4">
                <img src={festivalLogo} alt="Logo" className="h-7 w-auto object-contain" />
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 border border-[#2a3656] text-[#a5b4d4] hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User info if logged in */}
              {currentUser && (
                <div className="p-3 bg-[#141a32] border border-[#2a3656] rounded-xl mb-4 flex items-center gap-3">
                  <img src={currentUser.photoURL} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div className="overflow-hidden">
                    <span className="font-headline-sm text-sm text-white block truncate">{currentUser.displayName}</span>
                    <span className="text-[10px] text-[#38bdf8] font-mono block uppercase">Role: {currentUser.role}</span>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-1.5">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg font-headline-sm text-lg uppercase transition-colors flex items-center justify-between ${
                      activeRoute === link.id
                        ? 'bg-[#1d4ed8] text-white font-bold'
                        : 'text-[#dce1ff] hover:bg-[#141a32]'
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-xs text-[#a5b4d4]">➔</span>
                  </button>
                ))}

                {currentUser && currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg font-headline-sm text-lg uppercase text-[#f6c86a] hover:bg-[#141a32] flex items-center justify-between border border-[#f6c86a]/30 mt-2"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>ADMIN PORTAL</span>
                    </span>
                    <span className="text-xs">➔</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Drawer Bottom Action */}
            <div className="pt-4 border-t border-[#2a3656] space-y-2">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenBooking('SINGLE PASS', 349);
                }}
                className="w-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-2.5 font-headline-sm text-base uppercase rounded poster-shadow-dark flex items-center justify-center gap-1.5"
              >
                {!currentUser ? (
                  <>
                    <Lock className="w-4 h-4 text-[#f6c86a]" />
                    <span>LOGIN TO BOOK PASS</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4 text-[#f6c86a]" />
                    <span>BOOK YOUR PASS</span>
                  </>
                )}
              </button>

              {currentUser ? (
                <button
                  onClick={handleSignOut}
                  className="w-full py-1.5 text-center text-xs text-red-400 hover:text-red-300"
                >
                  Sign Out ({currentUser.displayName.split(' ')[0]})
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-2 bg-[#141a32] hover:bg-[#181e36] text-[#ffe8c0] text-xs font-label-stamp uppercase font-bold rounded border border-[#2a3656] text-center"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
