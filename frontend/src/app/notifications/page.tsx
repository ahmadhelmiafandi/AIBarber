'use client';

import React from 'react';
import Link from 'next/link';
import { useMarkAllAsReadMutation, useMarkAsReadMutation, useNotifications } from '@/hooks/use-notifications';
import { AppNotification } from '@/types/api';
import { Bell, CheckCheck, Loader2, Calendar, ArrowRight } from 'lucide-react';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications(false);
  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="size-6 text-amber-500" />
            Pemberitahuan Anda
          </h1>
          <p className="text-xs text-slate-400 mt-1">Daftar riwayat pembaruan status dan reminder antrian</p>
        </div>

        {notifications && notifications.some((n: AppNotification) => !n.read_at) && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-400 font-medium text-xs rounded-xl cursor-pointer transition-all disabled:opacity-50"
          >
            <CheckCheck className="size-4" />
            <span>Tandai Semua Dibaca</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <Loader2 className="size-8 animate-spin text-amber-400 mb-2" />
          <p className="text-sm text-slate-400">Memuat pemberitahuan...</p>
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400">
          <Bell className="size-10 mx-auto mb-2 text-slate-600" />
          <p className="text-base font-semibold text-slate-300">Belum ada pemberitahuan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: AppNotification) => {
            const isUnread = !n.read_at;
            const message = n.data?.message || 'Pemberitahuan antrian';
            const queueId = n.data?.queue_id;

            return (
              <div
                key={n.id}
                onClick={() => isUnread && handleMarkAsRead(n.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/60 border-slate-900 opacity-80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isUnread && <span className="size-2 rounded-full bg-amber-400"></span>}
                    <span className="font-semibold text-white text-sm">{message}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="size-3" />
                    <span>{new Date(n.created_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {queueId && (
                  <Link
                    href={`/queue/live/${queueId}`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>Lihat</span>
                    <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
