'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  useBarbers,
  useBookingSlots,
  useBranches,
  useCreateBooking,
  useServices,
} from '@/hooks/use-booking';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { Barber, Branch, Service } from '@/types/api';
import { Scissors, MapPin, UserCheck, Calendar, Clock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: branches, isLoading: loadingBranches } = useBranches();
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: barbers, isLoading: loadingBarbers } = useBarbers(selectedBranchId);
  const { data: slots, isLoading: loadingSlots } = useBookingSlots(
    selectedBranchId,
    selectedDate,
    selectedServiceId,
    selectedBarberId || undefined
  );

  const createBookingMutation = useCreateBooking();

  const selectedBranch = branches?.find((b: Branch) => b.id === selectedBranchId);
  const selectedService = services?.find((s: Service) => s.id === selectedServiceId);
  const selectedBarber = barbers?.find((b: Barber) => b.id === selectedBarberId);

  const handleConfirmBooking = async () => {
    if (!selectedBranchId || !selectedServiceId || !selectedDate || !selectedTime) {
      setErrorMsg('Mohon lengkapi seluruh data pemesanan.');
      return;
    }

    setErrorMsg(null);
    try {
      const booking = await createBookingMutation.mutateAsync({
        branch_id: selectedBranchId,
        service_id: selectedServiceId,
        booking_date: selectedDate,
        booking_time: selectedTime,
        barber_id: selectedBarberId || undefined,
      });

      if (booking.queue?.queue_id) {
        router.push(`/queue/live/${booking.queue.queue_id}`);
      } else {
        router.push(`/booking/confirmation/${booking.id}`);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setErrorMsg(errorObj.response?.data?.message || 'Gagal membuat booking. Silakan coba lagi.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Book Appointment</h1>
        <p className="text-sm text-slate-400">Pilih lokasi cabang, layanan, dan jam kedatangan Anda</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        {[
          { label: 'Cabang', num: 1 },
          { label: 'Layanan', num: 2 },
          { label: 'Barber', num: 3 },
          { label: 'Waktu', num: 4 },
          { label: 'Konfirmasi', num: 5 },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${
                step === s.num
                  ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                  : step > s.num
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="size-4" /> : s.num}
            </div>
            <span className={`text-xs hidden sm:inline ${step === s.num ? 'text-white font-medium' : 'text-slate-500'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Step 1: Branch Selector */}
      {step === 1 && (
        <div className="space-y-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="size-5 text-amber-500" />
            1. Pilih Cabang Barbershop
          </h2>
          {loadingBranches ? (
            <div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-amber-400" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {branches?.map((b: Branch) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBranchId(b.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedBranchId === b.id
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-base mb-1">{b.name}</div>
                  <div className="text-xs text-slate-400">{b.address}</div>
                  {b.phone && <div className="text-xs text-slate-500 mt-1">Telp: {b.phone}</div>}
                </div>
              ))}
            </div>
          )}
          <button
            disabled={!selectedBranchId}
            onClick={() => setStep(2)}
            className="w-full mt-4 h-11 bg-amber-500 text-slate-950 font-semibold rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Lanjut ke Layanan</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {/* Step 2: Service Selector */}
      {step === 2 && (
        <div className="space-y-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Scissors className="size-5 text-amber-500" />
            2. Pilih Layanan Barbershop
          </h2>
          {loadingServices ? (
            <div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-amber-400" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {services?.map((s: Service) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedServiceId === s.id
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-base">{s.name}</div>
                    <div className="text-xs text-slate-400 mt-1">Durasi: ~{s.estimated_duration_minutes} menit</div>
                  </div>
                  <div className="text-amber-400 font-bold text-base">
                    Rp {s.price.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(1)} className="flex-1 h-11 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800">Kembali</button>
            <button disabled={!selectedServiceId} onClick={() => setStep(3)} className="flex-1 h-11 bg-amber-500 text-slate-950 font-semibold rounded-xl hover:bg-amber-400 disabled:opacity-50">Lanjut</button>
          </div>
        </div>
      )}

      {/* Step 3: Barber Selector (Optional) */}
      {step === 3 && (
        <div className="space-y-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserCheck className="size-5 text-amber-500" />
            3. Pilih Barber (Opsional)
          </h2>
          {loadingBarbers ? (
            <div className="flex justify-center p-8"><Loader2 className="size-6 animate-spin text-amber-400" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <div
                onClick={() => setSelectedBarberId('')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedBarberId === ''
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-300'
                }`}
              >
                <div className="font-semibold">Siapa Saja yang Tersedia</div>
                <div className="text-xs text-slate-400 mt-1">Sistem akan memilihkan barber yang kosong lebih cepat</div>
              </div>

              {barbers?.map((b: Barber) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBarberId(b.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedBarberId === b.id
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold">{b.user?.name || `Barber #${b.id.substring(0, 6)}`}</div>
                  <div className="text-xs text-slate-400 mt-1">Status: Active</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(2)} className="flex-1 h-11 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800">Kembali</button>
            <button onClick={() => setStep(4)} className="flex-1 h-11 bg-amber-500 text-slate-950 font-semibold rounded-xl hover:bg-amber-400">Lanjut ke Slot</button>
          </div>
        </div>
      )}

      {/* Step 4: Date & Slot Picker */}
      {step === 4 && (
        <div className="space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="size-5 text-amber-500" />
            4. Pilih Tanggal & Jam
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tanggal Kedatangan</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime(null);
              }}
              className="w-full h-11 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <TimeSlotPicker
            slots={slots}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            isLoading={loadingSlots}
          />

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(3)} className="flex-1 h-11 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800">Kembali</button>
            <button disabled={!selectedTime} onClick={() => setStep(5)} className="flex-1 h-11 bg-amber-500 text-slate-950 font-semibold rounded-xl hover:bg-amber-400 disabled:opacity-50">Review Booking</button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Confirm */}
      {step === 5 && (
        <div className="space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-slate-200">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="size-5 text-amber-500" />
            5. Konfirmasi Pemesanan
          </h2>

          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Pemesan:</span>
              <span className="font-medium text-white">{user?.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Cabang:</span>
              <span className="font-medium text-white">{selectedBranch?.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Layanan:</span>
              <span className="font-medium text-white">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Barber:</span>
              <span className="font-medium text-white">{selectedBarber ? selectedBarber.user?.name : 'Siapa saja (bebas)'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Tanggal & Waktu:</span>
              <span className="font-medium text-white">{selectedDate} pk {selectedTime}</span>
            </div>
            <div className="flex justify-between pt-1 text-lg font-bold text-amber-400">
              <span>Total Biaya:</span>
              <span>Rp {selectedService?.price.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(4)} className="flex-1 h-11 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800">Kembali</button>
            <button
              disabled={createBookingMutation.isPending}
              onClick={handleConfirmBooking}
              className="flex-1 h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {createBookingMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Memproses Booking...</span>
                </>
              ) : (
                <span>Konfirmasi & Ambil Antrian</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
