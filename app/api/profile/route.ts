import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function PUT(request: NextRequest) {
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

    const profileData = await request.json();

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        full_name: profileData.fullName,
        username: profileData.username,
        title: profileData.title,
        country: profileData.country,
        timezone: profileData.timezone,
        website: profileData.website,
        bio: profileData.bio,
        twitter: profileData.twitter,
        linkedin: profileData.linkedin,
        github: profileData.github,
        instagram: profileData.instagram,
        phone_number: profileData.phone,
        phone_country_code: profileData.phoneCountryCode,
        primary_language: profileData.language,
        profile_image: profileData.profileImage,
        cover_image: profileData.coverImage,
        contact_email_public: profileData.contactEmailPublic,
        updated_at: new Date(),
      }, { onConflict: 'user_id' });

    if (error) throw error;

    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json(
      { profile: profile || {} },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
