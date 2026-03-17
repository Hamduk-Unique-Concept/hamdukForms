import { NextResponse } from 'next/server';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export async function POST() {
  try {
    // Generate secret for authenticator app
    const secret = speakeasy.generateSecret({
      name: 'Hamduk Forms',
      issuer: 'Hamduk',
      length: 32,
    });

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    // Store secret in session or return for verification
    // In production, you'd store this temporarily with a verification token

    return NextResponse.json({
      secret: secret.base32,
      qrCode,
      otpAuthUrl: secret.otpauth_url,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to set up 2FA' },
      { status: 500 }
    );
  }
}
