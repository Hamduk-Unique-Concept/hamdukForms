import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET templates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';

    let query = supabase
      .from('form_templates')
      .select('id, name, description, category, thumbnail_url, is_published, is_featured, created_at, form_structure')
      .eq('is_published', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data: templates, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      console.error('[v0] Template fetch error:', error);
      throw error;
    }

    return NextResponse.json(
      { templates: templates || [] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Templates fetch error:', error.message);
    return NextResponse.json(
      { message: 'Failed to fetch templates', error: error.message },
      { status: 500 }
    );
  }
}

// POST to create form from template
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log('[v0] Auth error in template POST:', authError);
      return NextResponse.json({ message: 'Unauthorized', error: authError?.message }, { status: 401 });
    }

    const {
      templateId,
      organizationId,
      formTitle,
    } = await request.json();

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('form_templates')
      .select('form_structure')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    // Create form from template
    const slug = `form-${Date.now()}`;
    const { data: newForm, error: createError } = await supabase
      .from('forms')
      .insert({
        organization_id: organizationId,
        created_by: user.id,
        title: formTitle || `${template.form_structure.name || 'New'} Form`,
        slug,
        status: 'draft',
        is_published: false,
        settings: template.form_structure.settings || {},
        theme_config: template.form_structure.themeConfig || {},
        branding_config: template.form_structure.brandingConfig || {},
      })
      .select('id')
      .single();

    if (createError) throw createError;

    // Insert template fields into new form
    if (template.form_structure.fields && template.form_structure.fields.length > 0) {
      const fieldsToInsert = template.form_structure.fields.map((field: any, index: number) => ({
        form_id: newForm.id,
        field_type: field.type,
        field_key: field.key || `field_${index}`,
        label: field.label,
        placeholder: field.placeholder,
        help_text: field.helpText,
        default_value: field.defaultValue,
        is_required: field.required || false,
        validation_rules: field.validations || {},
        options: field.options || [],
        conditional_logic: field.conditionalLogic || [],
        order_index: index,
      }));

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert);

      if (fieldsError) throw fieldsError;
    }

    return NextResponse.json(
      {
        message: 'Form created from template successfully',
        formId: newForm.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Form creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create form from template' },
      { status: 500 }
    );
  }
}
