import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = request.nextUrl.searchParams.get('organizationId');
    if (!orgId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    // Verify user has access to this organization
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', orgId)
      .eq('owner_id', user.id)
      .single();

    if (!org) {
      const { data: member } = await supabase
        .from('user_organizations')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single();

      if (!member) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get billing history
    const { data: history, error } = await supabase
      .from('billing_history')
      .select('*')
      .eq('organization_id', orgId)
      .order('invoice_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    console.error('[v0] Billing history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
