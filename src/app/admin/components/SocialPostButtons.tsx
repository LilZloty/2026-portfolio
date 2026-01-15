'use client';

import { useState } from 'react';

interface SocialPostButtonsProps {
  linkedinContent: string;
  twitterContent: string;
  onSuccess: (platform: string, url: string) => void;
  onError: (platform: string, error: string) => void;
  getAuthHeaders: () => Record<string, string>;
}

export default function SocialPostButtons({
  linkedinContent,
  twitterContent,
  onSuccess,
  onError,
  getAuthHeaders,
}: SocialPostButtonsProps) {
  const [postingLinkedIn, setPostingLinkedIn] = useState(false);
  const [postingTwitter, setPostingTwitter] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState<boolean | null>(null);
  const [twitterConnected, setTwitterConnected] = useState<boolean | null>(null);

  // Check connection status on first interaction
  const checkLinkedInStatus = async () => {
    if (linkedInConnected !== null) return linkedInConnected;
    
    try {
      const res = await fetch('/api/admin/post/linkedin', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setLinkedInConnected(data.connected);
      return data.connected;
    } catch {
      setLinkedInConnected(false);
      return false;
    }
  };

  const checkTwitterStatus = async () => {
    if (twitterConnected !== null) return twitterConnected;
    
    try {
      const res = await fetch('/api/admin/post/twitter', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setTwitterConnected(data.connected);
      return data.connected;
    } catch {
      setTwitterConnected(false);
      return false;
    }
  };

  const connectLinkedIn = async () => {
    try {
      const res = await fetch('/api/auth/linkedin', { method: 'POST' });
      const data = await res.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.error) {
        onError('LinkedIn', data.error);
      }
    } catch (error) {
      onError('LinkedIn', 'Failed to start OAuth flow');
    }
  };

  const connectTwitter = async () => {
    try {
      const res = await fetch('/api/auth/twitter', { method: 'POST' });
      const data = await res.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.error) {
        onError('Twitter', data.error);
      }
    } catch (error) {
      onError('Twitter', 'Failed to start OAuth flow');
    }
  };

  const postToLinkedIn = async () => {
    if (!linkedinContent.trim()) {
      onError('LinkedIn', 'No content to post');
      return;
    }

    const connected = await checkLinkedInStatus();
    if (!connected) {
      await connectLinkedIn();
      return;
    }

    setPostingLinkedIn(true);
    try {
      const res = await fetch('/api/admin/post/linkedin', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: linkedinContent }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        onSuccess('LinkedIn', data.postUrl);
      } else {
        onError('LinkedIn', data.error || 'Failed to post');
      }
    } catch (error) {
      onError('LinkedIn', 'Failed to post');
    } finally {
      setPostingLinkedIn(false);
    }
  };

  const postToTwitter = async () => {
    if (!twitterContent.trim()) {
      onError('Twitter', 'No content to post');
      return;
    }

    if (twitterContent.length > 280) {
      onError('Twitter', 'Content exceeds 280 characters');
      return;
    }

    const connected = await checkTwitterStatus();
    if (!connected) {
      await connectTwitter();
      return;
    }

    setPostingTwitter(true);
    try {
      const res = await fetch('/api/admin/post/twitter', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: twitterContent }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        onSuccess('Twitter', data.tweetUrl);
      } else {
        onError('Twitter', data.error || 'Failed to post');
      }
    } catch (error) {
      onError('Twitter', 'Failed to post');
    } finally {
      setPostingTwitter(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Post to LinkedIn */}
      <button
        onClick={postToLinkedIn}
        disabled={postingLinkedIn || !linkedinContent.trim()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ 
          background: '#0a66c2',
          color: 'white',
        }}
        title={linkedInConnected === false ? 'Click to connect LinkedIn' : 'Post to LinkedIn'}
      >
        {postingLinkedIn ? (
          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        )}
        {linkedInConnected === false ? 'Connect' : 'Post'}
      </button>

      {/* Post to Twitter */}
      <button
        onClick={postToTwitter}
        disabled={postingTwitter || !twitterContent.trim() || twitterContent.length > 280}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ 
          background: '#1d9bf0',
          color: 'white',
        }}
        title={twitterConnected === false ? 'Click to connect Twitter' : 'Post to Twitter'}
      >
        {postingTwitter ? (
          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        )}
        {twitterConnected === false ? 'Connect' : 'Post'}
      </button>
    </div>
  );
}
