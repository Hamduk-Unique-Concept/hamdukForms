import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!formId) {
      return NextResponse.json(
        { message: 'formId is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('responses')
      .select('*, response_statuses(*)', { count: 'exact' })
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('response_statuses.status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      responses: data,
      total: count,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { formId, action, responseId, data } = await request.json();

    if (!formId || !action) {
      return NextResponse.json(
        { message: 'formId and action are required' },
        { status: 400 }
      );
    }

    // Update response status
    if (action === 'update_status') {
      const { error } = await supabase
        .from('response_statuses')
        .upsert({
          response_id: responseId,
          status: data.status,
          assigned_to: data.assignedTo,
        }, {
          onConflict: 'response_id'
        });

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }

    // Add comment to response
    if (action === 'add_comment') {
      const { data: user } = await supabase.auth.getUser(
        request.headers.get('Authorization')?.replace('Bearer ', '')
      );

      const { error } = await supabase
        .from('response_comments')
        .insert({
          response_id: responseId,
          user_id: user?.user?.id,
          comment: data.comment,
        });

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }

    // Add/update tags
    if (action === 'update_tags') {
      const { error } = await supabase
        .from('response_statuses')
        .update({
          tags: data.tags,
        })
        .eq('response_id', responseId);

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }

    // Bulk delete
    if (action === 'bulk_delete') {
      const { error } = await supabase
        .from('responses')
        .delete()
        .in('id', data.responseIds);

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }

    // Bulk archive
    if (action === 'bulk_archive') {
      const { error } = await supabase
        .from('response_statuses')
        .update({
          archived: true,
        })
        .in('response_id', data.responseIds);

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
