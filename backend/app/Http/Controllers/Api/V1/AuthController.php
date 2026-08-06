<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Traits\ApiResponse;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly AuthService $authService)
    {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        return $this->successResponse(
            'Registrasi berhasil.',
            $this->authService->register($request->validated()),
            status: 201
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        return $this->successResponse(
            'Login berhasil.',
            $this->authService->login($request->validated('email'), $request->validated('password'))
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return $this->successResponse('Logout berhasil.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse(
            'Data user berhasil diambil.',
            $this->authService->formatUser($request->user())
        );
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        try {
            $status = $this->authService->forgotPassword($request->input('email'));

            return $status === Password::RESET_LINK_SENT
                ? $this->successResponse('Link reset password telah dikirim.')
                : $this->errorResponse('Email tidak ditemukan.', ['email' => [__($status)]], 422);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('forgotPassword mail error: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return $this->errorResponse('Gagal mengirim email reset password. Silakan hubungi administrator atau coba beberapa saat lagi.', [], 500);
        }
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = $this->authService->resetPassword($data);

        return $status === Password::PASSWORD_RESET
            ? $this->successResponse('Password berhasil direset.')
            : $this->errorResponse('Reset password gagal.', ['email' => [__($status)]], 422);
    }

    public function sendEmailVerification(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return $this->successResponse('Email sudah terverifikasi.');
        }

        $request->user()->sendEmailVerificationNotification();

        return $this->successResponse('Link verifikasi email telah dikirim.');
    }

    public function verifyEmail(EmailVerificationRequest $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return $this->successResponse('Email sudah terverifikasi.');
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return $this->successResponse('Email berhasil diverifikasi.');
    }
}
