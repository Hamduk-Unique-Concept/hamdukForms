import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { canManageForm, getAuthUser } from '@/lib/access/form-access';

function toDateKey(value: string | null | undefined) {
  return value ? value.split('T')[0] : '';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseClient();

  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id: formId } = await params;
    const allowed = await canManageForm(formId, user.id);
    if (!allowed) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, amount, currency, payment_provider, status, paid_at, created_at, customer_email, customer_name, description, payment_id')
      .eq('form_id', formId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: refunds } = await supabase
      .from('refund_requests')
      .select('amount, status, created_at')
      .eq('form_id', formId);

    const completedPayments = (payments || []).filter((payment) => payment.status === 'completed' || payment.status === 'refunded');
    const refundedPayments = (payments || []).filter((payment) => payment.status === 'refunded');
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
      - (refunds || []).filter((refund) => refund.status === 'processed').reduce((sum, refund) => sum + Number(refund.amount || 0), 0);

    const revenueByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      revenueByDay[date.toISOString().split('T')[0]] = 0;
    }

    for (const payment of completedPayments) {
      const key = toDateKey(payment.paid_at || payment.created_at);
      if (key in revenueByDay && payment.status !== 'refunded') {
        revenueByDay[key] += Number(payment.amount || 0);
      }
    }

    const revenueByGateway = (payments || [])
      .filter((payment) => payment.status === 'completed' || payment.status === 'refunded')
      .reduce<Record<string, number>>((acc, payment) => {
        const gateway = payment.payment_provider || 'unknown';
        acc[gateway] = (acc[gateway] || 0) + Number(payment.amount || 0);
        return acc;
      }, {});

    const totalTransactions = completedPayments.length;
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const refundRate = totalTransactions > 0 ? Math.round(((refunds || []).filter((refund) => refund.status === 'processed').length / totalTransactions) * 100) : 0;

    return NextResponse.json({
      totalRevenue,
      averageOrderValue,
      totalTransactions,
      refundRate,
      revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
      revenueByGateway: Object.entries(revenueByGateway).map(([gateway, revenue]) => ({ gateway, revenue })),
      recentTransactions: (payments || []).slice(0, 10),
      refunds: refunds || [],
      refundedTransactions: refundedPayments.length,
    });
  } catch (error) {
    console.error('[v0] Revenue analytics error:', error);
    return NextResponse.json({ message: 'Failed to fetch revenue analytics' }, { status: 500 });
  }
}
