import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const encryptKey = (key: string): string => {
  return cipher.update(key, 'utf8', 'hex') + cipher.final('hex');
};

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { provider, apiKey } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { message: 'Provider and API key are required' },
        { status: 400 }
      );
    }

    const validProviders = ['stripe', 'paystack', 'paypal', 'flutterwave'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { message: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Get user's organization
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgMember) {
      return NextResponse.json(
        { message: 'User does not belong to an organization' },
        { status: 400 }
      );
    }

    // Encrypt and store API key
    const encryptedKey = encryptKey(apiKey);

    // Update payment account
    const { error } = await supabase
      .from('payment_accounts')
      .upsert({
        organization_id: orgMember.organization_id,
        [`${provider}_secret_key`]: encryptedKey,
        [`${provider}_connected`]: true,
        updated_at: new Date(),
      }, { onConflict: 'organization_id' });

    if (error) throw error;

    return NextResponse.json(
      { message: `${provider} connected successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Provider connect error:', error);
    return NextResponse.json(
      { message: 'Failed to connect provider' },
      { status: 500 }
    );
  }
}
