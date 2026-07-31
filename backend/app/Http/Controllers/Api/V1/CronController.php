<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\CleanupExpiredAiStorageJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CronController extends Controller
{
    /**
     * Authenticated cron cleanup trigger for GitHub Actions / Webhook Schedulers.
     */
    public function cleanup(Request $request): JsonResponse
    {
        $expectedToken = env('CRON_SECRET_TOKEN');
        $providedToken = $request->header('X-Cron-Token');

        if (empty($expectedToken) || $providedToken !== $expectedToken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized cron request.',
            ], 401);
        }

        // Idempotent execution of storage cleanup job
        dispatch(new CleanupExpiredAiStorageJob());

        return response()->json([
            'status' => 'success',
            'message' => 'Cleanup job executed successfully.',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
