import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const { formId, email, name, phone, metadata } = await request.json();

    if (!formId || !email || !isEmail(email)) {
      return NextResponse.json({ message: 'Valid formId and email are required' }, { status: 400 });
    }

    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, organization_id, is_published')
      .eq('id', formId)
      .maybeSingle();

    if (formError) throw formError;
    if (!form || !form.is_published) {
      return NextResponse.json({ message: 'Form is not available' }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from('waitlist_entries')
      .select('id, waitlist_position, status')
      .eq('form_id', formId)
      .ilike('email', email)
      .in('status', ['waiting', 'promoted'])
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        message: 'Already on waitlist',
        entry: existing,
        position: existing.waitlist_position,
      });
    }

    const { data: lastEntry } = await supabase
      .from('waitlist_entries')
      .select('waitlist_position')
      .eq('form_id', formId)
      .order('waitlist_position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextPosition = (Number(lastEntry?.waitlist_position) || 0) + 1;

    const { data: entry, error: insertError } = await supabase
      .from('waitlist_entries')
      .insert({
        form_id: formId,
        organization_id: form.organization_id,
        email,
        name: name || null,
        phone: phone || null,
        waitlist_position: nextPosition,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ entry, position: nextPosition }, { status: 201 });
  } catch (error) {
    console.error('[v0] Join waitlist error:', error);
    return NextResponse.json({ message: 'Failed to join waitlist' }, { status: 500 });
  }
}
