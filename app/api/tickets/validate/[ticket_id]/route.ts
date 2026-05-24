import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await params;
    const supabase = getSupabaseClient();

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('id, ticket_number, attendee_name, attendee_email, ticket_type, checked_in, checked_in_at, form:form_id(title, name)')
      .eq('ticket_number', ticket_id)
      .maybeSingle();

    if (error) throw error;
    if (!ticket) {
      return NextResponse.json({ valid: false, message: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      ticket_id: ticket.id,
      ticket_number: ticket.ticket_number,
      attendee_name: ticket.attendee_name,
      attendee_email: ticket.attendee_email,
      ticket_type: ticket.ticket_type,
      event_name: (ticket.form as any)?.title || (ticket.form as any)?.name,
      checked_in: ticket.checked_in,
      checked_in_at: ticket.checked_in_at,
    });
  } catch (error) {
    console.error('[v0] Ticket validation error:', error);
    return NextResponse.json({ valid: false, message: 'Failed to validate ticket' }, { status: 500 });
  }
}
