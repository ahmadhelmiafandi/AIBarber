<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Hairstyle;
use App\Models\HairstyleImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class HairstyleImageController extends Controller
{
    use ApiResponse;

    public function store(Request $request, Hairstyle $hairstyle): JsonResponse
    {
        Gate::authorize('update', $hairstyle);

        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'type' => ['required', 'string', 'in:front,side,back,3d,reference'],
            'is_primary' => ['boolean'],
        ]);

        $file = $request->file('image');
        $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('hairstyles/' . $hairstyle->id, $filename, 'public');

        $image = $hairstyle->images()->create([
            'type' => $request->type,
            'image_url' => Storage::url($path),
            'is_primary' => $request->boolean('is_primary', false),
        ]);

        return $this->successResponse('Gambar berhasil diunggah.', $image, status: 201);
    }

    public function destroy(Hairstyle $hairstyle, HairstyleImage $image): JsonResponse
    {
        Gate::authorize('update', $hairstyle);

        if ($image->hairstyle_id !== $hairstyle->id) {
            return $this->errorResponse('Gambar tidak valid.', status: 404);
        }

        // Hapus file fisik (ubah 'storage/' -> 'public/')
        $relativePath = str_replace('/storage/', '', $image->image_url);
        Storage::disk('public')->delete($relativePath);

        $image->delete();

        return $this->successResponse('Gambar berhasil dihapus.');
    }
}
