import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params;
    const { responses, publishToken } = await request.json();

    if (!formId || !responses) {
      return NextResponse.json(
        { message: 'Invalid request' },
        { status: 400 }
      );
    }

    // Verify form is published (if publish token provided)
    if (publishToken) {
      const { data: publishLink } = await supabase
        .from('form_publish_links')
        .select('id')
        .eq('form_id', formId)
        .eq('publish_slug', publishToken)
        .eq('is_published', true)
        .single();

      if (!publishLink) {
        return NextResponse.json(
          { message: 'Form is not published' },
          { status: 403 }
        );
      }
    }

    // Store form response
    const { data: formResponse, error: submitError } = await supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        response_data: responses,
        submitted_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || '',
        user_agent: request.headers.get('user-agent') || '',
      })
      .select('id')
      .single();

    if (submitError) throw submitError;

    // Update analytics
    const { data: analytics } = await supabase
      .from('form_response_analytics')
      .select('total_responses')
      .eq('form_id', formId)
      .single();

    await supabase
      .from('form_response_analytics')
      .update({
        total_responses: (analytics?.total_responses || 0) + 1,
        last_response_at: new Date().toISOString(),
      })
      .eq('form_id', formId);

    // Trigger webhooks if configured
    try {
      const { data: webhooks } = await supabase
        .from('webhooks')
        .select('webhook_url, webhook_secret')
        .eq('form_id', formId)
        .eq('is_active', true);

      if (webhooks && webhooks.length > 0) {
        for (const webhook of webhooks) {
          fetch(webhook.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': webhook.webhook_secret,
            },
            body: JSON.stringify({
              event: 'form.submission',
              formId,
              responseId: formResponse?.id,
              data: responses,
              timestamp: new Date().toISOString(),
            }),
          }).catch(err => console.error('Webhook error:', err));
        }
      }
    } catch (webhookError) {
      console.error('Webhook trigger error:', webhookError);
      // Don't fail the request if webhook fails
    }

    return NextResponse.json(
      { 
        message: 'Form submitted successfully',
        responseId: formResponse?.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { message: 'Failed to submit form' },
      { status: 500 }
    );
  }
}
