'use client';

import { useState, useRef, useEffect } from 'react';
import PreviewModal from './components/PreviewModal';
import RegenerateDialog from './components/RegenerateDialog';
import ScheduleModal from './components/ScheduleModal';
import SocialPostButtons from './components/SocialPostButtons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Topic {
  id: string;
  title: string;
  context: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ToastData {
  message: string;
  files?: { type: string; path: string }[];
}

export default function AdminDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [drafts, setDrafts] = useState<{
    blog: string;
    linkedin: string;
    twitter: string;
  }>({
    blog: '',
    linkedin: '',
    twitter: '',
  });
  const [publishOptions, setPublishOptions] = useState({
    blog: true,
    linkedin: true,
    twitter: false,
  });
  const [activeDraft, setActiveDraft] = useState<'blog' | 'linkedin' | 'twitter' | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDrafts, setPreviewDrafts] = useState<{
    blog: string;
    linkedin: string;
    twitter: string;
  }>({ blog: '', linkedin: '', twitter: '' });
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [regenerateType, setRegenerateType] = useState<'blog' | 'linkedin' | 'twitter'>('blog');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get admin auth header for API calls - uses session token
  const getAuthHeaders = () => {
    const sessionToken = sessionStorage.getItem('admin_session') || '';
    return {
      'Content-Type': 'application/json',
      'X-Admin-Session': sessionToken,
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchTopics();
    // Load conversation history from localStorage
    loadConversationFromStorage();
  }, []);

  // Auto-save conversation to localStorage
  useEffect(() => {
    if (messages.length > 0 || currentTopic || contentTitle) {
      const conversationData = {
        messages: messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })),
        currentTopic,
        contentTitle,
        drafts,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('admin_current_conversation', JSON.stringify(conversationData));
    }
  }, [messages, currentTopic, contentTitle, drafts]);

  // Auto-hide toast after 8 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadConversationFromStorage = () => {
    try {
      const saved = localStorage.getItem('admin_current_conversation');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages.map((m: { id: string; role: 'user' | 'assistant'; content: string; timestamp: string }) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })));
        }
        if (data.currentTopic) setCurrentTopic(data.currentTopic);
        if (data.contentTitle) setContentTitle(data.contentTitle);
        if (data.drafts) setDrafts(data.drafts);
      }
    } catch (error) {
      console.error('Failed to load conversation from storage:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/admin/topics');
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt: `You are helping Theo Daudebourg, a Shopify performance specialist, develop content ideas for his blog. 
Help him explore topics related to Shopify speed optimization, CRO, AI-powered SEO, and e-commerce. 
Be conversational and help develop ideas that could become blog posts or social media content.
Keep responses focused and practical.`,
        }),
      });

      const data = await res.json();

      if (data.message) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTopic = async () => {
    if (!contentTitle.trim()) {
      setToast({ message: 'Please enter a title first.' });
      return;
    }

    try {
      await fetch('/api/admin/topics', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: contentTitle,
          context: currentTopic,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      fetchTopics();
      setToast({ message: 'Topic saved successfully!' });
    } catch (error) {
      console.error('Failed to save topic:', error);
    }
  };

  const loadTopic = (topic: Topic) => {
    setCurrentTopic(topic.context);
    setContentTitle(topic.title);
    setMessages(topic.messages.map((m, i) => ({
      id: i.toString(),
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: new Date(topic.updatedAt),
    })));
  };

  // Pre-generate content for preview (or use existing drafts)
  const preparePreview = async () => {
    if (messages.length === 0) {
      setToast({ message: 'Start a conversation first!' });
      return;
    }

    if (!contentTitle.trim()) {
      setToast({ message: 'Please enter a title before publishing.' });
      return;
    }

    const hasSelection = publishOptions.blog || publishOptions.linkedin || publishOptions.twitter;
    if (!hasSelection) {
      setToast({ message: 'Select at least one platform to publish.' });
      return;
    }

    // If we have manual drafts, use those for preview
    setPreviewDrafts({
      blog: drafts.blog || '[Blog content will be AI-generated...]',
      linkedin: drafts.linkedin || '[LinkedIn content will be AI-generated...]',
      twitter: drafts.twitter || '[Twitter content will be AI-generated...]',
    });
    
    setShowPreview(true);
  };

  // Actual publish after preview confirmation
  const confirmPublish = async () => {
    setGenerating(true);

    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          topic: contentTitle,
          context: currentTopic,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          drafts: {
            blog: drafts.blog || undefined,
            linkedin: drafts.linkedin || undefined,
            twitter: drafts.twitter || undefined,
          },
          outputs: publishOptions,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const files: { type: string; path: string }[] = [];
        if (data.paths?.blog) files.push({ type: 'Blog', path: data.paths.blog });
        if (data.paths?.linkedin) files.push({ type: 'LinkedIn', path: data.paths.linkedin });
        if (data.paths?.twitter) files.push({ type: 'Twitter', path: data.paths.twitter });
        
        setShowPreview(false);
        setToast({
          message: 'Content published successfully!',
          files: files.length > 0 ? files : undefined,
        });
      } else {
        setToast({ message: 'Generation failed: ' + data.error });
      }
    } catch (error) {
      console.error('Generate error:', error);
      setToast({ message: 'An error occurred during generation.' });
    } finally {
      setGenerating(false);
    }
  };

  // Legacy publishContent - now just opens preview
  const publishContent = () => {
    preparePreview();
  };

  const clearChat = () => {
    if (confirm('Clear current conversation?')) {
      setMessages([]);
      setCurrentTopic('');
      setContentTitle('');
      setDrafts({ blog: '', linkedin: '', twitter: '' });
      localStorage.removeItem('admin_current_conversation');
    }
  };

  const addToDraft = (type: 'blog' | 'linkedin' | 'twitter', content: string) => {
    setDrafts(prev => ({ ...prev, [type]: content }));
    setPublishOptions(prev => ({ ...prev, [type]: true }));
    setToast({ message: `Added to ${type} draft!` });
  };

  const openRegenerateDialog = (type: 'blog' | 'linkedin' | 'twitter') => {
    setRegenerateType(type);
    setShowRegenerateDialog(true);
  };

  const handleRegenerate = async (feedback: string) => {
    if (!drafts[regenerateType]) {
      setToast({ message: 'No content to regenerate. Add content to draft first.' });
      return;
    }

    setIsRegenerating(true);

    try {
      const res = await fetch('/api/admin/regenerate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          contentType: regenerateType,
          previousContent: drafts[regenerateType],
          feedback,
          context: {
            topic: contentTitle,
            topicContext: currentTopic,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
          },
        }),
      });

      const data = await res.json();

      if (data.success && data.content) {
        setDrafts(prev => ({ ...prev, [regenerateType]: data.content }));
        setShowRegenerateDialog(false);
        setToast({ message: `${regenerateType} content regenerated!` });
      } else {
        setToast({ message: 'Regeneration failed: ' + (data.error || 'Unknown error') });
      }
    } catch (error) {
      console.error('Regenerate error:', error);
      setToast({ message: 'Failed to regenerate content.' });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Schedule content for future publishing
  const handleSchedule = async (scheduledAt: string) => {
    if (!contentTitle.trim()) {
      setToast({ message: 'Please enter a title before scheduling.' });
      return;
    }

    setIsScheduling(true);

    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          topicId: currentTopic || undefined,
          title: contentTitle,
          scheduledAt,
          platforms: publishOptions,
          content: {
            blog: drafts.blog || undefined,
            linkedin: drafts.linkedin || undefined,
            twitter: drafts.twitter || undefined,
          },
        }),
      });

      const data = await res.json();

      if (data.scheduled) {
        setShowScheduleModal(false);
        setToast({ 
          message: `Scheduled for ${new Date(scheduledAt).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}` 
        });
      } else {
        setToast({ message: 'Scheduling failed: ' + (data.error || 'Unknown error') });
      }
    } catch (error) {
      console.error('Schedule error:', error);
      setToast({ message: 'Failed to schedule content.' });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="flex h-full relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-[110] animate-in slide-in-from-top-2 fade-in duration-300">
          <div 
            className="glass-card p-4 max-w-sm"
            style={{ background: 'var(--silver-900)' }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
                style={{ background: 'var(--lime-subtle)' }}
              >
                <svg className="w-4 h-4" style={{ color: 'var(--lime-neon)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--silver-100)' }}>{toast.message}</p>
                {toast.files && toast.files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {toast.files.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--silver-400)' }}>
                        <span style={{ color: 'var(--lime-neon)' }}>{file.type}:</span>
                        <span className="truncate font-mono">{file.path.split('/').pop()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setToast(null)}
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--silver-500)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={confirmPublish}
        title={contentTitle}
        drafts={previewDrafts}
        publishOptions={publishOptions}
        isPublishing={generating}
      />

      {/* Regenerate Dialog */}
      <RegenerateDialog
        isOpen={showRegenerateDialog}
        onClose={() => setShowRegenerateDialog(false)}
        onRegenerate={handleRegenerate}
        contentType={regenerateType}
        isRegenerating={isRegenerating}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleSchedule}
        title={contentTitle}
        platforms={publishOptions}
        isScheduling={isScheduling}
      />

      {/* Sidebar */}
      <aside 
        className="w-72 border-r p-4 overflow-y-auto flex flex-col"
        style={{ 
          borderColor: 'var(--silver-800)',
          background: 'var(--silver-950)'
        }}
      >
        {/* Saved Topics */}
        <div className="flex-shrink-0">
          <h2 
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--silver-500)' }}
          >
            Saved Topics
          </h2>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {topics.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--silver-600)' }}>No topics saved yet.</p>
            ) : (
              topics.slice(0, 5).map(topic => (
                <button
                  key={topic.id}
                  onClick={() => loadTopic(topic)}
                  className="w-full text-left px-3 py-2 text-sm rounded transition-colors hover:opacity-80"
                  style={{ 
                    color: 'var(--silver-300)',
                    background: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--silver-800)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="font-medium truncate">{topic.title}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Publishing Preview Panel */}
        <div className="mt-6 pt-6 border-t flex-1" style={{ borderColor: 'var(--silver-800)' }}>
          <h3 
            className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: 'var(--silver-500)' }}
          >
            Ready to Publish
          </h3>
          
          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-xs mb-1" style={{ color: 'var(--silver-500)' }}>Content Title</label>
            <input
              type="text"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full px-3 py-2 text-sm"
            />
          </div>

          {/* Platform Checkboxes */}
          <div className="space-y-3">
            {(['blog', 'linkedin', 'twitter'] as const).map(type => {
              const hasDraft = !!drafts[type];
              const isChecked = publishOptions[type];
              
              return (
                <div 
                  key={type} 
                  className="p-3 rounded border transition-colors"
                  style={{ 
                    borderColor: isChecked ? 'rgba(161, 251, 9, 0.3)' : 'var(--silver-800)',
                    background: isChecked ? 'var(--lime-subtle)' : 'var(--silver-900)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`publish-${type}`}
                      checked={isChecked}
                      onChange={(e) => setPublishOptions(prev => ({ ...prev, [type]: e.target.checked }))}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--lime-neon)' }}
                    />
                    <label htmlFor={`publish-${type}`} className="flex-1 cursor-pointer">
                      <span className="text-sm font-medium capitalize" style={{ color: 'var(--silver-100)' }}>{type}</span>
                      <span 
                        className="ml-2 text-[10px] px-1.5 py-0.5 rounded"
                        style={{ 
                          background: hasDraft ? 'var(--lime-subtle)' : 'var(--silver-800)',
                          color: hasDraft ? 'var(--lime-neon)' : 'var(--silver-500)'
                        }}
                      >
                        {hasDraft ? 'Draft Ready' : 'AI Generate'}
                      </span>
                    </label>
                    {hasDraft && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveDraft(type)}
                          className="text-[10px] transition-colors hover:opacity-80"
                          style={{ color: 'var(--silver-400)' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openRegenerateDialog(type)}
                          className="text-[10px] transition-colors hover:opacity-80"
                          style={{ color: 'var(--lime-neon)' }}
                        >
                          Regen
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {hasDraft && (
                    <p 
                      className="mt-2 text-xs line-clamp-2 pl-7"
                      style={{ color: 'var(--silver-400)' }}
                    >
                      {drafts[type]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Publish Button */}
          <button
            onClick={publishContent}
            disabled={generating || messages.length === 0 || !contentTitle.trim()}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Publish Selected
              </>
            )}
          </button>

          {/* Schedule Button */}
          <button
            onClick={() => setShowScheduleModal(true)}
            disabled={generating || messages.length === 0 || !contentTitle.trim()}
            className="btn-secondary w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Schedule Later
          </button>

          {/* Social Post Buttons */}
          {(drafts.linkedin || drafts.twitter) && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--silver-800)' }}>
              <label 
                className="block text-xs mb-2"
                style={{ color: 'var(--silver-500)' }}
              >
                Post directly
              </label>
              <SocialPostButtons
                linkedinContent={drafts.linkedin}
                twitterContent={drafts.twitter}
                onSuccess={(platform, url) => {
                  setToast({ 
                    message: `Posted to ${platform}!`,
                    files: [{ type: platform, path: url }]
                  });
                }}
                onError={(platform, error) => {
                  setToast({ message: `${platform} error: ${error}` });
                }}
                getAuthHeaders={getAuthHeaders}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col" style={{ background: 'var(--silver-950)' }}>
        {/* Context Input */}
        <div 
          className="p-4 border-b"
          style={{ 
            borderColor: 'var(--silver-800)',
            background: 'var(--silver-900)'
          }}
        >
          <label className="block text-xs mb-2" style={{ color: 'var(--silver-500)' }}>
            Topic Context (optional - helps Grok understand your focus)
          </label>
          <input
            type="text"
            value={currentTopic}
            onChange={(e) => setCurrentTopic(e.target.value)}
            placeholder="e.g., Shopify speed optimization for fashion stores"
            className="w-full px-4 py-2 text-sm"
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center mt-20" style={{ color: 'var(--silver-500)' }}>
              <p className="text-lg mb-2">Start a conversation</p>
              <p className="text-sm">
                Discuss content ideas with Grok, then generate blog posts and social content.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className="max-w-[80%] px-4 py-3 rounded"
                  style={{ 
                    background: message.role === 'user' ? 'var(--lime-neon)' : 'var(--silver-800)',
                    color: message.role === 'user' ? 'var(--silver-950)' : 'var(--silver-100)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Always visible action buttons for assistant messages */}
                {message.role === 'assistant' && (
                  <div className="flex gap-2 mt-2 ml-2">
                    <button 
                      onClick={() => addToDraft('blog', message.content)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Blog
                    </button>
                    <button 
                      onClick={() => addToDraft('linkedin', message.content)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div 
                className="px-4 py-3 rounded"
                style={{ 
                  background: 'var(--silver-800)',
                  color: 'var(--silver-400)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Draft Editor Overlay */}
        {activeDraft && (
          <div className="absolute inset-0 flex items-center justify-center p-8 z-50" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div 
              className="glass-card w-full max-w-4xl h-full max-h-[80vh] flex flex-col overflow-hidden"
              style={{ background: 'var(--silver-900)' }}
            >
              <div 
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: 'var(--silver-800)' }}
              >
                <h3 className="text-lg font-semibold capitalize" style={{ color: 'var(--silver-100)' }}>
                  Edit {activeDraft} Draft
                </h3>
                <button 
                  onClick={() => setActiveDraft(null)}
                  className="p-2 rounded transition-colors hover:opacity-80"
                  style={{ color: 'var(--silver-400)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={drafts[activeDraft]}
                  onChange={(e) => setDrafts(prev => ({ ...prev, [activeDraft]: e.target.value }))}
                  className="w-full h-full p-6 font-mono text-sm leading-relaxed resize-none"
                  style={{ 
                    background: 'var(--silver-950)',
                    color: 'var(--silver-200)'
                  }}
                  placeholder={`Write your ${activeDraft} content here...`}
                />
              </div>
              <div 
                className="p-4 border-t flex justify-between items-center"
                style={{ borderColor: 'var(--silver-800)' }}
              >
                <button
                  onClick={() => {
                    setDrafts(prev => ({ ...prev, [activeDraft]: '' }));
                    setActiveDraft(null);
                  }}
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--silver-400)' }}
                >
                  Clear Draft
                </button>
                <button
                  onClick={() => setActiveDraft(null)}
                  className="btn-primary"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div 
          className="p-4 border-t"
          style={{ 
            borderColor: 'var(--silver-800)',
            background: 'var(--silver-900)'
          }}
        >
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="w-full px-4 py-3 resize-none overflow-y-auto"
                style={{ 
                  minHeight: '48px',
                  maxHeight: '200px',
                  lineHeight: '1.5'
                }}
                rows={1}
                disabled={loading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 h-12"
            >
              Send
            </button>
          </div>
          <div className="flex gap-3 mt-3 text-xs" style={{ color: 'var(--silver-500)' }}>
            <button
              onClick={saveTopic}
              disabled={messages.length === 0}
              className="transition-colors hover:opacity-80 disabled:opacity-50"
              style={{ color: 'var(--silver-400)' }}
            >
              Save Topic
            </button>
            <span style={{ color: 'var(--silver-700)' }}>|</span>
            <button
              onClick={clearChat}
              className="transition-colors hover:opacity-80"
              style={{ color: 'var(--silver-400)' }}
            >
              Clear Chat
            </button>
            <span className="ml-auto" style={{ color: 'var(--silver-600)' }}>
              Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
