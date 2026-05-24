import { NextRequest, NextResponse } from 'next/server';
import { createTicket } from '@/lib/tickets/create-ticket';

export async function POST(request: NextRequest) {
  try {
    const {
      response_id,
      form_id,
      payment_reference,
      attendee_name,
      attendee_email,
      ticket_type,
    } = await request.json();

    if (!response_id && !form_id) {
      return NextResponse.json({ message: 'response_id or form_id is required' }, { status: 400 });
    }

    const { ticket, pdfBase64 } = await createTicket({
      responseId: response_id,
      formId: form_id,
      paymentReference: payment_reference,
      attendeeName: attendee_name,
      attendeeEmail: attendee_email,
      ticketType: ticket_type,
    });

    return NextResponse.json({
      message: 'Ticket generated',
      ticket,
      pdf_base64: pdfBase64,
    });
  } catch (error) {
    console.error('[v0] Ticket generation error:', error);
    return NextResponse.json({ message: 'Failed to generate ticket' }, { status: 500 });
  }
}
