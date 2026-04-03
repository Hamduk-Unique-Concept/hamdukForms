import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      console.log('[v0] Invite auth error:', authError);
      return NextResponse.json({ message: 'Unauthorized', error: authError?.message }, { status: 401 });
    }

    let { organizationId, email, role = 'member' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // If no organizationId provided, get user's default organization
    if (!organizationId) {
      const { data: userOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .single();

      if (!userOrg) {
        return NextResponse.json(
          { message: 'No organization found. Please create one first.' },
          { status: 400 }
        );
      }

      organizationId = userOrg.id;
    }

    // Verify user has access to this organization (either owner or member)
    const { data: isOwner } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organizationId)
      .eq('owner_id', user.id)
      .single();

    const { data: isMember } = await supabase
      .from('user_organizations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { message: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    // Check if email is already invited or is a member
    const { data: existingInvite } = await supabase
      .from('team_invitations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { message: 'This email already has a pending invitation' },
        { status: 400 }
      );
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation record
    const { data: invitation, error: createError } = await supabase
      .from('team_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        token: invitationToken,
        status: 'pending',
        expires_at: expiresAt,
        invited_by: user.id,
      })
      .select('id')
      .single();

    if (createError) throw createError;

    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    // Get inviter details
    const { data: inviterProfile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    // Send invitation email via Resend
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invite?token=${invitationToken}`;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.warn('[v0] RESEND_API_KEY not configured');
    }

    try {
      console.log('[v0] Sending email to:', email);
      console.log('[v0] Resend API Key exists:', !!resendApiKey);
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@forms.hamduk.com.ng',
          to: email,
          subject: `Join ${org?.name || 'Hamduk Forms'} on Hamduk Forms`,
          html: `
            <!DOCTYPE html>
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1f6feb;">You're invited to join ${org?.name || 'a team'}</h2>
                  
                  <p>Hi there,</p>
                  
                  <p><strong>${inviterProfile?.full_name || 'A team member'}</strong> has invited you to join <strong>${org?.name || 'Hamduk Forms'}</strong> on Hamduk Forms as a <strong>${role}</strong>.</p>
                  
                  <p>
                    <a href="${inviteLink}" style="display: inline-block; background-color: #1f6feb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Accept Invitation
                    </a>
                  </p>
                  
                  <p>Or copy this link: <code>${inviteLink}</code></p>
                  
                  <p style="color: #666; font-size: 12px;">
                    This invitation will expire in 7 days.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                  
                  <p style="font-size: 12px; color: #999;">
                    Hamduk Forms - Africa's #1 Form Platform<br>
                    <a href="https://forms.hamduk.com.ng" style="color: #1f6feb; text-decoration: none;">forms.hamduk.com.ng</a>
                  </p>
                </div>
              </body>
            </html>
          `,
        }),
      });

      const emailData = await emailResponse.json();
      console.log('[v0] Resend response status:', emailResponse.status);
      console.log('[v0] Resend response:', emailData);

      if (!emailResponse.ok) {
        console.error('Resend API error:', emailData);
      }
    } catch (emailError: any) {
      console.error('[v0] Error sending invitation email:', emailError.message);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json(
      { 
        message: 'Invitation sent successfully',
        invitationId: invitation.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Team invite error:', error);
    return NextResponse.json(
      { message: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

// GET endpoint to list team members
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const authToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized', error: authError?.message }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { message: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Get team members
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        user_profiles(full_name, username)
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (error) throw error;

    // Get pending invitations
    const { data: invitations } = await supabase
      .from('team_invitations')
      .select('id, email, role, created_at, status')
      .eq('organization_id', organizationId)
      .eq('status', 'pending');

    return NextResponse.json(
      { 
        members: members || [],
        pendingInvitations: invitations || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Team fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}
