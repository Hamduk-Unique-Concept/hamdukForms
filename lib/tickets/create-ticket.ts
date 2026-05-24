import { getSupabaseClient } from '@/lib/supabase/client';
import { generateTicketPdf } from '@/lib/tickets/generate-ticket';

function shortTicketNumber() {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function valueFromResponse(responseData: Record<string, any>, keys: string[]) {
  for (const [key, value] of Object.entries(responseData || {})) {
    const normalizedKey = key.toLowerCase();
    if (keys.some((candidate) => normalizedKey.includes(candidate))) return String(value);
  }
  return null;
}

interface CreateTicketInput {
  responseId?: string | null;
  formId: string;
  paymentReference?: string | null;
  attendeeName?: string | null;
  attendeeEmail?: string | null;
  ticketType?: string | null;
}

export async function createTicket(input: CreateTicketInput) {
  const supabase = getSupabaseClient();

  let responseRecord: any = null;
  if (input.responseId) {
    const { data, error } = await supabase
      .from('form_responses')
      .select('id, form_id, organization_id, response_data, submitter_email, submitter_name')
      .eq('id', input.responseId)
      .maybeSingle();

    if (error) throw error;
    responseRecord = data;
  }

  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('id, organization_id, title, name')
    .eq('id', input.formId || responseRecord?.form_id)
    .maybeSingle();

  if (formError) throw formError;
  if (!form) throw new Error('Form not found');

  const responseData = responseRecord?.response_data || {};
  const ticketNumber = shortTicketNumber();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://forms.hamduk.com.ng';
  const validationUrl = `${baseUrl}/api/tickets/validate/${ticketNumber}`;
  const attendeeName =
    input.attendeeName ||
    responseRecord?.submitter_name ||
    valueFromResponse(responseData, ['name', 'full_name', 'fullname']);
  const attendeeEmail =
    input.attendeeEmail ||
    responseRecord?.submitter_email ||
    valueFromResponse(responseData, ['email']);
  const ticketType = input.ticketType || valueFromResponse(responseData, ['ticket', 'type']) || 'General Admission';

  const { buffer, qrDataUrl } = await generateTicketPdf({
    ticketNumber,
    validationUrl,
    eventName: form.title || form.name || 'Hamduk Forms Ticket',
    attendeeName,
    attendeeEmail,
    ticketType,
  });

  const storagePath = `tickets/${form.id}/${ticketNumber}.pdf`;
  let ticketUrl: string | null = null;

  const uploadResult = await supabase.storage.from('tickets').upload(storagePath, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  });

  if (!uploadResult.error) {
    const { data: publicUrl } = supabase.storage.from('tickets').getPublicUrl(storagePath);
    ticketUrl = publicUrl.publicUrl;
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      ticket_number: ticketNumber,
      response_id: responseRecord?.id || input.responseId || null,
      form_id: form.id,
      organization_id: form.organization_id,
      attendee_name: attendeeName,
      attendee_email: attendeeEmail,
      ticket_type: ticketType,
      ticket_url: ticketUrl,
      qr_code_data: qrDataUrl,
      payment_reference: input.paymentReference,
    })
    .select()
    .single();

  if (ticketError) throw ticketError;

  return {
    ticket,
    pdfBase64: ticketUrl ? undefined : buffer.toString('base64'),
  };
}
