import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { code, planId } = await req.json();

    const { data: referralCode } = await supabase
      .from('referral_codes')
      .select('id, organization_id, discount_percentage, is_active')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (!referralCode) return NextResponse.json({ error: 'Invalid code' }, { status: 404 });

    const { data: plan } = await supabase.from('plans').select('price_monthly').eq('id', planId).single();
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 404 });

    const discount = plan.price_monthly * (referralCode.discount_percentage / 100);
    return NextResponse.json({ valid: true, discount, referrerOrgId: referralCode.organization_id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to apply referral' }, { status: 500 });
  }
}
