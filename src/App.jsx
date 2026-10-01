import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileStickyBar from './components/MobileStickyBar';
import BookingDrawer from './components/BookingDrawer';
import DigitalPassModal from './components/DigitalPassModal';
import AuthModal from './components/AuthModal';

import { getCurrentUser, subscribeToAuth, logout } from './lib/auth';
import { getFestivalContent } from './lib/contentStore';
import { LogOut, ShieldCheck } from 'lucide-react';

// Pages
import HomePage from './pages/HomePage';
import PassesPage from './pages/PassesPage';
import SchedulePage from './pages/SchedulePage';
import MyPassesPage from './pages/MyPassesPage';
import AdminPage from './pages/AdminPage';

// Dedicated Administrator Console Header
function AdminPortalHeader({ currentUser, onSignOut }) {
  const festivalLogo = getFestivalContent()?.hero?.logoUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAI00QCRrCHNCzAlVp_VDwHI08h9CQNITKgSW79HORvT2-eYnY3tZAnfm1BhASPONdVvjuxGKTPnIkFiJpsOSSWrIGWMPOS2CLzsEnLFmtgRKSHuZJcSziCZJ-n4Kr_GnOOoPtgz4kv-aoXkb6yP8Vm3yPvzEyNDIiK2puAYzCpz2XpeY1sAbyPlmRKSf9UfUdXXQEJLoeOdOak3ts0VWXPiGiUuJbo1JohJVulkU7hEl3hhhFENScMR55NsVGFQCkrQoI';

  return (
    <header className="bg-[#060d24] border-b-2 border-[#1e294b] px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Official Festival Logo & Console Title */}
        <div className="flex items-center gap-3">
          <img
            src={festivalLogo}
            alt="Dandiya Raat Logo"
            className="h-9 sm:h-11 w-auto object-contain"
          />
          <div className="border-l border-[#2a3656] pl-3">
            <span className="font-headline-sm text-sm sm:text-base text-white tracking-wider uppercase block leading-tight">
              ADMINISTRATOR DASHBOARD
            </span>
            <span className="font-label-stamp text-[9px] text-[#f6c86a] font-bold uppercase tracking-wider block">
              ROLE: ADMIN (DATABASE VERIFIED)
            </span>
          </div>
        </div>

        {/* Right: Logged-in Admin Account & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#141a32] border border-[#2a3656] rounded-full text-xs">
            <img
              src={currentUser.photoURL}
              alt=""
              className="w-6 h-6 rounded-full border border-amber-400/80 object-cover"
            />
            <div className="text-left hidden md:block">
              <span className="text-white font-bold block text-xs leading-none truncate max-w-[140px]">
                {currentUser.displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block leading-none mt-0.5 truncate max-w-[140px]">
                {currentUser.email}
              </span>
            </div>
            <span className="bg-amber-950 text-amber-300 border border-amber-500 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded">
              ADMIN
            </span>
          </div>

          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-200 hover:text-white rounded-lg text-xs font-label-stamp uppercase font-bold transition-colors shadow-md"
            title="Sign out of Admin Dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SIGN OUT</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [activeRoute, setActiveRoute] = useState('home');
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRequiredRole, setAuthRequiredRole] = useState(null);

  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState({ title: 'SINGLE PASS', price: 349 });
  const [activeDigitalPass, setActiveDigitalPass] = useState(null);

  const [pendingBooking, setPendingBooking] = useState(null);
  const [authActionContext, setAuthActionContext] = useState(null);

  // Subscribe to auth changes
  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const unsub = subscribeToAuth(() => {
      setCurrentUser(getCurrentUser());
    });
    return unsub;
  }, []);

  // Sync route with URL hash for browser history & bookmarking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (['passes', 'schedule', 'my-passes', 'admin'].includes(hash)) {
        setActiveRoute(hash);
      } else {
        setActiveRoute('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (routeId) => {
    setActiveRoute(routeId);
    window.location.hash = routeId === 'home' ? '' : `#/${routeId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    logout();
    setActiveRoute('home');
  };

  // STRICT RULE: Pass buying should ONLY happen after logging in!
  // Until then there should be no access to buy one.
  const handleOpenBooking = (passTitle = 'SINGLE PASS', price = 349) => {
    if (!currentUser) {
      setPendingBooking({ title: passTitle, price });
      setAuthActionContext('booking');
      setAuthModalOpen(true);
      return;
    }

    setSelectedPass({ title: passTitle, price });
    setBookingDrawerOpen(true);
  };

  const handleBookingComplete = (newBooking) => {
    setActiveDigitalPass(newBooking);
  };

  const handleOpenAuth = (requiredRole = null, context = null) => {
    setAuthRequiredRole(requiredRole);
    setAuthActionContext(context);
    setAuthModalOpen(true);
  };

  // =========================================================================
  // RULE: WHEN USER'S ROLE IN DATABASE IS ADMIN, DIRECTLY DISPLAY ADMIN DASHBOARD!
  // No public user festival website (Home, Passes, Schedule, Buy buttons) is shown.
  // =========================================================================
  if (currentUser && currentUser.role === 'admin') {
    return (
      <div className="bg-[#070d1e] text-on-surface min-h-screen flex flex-col font-body-md selection:bg-[#38bdf8] selection:text-[#0b1229]">
        <AdminPortalHeader currentUser={currentUser} onSignOut={handleSignOut} />
        <main className="flex-1">
          <AdminPage
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('admin')}
          />
        </main>
        <footer className="bg-[#050a1c] border-t border-[#1e294b] py-4 px-6 text-[10px] font-label-stamp uppercase text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>DANDIYA RAAT 2026 • ORGANISER COMMAND CENTER</span>
            <span>ROLE-BASED ACCESS CONTROL STRICTLY ENFORCED VIA DATABASE</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-[#0b1229] text-on-surface min-h-screen flex flex-col font-body-md selection:bg-[#38bdf8] selection:text-[#0b1229]">
      {/* Top Sticky Navigation */}
      <Navbar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenBooking}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth()}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeRoute === 'home' && (
          <HomePage
            currentUser={currentUser}
            onOpenBooking={handleOpenBooking}
            onNavigate={handleNavigate}
          />
        )}
        {activeRoute === 'passes' && (
          <PassesPage
            currentUser={currentUser}
            onOpenBooking={handleOpenBooking}
          />
        )}
        {activeRoute === 'schedule' && (
          <SchedulePage />
        )}
        {activeRoute === 'my-passes' && (
          <MyPassesPage
            onOpenBooking={handleOpenBooking}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth()}
          />
        )}
        {activeRoute === 'admin' && (
          <AdminPage
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('admin')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenBooking={handleOpenBooking}
      />

      {/* Mobile Sticky Quick Booking Bar (Hidden in wallet & admin) */}
      {activeRoute !== 'my-passes' && activeRoute !== 'admin' && (
        <MobileStickyBar
          currentUser={currentUser}
          onOpenBooking={handleOpenBooking}
        />
      )}

      {/* Booking Checkout Drawer */}
      <BookingDrawer
        isOpen={bookingDrawerOpen}
        onClose={() => setBookingDrawerOpen(false)}
        initialPassTitle={selectedPass.title}
        initialPrice={selectedPass.price}
        onBookingComplete={handleBookingComplete}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth(null, 'booking')}
      />

      {/* Newly Issued Digital Pass Modal */}
      {activeDigitalPass && (
        <DigitalPassModal
          booking={activeDigitalPass}
          onClose={() => setActiveDigitalPass(null)}
          onNavigateToWallet={() => handleNavigate('my-passes')}
        />
      )}

      {/* Google Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthActionContext(null);
        }}
        requiredRole={authRequiredRole}
        actionContext={authActionContext}
        onSuccess={(user) => {
          if (authRequiredRole === 'admin' && user.role === 'admin') {
            handleNavigate('admin');
          } else if (pendingBooking) {
            setSelectedPass(pendingBooking);
            setBookingDrawerOpen(true);
            setPendingBooking(null);
            setAuthActionContext(null);
          }
        }}
      />
    </div>
  );
}
