<?php

namespace App\Providers;

use App\Services\AI\Adapters\GeminiVisionAdapter;
use App\Services\AI\Adapters\MockAiAdapter;
use App\Services\AI\Adapters\OpenAiVisionAdapter;
use App\Services\AI\Contracts\IdentityVerifierInterface;
use App\Services\AI\Contracts\ImageGeneratorInterface;
use App\Services\AI\Contracts\LLMProviderInterface;
use App\Services\AI\Contracts\VisionProviderInterface;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $provider = env('AI_PROVIDER');
        $hasGemini = !empty(env('GEMINI_API_KEY'));
        $hasOpenAi = !empty(env('OPENAI_API_KEY'));

        if ($provider === 'gemini' || ($hasGemini && $provider !== 'mock')) {
            $this->app->singleton(VisionProviderInterface::class, GeminiVisionAdapter::class);
            $this->app->singleton(LLMProviderInterface::class, GeminiVisionAdapter::class);
        } elseif ($provider === 'openai' || ($hasOpenAi && $provider !== 'mock')) {
            $this->app->singleton(VisionProviderInterface::class, OpenAiVisionAdapter::class);
            $this->app->singleton(LLMProviderInterface::class, OpenAiVisionAdapter::class);
        } else {
            $this->app->singleton(VisionProviderInterface::class, MockAiAdapter::class);
            $this->app->singleton(LLMProviderInterface::class, MockAiAdapter::class);
        }

        $this->app->singleton(ImageGeneratorInterface::class, MockAiAdapter::class);
        $this->app->singleton(IdentityVerifierInterface::class, MockAiAdapter::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (empty(config('app.key'))) {
            config(['app.key' => env('APP_KEY', 'base64:G7TcTcA2PwSeF7ejDFc3+yOhJux5mxRVTur5sUFxR8=')]);
        }

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/');
            return "{$frontendUrl}/auth/reset-password?token={$token}&email=" . urlencode($notifiable->getEmailForPasswordReset());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perHour(3)->by($request->ip());
        });

        RateLimiter::for('email-verification', function (Request $request) {
            return Limit::perHour(3)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('public-master-data', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('ai-consultation', function (Request $request) {
            return Limit::perDay(5)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('ai-preview', function (Request $request) {
            return Limit::perDay(3)->by($request->user()?->id ?: $request->ip());
        });
    }
}
