import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { canAccessOrganization, getAuthUser } from '@/lib/access/form-access';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ message: 'organizationId is required' }, { status: 400 });
    }

    const allowed = await canAccessOrganization(organizationId, user.id);
    if (!allowed) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, amount, currency, payment_provider, status, paid_at, created_at, payment_id')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: refunds } = await supabase
      .from('refund_requests')
      .select('amount, status, created_at')
      .eq('organization_id', organizationId);

    const completedPayments = (payments || []).filter((payment) => payment.status === 'completed' || payment.status === 'refunded');
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
      - (refunds || []).filter((refund) => refund.status === 'processed').reduce((sum, refund) => sum + Number(refund.amount || 0), 0);

    const gatewayBreakdown = (payments || []).reduce<Record<string, number>>((acc, payment) => {
      if (payment.status !== 'completed' && payment.status !== 'refunded') return acc;
      const gateway = payment.payment_provider || 'unknown';
      acc[gateway] = (acc[gateway] || 0) + Number(payment.amount || 0);
      return acc;
    }, {});

    return NextResponse.json({
      totalRevenue,
      totalTransactions: completedPayments.length,
      refundsCount: (refunds || []).filter((refund) => refund.status === 'processed').length,
      revenueByGateway: Object.entries(gatewayBreakdown).map(([gateway, revenue]) => ({ gateway, revenue })),
      recentTransactions: (payments || []).slice(0, 20),
    });
  } catch (error) {
    console.error('[v0] Workspace revenue analytics error:', error);
    return NextResponse.json({ message: 'Failed to fetch workspace revenue analytics' }, { status: 500 });
  }
}
