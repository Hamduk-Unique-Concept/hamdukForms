import { streamText } from 'ai';
import { getSupabaseClient } from '@/lib/supabase/client';
import { checkFeatureAccess } from '@/lib/billing/feature-access';

const model = 'groq/mixtral-8x7b-32768';

export async function POST(request: Request) {
  const supabase = getSupabaseClient();
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const token = authHeader.substring(7);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { formTitle, formDescription, existingFields = [], organizationId } = await request.json();
  const resolvedOrganizationId = organizationId || request.headers.get('x-organization-id');
  if (!resolvedOrganizationId) {
    return new Response(JSON.stringify({ error: 'Organization ID required' }), { status: 400 });
  }

  const access = await checkFeatureAccess(resolvedOrganizationId, 'ai_credits_monthly');
  if (!access.allowed) {
    return new Response(JSON.stringify({
      error: 'PLAN_LIMIT_REACHED',
      feature: 'ai_credits_monthly',
      limit: access.limit,
      usage: access.usage,
    }), { status: 403 });
  }

  const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('id, value')
    .eq('organization_id', resolvedOrganizationId)
    .eq('metric', 'ai_credits_used')
    .eq('period_start', periodStart)
    .maybeSingle();

  await supabase.from('usage_tracking').upsert(
    {
      id: usage?.id,
      organization_id: resolvedOrganizationId,
      metric: 'ai_credits_used',
      value: (Number(usage?.value) || 0) + 1,
      period_start: periodStart,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id,metric,period_start' }
  );

  const existingFieldsText = existingFields
    .map((f: any) => `- ${f.label} (${f.type})`)
    .join('\n');

  const prompt = `
You are a form UX expert. Suggest additional fields for this form:

Form Title: "${formTitle}"
Form Description: "${formDescription}"

Existing Fields:
${existingFieldsText || '(None yet)'}

Analyze the form purpose and suggest 2-4 additional fields that would improve data collection.

For each suggestion, provide:
1. Field type (text, email, phone, number, textarea, select, checkbox, radio, date, time, file)
2. Label
3. Why it's needed
4. Suggested placeholder
5. Whether it should be required

Return ONLY valid JSON array:
[
  {
    "type": "string",
    "label": "string",
    "placeholder": "string",
    "required": boolean,
    "reasoning": "string"
  }
]
`;

  const result = streamText({
    model,
    prompt,
    system: `You are a form design expert. Suggest fields that would improve form completion and data quality. Return ONLY valid JSON.`,
  });

  return result.toTextStreamResponse();
}
