import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  addMessage,
  archiveConversation,
  exportAsMarkdown,
} from '@/../scripts/content-generator/utils/conversations';

// GET - List all conversations or get specific one
export async function GET(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const exportMd = searchParams.get('export') === 'md';

  if (id) {
    if (exportMd) {
      const markdown = exportAsMarkdown(id);
      if (!markdown) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      return new NextResponse(markdown, {
        headers: { 'Content-Type': 'text/markdown' },
      });
    }

    const conversation = getConversation(id);
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    return NextResponse.json({ conversation });
  }

  const includeArchived = searchParams.get('archived') === 'true';
  let conversations = listConversations();
  
  if (!includeArchived) {
    conversations = conversations.filter(c => !c.archived);
  }

  return NextResponse.json({ conversations });
}

// POST - Create new conversation or add message
export async function POST(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { action, id, title, topicContext, messages, message } = body;

    // Add message to existing conversation
    if (action === 'addMessage' && id && message) {
      const updated = addMessage(id, message);
      if (!updated) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      return NextResponse.json({ conversation: updated });
    }

    // Create new conversation
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const conversation = createConversation({
      title,
      topicContext,
      messages,
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Conversations POST error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

// PUT - Update conversation
export async function PUT(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Archive action
    if (action === 'archive') {
      const archived = archiveConversation(id);
      if (!archived) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      return NextResponse.json({ conversation: archived });
    }

    // Regular update
    const updated = updateConversation(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation: updated });
  } catch (error) {
    console.error('Conversations PUT error:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

// DELETE - Delete conversation
export async function DELETE(request: NextRequest) {
  const auth = validateAdminAuth(request);
  if (!auth.valid) {
    return auth.error;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const deleted = deleteConversation(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
