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

    public function index(): JsonResponse
    {
        $blogs = Blog::latest()->get();
        return $this->successResponse('Daftar artikel blog.', $blogs);
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
