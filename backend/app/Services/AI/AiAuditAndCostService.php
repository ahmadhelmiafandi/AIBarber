<?php

namespace App\Services\AI;

use App\Models\AiAuditLog;
use App\Models\DailyAiCost;
use App\Models\SystemSetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AiAuditAndCostService
{
    public function getDailyCostLimitUsd(): float
    {
        return (float) (SystemSetting::where('key', 'daily_ai_cost_limit_usd')->value('value') ?? 50.00);
    }

    public function reserveBudget(float $estimatedCostUsd): void
    {
        $today = Carbon::today()->toDateString();
        $limit = $this->getDailyCostLimitUsd();

        DB::transaction(function () use ($today, $estimatedCostUsd, $limit) {
            $dailyCost = DailyAiCost::where('date', 'like', $today . '%')->where('provider', 'system')->lockForUpdate()->first();

            if (!$dailyCost) {
                $dailyCost = DailyAiCost::create([
                    'date' => $today,
                    'provider' => 'system',
                    'total_cost_usd' => 0.00000,
                    'reserved_cost_usd' => 0.00000,
                    'total_requests' => 0,
                ]);
            }

            $projectedCost = (float) $dailyCost->total_cost_usd + (float) $dailyCost->reserved_cost_usd + $estimatedCostUsd;

            if ($projectedCost > $limit) {
                throw ValidationException::withMessages([
                    'budget' => ['Batas harian anggaran AI telah tercapai. Silakan coba lagi besok.'],
                ]);
            }

            $dailyCost->reserved_cost_usd = (float) $dailyCost->reserved_cost_usd + $estimatedCostUsd;
            $dailyCost->save();
        });
    }

    public function reconcileBudget(float $estimatedCostUsd, float $actualCostUsd): void
    {
        $today = Carbon::today()->toDateString();

        DB::transaction(function () use ($today, $estimatedCostUsd, $actualCostUsd) {
            $dailyCost = DailyAiCost::where('date', 'like', $today . '%')->where('provider', 'system')->lockForUpdate()->first();
            if ($dailyCost) {
                $dailyCost->reserved_cost_usd = max(0, (float) $dailyCost->reserved_cost_usd - $estimatedCostUsd);
                $dailyCost->total_cost_usd = (float) $dailyCost->total_cost_usd + $actualCostUsd;
                $dailyCost->total_requests = (int) $dailyCost->total_requests + 1;
                $dailyCost->save();
            }
        });
    }

    public function logOperation(array $params): AiAuditLog
    {
        // Enforce Privacy: Remove any raw image base64 data or sensitive text
        $sanitizedRequest = $params['request_payload'] ?? [];
        unset($sanitizedRequest['image_base64'], $sanitizedRequest['raw_bytes'], $sanitizedRequest['selfie_binary']);

        $sanitizedResponse = $params['response_payload'] ?? [];
        unset($sanitizedResponse['image_base64'], $sanitizedResponse['raw_bytes']);

        return AiAuditLog::create([
            'id' => Str::uuid(),
            'user_id' => $params['user_id'] ?? null,
            'operation_type' => $params['operation_type'] ?? 'consultation',
            'model_used' => $params['model_used'] ?? 'mock_ai',
            'engine_version' => $params['engine_version'] ?? 'v1.0',
            'duration_ms' => $params['duration_ms'] ?? 0,
            'similarity_score' => $params['similarity_score'] ?? null,
            'cost_usd' => $params['cost_usd'] ?? 0.00000,
            'status' => $params['status'] ?? 'success',
            'request_payload' => $sanitizedRequest,
            'response_payload' => $sanitizedResponse,
        ]);
    }
}
