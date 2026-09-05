'use client';

import React from 'react';

export interface NoticeBoxState {
  message: string;
  type: 'error' | 'warning' | 'success';
}

interface AdminNoticeBoxProps {
  notice: NoticeBoxState | null;
  onClose: () => void;
}

export default function AdminNoticeBox({ notice, onClose }: AdminNoticeBoxProps) {
  if (!notice) return null;

  return (
    <div
      role="alert"
      className="fixed top-6 right-6 z-[99999] max-w-md w-full animate-in fade-in slide-in-from-top-5 duration-200"
    >
      <div
        className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-xl transition-all ${
          notice.type === 'error'
            ? 'bg-rose-950/95 text-rose-100 border-rose-500/60 shadow-rose-950/80'
            : notice.type === 'warning'
              ? 'bg-amber-950/95 text-amber-100 border-amber-500/60 shadow-amber-950/80'
              : 'bg-emerald-950/95 text-emerald-100 border-emerald-500/60 shadow-emerald-950/80'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {notice.type === 'error' && (
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
              ✕
            </div>
          )}
          {notice.type === 'warning' && (
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              ⚠️
            </div>
          )}
          {notice.type === 'success' && (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
          )}
        </div>

        <div className="flex-1 text-xs font-semibold leading-relaxed">
          <p className="font-bold tracking-wider uppercase text-[10px] opacity-75 mb-0.5">
            {notice.type === 'error'
              ? 'Error Notice'
              : notice.type === 'warning'
                ? 'Warning Notice'
                : 'Success Notification'}
          </p>
          {notice.message}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
