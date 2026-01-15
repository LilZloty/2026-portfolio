'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated via session
    const checkSession = async () => {
      const sessionToken = sessionStorage.getItem('admin_session');
      if (sessionToken) {
        try {
          const res = await fetch('/api/admin/login', {
            headers: { 'X-Admin-Session': sessionToken },
          });
          if (res.ok) {
            setIsAuthenticated(true);
          } else {
            sessionStorage.removeItem('admin_session');
          }
        } catch {
          sessionStorage.removeItem('admin_session');
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.sessionToken) {
        sessionStorage.setItem('admin_session', data.sessionToken);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const sessionToken = sessionStorage.getItem('admin_session');
    
    try {
      await fetch('/api/admin/login', {
        method: 'DELETE',
        headers: sessionToken ? { 'X-Admin-Session': sessionToken } : {},
      });
    } catch {
      // Ignore errors on logout
    }
    
    sessionStorage.removeItem('admin_session');
    setIsAuthenticated(false);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[var(--silver-950)] flex items-center justify-center z-[100]">
        <div className="text-[var(--silver-400)]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-[var(--silver-950)] flex items-center justify-center p-4 z-[100]">
        <div className="w-full max-w-md">
          <div className="glass-card p-8">
            <h1 className="heading-md text-center mb-6" style={{ color: 'var(--silver-100)' }}>
              Admin Access
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--silver-400)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {loginError && (
                <p className="text-sm" style={{ color: 'var(--error, #ef4444)' }}>
                  {loginError}
                </p>
              )}
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--silver-950)] flex flex-col z-[100]">
      {/* Admin Header */}
      <header 
        className="flex-shrink-0 border-b px-6 py-4 flex items-center justify-between"
        style={{ 
          borderColor: 'var(--silver-800)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--silver-100)' }}>
            Content Admin
          </h1>
          <span className="tag tag-lime">Grok AI</span>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="/" 
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--silver-400)' }}
          >
            Back to Site
          </a>
          <button
            onClick={handleLogout}
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--silver-400)' }}
          >
            Logout
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
