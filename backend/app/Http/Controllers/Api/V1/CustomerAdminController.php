<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\QueryHelper;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerAdminController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        // Auto-seed demo data if fresh container database has 0 customers
        if (User::where('role', 'customer')->count() === 0) {
            try {
                \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
            } catch (\Throwable $e) {
                // Graceful fallback
            }
        }

        $query = User::with('membership')
            ->where(function ($q) {
                $q->where('role', 'customer')
                  ->orWhereNull('role')
                  ->orWhereHas('roles', function ($rq) {
                      $rq->whereIn('name', ['customer', 'Customer']);
                  });
            });

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('membership_tier')) {
            $tier = strtolower($request->input('membership_tier'));
            $query->whereHas('membership', function ($q) use ($tier) {
                $q->where('tier', $tier);
            });
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $paginated = QueryHelper::paginateOrAll($query, $request, 10);

        return $this->successResponse('Data customer berhasil diambil.', $paginated);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
            'status' => 'nullable|string|in:active,inactive,suspended',
        ]);

        $user = User::create([
            'id' => Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password'] ?? 'password123'),
            'role' => 'customer',
            'status' => $validated['status'] ?? 'active',
        ]);

        return $this->successResponse('Customer berhasil ditambahkan.', $user->load('membership'), status: 201);
    }

    public function show(User $user): JsonResponse
    {
        return $this->successResponse('Detail data customer.', $user->load(['membership', 'bookings.service']));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:users,email,{$user->id}",
            'phone' => 'nullable|string|max:20',
            'status' => 'sometimes|string|in:active,inactive,suspended',
        ]);

        $user->update($validated);

        return $this->successResponse('Data customer berhasil diperbarui.', $user->load('membership'));
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        return $this->successResponse('Customer berhasil dihapus.');
    }
}
