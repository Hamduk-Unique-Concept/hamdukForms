import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: existingOrg, error: fetchError } = await supabase
      .from('organizations')
      .select('id, name, slug')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingOrg?.id) {
      return NextResponse.json({ organization: existingOrg });
    }

    const displayName =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email ||
      'My Organization';
    const slugBase = slugify(displayName) || `org-${user.id.slice(0, 8)}`;

    const { data: newOrg, error: insertError } = await supabase
      .from('organizations')
      .insert({
        owner_id: user.id,
        created_by: user.id,
        name: displayName,
        slug: `${slugBase}-${Date.now().toString(36)}`,
      })
      .select('id, name, slug')
      .single();

    if (insertError) throw insertError;

    await supabase.from('user_organizations').upsert(
      {
        user_id: user.id,
        organization_id: newOrg.id,
        role: 'owner',
        can_delete: true,
        can_manage_team: true,
        can_manage_billing: true,
      },
      { onConflict: 'user_id,organization_id' }
    );

    return NextResponse.json({ organization: newOrg });
  } catch (error) {
    console.error('[organizations/current] failed:', error);
    return NextResponse.json(
      { message: 'Failed to load organization' },
      { status: 500 }
    );
  }
}
