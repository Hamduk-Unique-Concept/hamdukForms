import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');

    let query = supabase.from('webhooks').select('*');

    if (formId) {
      query = query.eq('form_id', formId);
    }

    const { data: webhooks, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      webhooks: webhooks || [],
    });
  } catch (error) {
    console.error('Get webhooks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { formId, url, events } = await request.json();

    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        form_id: formId,
        url,
        events,
        active: true,
        created_at: new Date().toISOString(),
        delivery_count: 0,
        failure_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      url: data.url,
      events: data.events,
      active: data.active,
      created: data.created_at,
      deliveryCount: data.delivery_count,
      failureCount: data.failure_count,
    });
  } catch (error) {
    console.error('Create webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}
