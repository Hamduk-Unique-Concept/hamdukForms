import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { name, description, type, fields, workspaceId, organizationId } = await request.json();

    // Get the user from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, we'll use a placeholder userId - in production, extract from JWT
    const userId = authHeader.split(' ')[1];

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .slice(0, 50);

    // Create the form
    const { data: form, error } = await supabase
      .from('forms')
      .insert([
        {
          name,
          description: description || '',
          slug,
          form_type: type || 'contact',
          workspace_id: workspaceId,
          organization_id: organizationId,
          created_by: userId,
          is_draft: true,
          status: 'draft',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating form:', error);
      return NextResponse.json(
        { error: 'Failed to create form' },
        { status: 500 }
      );
    }

    // Add form fields
    if (fields && fields.length > 0) {
      const fieldsToInsert = fields.map((field: any, index: number) => ({
        form_id: form.id,
        field_order: index,
        field_type: field.type,
        label: field.label,
        placeholder: field.placeholder || '',
        field_key: field.type + '_' + index,
        is_required: field.required || false,
      }));

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert);

      if (fieldsError) {
        console.error('Error creating fields:', fieldsError);
        // Continue anyway - form was created
      }
    }

    return NextResponse.json({
      success: true,
      form: {
        id: form.id,
        name: form.name,
        slug: form.slug,
      },
    });
  } catch (error) {
    console.error('Error in form creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const workspaceId = searchParams.get('workspaceId');

    let query = supabase.from('forms').select('*');

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch forms' },
        { status: 500 }
      );
    }

    return NextResponse.json({ forms: data });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
