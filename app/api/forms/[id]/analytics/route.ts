import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

function isAnswered(value: any) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function getDevice(userAgent = '') {
  const value = userAgent.toLowerCase();
  if (/ipad|tablet/.test(value)) return 'Tablet';
  if (/mobile|android|iphone/.test(value)) return 'Mobile';
  return 'Desktop';
}

async function getUser(request: NextRequest) {
  const supabase = getSupabaseClient();
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

  return user;
}

async function canAccessForm(userId: string, formId: string) {
  const supabase = getSupabaseClient();
  const { data: form } = await supabase
    .from('forms')
    .select('id, organization_id, created_by')
    .eq('id', formId)
    .maybeSingle();

  if (!form) return false;
  if (form.created_by === userId) return true;

  const { data: ownedOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', form.organization_id)
    .eq('owner_id', userId)
    .maybeSingle();

  if (ownedOrg) return true;

  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', form.organization_id)
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  return Boolean(member);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseClient();

  try {
    const { id } = await params;
    const user = await getUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await canAccessForm(user.id, id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const daysAgo = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const { data: responses, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('form_id', id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const { data: fields } = await supabase
      .from('form_fields')
      .select('id, label, field_type')
      .eq('form_id', id)
      .order('field_order', { ascending: true });

    const rows = responses || [];
    const totalSubmissions = rows.length;
    const completedResponses = rows.filter((response: any) => response.status === 'completed');
    const completionRate = totalSubmissions > 0
      ? Math.round((completedResponses.length / totalSubmissions) * 100)
      : 0;

    const completedDurations = completedResponses
      .map((response: any) => {
        if (!response.created_at || !response.completed_at) return null;
        return new Date(response.completed_at).getTime() - new Date(response.created_at).getTime();
      })
      .filter((duration: number | null) => typeof duration === 'number' && duration >= 0) as number[];

    const avgTimeToComplete = completedDurations.length
      ? Math.round(completedDurations.reduce((sum, duration) => sum + duration, 0) / completedDurations.length / 60000)
      : 0;

    const responsesByDay = [];
    for (let i = daysAgo; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = rows.filter((response: any) => response.created_at?.split('T')[0] === dateStr).length;
      responsesByDay.push({ date: dateStr, count });
    }

    const statusCounts = rows.reduce((acc: Record<string, number>, response: any) => {
      const status = response.status || 'completed';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    const fieldAnalytics = (fields || []).map((field: any) => {
      const answered = rows.filter((response: any) => isAnswered(response.response_data?.[field.id])).length;
      return {
        fieldName: field.label || field.field_type || 'Untitled field',
        completionRate: totalSubmissions > 0 ? Math.round((answered / totalSubmissions) * 100) : 0,
        avgTime: 0,
      };
    });

    const deviceCounts = rows.reduce((acc: Record<string, number>, response: any) => {
      const device = getDevice(response.submitter_user_agent || '');
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    const deviceStats = ['Desktop', 'Mobile', 'Tablet'].map((device) => ({
      device,
      count: deviceCounts[device] || 0,
    }));

    return NextResponse.json({
      totalSubmissions,
      completionRate,
      avgTimeToComplete,
      responsesByDay,
      fieldAnalytics,
      statusDistribution,
      deviceStats,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
