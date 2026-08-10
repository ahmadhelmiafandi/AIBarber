<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Membership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MembershipController extends Controller
{
    use ApiResponse;

    public function show(Request $request): JsonResponse
    {
        $membership = Membership::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'id' => (string) Str::uuid(),
                'tier' => 'Silver',
                'points' => 1250,
                'valid_until' => now()->addYear(),
                'status' => 'active',
            ]
        );

        return $this->successResponse('Detail status membership.', $membership);
    }
}
