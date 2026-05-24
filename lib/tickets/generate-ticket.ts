import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface TicketPdfInput {
  ticketNumber: string;
  validationUrl: string;
  eventName: string;
  attendeeName?: string | null;
  attendeeEmail?: string | null;
  ticketType?: string | null;
}

export async function generateTicketPdf(input: TicketPdfInput) {
  const qrDataUrl = await QRCode.toDataURL(input.validationUrl, {
    margin: 1,
    width: 240,
  });

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text(input.eventName || 'Hamduk Forms Ticket', 48, 72);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(90, 90, 90);
  pdf.text('Present this ticket at check-in.', 48, 96);

  pdf.setDrawColor(220, 220, 220);
  pdf.roundedRect(48, 128, pageWidth - 96, 300, 8, 8, 'S');

  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('Ticket Number', 72, 168);
  pdf.setFont('helvetica', 'normal');
  pdf.text(input.ticketNumber, 72, 190);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Attendee', 72, 228);
  pdf.setFont('helvetica', 'normal');
  pdf.text(input.attendeeName || input.attendeeEmail || 'Guest', 72, 250);

  if (input.attendeeEmail) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Email', 72, 288);
    pdf.setFont('helvetica', 'normal');
    pdf.text(input.attendeeEmail, 72, 310);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.text('Ticket Type', 72, 348);
  pdf.setFont('helvetica', 'normal');
  pdf.text(input.ticketType || 'General Admission', 72, 370);

  pdf.addImage(qrDataUrl, 'PNG', pageWidth - 230, 168, 132, 132);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Scan to validate', pageWidth - 207, 318);

  const arrayBuffer = pdf.output('arraybuffer');
  return {
    buffer: Buffer.from(arrayBuffer),
    qrDataUrl,
  };
}
