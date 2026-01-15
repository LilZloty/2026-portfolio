import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';
import { 
  getTopics, 
  createTopic, 
  updateTopic, 
  deleteTopic,
  getTopicsByStatus,
  getRecentTopics,
  searchTopics,
  Topic 
} from '@/../scripts/content-generator/utils/topics';

// GET - List all topics (with optional filtering)
export async function GET(request: NextRequest) {
  // Validate admin authentication
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as Topic['status'] | null;
  const query = searchParams.get('q');
  const limit = searchParams.get('limit');

  let topics: Topic[];

  if (query) {
    topics = searchTopics(query);
  } else if (status) {
    topics = getTopicsByStatus(status);
  } else if (limit) {
    topics = getRecentTopics(parseInt(limit, 10));
  } else {
    topics = getTopics();
  }

  return NextResponse.json({ topics });
}

// POST - Create new topic
export async function POST(request: NextRequest) {
  // Validate admin authentication
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { title, context, messages, source, status, tags } = body;

    const newTopic = createTopic({
      title,
      context,
      messages,
      source: source || 'admin',
      status: status || 'idea',
      tags,
    });

    return NextResponse.json({ topic: newTopic });
  } catch (error) {
    console.error('Create topic error:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}

// PUT - Update topic
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
        { error: 'Topic ID required' },
        { status: 400 }
      );
    }

    const updatedTopic = updateTopic(id, updateData);

    if (!updatedTopic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ topic: updatedTopic });
  } catch (error) {
    console.error('Update topic error:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}

// DELETE - Remove topic
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
        { error: 'Topic ID required' },
        { status: 400 }
      );
    }

    const deleted = deleteTopic(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete topic error:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
