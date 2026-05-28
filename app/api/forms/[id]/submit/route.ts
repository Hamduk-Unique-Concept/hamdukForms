import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { checkFeatureAccess } from '@/lib/billing/feature-access';
import { createTicket } from '@/lib/tickets/create-ticket';

async function getOrCreateWorkspaceForResponse(
  supabase: ReturnType<typeof getSupabaseClient>,
  organizationId: string,
  createdBy: string | null | undefined
) {
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('organization_id', organizationId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (workspace?.id) return workspace.id;
  if (!createdBy) return null;

  const { data: created } = await supabase
    .from('workspaces')
    .insert({
      organization_id: organizationId,
      name: 'Default Workspace',
      is_default: true,
      created_by: createdBy,
    })
    .select('id')
    .maybeSingle();

  return created?.id || null;
}

function parseWebhookEvents(events: unknown, eventType?: string | null) {
  if (Array.isArray(events)) return events;
  if (typeof events === 'string') {
    try {
      const parsed = JSON.parse(events);
      return Array.isArray(parsed) ? parsed : [events];
    } catch {
      return [events];
    }
  }
  return eventType ? [eventType] : [];
}

function parseMaybeJson(value: any, fallback: any) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function settingBool(settings: Record<string, any>, ...keys: string[]) {
  return keys.some((key) => settings[key] === true || settings[key] === 'true');
}

function settingValue<T>(settings: Record<string, any>, fallback: T, ...keys: string[]) {
  for (const key of keys) {
    if (settings[key] !== undefined && settings[key] !== null && settings[key] !== '') {
      return settings[key] as T;
    }
  }
  return fallback;
}

async function getUserFromRequest(
  supabase: ReturnType<typeof getSupabaseClient>,
  request: NextRequest
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  return user || null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseClient();
  try {
    const { id: formId } = await params;
    const { responses, publishToken, paymentRequired, formPassword } = await request.json();

    if (!formId || !responses) {
      return NextResponse.json(
        { message: 'Invalid request' },
        { status: 400 }
      );
    }

    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, organization_id, workspace_id, created_by, is_published, settings, require_password, form_password, allow_multiple_responses, max_responses, limit_one_response_per_user, scheduled_open_date, scheduled_close_date')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { message: 'Form not found' },
        { status: 404 }
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
    } else if (!form.is_published) {
      return NextResponse.json(
        { message: 'Form is not published' },
        { status: 403 }
      );
    }

    const formSettings = parseMaybeJson(form.settings, {});
    const effectivePaymentRequired = Boolean(paymentRequired || formSettings.enablePayment);
    const currentUser = await getUserFromRequest(supabase, request);
    const now = new Date();
    const openDate = settingValue<string | null>(
      formSettings,
      form.scheduled_open_date || null,
      'scheduledOpenDate',
      'opensAt',
      'openDate'
    );
    const closeDate = settingValue<string | null>(
      formSettings,
      form.scheduled_close_date || formSettings.expiresAt || null,
      'scheduledCloseDate',
      'closesAt',
      'closeDate',
      'expiresAt'
    );

    if (openDate && now < new Date(openDate)) {
      return NextResponse.json({ message: 'This form is not open yet' }, { status: 403 });
    }

    if (closeDate && now > new Date(closeDate)) {
      return NextResponse.json({ message: 'This form is closed' }, { status: 403 });
    }

    const requiresPassword =
      form.require_password ||
      settingBool(formSettings, 'requirePassword', 'require_password', 'passwordProtected');
    const savedPassword = settingValue<string | null>(
      formSettings,
      form.form_password || null,
      'formPassword',
      'form_password',
      'password'
    );

    if (requiresPassword && savedPassword && formPassword !== savedPassword) {
      return NextResponse.json({ message: 'Invalid form password' }, { status: 401 });
    }

    const requiresLogin = settingBool(formSettings, 'requireLogin', 'require_login');
    const oneResponsePerUser =
      form.limit_one_response_per_user ||
      settingBool(formSettings, 'limitOnePerUser', 'oneResponsePerPerson', 'one_response_per_person');

    if ((requiresLogin || oneResponsePerUser) && !currentUser) {
      return NextResponse.json({ message: 'Login is required to submit this form' }, { status: 401 });
    }

    const maxResponses = Number(
      settingValue<number | string | null>(
        formSettings,
        form.max_responses || null,
        'maxResponses',
        'max_responses'
      ) || 0
    );

    if (maxResponses > 0) {
      const { count } = await supabase
        .from('form_responses')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId)
        .in('status', ['completed', 'pending_payment']);

      if ((count || 0) >= maxResponses) {
        return NextResponse.json({ message: 'This form has reached its response limit' }, { status: 403 });
      }
    }

    if (oneResponsePerUser && currentUser) {
      const { data: existingResponse } = await supabase
        .from('form_responses')
        .select('id')
        .eq('form_id', formId)
        .or(`user_id.eq.${currentUser.id},respondent_id.eq.${currentUser.id}`)
        .limit(1)
        .maybeSingle();

      if (existingResponse) {
        return NextResponse.json({ message: 'You have already submitted this form' }, { status: 409 });
      }
    }

    const responseAccess = await checkFeatureAccess(form.organization_id, 'max_responses_per_month');
    if (!responseAccess.allowed) {
      return NextResponse.json(
        {
          error: 'PLAN_LIMIT_REACHED',
          feature: 'max_responses_per_month',
          limit: responseAccess.limit,
          usage: responseAccess.usage,
        },
        { status: 403 }
      );
    }

    const workspaceId = form.workspace_id || await getOrCreateWorkspaceForResponse(
      supabase,
      form.organization_id,
      form.created_by
    );

    if (!workspaceId) {
      return NextResponse.json(
        { message: 'Form workspace is not configured' },
        { status: 500 }
      );
    }

    // Store form response
    const { data: formResponse, error: submitError } = await supabase
      .from('form_responses')
      .insert({
        form_id: formId,
        workspace_id: workspaceId,
        organization_id: form.organization_id,
        user_id: currentUser?.id || null,
        submitter_email: currentUser?.email || responses.email || null,
        response_data: responses,
        status: effectivePaymentRequired ? 'pending_payment' : 'completed',
        completed_at: effectivePaymentRequired ? null : new Date().toISOString(),
        submitter_ip: request.headers.get('x-forwarded-for') || '',
        submitter_user_agent: request.headers.get('user-agent') || '',
      })
      .select('id')
      .single();

    if (submitError) throw submitError;

    const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('id, value')
      .eq('organization_id', form.organization_id)
      .eq('metric', 'responses_this_month')
      .eq('period_start', periodStart)
      .maybeSingle();

    await supabase.from('usage_tracking').upsert(
      {
        id: usage?.id,
        organization_id: form.organization_id,
        metric: 'responses_this_month',
        value: (Number(usage?.value) || 0) + 1,
        period_start: periodStart,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id,metric,period_start' }
    );

    await supabase.rpc('increment_form_response_count', { target_form_id: formId });

    let ticketResult: any = null;
    if (formSettings.generateTickets && !formSettings.ticketAfterPaymentOnly && !effectivePaymentRequired) {
      try {
        ticketResult = await createTicket({
          responseId: formResponse?.id,
          formId,
          ticketType: formSettings.defaultTicketType || 'General Admission',
        });
      } catch (ticketError) {
        console.error('Ticket generation error:', ticketError);
      }
    }

    // Trigger webhooks if configured
    try {
      const { data: webhooks } = await supabase
        .from('webhooks')
        .select('id, url, headers, event_type, events')
        .eq('form_id', formId)
        .eq('is_active', true);

      if (webhooks && webhooks.length > 0) {
        for (const webhook of webhooks) {
          const events = parseWebhookEvents(webhook.events, webhook.event_type);
          if (events.length > 0 && !events.includes('submission.received') && !events.includes('form.submission')) {
            continue;
          }

          fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(webhook.headers || {}),
            },
            body: JSON.stringify({
              event: 'submission.received',
              formId,
              responseId: formResponse?.id,
              data: responses,
              timestamp: new Date().toISOString(),
            }),
          })
            .then(async (webhookResponse) => {
              await supabase.from('webhook_logs').insert({
                webhook_id: webhook.id,
                status_code: webhookResponse.status,
                status: webhookResponse.ok ? 'success' : 'failed',
                request_body: {
                  event: 'submission.received',
                  formId,
                  responseId: formResponse?.id,
                },
                response_body: await webhookResponse.text().catch(() => ''),
              });
            })
            .catch(async (err) => {
              console.error('Webhook error:', err);
              await supabase.from('webhook_logs').insert({
                webhook_id: webhook.id,
                status: 'failed',
                error_message: err instanceof Error ? err.message : 'Webhook delivery failed',
                request_body: {
                  event: 'submission.received',
                  formId,
                  responseId: formResponse?.id,
                },
              });
            });
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
        ticket: ticketResult?.ticket || null,
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
