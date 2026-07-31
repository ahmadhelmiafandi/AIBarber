import React from 'react';
import { BookingSlot } from '@/types/api';
import { Clock, Loader2 } from 'lucide-react';

interface TimeSlotPickerProps {
  slots?: BookingSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  isLoading: boolean;
}

export function TimeSlotPicker({ slots, selectedTime, onSelectTime, isLoading }: TimeSlotPickerProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">
        <Loader2 className="size-6 animate-spin text-amber-400 mb-2" />
        <p className="text-sm">Memuat slot waktu tersedia...</p>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">
        <Clock className="size-8 mx-auto mb-2 text-slate-600" />
        <p className="text-sm font-medium">Tidak ada slot waktu tersedia pada tanggal ini.</p>
        <p className="text-xs text-slate-500 mt-1">Silakan pilih tanggal lain atau barber berbeda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        Pilih Jam Kunjungan
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isAvailable = slot.available;

          return (
            <button
              key={slot.time}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectTime(slot.time)}
              className={`h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                  : isAvailable
                  ? 'bg-slate-900 border border-slate-800 text-white hover:border-amber-500/50 hover:bg-slate-800'
                  : 'bg-slate-950/40 border border-slate-900 text-slate-600 cursor-not-allowed line-through opacity-60'
              }`}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
