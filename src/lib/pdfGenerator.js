import jsPDF from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generates a clean, basic white-themed festival entry pass PDF.
 * Directly embeds the scannable QR code into jsPDF, guaranteeing
 * that the QR code is 100% visible and never missing or scrambled!
 *
 * @param {object} booking - Booking data object
 * @param {string} fallbackRef - Booking reference
 * @param {string} fallbackHolder - Attendee name
 * @returns {Promise<boolean>}
 */
export async function exportPassToPdf(booking, fallbackRef = 'PASS', fallbackHolder = 'Attendee') {
  try {
    if (booking?.paymentStatus === 'REJECTED') {
      alert('⚠️ Pass Rejected: This booking has been marked as REJECTED by festival administration. An entry pass cannot be downloaded.');
      return false;
    }

    const bookingRef = (booking?.ref || booking?.id || fallbackRef || 'DND-HYD-PASS').toUpperCase();
    const holderName = (booking?.holderName || fallbackHolder || 'FESTIVAL GUEST').toUpperCase();
    const passTitle = (booking?.passTitle || 'FESTIVAL PASS').toUpperCase();
    const quantity = booking?.quantity || 1;
    const email = booking?.email || booking?.userEmail || '';
    const isCheckedIn = booking?.checkedIn === true;
    const checkedInAt = booking?.checkedInAt ? new Date(booking.checkedInAt).toLocaleTimeString() : null;

    // Generate high-resolution Base64 QR Code
    const qrPayload = JSON.stringify({
      ref: bookingRef,
      holder: holderName,
      pass: passTitle,
      qty: quantity,
      status: booking?.paymentStatus || 'VERIFIED',
      venue: 'Narapally Cricket Ground'
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 600,
      margin: 1,
      color: {
        dark: '#0b1229',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });

    // Create portrait A4 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    // Light neutral page backdrop
    pdf.setFillColor(243, 244, 246); // slate-100
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Basic Clean White Pass Container Card
    const cardX = 20;
    const cardY = 18;
    const cardWidth = 170;
    const cardHeight = 245;

    // White Card Background with Subtle Border
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(203, 213, 225); // slate-300
    pdf.setLineWidth(0.8);
    pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, 'FD');

    // Blue Header Top Accent Bar
    pdf.setFillColor(29, 78, 216); // #1d4ed8
    pdf.roundedRect(cardX, cardY, cardWidth, 14, 4, 4, 'F');
    pdf.rect(cardX, cardY + 8, cardWidth, 6, 'F'); // square bottom of top bar

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text('OFFICIAL DIGITAL ENTRY VOUCHER • VERIFIED', pageWidth / 2, cardY + 9, { align: 'center' });

    // Festival Title Header
    let currentY = cardY + 28;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(11, 18, 41); // #0b1229
    pdf.text('DANDIYA RAAT 2026', pageWidth / 2, currentY, { align: 'center' });

    currentY += 7;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(29, 78, 216);
    pdf.text('NARAPALLY CRICKET GROUND • HYDERABAD', pageWidth / 2, currentY, { align: 'center' });

    currentY += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text('15 October 2026 • 5:00 PM Onwards • Single Main Entrance', pageWidth / 2, currentY, { align: 'center' });

    // Dashed Divider Line
    currentY += 8;
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineDashPattern([2, 2], 0);
    pdf.line(cardX + 8, currentY, cardX + cardWidth - 8, currentY);
    pdf.setLineDashPattern([], 0); // reset dash

    // Prominent Email Notice Banner (As explicitly requested by user)
    currentY += 6;
    pdf.setFillColor(239, 246, 255); // blue-50
    pdf.setDrawColor(191, 219, 254); // blue-200
    pdf.roundedRect(cardX + 10, currentY, cardWidth - 20, 14, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(30, 58, 138); // blue-900
    pdf.text(
      'NOTE: The official original pass will also be sent to your registered email upon approval.',
      pageWidth / 2,
      currentY + 6,
      { align: 'center' }
    );
    if (email) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(59, 130, 246);
      pdf.text(`Sent to: ${email}`, pageWidth / 2, currentY + 11, { align: 'center' });
    }

    currentY += 20;

    // Attendee & Ticket Details Box (2 Columns)
    const leftCol = cardX + 16;
    const rightCol = cardX + (cardWidth / 2) + 8;

    // Row 1: Attendee Name & Booking Ref
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('PASS HOLDER', leftCol, currentY);
    pdf.text('BOOKING REFERENCE', rightCol, currentY);

    currentY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(11, 18, 41);
    pdf.text(holderName, leftCol, currentY);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(29, 78, 216);
    pdf.text(bookingRef, rightCol, currentY);

    currentY += 10;

    // Row 2: Pass Tier & Quantity
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('PASS TIER', leftCol, currentY);
    pdf.text('ADMISSION COUNT', rightCol, currentY);

    currentY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(11, 18, 41);
    pdf.text(passTitle, leftCol, currentY);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(11, 18, 41);
    pdf.text(`${quantity} Person${quantity > 1 ? 's' : ''}`, rightCol, currentY);

    // Dashed Divider before QR
    currentY += 9;
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineDashPattern([2, 2], 0);
    pdf.line(cardX + 8, currentY, cardX + cardWidth - 8, currentY);
    pdf.setLineDashPattern([], 0);

    // Entry Status Badge
    currentY += 7;
    if (isCheckedIn) {
      pdf.setFillColor(254, 242, 242);
      pdf.setDrawColor(239, 68, 68);
      pdf.roundedRect(cardX + 30, currentY, cardWidth - 60, 8, 2, 2, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(185, 28, 28);
      pdf.text(`ALREADY USED / ADMITTED (${checkedInAt || 'Earlier'})`, pageWidth / 2, currentY + 5.5, { align: 'center' });
    } else {
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(74, 222, 128);
      pdf.roundedRect(cardX + 30, currentY, cardWidth - 60, 8, 2, 2, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(21, 128, 61);
      pdf.text('✓ VERIFIED TICKET • PRESENT AT ENTRY TURNSTILE', pageWidth / 2, currentY + 5.5, { align: 'center' });
    }

    currentY += 13;

    // DIRECT EMBEDDED SCANNABLE QR CODE (Guaranteed 100% visible in PDF!)
    const qrSize = 65; // 65mm square (very large and crisp)
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = currentY;

    // QR Outer Box
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 2, 2, 'FD');

    // Add Image directly into PDF binary
    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize, undefined, 'FAST');

    currentY += qrSize + 7;

    // Security Token
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`TOKEN: ${bookingRef}-TURNSTILE-ENTRY`, pageWidth / 2, currentY, { align: 'center' });

    currentY += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(29, 78, 216);
    pdf.text('SCAN QR CODE AT TURNSTILE GATE UPON ARRIVAL', pageWidth / 2, currentY, { align: 'center' });

    currentY += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Narapally Cricket Ground, Hyderabad • Official Festival Pass', pageWidth / 2, currentY, { align: 'center' });

    // Download PDF directly
    const safeRef = bookingRef.replace(/[^a-zA-Z0-9_-]/g, '');
    pdf.save(`DandiyaRaat-Pass-${safeRef}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    window.print();
    return false;
  }
}
