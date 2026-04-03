import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formId = params.id;

    // Get form and verify user has access
    const { data: form, error: fetchError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (fetchError || !form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    // Check if user owns the organization or is a member
    const { data: isOwner } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', form.organization_id)
      .eq('owner_id', user.id)
      .single();

    const { data: isMember } = await supabase
      .from('user_organizations')
      .select('id')
      .eq('organization_id', form.organization_id)
      .eq('user_id', user.id)
      .single();

    if (!isOwner && !isMember) {
      return NextResponse.json({ message: 'Unauthorized access to this form' }, { status: 403 });
    }

    return NextResponse.json({ form }, { status: 200 });
  } catch (error: any) {
    console.error('[v0] Form fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formId = params.id;

    // Get form and verify user has access
    const { data: form } = await supabase
      .from('forms')
      .select('id, organization_id')
      .eq('id', formId)
      .single();

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    // Check if user owns the organization
    const { data: isOwner } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', form.organization_id)
      .eq('owner_id', user.id)
      .single();

    if (!isOwner) {
      return NextResponse.json({ message: 'Only form owner can delete' }, { status: 403 });
    }

    // Delete form and cascade delete related data
    const { error: deleteError } = await supabase
      .from('forms')
      .delete()
      .eq('id', formId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'Form deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('[v0] Form delete error:', error);
    return NextResponse.json(
      { message: 'Failed to delete form' },
      { status: 500 }
    );
  }
}
