import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, role, organizationId } = await request.json();

    // Get current user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create invitation record
    const { data: invitation, error } = await supabase
      .from('team_invitations')
      .insert({
        email,
        role,
        organization_id: organizationId,
        status: 'pending',
        invited_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // In production, send email invitation
    // For now, just return the invitation
    return NextResponse.json({
      id: invitation.id,
      email,
      name: email,
      role,
      joinedAt: invitation.invited_at,
      status: 'pending',
    });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
