<?php

namespace App\Services\Booking;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Service;
use App\Models\SystemSetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

use App\Services\Queue\QueueGenerationService;

class BookingCreationService
{
    public function __construct(
        private readonly QueueGenerationService $queueGenerationService
    ) {}

    public function createBooking(
        string $customerId,
        string $branchId,
        string $serviceId,
        string $bookingDate,
        string $bookingTime,
        ?string $barberId = null
    ): Booking {
        return DB::transaction(function () use ($customerId, $branchId, $serviceId, $bookingDate, $bookingTime, $barberId) {
            // 1. Validate Branch (Branch row lock serializes queue generation per branch)
            $branch = Branch::where('id', $branchId)->where('is_active', true)->lockForUpdate()->first();
            if (!$branch) {
                throw ValidationException::withMessages([
                    'branch_id' => ['Cabang tidak ditemukan atau tidak aktif.'],
                ]);
            }

            // 2. Validate Service
            $service = Service::where('id', $serviceId)->where('is_active', true)->first();
            if (!$service || $service->estimated_duration_minutes <= 0) {
                throw ValidationException::withMessages([
                    'service_id' => ['Layanan tidak ditemukan, tidak aktif, atau durasi tidak valid.'],
                ]);
            }

            // 3. Resolve Branch Timezone & Operating Hours
            $timezone = SystemSetting::where('key', 'branch_default_timezone')->value('value') ?: 'Asia/Jakarta';
            $dayOfWeek = strtolower(Carbon::parse($bookingDate, $timezone)->format('l'));
            $operatingHours = $this->resolveOperatingHours($branch, $dayOfWeek);

            if (!$operatingHours || empty($operatingHours['open']) || empty($operatingHours['close'])) {
                throw ValidationException::withMessages([
                    'booking_date' => ['Cabang tidak beroperasional pada tanggal tersebut.'],
                ]);
            }

            $openMinutes = $this->timeToMinutes($operatingHours['open']);
            $closeMinutes = $this->timeToMinutes($operatingHours['close']);
            $requestedStartMin = $this->timeToMinutes($bookingTime);
            $requestedEndMin = $requestedStartMin + $service->estimated_duration_minutes;

            if ($requestedStartMin < $openMinutes || $requestedEndMin > $closeMinutes) {
                throw ValidationException::withMessages([
                    'booking_time' => ['Waktu booking di luar jam operasional cabang.'],
                ]);
            }

            // 4. Past Time Check if today
            $nowInTimezone = Carbon::now($timezone);
            $isToday = Carbon::parse($bookingDate, $timezone)->isToday();

            if ($isToday) {
                $requestedDateTime = Carbon::parse("{$bookingDate} {$bookingTime}", $timezone);
                if ($requestedDateTime->lessThanOrEqualTo($nowInTimezone)) {
                    throw ValidationException::withMessages([
                        'booking_time' => ['Waktu booking tidak boleh di masa lalu.'],
                    ]);
                }
            }

            // 5. Resolve Eligible Barbers with lock
            $eligibleBarbersQuery = Barber::where('branch_id', $branchId)
                ->where('is_active', true)
                ->whereHas('user', function ($q) {
                    $q->where('status', 'active');
                })
                ->lockForUpdate();

            if ($barberId) {
                $eligibleBarbersQuery->where('id', $barberId);
            }

            $eligibleBarbers = $eligibleBarbersQuery->get();

            if ($eligibleBarbers->isEmpty()) {
                throw ValidationException::withMessages([
                    'barber_id' => ['Barber tidak ditemukan, tidak aktif, atau tidak bertugas di cabang ini.'],
                ]);
            }

            // 6. Lock active bookings for overlap check
            $pendingExpirationMinutes = (int) (SystemSetting::where('key', 'booking_pending_expiration_minutes')->value('value') ?? 15);
            $pendingThreshold = Carbon::now()->subMinutes($pendingExpirationMinutes);

            $activeBookings = Booking::with('service:id,estimated_duration_minutes')
                ->where('branch_id', $branchId)
                ->whereDate('booking_date', $bookingDate)
                ->whereIn('status', ['confirmed', 'pending'])
                ->where(function ($q) use ($pendingThreshold) {
                    $q->where('status', 'confirmed')
                      ->orWhere('created_at', '>=', $pendingThreshold);
                })
                ->lockForUpdate()
                ->get();

            // 7. Find Free Barber & Verify Concurrency Overlap
            $assignedBarberId = null;

            foreach ($eligibleBarbers as $barber) {
                $barberBookings = $activeBookings->where('barber_id', $barber->id);
                $hasConflict = false;

                /** @var Booking $booking */
                foreach ($barberBookings as $booking) {
                    $bookingStartStr = $booking->booking_time instanceof \DateTimeInterface
                        ? $booking->booking_time->format('H:i')
                        : substr((string) $booking->booking_time, 0, 5);

                    $bStartMin = $this->timeToMinutes($bookingStartStr);
                    $bDuration = $booking->service ? $booking->service->estimated_duration_minutes : 30;
                    $bEndMin = $bStartMin + $bDuration;

                    // Half-open interval overlap check [S1, E1) & [S2, E2)
                    if ($bStartMin < $requestedEndMin && $bEndMin > $requestedStartMin) {
                        $hasConflict = true;
                        break;
                    }
                }

                if (!$hasConflict) {
                    $assignedBarberId = $barber->id;
                    break;
                }
            }

            if (!$assignedBarberId) {
                throw ValidationException::withMessages([
                    'booking_time' => ['Mohon maaf, slot waktu ' . $bookingTime . ' sudah dibooking orang lain atau barber tidak tersedia.'],
                ]);
            }

            // 8. Generate Unique Booking Code
            $bookingCode = $this->generateUniqueBookingCode($bookingDate);

            // 9. Create Booking Record
            $booking = Booking::create([
                'booking_code' => $bookingCode,
                'customer_id' => $customerId,
                'barber_id' => $assignedBarberId,
                'branch_id' => $branchId,
                'service_id' => $serviceId,
                'booking_date' => $bookingDate,
                'booking_time' => $bookingTime,
                'total_price' => $service->price,
                'status' => 'confirmed',
            ]);

            // 10. Generate Queue Record & Initial Queue Event (Atomic Unit)
            $queue = $this->queueGenerationService->generateQueue($booking, $service);
            $booking->setRelation('queue', $queue);

            DB::afterCommit(function () use ($booking) {
                $customer = \App\Models\User::find($booking->customer_id);
                if ($customer) {
                    app(\App\Services\Notification\NotificationDeliveryService::class)->sendBookingConfirmed($customer, $booking);
                }
            });

            return $booking;
        });
    }

