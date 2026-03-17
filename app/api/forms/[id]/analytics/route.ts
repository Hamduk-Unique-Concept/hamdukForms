import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const daysAgo = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Fetch form responses
    const { data: responses, error } = await supabase
      .from('form_responses')
      .select('*')
      .eq('form_id', params.id)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Calculate metrics
    const totalSubmissions = responses?.length || 0;
    const completedResponses = responses?.filter((r: any) => r.status === 'completed') || [];
    const completionRate = totalSubmissions > 0 
      ? Math.round((completedResponses.length / totalSubmissions) * 100)
      : 0;

    // Calculate average time to complete
    const avgTimeToComplete = completedResponses.length > 0
      ? Math.round(
          completedResponses.reduce((sum: number, r: any) => {
            const created = new Date(r.created_at).getTime();
            const completed = new Date(r.updated_at).getTime();
            return sum + (completed - created);
          }, 0) / completedResponses.length / 60000
        )
      : 0;

    // Submissions by day
    const responsesByDay = [];
    for (let i = daysAgo; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = responses?.filter(
        (r: any) => r.created_at.split('T')[0] === dateStr
      ).length || 0;

      responsesByDay.push({ date: dateStr, count });
    }

    // Status distribution
    const statusDistribution = [
      { status: 'completed', count: completedResponses.length },
      { status: 'incomplete', count: (responses?.filter((r: any) => r.status === 'incomplete').length || 0) },
      { status: 'draft', count: (responses?.filter((r: any) => r.status === 'draft').length || 0) },
    ];

    // Field analytics (mock data for now)
    const fieldAnalytics = [
      { fieldName: 'Name', completionRate: 98, avgTime: 8 },
      { fieldName: 'Email', completionRate: 95, avgTime: 12 },
      { fieldName: 'Message', completionRate: 87, avgTime: 45 },
      { fieldName: 'Phone', completionRate: 72, avgTime: 15 },
    ];

    // Device stats (mock data)
    const deviceStats = [
      { device: 'Desktop', count: Math.round(totalSubmissions * 0.6) },
      { device: 'Mobile', count: Math.round(totalSubmissions * 0.35) },
      { device: 'Tablet', count: Math.round(totalSubmissions * 0.05) },
    ];

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
