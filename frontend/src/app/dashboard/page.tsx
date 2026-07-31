'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useActiveQueue } from '@/hooks/use-queue';
import { Clock, Plus, Bell, ArrowRight, Loader2, Scissors, LogOut } from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user, logout } = useAuth();
  const { data: activeQueue, isLoading } = useActiveQueue();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Halo, {user?.name || 'Pelanggan'}!</h1>
          <p className="text-xs text-slate-400">Selamat datang di Customer Dashboard AI Barbershop</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="Notifikasi"
          >
            <Bell className="size-5" />
          </Link>
          <button
            onClick={() => logout()}
            className="p-2.5 bg-slate-800 hover:bg-red-950/50 text-slate-300 hover:text-red-300 rounded-xl transition-all cursor-pointer"
            title="Keluar"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>

      {/* Active Queue Card */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Clock className="size-5 text-amber-500" />
          Antrian Aktif Anda
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Loader2 className="size-6 animate-spin text-amber-400 mb-2" />
          </div>
        ) : activeQueue ? (
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Kode Antrian</span>
                <div className="text-3xl font-black text-amber-400 font-mono">{activeQueue.queue_code}</div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold rounded-full text-xs capitalize">
                  {activeQueue.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-xs text-slate-500">Posisi Antrian</span>
                <div className="text-xl font-bold text-white">#{activeQueue.queue_position ?? '-'}</div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Di Depan Anda</span>
                <div className="text-xl font-bold text-amber-400">{activeQueue.customers_ahead ?? 0} orang</div>
              </div>
            </div>

            <Link
              href={`/queue/live/${activeQueue.queue_id}`}
              className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Buka Pantauan Realtime</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
            <Scissors className="size-10 mx-auto mb-2 text-slate-600" />
            <p className="text-base font-semibold text-slate-300">Anda belum memiliki antrian aktif.</p>
            <p className="text-xs text-slate-500 mb-6 mt-1">Pesan slot kunjungan sekarang dan nikmati barbershop tanpa antri lama.</p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all"
            >
              <Plus className="size-4" />
              <span>Buat Booking Baru</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
