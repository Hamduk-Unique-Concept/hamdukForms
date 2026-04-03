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

    let { planId, organizationId, fullName, email, phone, company, promoCode } = await request.json();

    if (!planId || !fullName || !email) {
      return NextResponse.json(
        { message: 'Missing required fields: planId, fullName, email' },
        { status: 400 }
      );
    }

    // If no organizationId, get user's default organization
    if (!organizationId || organizationId === '') {
      const { data: userOrg, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .single();

      if (orgError || !userOrg) {
        console.log('[v0] Error fetching organization:', orgError);
        return NextResponse.json({ message: 'No organization found' }, { status: 400 });
      }

      organizationId = userOrg.id;
    }

    // Define plan prices (in NGN)
    const plans: Record<string, number> = {
      free: 0,
      starter: 5000,
      professional: 15000,
      enterprise: 50000,
    };

    let finalAmount = plans[planId.toLowerCase()] || 0;
    let discountAmount = 0;
    let promoCodeId: string | null = null;

    // Validate and apply promo code if provided
    if (promoCode) {
      const { data: promoData, error: promoError } = await supabase
        .from('promo_codes')
        .select('id, discount_type, discount_value, max_uses, used_count, valid_until, is_active')
        .eq('code', promoCode.toUpperCase())
        .single();

      if (promoData && promoData.is_active) {
        // Check if promo is still valid
        if (promoData.valid_until && new Date(promoData.valid_until) < new Date()) {
          return NextResponse.json({ message: 'Promo code has expired' }, { status: 400 });
        }

        // Check usage limit
        if (promoData.max_uses && promoData.used_count >= promoData.max_uses) {
          return NextResponse.json({ message: 'Promo code has reached max uses' }, { status: 400 });
        }

        promoCodeId = promoData.id;

        // Calculate discount
        if (promoData.discount_type === 'percentage') {
          discountAmount = (finalAmount * promoData.discount_value) / 100;
        } else if (promoData.discount_type === 'fixed') {
          discountAmount = promoData.discount_value;
        }

        finalAmount = Math.max(0, finalAmount - discountAmount);
      }
    }

    // Store checkout info
    const { data, error } = await supabase
      .from('checkout_sessions')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        plan_id: planId,
        full_name: fullName,
        email,
        phone: phone || null,
        company: company || null,
        promo_code_id: promoCodeId,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[v0] Checkout save error:', error);
      throw error;
    }

    return NextResponse.json(
      {
        message: 'Checkout info saved',
        checkoutId: data?.id,
        amount: finalAmount,
        originalAmount: plans[planId.toLowerCase()] || 0,
        discountAmount,
        promoCodeApplied: !!promoCodeId,
      },
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
