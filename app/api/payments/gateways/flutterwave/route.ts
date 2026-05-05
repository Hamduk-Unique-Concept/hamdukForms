import { NextRequest, NextResponse } from 'next/server';

const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, email, phonenumber, fullname, txRef } = body;
    const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!flutterwaveSecretKey) {
      return NextResponse.json(
        { message: 'Flutterwave configuration missing' },
        { status: 500 }
      );
    }

    if (action === 'initialize') {
      if (!amount || !email) {
        return NextResponse.json(
          { message: 'Amount and email are required' },
          { status: 400 }
        );
      }

      const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${flutterwaveSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: txRef || `order_${Date.now()}`,
          amount,
          currency: 'NGN',
          payment_options: 'card,account,ussd',
          customer: {
            email,
            phonenumber,
            name: fullname,
          },
          customizations: {
            title: 'Payment',
            description: 'Order Payment',
            logo: 'https://checkout.flutterwave.com/assets/img/hero2.png',
          },
        }),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    if (action === 'verify') {
      const { transactionId } = body;
      if (!transactionId) {
        return NextResponse.json(
          { message: 'Transaction ID is required' },
          { status: 400 }
        );
      }

      const response = await fetch(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${flutterwaveSecretKey}`,
          },
        }
      );

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[v0] Flutterwave error:', error);
    return NextResponse.json(
      { message: error.message || 'Payment gateway error' },
      { status: 500 }
    );
  }
}
