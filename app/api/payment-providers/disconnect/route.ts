import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

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

    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { message: 'Provider is required' },
        { status: 400 }
      );
    }

    const validProviders = ['paystack', 'stripe', 'flutterwave', 'paypal'];
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

    // Update payment account to disconnect provider
    const updateData: Record<string, any> = {
      [`${provider}_connected`]: false,
      [`${provider}_secret_key`]: null,
      [`${provider}_public_key`]: null,
      updated_at: new Date(),
    };

    const { error } = await supabase
      .from('payment_accounts')
      .update(updateData)
      .eq('organization_id', orgMember.organization_id);

    if (error) throw error;

    return NextResponse.json(
      { message: `${provider} disconnected successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Provider disconnect error:', error);
    return NextResponse.json(
      { message: 'Failed to disconnect provider' },
      { status: 500 }
    );
  }
}
