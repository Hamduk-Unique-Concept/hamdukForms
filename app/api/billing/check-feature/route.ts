import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkFeatureAccess } from '@/lib/billing/feature-access';

// Validation schema
const checkFeatureSchema = z.object({
  feature_key: z.string().min(1, 'Feature key is required'),
  organization_id: z.string().uuid('Invalid organization ID'),
});

type CheckFeatureRequest = z.infer<typeof checkFeatureSchema>;

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

    // Parse and validate request body
    const body = await request.json();
    const validation = checkFeatureSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: 'Invalid request',
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { feature_key, organization_id }: CheckFeatureRequest = validation.data;

    // Verify user has access to this organization
    const { data: orgAccess } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organization_id)
      .eq('owner_id', user.id)
      .single();

    const { data: memberAccess } = await supabase
      .from('user_organizations')
      .select('id')
      .eq('organization_id', organization_id)
      .eq('user_id', user.id)
      .single();

    if (!orgAccess && !memberAccess) {
      return NextResponse.json(
        { message: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    // Check feature access
    const featureAccess = await checkFeatureAccess(organization_id, feature_key);

    return NextResponse.json({
      success: true,
      data: {
        feature_key,
        allowed: featureAccess.allowed,
        limit: featureAccess.limit,
        usage: featureAccess.usage,
        remaining: featureAccess.remaining,
        reset_date: featureAccess.resetDate,
      },
    });
  } catch (error) {
    console.error('[v0] Error in POST /api/billing/check-feature:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
