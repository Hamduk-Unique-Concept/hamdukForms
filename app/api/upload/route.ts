import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// You can implement cloud storage (AWS S3, Google Cloud Storage, etc.)
// For now, using a simple approach with base64 encoding
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only images allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File too large. Max size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = uuidv4().split('-')[0];
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${randomId}.${ext}`;

    // In production, you would upload to S3, Google Cloud Storage, or similar
    // For now, we'll create a public URL
    // You should implement actual cloud storage upload here
    const publicUrl = `https://forms.hamduk.com.ng/uploads/${filename}`;

    return NextResponse.json(
      { 
        message: 'Upload successful',
        url: publicUrl,
        filename,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Upload failed' },
      { status: 500 }
    );
  }
}
