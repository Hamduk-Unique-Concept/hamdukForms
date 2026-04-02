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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized', error: authError?.message }, { status: 401 });
    }

    const { planId, organizationId, fullName, email, phone, company } = await request.json();

    if (!planId || !organizationId || !fullName || !email) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store checkout info temporarily
    const { data, error } = await supabase
      .from('checkout_sessions')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        plan_id: planId,
        full_name: fullName,
        email,
        phone,
        company,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: 'Checkout info saved', checkoutId: data?.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Checkout save error:', error);
    return NextResponse.json(
      { message: 'Failed to save checkout' },
      { status: 500 }
    );
  }
}
