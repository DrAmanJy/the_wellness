'use client';

import { MessageSquare, RefreshCw, Check } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

import { ContactQuery } from '../../types';

interface QueriesTabProps {
  queries: ContactQuery[];
  isRefreshingQueries: boolean;
  onRefreshQueries: () => Promise<void>;
  onToggleQueryStatus: (queryId: string) => Promise<void>;
}

export default function QueriesTab({
  queries,
  isRefreshingQueries,
  onRefreshQueries,
  onToggleQueryStatus,
}: QueriesTabProps) {
  return (
    <motion.div
      key="queries"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-heading font-bold text-wellness-navy flex items-center gap-2">
          <MessageSquare size={18} className="text-wellness-green" />
          Clinical & Partnership Inquiries
        </h3>
        <button
          onClick={() => {
            void onRefreshQueries();
          }}
          disabled={isRefreshingQueries}
          className="bg-white border border-wellness-gray-200 text-wellness-navy text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-wellness-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshingQueries ? 'animate-spin' : ''} />
          Refresh Inquiries
        </button>
      </div>

      {queries.length === 0 ? (
        <div className="py-20 text-center text-wellness-charcoal/50 bg-white rounded-3xl border border-wellness-gray-200 shadow-sm flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-wellness-gray-50 flex items-center justify-center mb-4 text-wellness-charcoal/30">
            <MessageSquare size={24} />
          </div>
          <h4 className="text-base font-bold text-wellness-navy">No messages found</h4>
          <p className="text-xs text-wellness-charcoal/60 mt-1 max-w-xs leading-relaxed font-semibold">
            No user inquiries submitted yet. Contact form entries submitted on the contact page will
            automatically appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {queries.map((q) => {
            const isPending = q.status === 'pending';
            return (
              <div
                key={q.id}
                className={`bg-white border p-6 rounded-3xl shadow-sm transition-all relative overflow-hidden flex flex-col md:flex-row justify-between gap-6 hover:shadow-md ${
                  isPending
                    ? 'border-wellness-gray-200'
                    : 'border-wellness-green/30 bg-wellness-green/[0.01]'
                }`}
              >
                {/* Status bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isPending ? 'bg-amber-400' : 'bg-wellness-green'
                  }`}
                />

                <div className="space-y-4 max-w-3xl pl-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded text-[9px] font-extrabold uppercase tracking-widest border ${
                        isPending
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-wellness-green/10 text-wellness-green border-wellness-green/20'
                      }`}
                    >
                      {q.status}
                    </span>

                    <span className="bg-wellness-navy/5 text-wellness-navy border border-wellness-navy/10 px-2.5 py-1 rounded text-[9px] font-extrabold uppercase tracking-widest">
                      {q.inquiryType}
                    </span>

                    <span className="text-[10px] text-wellness-charcoal/40 font-mono font-bold">
                      {new Date(q.date).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-wellness-navy">
                      {q.firstName} {q.lastName}
                      {q.company && (
                        <span className="text-wellness-charcoal/50 font-semibold text-xs ml-1">
                          at {q.company}
                        </span>
                      )}
                    </h4>
                    <a
                      href={`mailto:${q.email}`}
                      className="text-[11px] text-wellness-green hover:underline font-mono font-bold mt-0.5 block"
                    >
                      {q.email}
                    </a>
                  </div>

                  <div className="p-4 rounded-xl bg-wellness-gray-50 border border-wellness-gray-200">
                    <p className="text-xs text-wellness-charcoal/80 leading-relaxed font-semibold">
                      "{q.message}"
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col md:items-end justify-between items-center gap-3 shrink-0">
                  <span className="text-[10px] text-wellness-charcoal/40 font-mono font-bold">
                    ID: {q.id}
                  </span>
                  <button
                    onClick={() => {
                      void onToggleQueryStatus(q.id);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm border ${
                      isPending
                        ? 'bg-wellness-green text-white border-transparent hover:bg-wellness-navy'
                        : 'bg-white text-wellness-navy border-wellness-gray-200 hover:bg-wellness-gray-50'
                    }`}
                  >
                    <Check size={14} />
                    {isPending ? 'Resolve Inquiry' : 'Mark Pending'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
