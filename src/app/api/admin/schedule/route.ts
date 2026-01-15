import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';
import {
  getScheduledContent,
  createScheduledContent,
  updateScheduledContent,
  deleteScheduledContent,
  getContentByStatus,
  getUpcomingContent,
  getDueContent,
  ScheduledContent,
} from '@/../scripts/content-generator/utils/scheduler';

// GET - List scheduled content (with optional filtering)
export async function GET(request: NextRequest) {
  // Validate admin authentication
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as ScheduledContent['status'] | null;
  const upcoming = searchParams.get('upcoming');
  const due = searchParams.get('due');

  let items: ScheduledContent[];

  if (due === 'true') {
    items = getDueContent();
  } else if (upcoming) {
    items = getUpcomingContent(parseInt(upcoming, 10) || 10);
  } else if (status) {
    items = getContentByStatus(status);
  } else {
    items = getScheduledContent();
  }

  return NextResponse.json({ scheduled: items });
}

// POST - Create new scheduled content
export async function POST(request: NextRequest) {
  // Validate admin authentication
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { topicId, title, scheduledAt, platforms, content } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { error: 'Title and scheduledAt are required' },
        { status: 400 }
      );
    }

    // Validate scheduledAt is in the future
    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    const newItem = createScheduledContent({
      topicId,
      title,
      scheduledAt,
      platforms: platforms || { blog: true, linkedin: false, twitter: false },
      content: content || {},
    });

    return NextResponse.json({ scheduled: newItem });
  } catch (error) {
    console.error('Create scheduled content error:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled content' },
      { status: 500 }
    );
  }
}

// PUT - Update scheduled content
export async function PUT(request: NextRequest) {
  // Validate admin authentication
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const updatedItem = updateScheduledContent(id, updateData);

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Scheduled content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ scheduled: updatedItem });
  } catch (error) {
    console.error('Update scheduled content error:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduled content' },
      { status: 500 }
    );
  }
}

// DELETE - Remove scheduled content
export async function DELETE(request: NextRequest) {
  // Validate admin authentication
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const deleted = deleteScheduledContent(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Scheduled content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete scheduled content error:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled content' },
      { status: 500 }
    );
  }
}
