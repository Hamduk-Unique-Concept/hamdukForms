import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await params;
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, ticket_number, form_id, organization_id, checked_in, checked_in_at, attendee_name, ticket_type')
      .eq('ticket_number', ticket_id)
      .maybeSingle();

    if (ticketError) throw ticketError;
    if (!ticket) return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });

    const { data: member } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', ticket.organization_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    const { data: owner } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', ticket.organization_id)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!member && !owner) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (ticket.checked_in) {
      return NextResponse.json({
        valid: true,
        checked_in: true,
        already_checked_in: true,
        checked_in_at: ticket.checked_in_at,
        attendee_name: ticket.attendee_name,
        ticket_type: ticket.ticket_type,
      });
    }

    const checkedInAt = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from('tickets')
      .update({
        checked_in: true,
        checked_in_at: checkedInAt,
        checked_in_by: user.id,
        updated_at: checkedInAt,
      })
      .eq('id', ticket.id)
      .select('id, ticket_number, attendee_name, ticket_type, checked_in, checked_in_at')
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      valid: true,
      checked_in: true,
      ticket: updated,
    });
  } catch (error) {
    console.error('[v0] Ticket check-in error:', error);
    return NextResponse.json({ message: 'Failed to check in ticket' }, { status: 500 });
  }
}
