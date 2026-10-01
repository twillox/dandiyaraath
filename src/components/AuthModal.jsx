import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Ticket } from 'lucide-react';
import { loginWithGoogleFirebase, loginAsGateScanner } from '../lib/auth';

export default function AuthModal({ isOpen, onClose, onSuccess, requiredRole = null, actionContext = null }) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isBookingAction = actionContext === 'booking';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await loginWithGoogleFirebase();
      setLoading(false);
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err) {
      setLoading(false);
      console.error('Firebase Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in window was closed. Please click below to sign in with your Google account.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Firebase domain warning: Ensure localhost is added to Authorized Domains in Firebase Console > Authentication > Settings.');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#0b1229] border-2 border-[#2a3656] text-[#dce1ff] p-6 sm:p-7 rounded-2xl poster-shadow-dark animate-fadeIn">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 text-[#a5b4d4] hover:text-white border border-[#2a3656] hover:border-[#f6c86a] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#141a32] border border-[#38bdf8]/40 flex items-center justify-center mx-auto mb-3.5 shadow-md">
            {isBookingAction ? (
              <Ticket className="w-7 h-7 text-[#f6c86a]" />
            ) : (
              <svg className="w-7 h-7" viewBox="0 0 24 24">
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
            )}
          </div>

          <h3 className="font-headline-sm text-2xl text-white uppercase leading-snug">
            {requiredRole === 'admin'
              ? 'ADMINISTRATOR AUTHENTICATION'
              : isBookingAction
                ? 'SIGN IN WITH GOOGLE TO BOOK PASSES'
                : 'SIGN IN WITH GOOGLE'}
          </h3>
          <p className="font-body-sm text-xs text-[#a5b4d4] mt-1.5 leading-relaxed">
            {requiredRole === 'admin'
              ? 'Only Google accounts with the "admin" role in the database can access the festival command center.'
              : isBookingAction
                ? 'Pass booking requires an authenticated Google account. All your entry vouchers, QR turnstile passes, and dandiya receipts are safely preserved in your profile.'
                : 'Sign in to access your digital passes, ticket QR codes, and booking history across all devices.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500 rounded-lg text-xs text-red-200 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Main Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-100 text-[#0b1229] py-3.5 px-4 rounded-xl font-headline-sm text-base uppercase font-bold flex items-center justify-center gap-3 poster-shadow-dark transition-all active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>{loading ? 'AUTHENTICATING WITH GOOGLE...' : 'CONTINUE WITH GOOGLE'}</span>
          </button>

          {/* Turnstile Gate Staff Scanner Quick Access */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                const passCode = window.prompt('Enter Gate Staff Passkey (e.g. GATE2026 or AUTH2026):', 'GATE2026');
                if (passCode && (passCode.trim().toUpperCase() === 'GATE2026' || passCode.trim().toUpperCase() === 'AUTH2026' || passCode.trim().toUpperCase() === 'AUTH')) {
                  const gateUser = loginAsGateScanner('Main Entrance', 'Turnstile Staff');
                  if (onSuccess) onSuccess(gateUser);
                  onClose();
                } else if (passCode) {
                  setError('Invalid Gate Staff Passkey. Access denied.');
                }
              }}
              className="text-xs text-[#f6c86a] hover:text-white underline font-mono tracking-wide"
            >
              Gate Staff Turnstile Access (Role: Auth)
            </button>
          </div>

          {/* Secure OAuth Assurance Footer */}
          <div className="pt-3 border-t border-[#2a3656]/60 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#a5b4d4]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Official Firebase Google Authentication • 100% Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
