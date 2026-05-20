import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const trackUsageSchema = z.object({
  org_id: z.string().uuid(),
  metric: z.enum(['forms_count', 'responses_this_month', 'storage_bytes', 'ai_credits_used', 'team_seats_used']),
  increment_by: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { org_id, metric, increment_by } = trackUsageSchema.parse(body);

    // Get current period start (first day of month)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Upsert usage tracking record
    const { data, error } = await supabase
      .from('usage_tracking')
      .upsert(
        {
          organization_id: org_id,
          metric,
          period_start: periodStart.toISOString().split('T')[0],
          value: increment_by,
          updated_at: new Date(),
        },
        {
          onConflict: 'organization_id,metric,period_start',
        }
      )
      .select();

    if (error) {
      console.error('[v0] Usage tracking error:', error);
      return NextResponse.json(
        { error: 'Failed to track usage' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Track usage error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
