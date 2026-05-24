import { getSupabaseClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = getSupabaseClient();
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const dateRange = searchParams.get('dateRange') || '7d';

    if (!formId) {
      return NextResponse.json(
        { message: 'formId is required' },
        { status: 400 }
      );
    }

    // Get main analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('form_analytics')
      .select('*')
      .eq('form_id', formId)
      .single();

    if (analyticsError) {
      return NextResponse.json(
        { message: analyticsError.message },
        { status: 400 }
      );
    }

    // Get field-level analytics
    const { data: fieldAnalytics } = await supabase
      .from('field_analytics')
      .select('*')
      .eq('form_id', formId)
      .order('dropoff_rate', { ascending: false })
      .limit(10);

    // Get form visits for device breakdown
    const { data: visits } = await supabase
      .from('form_visits')
      .select('device_type, country')
      .eq('form_id', formId);

    const deviceBreakdown: Record<string, number> = {};
    const countryBreakdown: Record<string, number> = {};

    visits?.forEach(visit => {
      deviceBreakdown[visit.device_type] = (deviceBreakdown[visit.device_type] || 0) + 1;
      if (visit.country) {
        countryBreakdown[visit.country] = (countryBreakdown[visit.country] || 0) + 1;
      }
    });

    return NextResponse.json({
      analytics,
      fieldAnalytics,
      deviceBreakdown,
      countryBreakdown,
      totalVisits: visits?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { formId, event, data } = await request.json();

    if (!formId || !event) {
      return NextResponse.json(
        { message: 'formId and event are required' },
        { status: 400 }
      );
    }

    // Log form visit
    if (event === 'visit') {
      const { data: insertData, error } = await supabase
        .from('form_visits')
        .insert({
          form_id: formId,
          session_id: data.sessionId,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          referrer_url: data.referrerUrl,
          utm_source: data.utmSource,
          utm_medium: data.utmMedium,
          utm_campaign: data.utmCampaign,
          device_type: data.deviceType,
          country: data.country,
        });

      if (error) {
        console.error('Visit tracking error:', error);
      }
    }

    // Log field interaction
    if (event === 'field_interaction') {
      const { data: updateData, error } = await supabase
        .from('field_analytics')
        .upsert({
          form_id: formId,
          field_id: data.fieldId,
          field_label: data.fieldLabel,
          field_type: data.fieldType,
          total_interactions: (data.interactions || 0) + 1,
          avg_time_spent_seconds: data.timeSpent || 0,
        }, {
          onConflict: 'form_id, field_id'
        });

      if (error) {
        console.error('Field analytics error:', error);
      }
    }

    // Log form dropoff
    if (event === 'dropoff') {
      const { error } = await supabase
        .from('form_visits')
        .update({
          dropped_at: new Date().toISOString(),
          time_spent_seconds: data.timeSpent,
        })
        .eq('session_id', data.sessionId);

      if (error) {
        console.error('Dropoff tracking error:', error);
      }

      // Update field dropoff
      if (data.fieldId) {
        await supabase
          .from('field_analytics')
          .update({
            dropoff_count: (data.dropoffCount || 0) + 1,
          })
          .eq('form_id', formId)
          .eq('field_id', data.fieldId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