    private function generateUniqueBookingCode(string $bookingDate): string
    {
        $dateFormatted = date('Ymd', strtotime($bookingDate));
        do {
            $code = 'BK-' . $dateFormatted . '-' . strtoupper(Str::random(4));
        } while (Booking::where('booking_code', $code)->exists());

        return $code;
    }

    private function resolveOperatingHours(Branch $branch, string $dayOfWeek): ?array
    {
        $openingHours = $branch->opening_hours;

        if (is_array($openingHours) && isset($openingHours[$dayOfWeek])) {
            $dayConfig = $openingHours[$dayOfWeek];
            if (is_array($dayConfig)) {
                if (isset($dayConfig['is_open']) && !$dayConfig['is_open']) {
                    return null;
                }
                if (!empty($dayConfig['open']) && !empty($dayConfig['close'])) {
                    return [
                        'open' => $dayConfig['open'],
                        'close' => $dayConfig['close'],
                    ];
                }
            }
        }

        $defaultSetting = SystemSetting::where('key', 'default_operating_hours')->value('value');
        if ($defaultSetting) {
            $decoded = is_array($defaultSetting) ? $defaultSetting : json_decode($defaultSetting, true);
            if (is_array($decoded) && !empty($decoded['open']) && !empty($decoded['close'])) {
                return [
                    'open' => $decoded['open'],
                    'close' => $decoded['close'],
                ];
            }
        }

        return null;
    }

    private function timeToMinutes(string $timeStr): int
    {
        $parts = explode(':', $timeStr);
        return ((int) $parts[0]) * 60 + ((int) $parts[1]);
    }
}
