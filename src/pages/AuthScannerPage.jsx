import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  findBooking,
  updateBookingCheckIn,
  getLocalBookings,
  subscribeToStore
} from '../lib/storage';
import { logout } from '../lib/auth';
import { getFestivalContent } from '../lib/contentStore';
import {
  Camera,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  LogOut,
  Volume2,
  VolumeX,
  Keyboard,
  ShieldCheck,
  Search,
  Users,
  Clock,
  MapPin,
  RefreshCw,
  Zap,
  ZapOff
} from 'lucide-react';

// Web Audio API Synthesizers for Instant Audio Feedback
function playSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      // Pleasant high double-chime (880Hz A5 -> 1320Hz E6)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now + 0.12);
      gain2.gain.setValueAtTime(0.35, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.4);
    } else if (type === 'already_used') {
      // Deep harsh double-buzzer (160Hz -> 130Hz sawtooth)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(130, now + 0.15);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'warning') {
      // Rapid alternating amber alert beeps
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(390, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'invalid') {
      // Low thud error
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (err) {
    console.warn('Audio synthesis notice:', err);
  }
}

export default function AuthScannerPage({ currentUser, onSignOut }) {
  const festivalLogo = getFestivalContent()?.hero?.logoUrl ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAI00QCRrCHNCzAlVp_VDwHI08h9CQNITKgSW79HORvT2-eYnY3tZAnfm1BhASPONdVvjuxGKTPnIkFiJpsOSSWrIGWMPOS2CLzsEnLFmtgRKSHuZJcSziCZJ-n4Kr_GnOOoPtgz4kv-aoXkb6yP8Vm3yPvzEyNDIiK2puAYzCpz2XpeY1sAbyPlmRKSf9UfUdXXQEJLoeOdOak3ts0VWXPiGiUuJbo1JohJVulkU7hEl3hhhFENScMR55NsVGFQCkrQoI';

  // Scanner states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanResult, setScanResult] = useState(null); // { type: 'VALID_ADMISSION' | 'ALREADY_USED' | 'PENDING' | 'NOT_FOUND', booking, rawQuery }
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedGate, setSelectedGate] = useState('Main Entrance');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionAdmissions, setSessionAdmissions] = useState([]);
  const [manualInputOpen, setManualInputOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Hardware torch & camera switching
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);

  const scannerRef = useRef(null);
  const autoResumeTimerRef = useRef(null);

  // Sync turnstile metrics from store
  const [totalFestBookings, setTotalFestBookings] = useState([]);
  const refreshStats = () => {
    const list = getLocalBookings();
    setTotalFestBookings(list);
  };

  useEffect(() => {
    refreshStats();
    const unsub = subscribeToStore(refreshStats);
    return unsub;
  }, []);

  // Initialize and start camera
  useEffect(() => {
    let html5QrCode = null;
    let isCancelled = false;

    async function initScanner() {
      try {
        setCameraError(null);
        // List cameras
        const devices = await Html5Qrcode.getCameras();
        if (isCancelled) return;

        if (!devices || devices.length === 0) {
          setCameraError('No camera found on this device. Use manual code entry below.');
          return;
        }

        setAvailableCameras(devices);
        // Prefer back camera ("environment")
        const backCam = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[0];
        const camId = selectedCameraId || backCam.id;

        html5QrCode = new Html5Qrcode('turnstile-qr-reader');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          camId,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const edgeSize = Math.floor(minEdge * 0.72);
              return { width: edgeSize, height: edgeSize };
            },
            aspectRatio: 1.0
          },
          (decodedText) => {
            onQrCodeDetected(decodedText);
          },
          () => {
            // Frame scanned with no QR code detected
          }
        );

        if (!isCancelled) {
          setCameraActive(true);
          // Check torch capability
          try {
            const track = html5QrCode.getRunningTrackCapabilities?.();
            if (track && track.torch) {
              setHasTorch(true);
            }
          } catch {}
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Camera initialization error:', err);
          setCameraActive(false);
          if (err.name === 'NotAllowedError' || err.toString().includes('NotAllowedError')) {
            setCameraError('Camera permission denied. Please allow camera permissions in browser address bar.');
          } else {
            setCameraError(err.message || 'Unable to open camera feed. You can use manual pass code lookup below.');
          }
        }
      }
    }

    initScanner();

    return () => {
      isCancelled = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          try {
            scannerRef.current.clear();
          } catch {}
        });
      }
      if (autoResumeTimerRef.current) {
        clearTimeout(autoResumeTimerRef.current);
      }
    };
  }, [selectedCameraId]);

  // Handle detected QR Code
  const onQrCodeDetected = (decodedText) => {
    if (isProcessing) return;
    processTicketCode(decodedText);
  };

  const processTicketCode = (code) => {
    if (!code || isProcessing) return;
    setIsProcessing(true);

    // Pause camera scan loop momentarily
    if (scannerRef.current && scannerRef.current.pause) {
      try {
        scannerRef.current.pause(true);
      } catch {}
    }

    const booking = findBooking(code);

    if (!booking) {
      // 1. INVALID PASS
      if (soundEnabled) playSound('invalid');
      try { navigator.vibrate?.([200, 100, 200]); } catch {}

      setScanResult({
        type: 'NOT_FOUND',
        rawQuery: code,
        timestamp: new Date().toLocaleTimeString()
      });
      setIsProcessing(false);
      return;
    }

    // 2. CHECK PAYMENT STATUS (REJECTED vs PENDING)
    if (booking.paymentStatus === 'REJECTED') {
      if (soundEnabled) playSound('invalid');
      try { navigator.vibrate?.([400, 100, 400]); } catch {}

      setScanResult({
        type: 'REJECTED_PAYMENT',
        booking: booking,
        rawQuery: code,
        timestamp: new Date().toLocaleTimeString()
      });
      setIsProcessing(false);
      return;
    }

    if (booking.paymentStatus === 'PENDING_VERIFICATION') {
      if (soundEnabled) playSound('warning');
      try { navigator.vibrate?.([150, 100, 150]); } catch {}

      setScanResult({
        type: 'PENDING_PAYMENT',
        booking: booking,
        rawQuery: code,
        timestamp: new Date().toLocaleTimeString()
      });
      setIsProcessing(false);
      return;
    }

    // 3. CHECK IF ALREADY USED
    if (booking.checkedIn === true) {
      if (soundEnabled) playSound('already_used');
      try { navigator.vibrate?.([400, 100, 400]); } catch {}

      setScanResult({
        type: 'ALREADY_USED',
        booking: booking,
        rawQuery: code,
        timestamp: new Date().toLocaleTimeString()
      });
      setIsProcessing(false);
      return;
    }

    // 4. VALID PASS -> MARK USED EVERYWHERE IMMEDIATELY!
    const checkInResult = updateBookingCheckIn(booking.id, true, selectedGate);

    if (checkInResult.success) {
      if (soundEnabled) playSound('success');
      try { navigator.vibrate?.([100, 60, 100]); } catch {}

      const updatedBooking = checkInResult.booking;
      setScanResult({
        type: 'VALID_ADMISSION',
        booking: updatedBooking,
        rawQuery: code,
        timestamp: new Date().toLocaleTimeString()
      });

      // Record in current session admissions
      setSessionAdmissions(prev => [
        {
          id: updatedBooking.id,
          ref: updatedBooking.ref || updatedBooking.id,
          holderName: updatedBooking.holderName,
          passTitle: updatedBooking.passTitle,
          quantity: updatedBooking.quantity || 1,
          time: new Date().toLocaleTimeString(),
          gate: selectedGate
        },
        ...prev
      ]);
    } else if (checkInResult.alreadyUsed) {
      if (soundEnabled) playSound('already_used');
      try { navigator.vibrate?.([400, 100, 400]); } catch {}

      setScanResult({
        type: 'ALREADY_USED',
        booking: checkInResult.booking,
        rawQuery: code,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    setIsProcessing(false);

    // Auto-resume camera scanning after 5 seconds of displaying result
    if (autoResumeTimerRef.current) clearTimeout(autoResumeTimerRef.current);
    autoResumeTimerRef.current = setTimeout(() => {
      resumeScanning();
    }, 5500);
  };

  const resumeScanning = () => {
    if (autoResumeTimerRef.current) clearTimeout(autoResumeTimerRef.current);
    setScanResult(null);
    setIsProcessing(false);
    if (scannerRef.current && scannerRef.current.resume) {
      try {
        scannerRef.current.resume();
      } catch {}
    }
  };

  const handleManualLookup = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setManualInputOpen(false);
    processTicketCode(manualCode.trim());
    setManualCode('');
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }]
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn('Torch toggle not supported on this device/browser:', err);
    }
  };

  const totalAdmittedInFestival = totalFestBookings.filter(b => b.checkedIn).length;
  const totalVerifiedBookings = totalFestBookings.filter(b => b.paymentStatus !== 'PENDING_VERIFICATION' && b.paymentStatus !== 'REJECTED').length;

  return (
    <div className="bg-[#050a18] text-[#dce1ff] min-h-screen flex flex-col font-body-md select-none">
      {/* Turnstile Top App Bar */}
      <header className="bg-[#070d22] border-b-2 border-[#1e294b] px-3.5 sm:px-6 py-2.5 sticky top-0 z-40 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Festival Emblem & Gate Scanner Brand */}
          <div className="flex items-center gap-2.5">
            <img
              src={festivalLogo}
              alt="Dandiya Raat"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow"
            />
            <div className="border-l border-[#2a3656] pl-2.5">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-sm sm:text-base text-white tracking-wide uppercase font-bold block leading-none">
                  TURNSTILE SCANNER
                </span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/80 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <span className="font-label-stamp text-[9px] text-[#f6c86a] font-bold uppercase tracking-wider block mt-0.5">
                ROLE: AUTH (SECURITY GATE PASS)
              </span>
            </div>
          </div>

          {/* Gate Selector & Controls */}
          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label="Toggle turnstile audio"
              className={`p-2 rounded-lg border text-xs transition-colors ${
                soundEnabled
                  ? 'bg-[#141a32] border-[#2a3656] text-[#38bdf8]'
                  : 'bg-red-950/40 border-red-800 text-red-400'
              }`}
              title={soundEnabled ? 'Sound On' : 'Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Manual Code Entry Button */}
            <button
              onClick={() => setManualInputOpen(true)}
              className="p-2 bg-[#141a32] hover:bg-[#1c2445] border border-[#2a3656] hover:border-[#f6c86a] rounded-lg text-[#f6c86a] text-xs transition-colors"
              title="Enter Pass Code Manually"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-200 hover:text-white rounded-lg text-xs font-label-stamp uppercase font-bold transition-all shadow-md active:scale-95"
              title="Sign Out of Gate Scanner"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SIGN OUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Turnstile Body */}
      <main className="flex-1 max-w-xl w-full mx-auto p-3 sm:p-4 flex flex-col gap-3">
        {/* Festival Main Entrance Status Bar */}
        <div className="bg-[#0b1229] border border-[#1e294b] rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-4 h-4 text-[#f6c86a] shrink-0" />
            <span className="text-white font-label-stamp uppercase text-[11px] font-bold">
              NARAPALLY CRICKET GROUND • MAIN ENTRANCE
            </span>
          </div>
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/80 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
            SCANNER READY
          </span>
        </div>

        {/* Live Viewfinder / Scanner Container */}
        <div className="relative bg-[#070d1e] border-2 border-[#1e294b] rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[340px] sm:min-h-[380px]">
          {/* Turnstile Reticle / Overlay when camera is active and no scan result */}
          {cameraActive && !scanResult && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
              {/* Animated Laser Scanning Beam */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-[#38bdf8]/60 rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.25)] flex items-center justify-center">
                {/* 4 Corner Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#f6c86a] rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#f6c86a] rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#f6c86a] rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#f6c86a] rounded-br-lg"></div>

                {/* Laser animation line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#f6c86a] to-transparent shadow-[0_0_12px_#f6c86a] animate-pulse"></div>

                <span className="font-label-stamp text-[10px] text-white/90 bg-[#070d1e]/80 px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
                  ALIGN PASS QR CODE HERE
                </span>
              </div>
            </div>
          )}

          {/* Hardware Torch & Camera Switcher Floating Bar */}
          {cameraActive && !scanResult && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
              {hasTorch && (
                <button
                  onClick={toggleTorch}
                  className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                    torchOn
                      ? 'bg-amber-400 text-[#070d1e] border-amber-300 shadow-[0_0_12px_#f6c86a]'
                      : 'bg-black/50 text-white border-white/20'
                  }`}
                  title={torchOn ? 'Turn Off Flashlight' : 'Turn On Flashlight'}
                >
                  {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                </button>
              )}

              {availableCameras.length > 1 && (
                <button
                  onClick={() => {
                    const currentIndex = availableCameras.findIndex(c => c.id === selectedCameraId);
                    const nextIndex = (currentIndex + 1) % availableCameras.length;
                    setSelectedCameraId(availableCameras[nextIndex].id);
                  }}
                  className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-colors"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* HTML5 QR Code DOM Element */}
          <div
            id="turnstile-qr-reader"
            className="w-full h-full min-h-[340px] sm:min-h-[380px] bg-black flex items-center justify-center overflow-hidden"
          ></div>

          {/* Camera Error or Loading States */}
          {!cameraActive && !cameraError && (
            <div className="absolute inset-0 bg-[#070d1e] flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
              <Camera className="w-12 h-12 text-[#38bdf8] animate-pulse" />
              <h3 className="font-headline-sm text-lg uppercase text-white">INITIALIZING TURNSTILE CAMERA</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Requesting rear-facing scanner camera stream...
              </p>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 bg-[#070d1e] flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
              <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-headline-sm text-lg uppercase text-red-300">CAMERA ACCESS ISSUE</h3>
              <p className="text-xs text-red-200/80 max-w-sm leading-relaxed">
                {cameraError}
              </p>
              <button
                onClick={() => setManualInputOpen(true)}
                className="bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs font-headline-sm uppercase px-4 py-2 rounded-lg font-bold shadow-lg"
              >
                USE MANUAL TICKET LOOKUP
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* RESULT OVERLAYS: INSTANT RECOGNITION (VALID vs ALREADY USED vs PENDING)  */}
          {/* ========================================================================= */}
          {scanResult && (
            <div className="absolute inset-0 z-30 bg-black/92 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between animate-fadeIn">
              {/* 1. ALREADY USED! (Critical Warning) */}
              {scanResult.type === 'ALREADY_USED' && (
                <div className="flex-1 flex flex-col justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mx-auto text-red-500 animate-bounce">
                    <XCircle className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="bg-red-600 text-white font-mono text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      DENIED • ALREADY USED
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-headline-sm uppercase text-red-400 mt-2 tracking-tight">
                      ALREADY USED!
                    </h2>
                    <p className="text-xs text-red-200 mt-1">
                      This pass has already been admitted at the turnstiles.
                    </p>
                  </div>

                  {/* Previous Admission Details Card */}
                  <div className="bg-[#14080a] border-2 border-red-600/70 rounded-xl p-3.5 text-left text-xs space-y-2 max-w-sm mx-auto w-full shadow-2xl">
                    <div className="flex justify-between items-center pb-1.5 border-b border-red-900/60">
                      <span className="text-red-300 font-label-stamp uppercase text-[10px]">ADMITTED AT:</span>
                      <span className="font-mono font-bold text-red-200">
                        {scanResult.booking?.checkedInAt
                          ? new Date(scanResult.booking.checkedInAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })
                          : 'Earlier during festival'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-red-300 font-label-stamp uppercase text-[10px]">ENTRANCE:</span>
                      <span className="font-bold text-white">
                        Main Entrance (Narapally Ground)
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-red-300 font-label-stamp uppercase text-[10px]">ATTENDEE:</span>
                      <span className="font-bold text-white uppercase truncate max-w-[160px]">
                        {scanResult.booking?.holderName}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-red-300 font-label-stamp uppercase text-[10px]">PASS TIER:</span>
                      <span className="font-medium text-amber-300 uppercase">
                        {scanResult.booking?.passTitle} (x{scanResult.booking?.quantity || 1})
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-red-900/60 font-mono text-[11px]">
                      <span className="text-slate-400">BOOKING REF:</span>
                      <span className="font-bold text-red-400">{scanResult.booking?.ref || scanResult.booking?.id}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. VALID ADMISSION (Marked Used Everywhere) */}
              {scanResult.type === 'VALID_ADMISSION' && (
                <div className="flex-1 flex flex-col justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="bg-emerald-600 text-white font-mono text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      ADMISSION APPROVED • PASS USED
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-headline-sm uppercase text-emerald-400 mt-2 tracking-tight">
                      VALID ENTRY!
                    </h2>
                    <p className="text-xs text-emerald-200 mt-1">
                      Pass marked as <strong className="text-white">USED EVERYWHERE</strong> in real-time database.
                    </p>
                  </div>

                  {/* Attendee Admission Card */}
                  <div className="bg-[#051c14] border-2 border-emerald-500/70 rounded-xl p-3.5 text-left text-xs space-y-2 max-w-sm mx-auto w-full shadow-2xl">
                    <div className="flex justify-between items-center pb-1.5 border-b border-emerald-900/60">
                      <span className="text-emerald-300 font-label-stamp uppercase text-[10px]">ATTENDEE:</span>
                      <span className="font-bold text-white text-sm uppercase truncate max-w-[170px]">
                        {scanResult.booking?.holderName}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-emerald-300 font-label-stamp uppercase text-[10px]">PASS TYPE:</span>
                      <span className="font-bold text-[#f6c86a] uppercase">
                        {scanResult.booking?.passTitle}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-emerald-300 font-label-stamp uppercase text-[10px]">PERSONS ADMITTED:</span>
                      <span className="font-mono font-bold text-white bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500">
                        {scanResult.booking?.quantity || 1} PERSON{(scanResult.booking?.quantity || 1) > 1 ? 'S' : ''}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-emerald-300 font-label-stamp uppercase text-[10px]">ENTRANCE:</span>
                      <span className="font-medium text-emerald-200">Main Entrance</span>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-emerald-900/60 font-mono text-[11px]">
                      <span className="text-slate-400">REF:</span>
                      <span className="font-bold text-emerald-400">{scanResult.booking?.ref || scanResult.booking?.id}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. REJECTED PAYMENT / REVOKED PASS */}
              {scanResult.type === 'REJECTED_PAYMENT' && (
                <div className="flex-1 flex flex-col justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mx-auto text-red-500 animate-bounce">
                    <XCircle className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="bg-red-600 text-white font-mono text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      ⛔ ENTRY DENIED • PASS REJECTED
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-headline-sm uppercase text-red-400 mt-2 tracking-tight">
                      PAYMENT REJECTED!
                    </h2>
                    <p className="text-xs text-red-200 mt-1 font-bold">
                      This ticket was flagged and rejected by festival admin. DO NOT ADMIT.
                    </p>
                  </div>

                  <div className="bg-[#14080a] border-2 border-red-600/70 rounded-xl p-3.5 text-left text-xs space-y-2 max-w-sm mx-auto w-full shadow-2xl">
                    <div className="flex justify-between items-center pb-1.5 border-b border-red-900/60">
                      <span className="text-red-300 font-label-stamp uppercase text-[10px]">ATTENDEE:</span>
                      <span className="font-bold text-white uppercase truncate max-w-[170px]">
                        {scanResult.booking?.holderName}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-red-300 font-label-stamp uppercase text-[10px]">PASS TIER:</span>
                      <span className="font-medium text-white">
                        {scanResult.booking?.passTitle} (x{scanResult.booking?.quantity || 1})
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-red-300 font-label-stamp uppercase text-[10px]">REJECTION REASON:</span>
                      <span className="font-medium text-red-300 text-right text-[11px] max-w-[200px] truncate">
                        {scanResult.booking?.adminNotes || 'Payment verification failed'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-red-900/60 font-mono text-[11px]">
                      <span className="text-slate-400">BOOKING REF:</span>
                      <span className="font-bold text-red-400">{scanResult.booking?.ref || scanResult.booking?.id}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PENDING PAYMENT VERIFICATION */}
              {scanResult.type === 'PENDING_PAYMENT' && (
                <div className="flex-1 flex flex-col justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400">
                    <AlertTriangle className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="bg-amber-600 text-white font-mono text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      PAYMENT PENDING
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-headline-sm uppercase text-amber-400 mt-2 tracking-tight">
                      PAYMENT UNVERIFIED
                    </h2>
                    <p className="text-xs text-amber-200 mt-1">
                      Direct attendee to the Helpdesk / Registration Counter for verification.
                    </p>
                  </div>

                  <div className="bg-[#1c1405] border-2 border-amber-500/70 rounded-xl p-3.5 text-left text-xs space-y-2 max-w-sm mx-auto w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-300 font-label-stamp uppercase text-[10px]">HOLDER:</span>
                      <span className="font-bold text-white uppercase">{scanResult.booking?.holderName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-300 font-label-stamp uppercase text-[10px]">TIER:</span>
                      <span className="font-medium text-white">{scanResult.booking?.passTitle}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-amber-300 font-label-stamp uppercase text-[10px]">AMOUNT DUE:</span>
                      <span className="font-mono font-bold text-amber-300">₹{scanResult.booking?.totalAmount}/-</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-amber-900/60 font-mono text-[11px]">
                      <span className="text-slate-400">REF:</span>
                      <span className="font-bold text-amber-400">{scanResult.booking?.ref || scanResult.booking?.id}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. NOT FOUND / INVALID QR */}
              {scanResult.type === 'NOT_FOUND' && (
                <div className="flex-1 flex flex-col justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-950 border-2 border-red-500 flex items-center justify-center mx-auto text-red-400">
                    <XCircle className="w-10 h-10" />
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black font-headline-sm uppercase text-red-400 tracking-tight">
                      INVALID PASS
                    </h2>
                    <p className="text-xs text-red-200 mt-1">
                      No matching festival booking was found in the database.
                    </p>
                  </div>

                  <div className="bg-[#14080a] border border-red-800/80 rounded-xl p-3 text-left font-mono text-xs max-w-sm mx-auto w-full text-slate-300 break-all">
                    <span className="text-[10px] text-red-400 font-label-stamp uppercase block mb-1">SCANNED PAYLOAD:</span>
                    <span className="text-slate-200">{scanResult.rawQuery?.slice(0, 100)}</span>
                  </div>
                </div>
              )}

              {/* Resume / Scan Next Pass Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resumeScanning}
                  className="w-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white py-3.5 rounded-xl font-headline-sm text-sm uppercase tracking-wider font-bold transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>SCAN NEXT PASS NOW</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Turnstile Live Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#0b1229] border border-[#1e294b] rounded-xl p-2.5">
            <span className="text-[9px] text-slate-400 font-label-stamp uppercase block">THIS SESSION</span>
            <span className="text-lg sm:text-xl font-mono font-bold text-[#f6c86a]">
              {sessionAdmissions.length}
            </span>
          </div>
          <div className="bg-[#0b1229] border border-[#1e294b] rounded-xl p-2.5">
            <span className="text-[9px] text-slate-400 font-label-stamp uppercase block">FESTIVAL CHECKED-IN</span>
            <span className="text-lg sm:text-xl font-mono font-bold text-emerald-400">
              {totalAdmittedInFestival}
            </span>
          </div>
          <div className="bg-[#0b1229] border border-[#1e294b] rounded-xl p-2.5">
            <span className="text-[9px] text-slate-400 font-label-stamp uppercase block">VERIFIED TICKETS</span>
            <span className="text-lg sm:text-xl font-mono font-bold text-[#38bdf8]">
              {totalVerifiedBookings}
            </span>
          </div>
        </div>

        {/* Recent Admissions in This Session */}
        {sessionAdmissions.length > 0 && (
          <div className="bg-[#0b1229] border border-[#1e294b] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1e294b]">
              <span className="font-headline-sm text-xs uppercase text-white font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>RECENT ADMISSIONS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {sessionAdmissions.length} ADMITTED
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {sessionAdmissions.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#141a32] border border-[#2a3656] rounded-lg p-2 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-white block truncate uppercase text-[11px]">
                      {item.holderName}
                    </span>
                    <span className="font-mono text-[9px] text-[#f6c86a] block">
                      {item.ref} • {item.passTitle} (x{item.quantity})
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold block">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Manual Pass Code Lookup Modal */}
      {manualInputOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#0b1229] border-2 border-[#2a3656] text-[#dce1ff] p-5 rounded-2xl shadow-2xl">
            <h3 className="font-headline-sm text-lg text-white uppercase leading-snug flex items-center gap-2">
              <Search className="w-4 h-4 text-[#f6c86a]" />
              <span>MANUAL PASS LOOKUP</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter attendee booking reference, phone number, or token code:
            </p>

            <form onSubmit={handleManualLookup} className="mt-4 space-y-3">
              <div>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. DND-HYD-84920 or 9876543210"
                  autoFocus
                  className="w-full bg-[#141a32] border border-[#2a3656] focus:border-[#f6c86a] text-white font-mono text-sm px-3.5 py-2.5 rounded-xl uppercase tracking-wider focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setManualInputOpen(false);
                    setManualCode('');
                  }}
                  className="py-2.5 px-3 bg-[#141a32] hover:bg-[#1a2342] text-slate-300 rounded-xl font-headline-sm text-xs uppercase font-bold border border-[#2a3656]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!manualCode.trim()}
                  className="py-2.5 px-3 bg-[#1d4ed8] hover:bg-[#2563eb] text-white rounded-xl font-headline-sm text-xs uppercase font-bold shadow-lg disabled:opacity-50"
                >
                  VERIFY & ADMIT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
