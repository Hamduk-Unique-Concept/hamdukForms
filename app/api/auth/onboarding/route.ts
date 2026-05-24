import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      username,
      fullName,
      title,
      country,
      timezone,
      industry,
      company,
      bio,
      profileImage,
    } = await request.json();

    // Update user profile
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        username,
        full_name: fullName,
        title,
        country,
        timezone,
        industry,
        company,
        bio,
        profile_image: profileImage,
        onboarding_completed: true,
        updated_at: new Date(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Onboarding error:', error);
      return NextResponse.json(
        { message: 'Failed to complete onboarding' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Onboarding completed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
