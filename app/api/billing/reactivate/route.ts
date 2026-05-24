import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const reactivateSchema = z.object({
  organization_id: z.string().uuid(),
});

type ReactivateRequest = z.infer<typeof reactivateSchema>;

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reactivateSchema.parse(body);

    // Verify user has access to organization
    const { data: org } = await supabase
      .from('organizations')
      .select('id, owner_id')
      .eq('id', validatedData.organization_id)
      .single();

    if (!org || org.owner_id !== user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to reactivate this subscription' },
        { status: 403 }
      );
    }

    // Get subscription that's scheduled for cancellation
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('organization_id', validatedData.organization_id)
      .eq('cancel_at_period_end', true)
      .limit(1)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { message: 'No subscription scheduled for cancellation found' },
        { status: 404 }
      );
    }

    await supabase
      .from('user_subscriptions')
      .update({
        cancel_at_period_end: false,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      next_billing_date: subscription.current_period_end,
    });
  } catch (error) {
    console.error('[v0] Reactivate subscription error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
