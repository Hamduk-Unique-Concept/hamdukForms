import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { createTicket } from '@/lib/tickets/create-ticket';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

function parseMaybeJson(value: any, fallback: any) {
  if (!value) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      currency = 'ZAR',
      email,
      formId,
      responseId,
      respondentName,
      respondentEmail,
      callbackUrl,
    } = body;

    // Validate input
    if (!amount || !email || !formId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reference = `form-${formId}-${Date.now()}`;

    // Initialize transaction with Paystack
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          amount: Math.round(amount * 100), // Convert to kobo
          email,
          currency,
          callback_url: callbackUrl
            ? `${callbackUrl}?payment_reference=${encodeURIComponent(reference)}&response_id=${encodeURIComponent(responseId || '')}&form_id=${encodeURIComponent(formId)}`
            : undefined,
          metadata: {
            formId,
            responseId: responseId || '',
            respondentName: respondentName || '',
            respondentEmail: respondentEmail || email,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (error: any) {
    console.error('Paystack error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const responseId = searchParams.get('responseId');
    const formId = searchParams.get('formId');

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to verify payment' },
        { status: response.status }
      );
    }

    const paymentData = data.data;
    let ticket = null;

    if (paymentData.status === 'success') {
      const resolvedFormId = formId || paymentData.metadata?.formId;
      const resolvedResponseId = responseId || paymentData.metadata?.responseId;
      const paymentAmount = paymentData.amount / 100;

      if (resolvedResponseId) {
        await supabase
          .from('form_responses')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', resolvedResponseId);
      }

      if (resolvedFormId) {
        const { data: form } = await supabase
          .from('forms')
          .select('settings, organization_id, title, name')
          .eq('id', resolvedFormId)
          .maybeSingle();

        const settings = parseMaybeJson(form?.settings, {});

        await supabase
          .from('payments')
          .upsert(
            {
              organization_id: form?.organization_id || paymentData.metadata?.organizationId || null,
              form_id: resolvedFormId,
              response_id: resolvedResponseId || null,
              amount: paymentAmount,
              currency: paymentData.currency || 'NGN',
              description: form?.title || form?.name || 'Form payment',
              payment_provider: 'paystack',
              payment_id: reference,
              status: 'completed',
              paid_at: new Date().toISOString(),
              customer_email: paymentData.customer?.email || paymentData.metadata?.respondentEmail || null,
              customer_name: paymentData.metadata?.respondentName || paymentData.customer?.first_name || null,
            },
            { onConflict: 'payment_id' }
          );

        if (settings.generateTickets && settings.ticketAfterPaymentOnly && resolvedResponseId) {
          try {
            const { data: existingTicket } = await supabase
              .from('tickets')
              .select('*')
              .eq('response_id', resolvedResponseId)
              .maybeSingle();

            if (existingTicket) {
              ticket = existingTicket;
            } else {
              const ticketResult = await createTicket({
                responseId: resolvedResponseId,
                formId: resolvedFormId,
                paymentReference: reference,
                ticketType: settings.defaultTicketType || 'General Admission',
              });
              ticket = ticketResult.ticket;
            }
          } catch (ticketError) {
            console.error('Ticket generation after payment failed:', ticketError);
          }
        }
      }
    }

    return NextResponse.json({
      status: data.data.status,
      amount: data.data.amount / 100,
      currency: data.data.currency,
      reference: data.data.reference,
      paidAt: data.data.paid_at,
      customerEmail: data.data.customer?.email,
      ticket,
    });
  } catch (error: any) {
    console.error('Paystack error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
