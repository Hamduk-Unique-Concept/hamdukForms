import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get('provider');

  if (!provider || !['google', 'microsoft'].includes(provider)) {
    return NextResponse.json(
      { message: 'Invalid provider' },
      { status: 400 }
    );
  }

  // Build OAuth authorization URLs
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback`;

  if (provider === 'google') {
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID || '');
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  if (provider === 'microsoft') {
    const microsoftAuthUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    microsoftAuthUrl.searchParams.set('client_id', process.env.MICROSOFT_CLIENT_ID || '');
    microsoftAuthUrl.searchParams.set('redirect_uri', redirectUri);
    microsoftAuthUrl.searchParams.set('response_type', 'code');
    microsoftAuthUrl.searchParams.set('scope', 'openid email profile');

    return NextResponse.redirect(microsoftAuthUrl.toString());
  }

  return NextResponse.json(
    { message: 'Provider not configured' },
    { status: 500 }
  );
}
