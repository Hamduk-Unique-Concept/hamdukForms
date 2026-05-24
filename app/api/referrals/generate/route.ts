import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { organizationId } = await req.json();
    const code = 'HAMDUK' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data, error } = await supabase
      .from('referral_codes')
      .insert({ organization_id: organizationId, code, commission_percentage: 10, discount_percentage: 10 })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ code: data.code, url: `https://forms.hamduk.com.ng/signup?ref=${data.code}` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
  }
}
