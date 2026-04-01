import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');
    const { planType, amount, organizationId } = await request.json();

    if (!planType || !amount || !organizationId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user email
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !user?.email) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('subscriptions')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        plan_type: planType,
        amount,
        currency: 'NGN',
        status: 'pending',
        payment_provider: 'paystack',
      })
      .select('id')
      .single();

    if (txError) throw txError;

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100, // Paystack expects amount in kobo
        metadata: {
          transactionId: transaction?.id,
          planType,
          organizationId,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify?transactionId=${transaction?.id}`,
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      throw new Error(paystackData.message || 'Failed to initialize payment');
    }

    // Store Paystack reference
    if (transaction?.id) {
      await supabase
        .from('subscriptions')
        .update({
          transaction_id: paystackData.data.reference,
        })
        .eq('id', transaction.id);
    }

    return NextResponse.json(
      {
        message: 'Payment initialized',
        authorizationUrl: paystackData.data.authorization_url,
        accessCode: paystackData.data.access_code,
        reference: paystackData.data.reference,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}
