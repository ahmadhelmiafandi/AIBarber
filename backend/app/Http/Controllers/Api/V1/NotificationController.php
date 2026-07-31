<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Http\Traits\ApiResponse;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $unreadOnly = $request->boolean('unread_only');

        $query = Notification::where('notifiable_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($unreadOnly) {
            $query->whereNull('read_at');
        }

        $notifications = $query->limit(50)->get();

        return $this->successResponse('Daftar notifikasi berhasil diambil.', NotificationResource::collection($notifications));
    }

    public function markAsRead(Notification $notification, Request $request): JsonResponse
    {
        if ($notification->notifiable_id !== $request->user()->id) {
            return $this->errorResponse('Akses ditolak.', 403);
        }

        $notification->update(['read_at' => now()]);

        return $this->successResponse('Notifikasi ditandai telah dibaca.', new NotificationResource($notification));
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('notifiable_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->successResponse('Semua notifikasi ditandai telah dibaca.', null);
    }
}
