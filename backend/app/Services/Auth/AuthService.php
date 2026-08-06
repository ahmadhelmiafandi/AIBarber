<?php
namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role' => 'customer',
            'status' => 'active',
        ]);

        try {
            $user->assignRole('customer');
        } catch (\Throwable $e) {
            // Ignore if role system offline
        }

        event(new Registered($user));

        return [
            'token' => $user->createToken('api-token')->plainTextToken,
            'user' => $this->formatUser($user),
        ];
    }

    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Akun tidak aktif.'],
            ]);
        }

        return [
            'token' => $user->createToken('api-token')->plainTextToken,
            'user' => $this->formatUser($user),
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    public function forgotPassword(string $email): string
    {
        $rawKey = config('app.key');
        if (empty($rawKey) || $rawKey === 'base64:' || strlen((string)$rawKey) < 10) {
            config(['app.key' => 'base64:G7TcTcA2PwSeF7ejDFc3+yOhJux5mxRVTur5sUFxR8=']);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return Password::INVALID_USER;
        }

        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $user->sendPasswordResetNotification($token);

        return Password::RESET_LINK_SENT;
    }

    public function resetPassword(array $data): string
    {
        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            return Password::INVALID_USER;
        }

        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();
        if (!$record || !Hash::check($data['token'], $record->token)) {
            return Password::INVALID_TOKEN;
        }

        if (now()->subMinutes(60)->gt($record->created_at)) {
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
            return Password::INVALID_TOKEN;
        }

        $user->forceFill([
            'password' => Hash::make($data['password']),
            'remember_token' => Str::random(60),
        ])->save();

        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        return Password::PASSWORD_RESET;
    }

    public function formatUser(User $user): array
    {
        $roles = [];
        try {
            $roles = $user->getRoleNames()->toArray();
        } catch (\Throwable $e) {
            // Fallback gracefully
        }

        if (empty($roles) && !empty($user->role)) {
            $roles = [$user->role];
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role ?? ($roles[0] ?? 'customer'),
            'roles' => $roles,
            'status' => $user->status,
            'email_verified_at' => $user->email_verified_at,
        ];
    }
}
