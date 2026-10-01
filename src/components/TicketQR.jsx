import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function TicketQR({ data, size = 160, darkColor = '#070d1e', lightColor = '#f0f4fa' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(
        canvasRef.current,
        data,
        {
          width: size,
          margin: 1,
          color: {
            dark: darkColor,
            light: lightColor
          },
          errorCorrectionLevel: 'H'
        },
        (error) => {
          if (error) console.error('QR code generation error', error);
        }
      );
    }
  }, [data, size, darkColor, lightColor]);

  return (
    <div className="inline-block p-2 bg-white rounded border border-[#0b1229] shadow-sm">
      <canvas ref={canvasRef} width={size} height={size} className="block mx-auto" />
    </div>
  );
}
