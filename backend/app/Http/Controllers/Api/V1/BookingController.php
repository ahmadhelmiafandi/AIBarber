<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\BookingAvailabilityRequest;
use App\Http\Requests\Booking\CreateBookingRequest;
use App\Http\Resources\BookingResource;
use App\Http\Traits\ApiResponse;
use App\Models\Booking;
use App\Services\Booking\BookingAvailabilityService;
use App\Services\Booking\BookingCreationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class BookingController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly BookingAvailabilityService $bookingAvailabilityService,
        private readonly BookingCreationService $bookingCreationService
    ) {}

    public function getAvailableSlots(BookingAvailabilityRequest $request): JsonResponse
    {
        Gate::authorize('viewAny', Booking::class);

        $result = $this->bookingAvailabilityService->getAvailableSlots(
            branchId: $request->validated('branch_id'),
            serviceId: $request->validated('service_id'),
            date: $request->validated('date'),
            barberId: $request->validated('barber_id')
        );

        return $this->successResponse('Ketersediaan slot booking berhasil diambil.', $result);
    }

    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Booking::with(['customer', 'branch', 'barber.user', 'service']);

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('barber.user', function ($bq) use ($search) {
                      $bq->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('service', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'Semua') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->input('branch_id'));
        }

        if ($request->filled('date')) {
            $query->whereDate('booking_date', $request->input('date'));
        }

        $query->latest();

        $paginated = \App\Helpers\QueryHelper::paginateOrAll($query, $request, 10);

        return $this->successResponse('Riwayat booking pengguna.', BookingResource::collection($paginated));
    }

    public function store(CreateBookingRequest $request): JsonResponse
    {
        Gate::authorize('create', Booking::class);

        $booking = $this->bookingCreationService->createBooking(
            customerId: $request->user()->id,
            branchId: $request->validated('branch_id'),
            serviceId: $request->validated('service_id'),
            bookingDate: $request->validated('booking_date'),
            bookingTime: $request->validated('booking_time'),
            barberId: $request->validated('barber_id')
        );

        return $this->successResponse('Reservasi berhasil dibuat.', new BookingResource($booking), status: 201);
    }
}
