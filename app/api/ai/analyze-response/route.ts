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

  const { response, formContext, analysisType = 'sentiment', organizationId } = await request.json();
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

  let prompt = '';

  if (analysisType === 'sentiment') {
    prompt = `
Analyze the sentiment and key themes in this form response:

Response:
"${response}"

Provide a JSON analysis with:
- sentiment: 'positive' | 'neutral' | 'negative'
- confidence: number (0-100)
- themes: string[]
- summary: string

Return ONLY valid JSON.
`;
  } else if (analysisType === 'validation') {
    prompt = `
Validate this form response against the expected format:

Expected format: ${JSON.stringify(formContext)}
Response: "${response}"

Check for:
- Data type correctness
- Required fields
- Format compliance
- Suspicious patterns

Return JSON with:
- valid: boolean
- issues: string[]
- suggestions: string[]
`;
  } else if (analysisType === 'flagging') {
    prompt = `
Review this form response for potential issues:

Response: "${response}"

Look for:
- Spam indicators
- Malicious content
- Incomplete information
- Suspicious patterns

Return JSON with:
- riskLevel: 'low' | 'medium' | 'high'
- flags: string[]
- recommendedAction: string
`;
  }

  const result = streamText({
    model,
    prompt,
    system: `You are a form response analyst. Analyze the provided response and return ONLY valid JSON. No additional text.`,
  });

  return result.toTextStreamResponse();
}
