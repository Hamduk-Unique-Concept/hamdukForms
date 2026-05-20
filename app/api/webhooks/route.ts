import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseClient } from '@/lib/supabase/client';

interface WebhookPayload {
  event: string;
  timestamp: number;
  data: Record<string, any>;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const body = await request.json();
    const { formId, webhooks, data } = body;

    // Fetch form to get webhooks
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('webhooks')
      .eq('id', formId)
      .single();

    if (formError || !form?.webhooks) {
      return NextResponse.json(
        { error: 'Form not found or no webhooks configured' },
        { status: 404 }
      );
    }

    const activeWebhooks = form.webhooks.filter((w: any) => w.active);
    const results = [];

    for (const webhook of activeWebhooks) {
      const payload: WebhookPayload = {
        event: data.event,
        timestamp: Date.now(),
        data: data,
      };

      // Create HMAC signature
      const signature = crypto
        .createHmac('sha256', webhook.secret || '')
        .update(JSON.stringify(payload))
        .digest('hex');

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': data.event,
          },
          body: JSON.stringify(payload),
        });

        results.push({
          webhookId: webhook.id,
          success: response.ok,
          status: response.status,
        });

        // Log webhook delivery
        await supabase.from('webhook_logs').insert({
          webhook_id: webhook.id,
          event: data.event,
          status_code: response.status,
          success: response.ok,
          error: !response.ok ? await response.text() : null,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        results.push({
          webhookId: webhook.id,
          success: false,
          error: String(error),
        });
      }
    }

    return NextResponse.json({ results, success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhooks' },
      { status: 500 }
    );
  }
}
