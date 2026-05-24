import { streamText } from 'ai';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { checkFeatureAccess } from '@/lib/billing/feature-access';

const model = 'groq/mixtral-8x7b-32768';

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  fields: z.array(
    z.object({
      type: z.string(),
      label: z.string(),
      placeholder: z.string().nullable(),
      required: z.boolean(),
      options: z.array(z.string()).nullable(),
    })
  ),
});

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

  const { formDescription, organizationId } = await request.json();
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

  const prompt = `
You are an expert form builder. Create a well-structured form based on this description:
"${formDescription}"

Generate a JSON form with the following structure:
- title: A clear, concise form title
- description: A helpful description for users
- fields: An array of form fields

Available field types: text, email, phone, number, textarea, select, checkbox, radio, date, time, file.

Create appropriate fields that would logically fit for this use case. Use proper field types, meaningful labels, and smart defaults.

Return ONLY valid JSON matching this schema:
{
  "title": "string",
  "description": "string",
  "fields": [
    {
      "type": "string (one of: text, email, phone, number, textarea, select, checkbox, radio, date, time, file)",
      "label": "string",
      "placeholder": "string or null",
      "required": boolean,
      "options": ["array of strings for select/radio/checkbox or null"]
    }
  ]
}
`;

  const result = streamText({
    model,
    prompt,
    system: `You are a form creation assistant. When asked to generate a form, return ONLY valid JSON that can be parsed. No additional text, no markdown code blocks, just pure JSON.`,
  });

  return result.toTextStreamResponse();
}
