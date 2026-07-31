<?php

namespace App\Providers;

use App\Services\AI\Adapters\MockAiAdapter;
use App\Services\AI\Contracts\IdentityVerifierInterface;
use App\Services\AI\Contracts\ImageGeneratorInterface;
use App\Services\AI\Contracts\LLMProviderInterface;
use App\Services\AI\Contracts\VisionProviderInterface;
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
        // Default container bindings use MockAiAdapter for local / testing
        $this->app->singleton(VisionProviderInterface::class, MockAiAdapter::class);
        $this->app->singleton(LLMProviderInterface::class, MockAiAdapter::class);
        $this->app->singleton(ImageGeneratorInterface::class, MockAiAdapter::class);
        $this->app->singleton(IdentityVerifierInterface::class, MockAiAdapter::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
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
