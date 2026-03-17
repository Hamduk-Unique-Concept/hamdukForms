import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (formId) {
      query = query.eq('form_id', formId);
    }

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: activities, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      activities: activities?.map((a: any) => ({
        id: a.id,
        type: a.type,
        user: a.user_email,
        action: a.action,
        target: a.target_name,
        timestamp: a.created_at,
        details: a.details,
      })) || [],
    });
  } catch (error) {
    console.error('Activity log error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, action, targetId, targetName, formId, organizationId, details } =
      await request.json();

    const { error } = await supabase.from('activity_logs').insert({
      type,
      action,
      target_id: targetId,
      target_name: targetName,
      form_id: formId,
      organization_id: organizationId,
      details,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activity log insert error:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
