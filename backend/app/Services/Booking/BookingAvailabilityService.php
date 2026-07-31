<?php

namespace App\Services\Booking;

use App\Models\Barber;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Service;
use App\Models\SystemSetting;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class BookingAvailabilityService
{
    public function getAvailableSlots(string $branchId, string $serviceId, string $date, ?string $barberId = null): array
    {
        // 1. Validate Branch
        $branch = Branch::find($branchId);
        if (!$branch || !$branch->is_active) {
            throw ValidationException::withMessages([
                'branch_id' => ['Cabang tidak ditemukan atau tidak aktif.'],
            ]);
        }

        // 2. Validate Service
        $service = Service::find($serviceId);
        if (!$service || !$service->is_active || $service->estimated_duration_minutes <= 0) {
            throw ValidationException::withMessages([
                'service_id' => ['Layanan tidak ditemukan, tidak aktif, atau durasi tidak valid.'],
            ]);
        }

        // 3. Validate Specific Barber if provided
        if ($barberId) {
            $barber = Barber::with('user')->find($barberId);
            if (
                !$barber ||
                !$barber->is_active ||
                $barber->branch_id !== $branchId ||
                !$barber->user ||
                $barber->user->status !== 'active'
            ) {
                throw ValidationException::withMessages([
                    'barber_id' => ['Barber tidak ditemukan, tidak aktif, atau tidak bertugas di cabang ini.'],
                ]);
            }
        }

        // 4. Resolve Branch Timezone
        $timezone = SystemSetting::where('key', 'branch_default_timezone')->value('value')
            ?: 'Asia/Jakarta';

        // 5. Resolve Operating Hours
        $dayOfWeek = strtolower(Carbon::parse($date, $timezone)->format('l'));
        $operatingHours = $this->resolveOperatingHours($branch, $dayOfWeek);

        if (!$operatingHours || empty($operatingHours['open']) || empty($operatingHours['close'])) {
            return [
                'branch_id' => $branchId,
                'service_id' => $serviceId,
                'date' => $date,
                'service_duration_minutes' => $service->estimated_duration_minutes,
                'available_slots' => [],
            ];
        }

        $openTimeStr = $operatingHours['open']; // e.g. "09:00"
        $closeTimeStr = $operatingHours['close']; // e.g. "17:00"

        $openMinutes = $this->timeToMinutes($openTimeStr);
        $closeMinutes = $this->timeToMinutes($closeTimeStr);
        $durationMinutes = $service->estimated_duration_minutes;

        // If duration is longer than the operating window
        if ($durationMinutes > ($closeMinutes - $openMinutes)) {
            return [
                'branch_id' => $branchId,
                'service_id' => $serviceId,
                'date' => $date,
                'service_duration_minutes' => $service->estimated_duration_minutes,
                'available_slots' => [],
            ];
        }

        // 6. Resolve Eligible Barbers
        $eligibleBarbersQuery = Barber::where('branch_id', $branchId)
            ->where('is_active', true)
            ->whereHas('user', function ($q) {
                $q->where('status', 'active');
            });

        if ($barberId) {
            $eligibleBarbersQuery->where('id', $barberId);
        }

        $eligibleBarbers = $eligibleBarbersQuery->get();

        if ($eligibleBarbers->isEmpty()) {
            return [
                'branch_id' => $branchId,
                'service_id' => $serviceId,
                'date' => $date,
                'service_duration_minutes' => $service->estimated_duration_minutes,
                'available_slots' => [],
            ];
        }

        // 7. Bulk Load Active Bookings
        $pendingExpirationMinutes = (int) (SystemSetting::where('key', 'booking_pending_expiration_minutes')->value('value') ?? 15);
        $pendingThreshold = Carbon::now()->subMinutes($pendingExpirationMinutes);

        $activeBookings = Booking::with('service:id,estimated_duration_minutes')
            ->where('branch_id', $branchId)
            ->whereDate('booking_date', $date)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where(function ($q) use ($pendingThreshold) {
                $q->where('status', 'confirmed')
                  ->orWhere('created_at', '>=', $pendingThreshold);
            })
            ->when($barberId, fn($q) => $q->where('barber_id', $barberId))
            ->get();

        // 8. Generate Candidate Slots Grid (30-minute interval)
        $nowInTimezone = Carbon::now($timezone);
        $isToday = Carbon::parse($date, $timezone)->isToday();

        $availableSlots = [];
        $gridInterval = 30; // 30 mins grid

        for ($slotStartMin = $openMinutes; $slotStartMin + $durationMinutes <= $closeMinutes; $slotStartMin += $gridInterval) {
            $slotEndMin = $slotStartMin + $durationMinutes;
            $slotStartStr = $this->minutesToTime($slotStartMin);

            // Filter out past slots today
            if ($isToday) {
                $slotDateTime = Carbon::parse("{$date} {$slotStartStr}", $timezone);
                if ($slotDateTime->lessThanOrEqualTo($nowInTimezone)) {
                    continue;
                }
            }

            // Check if AT LEAST ONE eligible barber is free for this [slotStartMin, slotEndMin)
            $isSlotAvailable = false;

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

                    // Half-open overlap check: [S1, E1) & [S2, E2)
                    // Conflict if bStartMin < slotEndMin AND bEndMin > slotStartMin
                    if ($bStartMin < $slotEndMin && $bEndMin > $slotStartMin) {
                        $hasConflict = true;
                        break;
                    }
                }

                if (!$hasConflict) {
                    $isSlotAvailable = true;
                    break;
                }
            }

            if ($isSlotAvailable) {
                $availableSlots[] = $slotStartStr;
            }
        }

        return [
            'branch_id' => $branchId,
            'service_id' => $serviceId,
            'date' => $date,
            'service_duration_minutes' => $service->estimated_duration_minutes,
            'available_slots' => $availableSlots,
        ];
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

        // Fallback to system settings
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

    private function minutesToTime(int $minutes): string
    {
        $h = floor($minutes / 60);
        $m = $minutes % 60;
        return sprintf('%02d:%02d', $h, $m);
    }
}
