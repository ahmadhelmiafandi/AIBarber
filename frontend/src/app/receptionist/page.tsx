'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useBranchQueues, useCheckInMutation } from '@/hooks/use-queue';
import { useRealtimeQueue } from '@/hooks/use-realtime';
import { Queue } from '@/types/api';
import { UserCheck, RefreshCw, Loader2, AlertCircle, Search } from 'lucide-react';

export default function ReceptionistDashboardPage() {
  const { user } = useAuth();
  const branchId = user?.barberProfile?.branch_id || '';
  const [selectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: queues, isLoading, isError, refetch } = useBranchQueues(branchId, selectedDate);
  const checkInMutation = useCheckInMutation();

  useRealtimeQueue({
    branchId,
    currentLocalVersion: queues?.[0]?.version || 0,
    onQueueUpdate: () => refetch(),
    onVersionGap: () => refetch(),
  });

  const handleDeskCheckIn = async (queueId: string) => {
    setErrorMsg(null);
    try {
      await checkInMutation.mutateAsync(queueId);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setErrorMsg(errorObj.response?.data?.message || 'Gagal melakukan check-in.');
    }
  };

  const filteredQueues = queues?.filter((q: Queue) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.queue_code.toLowerCase().includes(query) ||
      (q.booking?.customer?.name && q.booking.customer.name.toLowerCase().includes(query)) ||
      (q.booking?.booking_code && q.booking.booking_code.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="size-6 text-amber-500" />
            Receptionist Desk Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Check-in antrian kedatangan pelanggan</p>
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

      {/* Search Input */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kode antrian, kode booking, atau nama customer..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <Loader2 className="size-8 animate-spin text-amber-400 mb-2" />
          <p className="text-sm text-slate-400">Memuat daftar antrian meja resepsionis...</p>
        </div>
      ) : isError || !filteredQueues || filteredQueues.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400">
          <p className="text-base font-semibold text-slate-300">Tidak ada antrian yang cocok.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Kode Antrian</th>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Barber</th>
                  <th className="p-4">Estimasi Mulai</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredQueues.map((q: Queue) => (
                  <tr key={q.queue_id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-400">{q.queue_code}</td>
                    <td className="p-4 font-medium text-white">{q.booking?.customer?.name || 'Customer'}</td>
                    <td className="p-4">{q.booking?.barber?.user?.name || 'Bebas'}</td>
                    <td className="p-4">
                      {q.estimated_start_time ? new Date(q.estimated_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 capitalize">
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {q.status === 'waiting' && (
                        <button
                          disabled={checkInMutation.isPending}
                          onClick={() => handleDeskCheckIn(q.queue_id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
