import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    // Find invitation by token
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .select('id, organization_id, email, role, expires_at, status')
      .eq('token', token)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { message: 'Invitation not found or has expired' },
        { status: 404 }
      );
    }

    // Check if invitation is still valid
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { message: 'This invitation has already been used' },
        { status: 400 }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { message: 'This invitation has expired' },
        { status: 400 }
      );
    }

    // Get organization name
    const { data: org } = await supabase
      .from('organizations')
      .select('name, id')
      .eq('id', invitation.organization_id)
      .single();

    // FIXED: getUserByEmail doesn't exist — query user_profiles instead
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', invitation.email)
      .single();

    let userId = existingProfile?.id;

    if (!existingProfile) {
      // Create a new user account with the invitation email
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: invitation.email,
        email_confirm: false,
        user_metadata: {
          invitedByEmail: true,
        },
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Add user to organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: userId,
        role: invitation.role,
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      // Check if already a member
      if (!memberError.message.includes('duplicate')) {
        throw memberError;
      }
    }

    // Mark invitation as accepted
    await supabase
      .from('team_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    return NextResponse.json(
      {
        message: 'Invitation accepted successfully',
        organizationName: org?.name,
        organizationId: org?.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      { message: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}