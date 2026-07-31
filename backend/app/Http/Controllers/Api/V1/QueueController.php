<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\QueueResource;
use App\Http\Traits\ApiResponse;
use App\Models\Branch;
use App\Models\Queue;
use App\Services\Queue\QueueCheckInService;
use App\Services\Queue\QueueServiceStateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class QueueController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly QueueCheckInService $queueCheckInService,
        private readonly QueueServiceStateService $queueServiceStateService
    ) {}

    public function getActiveQueue(Request $request): JsonResponse
    {
        $user = $request->user();

        $activeQueue = Queue::with(['booking.service', 'booking.barber.user', 'booking.branch'])
            ->whereHas('booking', function ($q) use ($user) {
                $q->where('customer_id', $user->id);
            })
            ->whereIn('status', ['waiting', 'checked_in', 'called', 'on_service'])
            ->orderBy('estimated_start_time', 'asc')
            ->first();

        if (!$activeQueue) {
            return $this->successResponse('Tidak ada antrian aktif.', null);
        }

        return $this->successResponse('Antrian aktif berhasil ditemukan.', new QueueResource($activeQueue));
    }

    public function show(Queue $queue): JsonResponse
    {
        Gate::authorize('view', $queue);

        $queue->load(['booking.service', 'booking.barber.user', 'booking.branch']);

        return $this->successResponse('Detail antrian berhasil diambil.', new QueueResource($queue));
    }

    public function getBranchQueues(Branch $branch, Request $request): JsonResponse
    {
        $date = $request->query('date', now()->format('Y-m-d'));
        $status = $request->query('status');

        $query = Queue::with(['booking.service', 'booking.customer', 'booking.barber.user'])
            ->where('branch_id', $branch->id)
            ->whereDate('booking_date', $date);

        if ($status) {
            $query->where('status', $status);
        } else {
            $query->whereIn('status', ['waiting', 'checked_in', 'called', 'on_service', 'completed', 'skipped']);
        }

        $queues = $query->orderBy('estimated_start_time', 'asc')->get();

        return $this->successResponse('Daftar antrian cabang berhasil diambil.', QueueResource::collection($queues));
    }

    public function checkIn(Queue $queue): JsonResponse
    {
        Gate::authorize('checkIn', $queue);

        $updatedQueue = $this->queueCheckInService->checkIn($queue->id);
        $updatedQueue->load(['booking.service', 'booking.barber.user', 'booking.branch']);

        return $this->successResponse('Check-in berhasil.', new QueueResource($updatedQueue));
    }

    public function call(Queue $queue): JsonResponse
    {
        Gate::authorize('call', $queue);

        $updatedQueue = $this->queueServiceStateService->callCustomer($queue->id);
        $updatedQueue->load(['booking.service', 'booking.barber.user', 'booking.branch']);

        return $this->successResponse('Pelanggan berhasil dipanggil.', new QueueResource($updatedQueue));
    }

    public function startService(Queue $queue): JsonResponse
    {
        Gate::authorize('startService', $queue);

        $updatedQueue = $this->queueServiceStateService->startService($queue->id);
        $updatedQueue->load(['booking.service', 'booking.barber.user', 'booking.branch']);

        return $this->successResponse('Layanan berhasil dimulai.', new QueueResource($updatedQueue));
    }

    public function completeService(Queue $queue): JsonResponse
    {
        Gate::authorize('completeService', $queue);

        $updatedQueue = $this->queueServiceStateService->completeService($queue->id);
        $updatedQueue->load(['booking.service', 'booking.barber.user', 'booking.branch']);

        return $this->successResponse('Layanan berhasil diselesaikan.', new QueueResource($updatedQueue));
    }
}
