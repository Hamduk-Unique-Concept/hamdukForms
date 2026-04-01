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
    const { provider, apiKey, publicKey, secretKey } = await request.json();

    if (!provider || (!apiKey && !secretKey)) {
      return NextResponse.json(
        { message: 'Provider and credentials are required' },
        { status: 400 }
      );
    }

    // Validate API keys based on provider
    const validationRules: Record<string, (key: string) => boolean> = {
      stripe: (key) => key.startsWith('sk_'),
      paystack: (key) => key.length > 20,
      paypal: (key) => key.length > 20,
      flutterwave: (key) => key.length > 20,
    };

    const validator = validationRules[provider];
    if (validator && apiKey && !validator(apiKey)) {
      return NextResponse.json(
        { message: `Invalid ${provider} API key format` },
        { status: 400 }
      );
    }

    // Store credentials securely
    const { error } = await supabase
      .from('payment_providers')
      .upsert({
        user_id: userId,
        provider,
        api_key: apiKey,
        public_key: publicKey,
        secret_key: secretKey,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' });

    if (error) throw error;

    return NextResponse.json(
      { message: `${provider} configured successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment provider error:', error);
    return NextResponse.json(
      { message: 'Failed to configure payment provider' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');

    const { data: providers, error } = await supabase
      .from('payment_providers')
      .select('provider, is_active, updated_at')
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ providers: providers || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { message: 'Failed to fetch payment providers' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');
    const { provider } = await request.json();

    const { error } = await supabase
      .from('payment_providers')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('provider', provider);

    if (error) throw error;

    return NextResponse.json(
      { message: `${provider} removed` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing provider:', error);
    return NextResponse.json(
      { message: 'Failed to remove payment provider' },
      { status: 500 }
    );
  }
}
