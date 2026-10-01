import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function TicketQR({
  data,
  size = 180,
  darkColor = '#060b1c',
  lightColor = '#ffffff',
  className = ''
}) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (!data) return;

    let isSubscribed = true;

    // Generate high-resolution 2x canvas rendered to base64 Data URL
    // Data URLs NEVER get stripped by html2canvas, never fail CORS, and are 100% printable!
    QRCode.toDataURL(data, {
      width: Math.max(size * 2.5, 360),
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        if (isSubscribed) setQrUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });

    return () => {
      isSubscribed = false;
    };
  }, [data, size, darkColor, lightColor]);

  if (!qrUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-white rounded-xl ${className}`}
      >
        <span className="text-[10px] text-slate-400 font-mono animate-pulse">GENERATING QR...</span>
      </div>
    );
  }

  return (
    <div className={`inline-block p-2 bg-white rounded-xl shadow-md border border-[#d4af37]/40 ${className}`}>
      <img
        src={qrUrl}
        alt="Turnstile Admission QR"
        style={{ width: size, height: size }}
        className="block mx-auto object-contain select-none"
        crossOrigin="anonymous"
      />
    </div>
  );
}
