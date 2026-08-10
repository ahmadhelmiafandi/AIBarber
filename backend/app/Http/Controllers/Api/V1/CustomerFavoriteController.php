<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\CustomerFavorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomerFavoriteController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $favorites = CustomerFavorite::with('hairstyle')
            ->where('user_id', $request->user()->id)
            ->get();

        return $this->successResponse('Daftar gaya rambut favorit.', $favorites);
    }

    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'hairstyle_id' => ['required', 'uuid', 'exists:hairstyles,id'],
        ]);

        $userId = $request->user()->id;
        $hairstyleId = $request->input('hairstyle_id');

        $existing = CustomerFavorite::where('user_id', $userId)
            ->where('hairstyle_id', $hairstyleId)
            ->first();

        if ($existing) {
            $existing->delete();
            return $this->successResponse('Dihapus dari favorit.', ['is_favorite' => false]);
        }

        $fav = CustomerFavorite::create([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'hairstyle_id' => $hairstyleId,
        ]);

        return $this->successResponse('Ditambahkan ke favorit.', ['is_favorite' => true, 'favorite' => $fav], status: 201);
    }
}
