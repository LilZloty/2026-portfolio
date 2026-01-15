'use client';

import { useState } from 'react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledAt: string) => Promise<void>;
  title: string;
  platforms: {
    blog: boolean;
    linkedin: boolean;
    twitter: boolean;
  };
  isScheduling: boolean;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  title,
  platforms,
  isScheduling,
}: ScheduleModalProps) {
  // Default to tomorrow at 9 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  const [scheduledDate, setScheduledDate] = useState(
    tomorrow.toISOString().slice(0, 16)
  );

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!scheduledDate) return;
    await onSchedule(new Date(scheduledDate).toISOString());
  };

  const enabledPlatforms = Object.entries(platforms)
    .filter(([, enabled]) => enabled)
    .map(([platform]) => platform);

  // Quick schedule options
  const quickOptions = [
    { label: 'Tomorrow 9 AM', hours: 24 + (9 - new Date().getHours()) },
    { label: 'In 3 days', hours: 72 },
    { label: 'Next week', hours: 168 },
  ];

  const setQuickSchedule = (hoursFromNow: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hoursFromNow);
    date.setMinutes(0, 0, 0);
    setScheduledDate(date.toISOString().slice(0, 16));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div 
        className="w-full max-w-md rounded overflow-hidden"
        style={{ 
          background: 'var(--silver-900)',
          border: '1px solid var(--silver-700)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--silver-800)' }}
        >
          <div>
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'var(--silver-100)' }}
            >
              Schedule Content
            </h2>
            <p 
              className="text-sm mt-1 truncate max-w-xs"
              style={{ color: 'var(--silver-500)' }}
            >
              {title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded transition-colors hover:opacity-80"
            style={{ color: 'var(--silver-400)' }}
            disabled={isScheduling}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Platforms summary */}
          <div>
            <label 
              className="block text-xs mb-2"
              style={{ color: 'var(--silver-500)' }}
            >
              Publishing to
            </label>
            <div className="flex gap-2">
              {enabledPlatforms.map(platform => (
                <span
                  key={platform}
                  className="text-xs px-2 py-1 rounded capitalize"
                  style={{ 
                    background: 'var(--lime-subtle)',
                    color: 'var(--lime-neon)'
                  }}
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Quick options */}
          <div>
            <label 
              className="block text-xs mb-2"
              style={{ color: 'var(--silver-500)' }}
            >
              Quick schedule
            </label>
            <div className="flex gap-2">
              {quickOptions.map(option => (
                <button
                  key={option.label}
                  onClick={() => setQuickSchedule(option.hours)}
                  className="text-xs px-3 py-1.5 rounded transition-colors"
                  style={{ 
                    background: 'var(--silver-800)',
                    color: 'var(--silver-300)'
                  }}
                  disabled={isScheduling}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date/time picker */}
          <div>
            <label 
              className="block text-xs mb-2"
              style={{ color: 'var(--silver-500)' }}
            >
              Custom date & time
            </label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 text-sm rounded"
              style={{ 
                background: 'var(--silver-950)',
                color: 'var(--silver-200)',
                border: '1px solid var(--silver-700)'
              }}
              disabled={isScheduling}
            />
          </div>

          {/* Preview */}
          {scheduledDate && (
            <div 
              className="p-3 rounded text-sm"
              style={{ background: 'var(--silver-950)' }}
            >
              <span style={{ color: 'var(--silver-500)' }}>Scheduled for: </span>
              <span style={{ color: 'var(--lime-neon)' }}>
                {new Date(scheduledDate).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-4 border-t"
          style={{ borderColor: 'var(--silver-800)' }}
        >
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isScheduling}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!scheduledDate || isScheduling}
            className="btn-primary flex items-center gap-2"
          >
            {isScheduling ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scheduling...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
