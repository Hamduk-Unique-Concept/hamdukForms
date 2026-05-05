import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, quantity, basePrice, rules, country, userType } = body;

    if (!basePrice || !rules) {
      return NextResponse.json(
        { message: 'basePrice and rules are required' },
        { status: 400 }
      );
    }

    let finalPrice = basePrice;
    const appliedRules: any[] = [];

    rules.forEach((rule: any) => {
      let ruleApplies = false;

      switch (rule.condition) {
        case 'quantity':
          if (rule.operator === 'greater' && quantity > parseInt(rule.value)) ruleApplies = true;
          if (rule.operator === 'less' && quantity < parseInt(rule.value)) ruleApplies = true;
          if (rule.operator === 'equals' && quantity === parseInt(rule.value)) ruleApplies = true;
          break;
        case 'value':
          if (rule.operator === 'greater' && basePrice > parseInt(rule.value)) ruleApplies = true;
          if (rule.operator === 'less' && basePrice < parseInt(rule.value)) ruleApplies = true;
          break;
        case 'country':
          if (rule.operator === 'equals' && country === rule.value) ruleApplies = true;
          break;
        case 'user_type':
          if (rule.operator === 'equals' && userType === rule.value) ruleApplies = true;
          break;
        case 'time':
          const now = new Date().getHours();
          if (rule.operator === 'greater' && now > parseInt(rule.value)) ruleApplies = true;
          if (rule.operator === 'less' && now < parseInt(rule.value)) ruleApplies = true;
          break;
      }

      if (ruleApplies) {
        appliedRules.push(rule);
        if (rule.modifierType === 'percentage') {
          finalPrice = finalPrice * (1 + rule.priceModifier / 100);
        } else {
          finalPrice = finalPrice + rule.priceModifier;
        }
      }
    });

    // Round to 2 decimal places
    finalPrice = Math.round(finalPrice * 100) / 100;
    finalPrice = Math.max(0, finalPrice);

    return NextResponse.json(
      {
        basePrice,
        finalPrice,
        appliedRules,
        discount: basePrice - finalPrice,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Pricing calculation error:', error);
    return NextResponse.json(
      { message: error.message || 'Pricing calculation failed' },
      { status: 500 }
    );
  }
}
