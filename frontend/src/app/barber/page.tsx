'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  useBranchQueues,
  useCallCustomerMutation,
  useStartServiceMutation,
  useCompleteServiceMutation,
} from '@/hooks/use-queue';
import { useRealtimeQueue } from '@/hooks/use-realtime';
import { Queue } from '@/types/api';
import { Phone, Play, CheckCircle, RefreshCw, Scissors, AlertCircle, Loader2 } from 'lucide-react';

export default function BarberDashboardPage() {
  const { user } = useAuth();
  const branchId = user?.barberProfile?.branch_id || '';
  const [selectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: queues, isLoading, isError, refetch } = useBranchQueues(branchId, selectedDate);

  const callMutation = useCallCustomerMutation();
  const startMutation = useStartServiceMutation();
  const completeMutation = useCompleteServiceMutation();

  useRealtimeQueue({
    branchId,
    currentLocalVersion: queues?.[0]?.version || 0,
    onQueueUpdate: () => refetch(),
    onVersionGap: () => refetch(),
  });

  const handleCall = async (queueId: string) => {
    setErrorMsg(null);
    try {
      await callMutation.mutateAsync(queueId);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setErrorMsg(errorObj.response?.data?.message || 'Gagal memanggil pelanggan.');
    }
  };

  const handleStart = async (queueId: string) => {
    setErrorMsg(null);
    try {
      await startMutation.mutateAsync(queueId);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setErrorMsg(errorObj.response?.data?.message || 'Gagal memulai layanan.');
    }
  };

  const handleComplete = async (queueId: string) => {
    setErrorMsg(null);
    try {
      await completeMutation.mutateAsync(queueId);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setErrorMsg(errorObj.response?.data?.message || 'Gagal menyelesaikan layanan.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scissors className="size-6 text-amber-500" />
            Barber Station Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Kelola pemanggilan dan layanan antrian pelanggan</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white text-xs cursor-pointer w-fit"
        >
          <RefreshCw className="size-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <Loader2 className="size-8 animate-spin text-amber-400 mb-2" />
          <p className="text-sm text-slate-400">Memuat daftar antrian cabang...</p>
        </div>
      ) : isError || !queues || queues.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400">
          <p className="text-base font-semibold text-slate-300">Belum ada antrian untuk hari ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {queues.map((q: Queue) => {
            const isPendingAction =
              callMutation.isPending || startMutation.isPending || completeMutation.isPending;

            return (
              <div
                key={q.queue_id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-center">
                    <div className="text-2xl font-black text-amber-400 font-mono">{q.queue_code}</div>
                    <div className="text-[10px] text-slate-500 font-mono">v{q.version}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-base">
                        {q.booking?.customer?.name || 'Customer'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize">
                        {q.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Layanan: {q.booking?.service?.name || '-'}</div>
                      <div>Estimasi: {q.estimated_start_time ? new Date(q.estimated_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {q.status === 'checked_in' && (
                    <button
                      disabled={isPendingAction}
                      onClick={() => handleCall(q.queue_id)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Phone className="size-4" />
                      <span>Panggil Customer</span>
                    </button>
                  )}

                  {q.status === 'called' && (
                    <button
                      disabled={isPendingAction}
                      onClick={() => handleStart(q.queue_id)}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="size-4" />
                      <span>Mulai Layanan</span>
                    </button>
                  )}

                  {q.status === 'on_service' && (
                    <button
                      disabled={isPendingAction}
                      onClick={() => handleComplete(q.queue_id)}
                      className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="size-4" />
                      <span>Selesaikan Layanan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
