import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { message: 'Reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || ''}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      return NextResponse.json(
        { message: 'Payment verification failed' },
        { status: 400 }
      );
    }

    const { status, data } = paystackData;
    const isSuccessful = status && data.status === 'success';

    // Update subscription status
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('transaction_id', reference)
      .single();

    if (subscription && !fetchError) {
      const updateStatus = isSuccessful ? 'active' : 'failed';
      
      await supabase
        .from('subscriptions')
        .update({
          status: updateStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      // If payment successful, update organization plan
      if (isSuccessful) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('organization_id, plan_type')
          .eq('id', subscription.id)
          .single();

        if (sub) {
          await supabase
            .from('organizations')
            .update({
              subscription_plan: sub.plan_type,
              subscription_status: 'active',
            })
            .eq('id', sub.organization_id);
        }
      }
    }

    return NextResponse.json(
      {
        success: isSuccessful,
        message: isSuccessful ? 'Payment successful' : 'Payment failed',
        reference,
        amount: data.amount / 100, // Convert from kobo to Naira
      },
      { status: isSuccessful ? 200 : 400 }
    );
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    );
  }
}
