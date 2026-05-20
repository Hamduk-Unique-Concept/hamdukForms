import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  try {
    const organizationId = req.nextUrl.searchParams.get('organizationId');
    if (!organizationId) return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });

    const { data: codes } = await supabase
      .from('referral_codes')
      .select('id, code, uses_count, total_commission_earned')
      .eq('organization_id', organizationId);

    const { data: redemptions } = await supabase
      .from('referral_redemptions')
      .select('referred_user_id, commission_amount')
      .in('referral_code_id', codes?.map(c => c.id) || []);

    const totalReferred = redemptions?.length || 0;
    const totalEarned = redemptions?.reduce((sum, r) => sum + (r.commission_amount || 0), 0) || 0;

    return NextResponse.json({ totalReferred, totalEarned, codes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
