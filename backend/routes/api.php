<?php

use App\Http\Controllers\Api\V1\AdminAiRulesController;
use App\Http\Controllers\Api\V1\AiChatController;
use App\Http\Controllers\Api\V1\AiConsultationController;
use App\Http\Controllers\Api\V1\AiPreviewController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BarberController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\BranchController;
use App\Http\Controllers\Api\V1\CronController;
use App\Http\Controllers\Api\V1\HairstyleController;
use App\Http\Controllers\Api\V1\HairstyleImageController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\QueueController;
use App\Http\Controllers\Api\V1\ServiceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Unauthenticated Healthcheck & Public Scheduler Triggers
    Route::get('/health', [HealthController::class, 'check']);
    Route::post('/cron/cleanup', [CronController::class, 'cleanup']);

    // Public Authentication
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware(['throttle:password-reset']);

    // Authenticated Routes
    Route::middleware('auth:sanctum')->group(function () {
        // User Profile & Auth
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/email/verification-notification', [AuthController::class, 'sendEmailVerification'])->middleware('throttle:email-verification');
        Route::get('/auth/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->middleware('signed')->name('verification.verify');

        // Master Data
        Route::middleware('throttle:public-master-data')->group(function () {
            Route::apiResource('branches', BranchController::class);
            Route::apiResource('services', ServiceController::class);
            Route::apiResource('hairstyles', HairstyleController::class);
            Route::post('hairstyles/{hairstyle}/images', [HairstyleImageController::class, 'store']);
            Route::delete('hairstyles/{hairstyle}/images/{image}', [HairstyleImageController::class, 'destroy']);
            Route::apiResource('barbers', BarberController::class);
            Route::get('/booking-slots', [BookingController::class, 'getAvailableSlots']);
        });

        // Booking
        Route::post('/bookings', [BookingController::class, 'store']);

        // Queue Query & Actions
        Route::get('/queues/active', [QueueController::class, 'getActiveQueue']);
        Route::get('/queues/{queue}', [QueueController::class, 'show']);
        Route::get('/branches/{branch}/queues', [QueueController::class, 'getBranchQueues']);
        Route::post('/queues/{queue}/check-in', [QueueController::class, 'checkIn']);
        Route::post('/queues/{queue}/call', [QueueController::class, 'call']);
        Route::post('/queues/{queue}/start-service', [QueueController::class, 'startService']);
        Route::post('/queues/{queue}/complete-service', [QueueController::class, 'completeService']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

        // AI Subsystem
        Route::post('/ai/consultations', [AiConsultationController::class, 'store'])->middleware('throttle:ai-consultation');
        Route::get('/ai/consultations/{id}', [AiConsultationController::class, 'show']);
        Route::post('/ai/chat', [AiChatController::class, 'chat']);
        Route::post('/ai/previews', [AiPreviewController::class, 'store'])->middleware('throttle:ai-preview');
        Route::get('/ai/previews/{id}', [AiPreviewController::class, 'show']);

        // Admin AI CMS & Weights
        Route::get('/admin/ai-rules', [AdminAiRulesController::class, 'index']);
        Route::post('/admin/ai-rules', [AdminAiRulesController::class, 'storeRule']);
        Route::post('/admin/ai-settings', [AdminAiRulesController::class, 'updateSettings']);
    });
});
