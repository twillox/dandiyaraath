import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports any DOM element (specifically the royal Dandiya Raat ticket) to a high-res PDF.
 * @param {string|HTMLElement} elementOrId - The DOM element or ID to export
 * @param {string} bookingRef - The booking reference code for naming the file
 * @param {string} holderName - Optional attendee name for metadata
 * @returns {Promise<boolean>}
 */
export async function exportPassToPdf(elementOrId, bookingRef = 'PASS', holderName = 'Attendee') {
  const element = typeof elementOrId === 'string'
    ? document.getElementById(elementOrId)
    : elementOrId;

  if (!element) {
    throw new Error('Pass element could not be found for PDF generation.');
  }

  try {
    // Generate high-DPI canvas capture
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#070d1e',
      logging: false,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

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
    pdf.setDrawColor(212, 175, 55); // #d4af37 metallic gold
    pdf.setLineWidth(0.6);
    pdf.rect(8, 8, pdfWidth - 16, pdfHeight - 16, 'S');

    // Header banner text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(246, 200, 106); // #f6c86a
    pdf.text('DANDIYA RAAT 2026 • OFFICIAL ENTRY PASS', pdfWidth / 2, 16, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Narapally Cricket Ground, Hyderabad • 15 October 2026', pdfWidth / 2, 21, { align: 'center' });

    // Calculate pass dimensions to center on page
    const maxImgWidth = 160;
    const imgHeight = (canvas.height * maxImgWidth) / canvas.width;
    const xPos = (pdfWidth - maxImgWidth) / 2;
    const yPos = 26;

    pdf.addImage(imgData, 'PNG', xPos, yPos, maxImgWidth, imgHeight, undefined, 'FAST');

    // Security footer text
    const footerY = Math.min(yPos + imgHeight + 12, pdfHeight - 14);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(246, 200, 106);
    pdf.text(`BOOKING REF: ${(bookingRef || '').toUpperCase()}  |  ATTENDEE: ${(holderName || '').toUpperCase()}`, pdfWidth / 2, footerY, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('This digital voucher contains an encrypted turnstile token. Present printed or on mobile screen at entry gates.', pdfWidth / 2, footerY + 5, { align: 'center' });

    const safeRef = (bookingRef || 'TICKET').replace(/[^a-zA-Z0-9_-]/g, '');
    pdf.save(`DandiyaRaat-Pass-${safeRef}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}
