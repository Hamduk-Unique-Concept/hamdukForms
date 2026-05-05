import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const invoiceData = await request.json();

    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      taxRate,
      currency,
      notes,
    } = invoiceData;

    if (!invoiceNumber || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Invoice number and items are required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + item.quantity * item.unitPrice, 0
    );
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    // Prepare invoice object
    const invoice = {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items: items.map((item: any) => ({
        ...item,
        lineTotal: item.quantity * item.unitPrice,
      })),
      subtotal,
      tax,
      taxRate,
      total,
      currency,
      notes,
      generatedAt: new Date().toISOString(),
    };

    // In production, you would:
    // 1. Save to database
    // 2. Generate PDF using a library like pdfkit
    // 3. Send email if requested
    // 4. Return download URL or base64 PDF

    console.log('[v0] Invoice generated:', invoice);

    return NextResponse.json(
      {
        message: 'Invoice generated successfully',
        invoice,
        // In production: downloadUrl, emailSent, etc.
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Invoice generation error:', error);
    return NextResponse.json(
      { message: error.message || 'Invoice generation failed' },
      { status: 500 }
    );
  }
}
