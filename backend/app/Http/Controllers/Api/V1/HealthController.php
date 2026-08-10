<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    /**
     * Unauthenticated health check endpoint for monitoring & staging verification.
     */
    public function check(): JsonResponse
    {
        $dbStatus = 'failed';
        $redisStatus = 'failed';

        $dbError = null;
        try {
            DB::connection()->getPdo();
            $dbStatus = 'ok';
        } catch (\Throwable $e) {
            $dbError = $e->getMessage();
            report($e);
        }

        try {
            Redis::ping();
            $redisStatus = 'ok';
        } catch (\Throwable $e) {
            report($e);
        }

        $isHealthy = ($dbStatus === 'ok');
        $statusCode = $isHealthy ? 200 : 503;

        return response()->json([
            'status' => $isHealthy ? 'healthy' : 'unhealthy',
            'deployment_profile' => config('app.deployment_profile', env('DEPLOYMENT_PROFILE', 'demo')),
            'checks' => [
                'database' => $dbStatus,
                'redis' => $redisStatus,
            ],
            'timestamp' => now()->toIso8601String(),
        ], $statusCode);
    }
}
