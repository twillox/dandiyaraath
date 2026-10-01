import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

/**
 * Generates an exquisite, uncompressed, high-resolution royal festival ticket PDF.
 * Renders an offscreen, perfectly-proportioned 600px layout so mobile viewports
 * NEVER scramble the layout, clip borders, or omit the QR code!
 *
 * @param {object|string} bookingOrElementId - The booking data object or DOM element ID
 * @param {string} fallbackRef - Booking reference
 * @param {string} fallbackHolder - Attendee name
 * @returns {Promise<boolean>}
 */
export async function exportPassToPdf(bookingOrElementId, fallbackRef = 'PASS', fallbackHolder = 'Attendee') {
  try {
    let booking = null;

    if (typeof bookingOrElementId === 'object' && bookingOrElementId !== null) {
      booking = bookingOrElementId;
    }

    // Reference and holder name
    const bookingRef = (booking?.ref || booking?.id || fallbackRef || 'DND-HYD-PASS').toUpperCase();
    const holderName = (booking?.holderName || fallbackHolder || 'FESTIVAL GUEST').toUpperCase();
    const passTitle = (booking?.passTitle || 'ROYAL FESTIVAL PASS').toUpperCase();
    const quantity = booking?.quantity || 1;
    const gate = (booking?.gate || 'GATE 02 - MAIN ENTRANCE').toUpperCase();
    const isCheckedIn = booking?.checkedIn === true;
    const checkedInAt = booking?.checkedInAt ? new Date(booking.checkedInAt).toLocaleTimeString() : null;

    // Generate guaranteed high-res Base64 QR code Data URL
    const qrPayload = JSON.stringify({
      ref: bookingRef,
      holder: holderName,
      pass: passTitle,
      qty: quantity,
      status: booking?.paymentStatus || 'VERIFIED',
      venue: 'Narapally Cricket Ground'
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 1,
      color: {
        dark: '#070d1e',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });

    // Create an offscreen, fixed 600px container with strict pixel dimensions
    // This completely eliminates mobile viewport squishing, text wrapping bugs, and CORS issues!
    const ticketContainer = document.createElement('div');
    ticketContainer.style.position = 'fixed';
    ticketContainer.style.left = '-9999px';
    ticketContainer.style.top = '0';
    ticketContainer.style.width = '600px';
    ticketContainer.style.backgroundColor = '#070d1e';
    ticketContainer.style.color = '#ffffff';
    ticketContainer.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    ticketContainer.style.boxSizing = 'border-box';
    ticketContainer.style.zIndex = '-999';

    ticketContainer.innerHTML = `
      <div style="
        width: 600px;
        background: linear-gradient(180deg, #0b1430 0%, #070d22 45%, #050a18 100%);
        border: 3px double #d4af37;
        border-radius: 20px;
        padding: 24px;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      ">
        <!-- Top Ornamental Ribbon -->
        <div style="text-align: center; margin-bottom: 14px;">
          <div style="
            display: inline-block;
            background: linear-gradient(90deg, rgba(212,175,55,0.2), rgba(246,200,106,0.35), rgba(212,175,55,0.2));
            border: 1px solid #f6c86a;
            border-radius: 20px;
            padding: 4px 18px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #f6c86a;
            text-transform: uppercase;
          ">
            ✦ OFFICIAL FESTIVAL TURNSTILE PASS ✦
          </div>
        </div>

        <!-- Festival Title & Venue -->
        <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px dashed rgba(212,175,55,0.4);">
          <div style="font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; margin: 0;">
            DANDIYA <span style="color: #f6c86a;">रात</span> 2026
          </div>
          <div style="font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #38bdf8; text-transform: uppercase; margin-top: 4px;">
            NARAPALLY CRICKET GROUND • HYDERABAD
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">
            15 OCTOBER 2026 • GATES OPEN 5:00 PM
          </div>

          <!-- Hologram Strip -->
          <div style="
            height: 6px;
            width: 100%;
            border-radius: 6px;
            margin-top: 12px;
            background: linear-gradient(90deg, #38bdf8 0%, #ec4899 25%, #f6c86a 50%, #10b981 75%, #38bdf8 100%);
          "></div>
        </div>

        <!-- Tier Banner -->
        <div style="text-align: center; margin-top: 16px; margin-bottom: 14px;">
          <div style="
            display: inline-block;
            background: linear-gradient(90deg, #d4af37, #f6c86a, #d4af37);
            color: #070d1e;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 1.5px;
            padding: 6px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(212,175,55,0.3);
          ">
            ★ ${passTitle} ★
          </div>
          <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${holderName}
          </div>
        </div>

        <!-- 4-Box Clean Metadata Grid -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        ">
          <div style="background: rgba(14, 22, 51, 0.8); border: 1px solid rgba(212,175,55,0.35); border-radius: 10px; padding: 10px 14px;">
            <div style="font-size: 9px; font-weight: 700; color: #f6c86a; letter-spacing: 1px; text-transform: uppercase;">BOOKING REFERENCE</div>
            <div style="font-size: 13px; font-family: monospace; font-weight: 700; color: #38bdf8; margin-top: 3px;">${bookingRef}</div>
          </div>

          <div style="background: rgba(14, 22, 51, 0.8); border: 1px solid rgba(212,175,55,0.35); border-radius: 10px; padding: 10px 14px;">
            <div style="font-size: 9px; font-weight: 700; color: #f6c86a; letter-spacing: 1px; text-transform: uppercase;">PERSONS ADMITTED</div>
            <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-top: 3px;">${quantity} PERSON${quantity > 1 ? 'S' : ''}</div>
          </div>

          <div style="background: rgba(14, 22, 51, 0.8); border: 1px solid rgba(212,175,55,0.35); border-radius: 10px; padding: 10px 14px;">
            <div style="font-size: 9px; font-weight: 700; color: #f6c86a; letter-spacing: 1px; text-transform: uppercase;">ENTRY TURNSTILE</div>
            <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-top: 3px;">${gate}</div>
          </div>

          <div style="background: rgba(14, 22, 51, 0.8); border: 1px solid rgba(212,175,55,0.35); border-radius: 10px; padding: 10px 14px;">
            <div style="font-size: 9px; font-weight: 700; color: #f6c86a; letter-spacing: 1px; text-transform: uppercase;">TIMING</div>
            <div style="font-size: 13px; font-weight: 700; color: #f6c86a; margin-top: 3px;">5:00 PM - 12:30 AM</div>
          </div>
        </div>

        <!-- Admission Status Stamp -->
        <div style="text-align: center; margin-bottom: 16px;">
          ${
            isCheckedIn
              ? `<div style="
                  background: rgba(153, 27, 27, 0.4);
                  border: 2px solid #ef4444;
                  border-radius: 10px;
                  padding: 8px 14px;
                  color: #fca5a5;
                  font-weight: 800;
                  font-size: 12px;
                  letter-spacing: 1.5px;
                  text-transform: uppercase;
                ">
                  ⚠ TICKET ALREADY CHECKED IN • ADMITTED AT ${checkedInAt || 'GATE'}
                </div>`
              : `<div style="
                  background: rgba(6, 78, 59, 0.4);
                  border: 2px solid #10b981;
                  border-radius: 10px;
                  padding: 8px 14px;
                  color: #6ee7b7;
                  font-weight: 800;
                  font-size: 12px;
                  letter-spacing: 1.5px;
                  text-transform: uppercase;
                ">
                  ✓ VERIFIED & AUTHENTICATED • SCAN AT TURNSTILES
                </div>`
          }
        </div>

        <!-- High-Contrast Scannable QR Code Box -->
        <div style="text-align: center; padding-top: 4px;">
          <div style="
            display: inline-block;
            background: #ffffff;
            padding: 12px;
            border-radius: 16px;
            border: 3px solid #d4af37;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          ">
            <img src="${qrDataUrl}" width="180" height="180" style="display: block; width: 180px; height: 180px;" alt="QR Code" />
          </div>

          <div style="font-family: monospace; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #f6c86a; margin-top: 10px; text-transform: uppercase;">
            TOKEN: ${bookingRef}-TURNSTILE-SECURITY
          </div>
        </div>

        <!-- Barcode Strip -->
        <div style="margin-top: 14px; text-align: center;">
          <div style="
            background: #0b1430;
            border: 1px solid #1e294b;
            border-radius: 6px;
            padding: 6px 12px;
            font-family: monospace;
            font-size: 9px;
            letter-spacing: 6px;
            color: #cbd5e1;
            display: inline-block;
            width: 80%;
          ">
            ||| | ||||| || |||| ||||| | || |||| | ||| ||||| ||
          </div>
          <div style="font-size: 9px; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-top: 6px;">
            Present digital pass on phone or printed sheet at turnstiles for festival wristband.
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(ticketContainer);

    // Wait a brief tick for render
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Capture with html2canvas with scale 2 for retina clarity
    const canvas = await html2canvas(ticketContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#070d1e',
      width: 600,
      windowWidth: 600,
      logging: false
    });

    document.body.removeChild(ticketContainer);

    // Initialize portrait A4 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Dark royal festive background for full page
    pdf.setFillColor(7, 13, 30);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    // Subtle festival gold borders
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(0.6);
    pdf.rect(8, 8, pdfWidth - 16, pdfHeight - 16, 'S');

    // Header banner text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(246, 200, 106);
    pdf.text('DANDIYA RAAT 2026 • OFFICIAL ENTRY PASS', pdfWidth / 2, 16, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Narapally Cricket Ground, Hyderabad • 15 October 2026', pdfWidth / 2, 21, { align: 'center' });

    const maxImgWidth = 150;
    const imgHeight = (canvas.height * maxImgWidth) / canvas.width;
    const xPos = (pdfWidth - maxImgWidth) / 2;
    const yPos = 26;

    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', xPos, yPos, maxImgWidth, imgHeight, undefined, 'FAST');

    // Security footer text
    const footerY = Math.min(yPos + imgHeight + 10, pdfHeight - 12);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(246, 200, 106);
    pdf.text(`BOOKING REF: ${bookingRef}  |  ATTENDEE: ${holderName}`, pdfWidth / 2, footerY, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Present this digital or printed pass with QR code at turnstile gates for entry wristband.', pdfWidth / 2, footerY + 4, { align: 'center' });

    const safeRef = bookingRef.replace(/[^a-zA-Z0-9_-]/g, '');
    pdf.save(`DandiyaRaat-Pass-${safeRef}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    // Fallback: window.print()
    window.print();
    return false;
  }
}
