<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Blog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Blog::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%");
            });
        }

        $query->latest();
        $paginated = \App\Helpers\QueryHelper::paginateOrAll($query, $request, 10);

        return $this->successResponse('Daftar artikel blog.', $paginated);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'content' => ['required', 'string'],
        ]);

        $blog = Blog::create([
            'id' => (string) Str::uuid(),
            'slug' => Str::slug($request->input('title')) . '-' . Str::random(4),
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'image_url' => $request->input('image_url'),
            'author' => $request->input('author', 'Admin Barbershop'),
            'published_at' => now(),
        ]);

        return $this->successResponse('Artikel blog berhasil dibuat.', $blog, status: 201);
    }
}
