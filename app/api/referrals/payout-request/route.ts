import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { sendEmail } from '@/lib/resend-service';

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { organizationId, paymentMethod, paymentDetails } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const { data: codes, error: codesError } = await supabase
      .from('referral_codes')
      .select('id, code, total_commission_earned')
      .eq('organization_id', organizationId);

    if (codesError) throw codesError;

    const totalEarned = (codes || []).reduce(
      (sum, code) => sum + Number(code.total_commission_earned || 0),
      0
    );

    if (totalEarned <= 0 || !codes?.length) {
      return NextResponse.json({ error: 'No commission available for payout' }, { status: 400 });
    }

    const primaryCode = codes[0];
    const { data: payout, error: payoutError } = await supabase
      .from('referral_payouts')
      .insert({
        organization_id: organizationId,
        referral_code_id: primaryCode.id,
        total_amount: totalEarned,
        payout_amount: totalEarned,
        payout_currency: 'NGN',
        payment_method: paymentMethod || 'manual',
        payout_method: paymentMethod || 'manual',
        payment_details: paymentDetails || {},
        status: 'pending',
        notes: `Payout requested for referral code ${primaryCode.code}`,
      })
      .select()
      .single();

    if (payoutError) throw payoutError;

    const { data: organization } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .maybeSingle();

    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `Referral payout request: ₦${totalEarned.toLocaleString()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2>Referral payout request</h2>
            <p><strong>Organization:</strong> ${organization?.name || organizationId}</p>
            <p><strong>Amount:</strong> ₦${totalEarned.toLocaleString()}</p>
            <p><strong>Payout ID:</strong> ${payout.id}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message: 'Payout request submitted',
      payout,
    });
  } catch (error) {
    console.error('[v0] Referral payout request error:', error);
    return NextResponse.json({ error: 'Failed to request payout' }, { status: 500 });
  }
}
