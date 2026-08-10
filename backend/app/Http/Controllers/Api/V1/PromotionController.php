<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PromotionController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $promotions = Promotion::all();
        return $this->successResponse('Daftar promosi.', $promotions);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:100'],
            'discount_percent' => ['required', 'integer', 'between:1,100'],
        ]);

        $promo = Promotion::create([
            'id' => (string) Str::uuid(),
            'code' => strtoupper($request->input('code')),
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'discount_percent' => $request->input('discount_percent'),
            'valid_until' => $request->input('valid_until'),
            'is_active' => true,
        ]);

        return $this->successResponse('Promosi berhasil dibuat.', $promo, status: 201);
    }
}
